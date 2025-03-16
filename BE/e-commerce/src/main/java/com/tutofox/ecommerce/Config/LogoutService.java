package com.tutofox.ecommerce.Config;

import com.tutofox.ecommerce.Entity.Status;
import com.tutofox.ecommerce.Entity.TokenEntity;
import com.tutofox.ecommerce.Repository.Customer.TokenCustomerRepository;
import com.tutofox.ecommerce.Repository.TokenRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

@Service
public class LogoutService implements LogoutHandler {

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private TokenCustomerRepository tokenCustomerRepository;

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        if(authHeader == null || !authHeader.startsWith("Bearer ")){
            return;
        }
        jwt = authHeader.substring(7);
        TokenEntity token = tokenCustomerRepository.findByToken(jwt);
        Date date = new Date();
        System.out.println(date);
        if(token !=null){
            token.setExpired(true);
            token.setRevoked(true);
            token.setLogoutTime(date);
            token.setStatus(Status.inactive);
            tokenRepository.save(token);
            SecurityContextHolder.clearContext();
        }
    }
}
