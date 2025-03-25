package com.tutofox.ecommerce.Utils;

import com.tutofox.ecommerce.Entity.CategoryEntity;
import com.tutofox.ecommerce.Model.Request.CategoryRequest;
import com.tutofox.ecommerce.Model.Response.CategoryResponse;
import org.modelmapper.ModelMapper;

public class CategoryMapper {

    private ModelMapper map = new ModelMapper();

    public CategoryEntity convertToEntity(CategoryRequest categoryRequest){
        return map.map(categoryRequest, CategoryEntity.class);
    }

    public CategoryResponse convertToResponse(CategoryEntity category){
        return map.map(category, CategoryResponse.class);
    }
}
