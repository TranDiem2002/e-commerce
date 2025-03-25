package com.tutofox.ecommerce.Utils;

import com.tutofox.ecommerce.Entity.SubCategoryEntity;
import com.tutofox.ecommerce.Model.Response.SubCategoryResponse;
import org.modelmapper.ModelMapper;

public class SubCategoryMapper {

    private ModelMapper modelMapper = new ModelMapper();

    public SubCategoryResponse convertToResponse(SubCategoryEntity subCategoryEntity){
        return modelMapper.map(subCategoryEntity, SubCategoryResponse.class);
    }
}
