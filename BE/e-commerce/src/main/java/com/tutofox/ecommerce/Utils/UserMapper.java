package com.tutofox.ecommerce.Utils;

import com.tutofox.ecommerce.Entity.UserEntity;
import com.tutofox.ecommerce.Model.Request.UserRequest;
import org.modelmapper.ModelMapper;

public class UserMapper {

    ModelMapper modelMapper = new ModelMapper();

    public UserEntity convertToEntity(UserRequest user){
        return modelMapper.map(user, UserEntity.class);
    }

}
