package com.tutofox.ecommerce.Model.Request;

import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserInfoRequest {
    private String userName;

    private String  gender;

    private List<String> skinTypes;

    private List<String> skinConcerns;
}
