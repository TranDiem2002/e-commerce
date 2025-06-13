package com.tutofox.ecommerce.Utils;

import com.tutofox.ecommerce.Entity.*;
import com.tutofox.ecommerce.Model.Request.UserRequest;
import com.tutofox.ecommerce.Model.Response.UserDetailResponse;
import org.modelmapper.ModelMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class UserMapper {

    ModelMapper modelMapper = new ModelMapper();

    public UserEntity convertToEntity(UserRequest user){
        UserEntity userEntity = modelMapper.map(user, UserEntity.class);
        if(user.getGender() != null)
            userEntity.setGender(Gender.valueOf(user.getGender()));
        return userEntity;
    }

    public UserDetailResponse convertToResponseDetail(UserEntity user){
        UserDetailResponse userDetailResponse = modelMapper.map(user, UserDetailResponse.class);
        List<SkinConcernEntity> skinConcernEntities = user.getSkinConcerns();
        userDetailResponse.setSkinConcerns(skinConcernEntities.stream().map(x -> x.getConcernName()).collect(Collectors.toList()));
        List<SkinTypeEntity> skinTypeEntities = user.getSkinTypeEntities();
        userDetailResponse.setSkinTypes(skinTypeEntities.stream().map(x -> x.getSkinTypeName()).collect(Collectors.toList()));
        userDetailResponse.setGender(user.getGender().name());
        userDetailResponse.setUserName(user.getName());
        return userDetailResponse;
    }

}
