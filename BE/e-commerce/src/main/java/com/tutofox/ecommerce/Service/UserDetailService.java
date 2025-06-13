package com.tutofox.ecommerce.Service;

import com.tutofox.ecommerce.Config.JwtService;
import com.tutofox.ecommerce.Entity.*;
import com.tutofox.ecommerce.Model.Request.AuthenticationRequest;
import com.tutofox.ecommerce.Model.Request.UserInfoRequest;
import com.tutofox.ecommerce.Model.Request.UserRequest;
import com.tutofox.ecommerce.Model.Response.AuthenticationResponse;
import com.tutofox.ecommerce.Model.Response.UserDetailResponse;
import com.tutofox.ecommerce.Repository.SkinConcernRepository;
import com.tutofox.ecommerce.Repository.SkinTypeRepository;
import com.tutofox.ecommerce.Repository.TokenRepository;
import com.tutofox.ecommerce.Repository.UserRepository;
import com.tutofox.ecommerce.Utils.UserMapper;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    @Autowired
    private SkinTypeRepository skinTypeRepository;

    @Autowired
    private SkinConcernRepository skinConcernRepository;

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
        user.setUserId(userRepository.findAll().size());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setSkinTypeEntities(saveSkinType(request.getSkinType()));
        user.setSkinConcerns(saveSkinConcern(request.getSkinConcerns()));
        userRepository.save(user);
        return "đã add user thành công";
    }

    public void update(UserInfoRequest request, UserDetails userDetails) {
        Optional<UserEntity> user1 = userRepository.findByEmail(userDetails.getUsername());
        if(user1.isPresent()){
            UserEntity userEntity = user1.get();
            userEntity.setUserName(request.getUserName());
            userEntity.setGender(Gender.valueOf(request.getGender()));
            userEntity.setSkinTypeEntities(saveSkinType(request.getSkinTypes()));
            userEntity.setSkinConcerns(saveSkinConcern(request.getSkinConcerns()));
            userRepository.save(userEntity);
        }
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

    public UserDetailResponse getInfoUser(UserDetails userDetails){
        Optional<UserEntity> user = userRepository.findByEmail(userDetails.getUsername());
        if(!user.isPresent())
            return null;
        return userMapper.convertToResponseDetail(user.get());
    }

    public List<UserDetailResponse> getInfoAllUser(){
        List<UserEntity> userEntities = userRepository.findAll();
        return userEntities.stream().map( userEntity -> userMapper.convertToResponseDetail(userEntity)).collect(Collectors.toList());
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

    private List<SkinTypeEntity> saveSkinType(List<String> request){

        List<SkinTypeEntity> skinTypeEntities = new ArrayList<>();
        if (request != null) {
            List<SkinTypeEntity> skinTypeEntityList = skinTypeRepository.findAll();

            for (String skinType : request) {
                SkinTypeEntity skin = skinTypeEntityList.stream()
                        .filter(skinTypeEntity -> skinTypeEntity.getSkinTypeName().equals(skinType))
                        .findFirst()
                        .orElse(null);

                if (skin == null) {
                    skin = new SkinTypeEntity();
                    skin.setSkinTypeName(skinType);
                    skin = skinTypeRepository.save(skin);
                }
                skinTypeEntities.add(skin);
            }
        }
        return skinTypeEntities;
    }

    private List<SkinConcernEntity> saveSkinConcern(List<String> request){
        List<SkinConcernEntity> skinConcernEntities = new ArrayList<>();
        if (request != null) {
            List<SkinConcernEntity> skinConcernList = skinConcernRepository.findAll();

            for (String skinConcern : request) {
                SkinConcernEntity skinConcernEntity = skinConcernList.stream()
                        .filter(x -> x.getConcernName().equals(skinConcern))
                        .findFirst()
                        .orElse(null);

                if (skinConcernEntity == null) {
                    skinConcernEntity = new SkinConcernEntity();
                    skinConcernEntity.setConcernId(skinConcernList.size());
                    skinConcernEntity.setConcernName(skinConcern);
                    skinConcernEntity = skinConcernRepository.save(skinConcernEntity);
                }
                skinConcernEntities.add(skinConcernEntity);
            }
        }
        return skinConcernEntities;
    }
}
