package com.tutofox.ecommerce.Model.Response;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class UserDetailResponse {

    private String userName;

    private String email;

    private String phone;

    private String gender;

    private String avatar;

    private List<String> skinConcerns;

    private List<String> skinTypes;

}
