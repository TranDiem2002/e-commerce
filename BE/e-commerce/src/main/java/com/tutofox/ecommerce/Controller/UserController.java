package com.tutofox.ecommerce.Controller;

import com.tutofox.ecommerce.Model.Request.AuthenticationRequest;
import com.tutofox.ecommerce.Model.Request.UserRequest;
import com.tutofox.ecommerce.Model.Response.AuthenticationResponse;
import com.tutofox.ecommerce.Service.UserDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserDetailService userDetailsService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRequest userRequest){
        String response = userDetailsService.register(userRequest);
        if(response != "đã add user thành công"){
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody  AuthenticationRequest auth){
        AuthenticationResponse response = userDetailsService.authentication(auth);
        return ResponseEntity.ok(response);
    }
}
