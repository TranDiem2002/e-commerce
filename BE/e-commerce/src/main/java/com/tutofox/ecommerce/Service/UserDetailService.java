package com.tutofox.ecommerce.Service;

import com.tutofox.ecommerce.Config.JwtService;
import com.tutofox.ecommerce.Entity.*;
import com.tutofox.ecommerce.Model.Request.AuthenticationRequest;
import com.tutofox.ecommerce.Model.Request.UserRequest;
import com.tutofox.ecommerce.Model.Response.AuthenticationResponse;
import com.tutofox.ecommerce.Repository.TokenRepository;
import com.tutofox.ecommerce.Repository.UserRepository;
import com.tutofox.ecommerce.Utils.UserMapper;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

@Service
public class UserDetailService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    private UserMapper userMapper;

    public UserDetailService() {
        this.userMapper = new UserMapper();
    }

    public String register(UserRequest request) {
        Optional<UserEntity> user1 = userRepository.findByEmail(request.getEmail());
        if(user1.isPresent()){
            return "Email đã tồn tại.";
        }
        UserEntity user = userMapper.convertToEntity(request);
        StringBuilder rs = new StringBuilder();
        String email = request.getEmail();
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        userRepository.save(user);
        var jwtToken = jwtService.generateToken( user);
        return "đã add user thành công";
    }

    public AuthenticationResponse authentication(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        var jwtToken = jwtService.generateToken( user);
        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .build();
    }

    private void saveUserToken (UserEntity user, String jwt){
        Date date = new Date();

        var token = TokenEntity.builder()
                .user(user)
                .token(jwt)
                .tokenType(TokenType.BEARER)
                .status(Status.activate)
                .timeLogin(date)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
    }


    private void revokeAllUserTokens(UserEntity user){
        var validUserToken = tokenRepository.findAllValidTokenByUser(user.getUserId());
        if(validUserToken.isEmpty()){
            return;
        }
        validUserToken.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });
        tokenRepository.saveAll(validUserToken);
    }
}
