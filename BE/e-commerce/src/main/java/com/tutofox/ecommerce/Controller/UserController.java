package com.tutofox.ecommerce.Controller;

import com.tutofox.ecommerce.Model.Request.AuthenticationRequest;
import com.tutofox.ecommerce.Model.Request.UserRequest;
import com.tutofox.ecommerce.Model.Response.AuthenticationResponse;
import com.tutofox.ecommerce.Service.UserDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/detail")
    public ResponseEntity<?> getDetailInfo(@AuthenticationPrincipal UserDetails userDetails){
        return ResponseEntity.ok(userDetailsService.getInfoUser(userDetails));
    }

    @GetMapping("/getAll")
    public ResponseEntity<?> getAllDetail(Authentication authentication){
        if (check(authentication) != null) {
            return new ResponseEntity<>("Bạn không có quyền xem!", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(userDetailsService.getInfoAllUser());
    }

    public  String check(Authentication authentication){
        if (authentication == null || !authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ADMIN"))) {
            return "Bạn không có quyền xem!";
        }
        return null;
    }
}
