package com.tutofox.ecommerce.Model.Response;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class AuthenticationResponse {
    private String token;
    private String role;
}
