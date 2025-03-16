package com.tutofox.ecommerce.Model.Request;

import com.tutofox.ecommerce.Entity.Gender;
import com.tutofox.ecommerce.Entity.Role;
import com.tutofox.ecommerce.Entity.SkinConcernEntity;
import com.tutofox.ecommerce.Entity.SkinType;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserRequest {

    private String userName;

    private String email;

    private String password;

    private String birthday;

    private String  gender;

    private String skinType;

    private List<String> skinConcerns;
}
