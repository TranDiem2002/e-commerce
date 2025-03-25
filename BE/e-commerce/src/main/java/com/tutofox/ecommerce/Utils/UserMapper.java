package com.tutofox.ecommerce.Utils;

import com.tutofox.ecommerce.Entity.Gender;
import com.tutofox.ecommerce.Entity.SkinType;
import com.tutofox.ecommerce.Entity.UserEntity;
import com.tutofox.ecommerce.Model.Request.UserRequest;
import org.modelmapper.ModelMapper;

public class UserMapper {

    ModelMapper modelMapper = new ModelMapper();

    public UserEntity convertToEntity(UserRequest user){
        UserEntity userEntity = modelMapper.map(user, UserEntity.class);
        userEntity.setGender(Gender.valueOf(user.getGender()));
        userEntity.setSkinType(SkinType.valueOf(user.getSkinType()));
        return userEntity;
    }

}
