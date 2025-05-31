package com.tutofox.ecommerce.Service;

import com.tutofox.ecommerce.Model.Request.SubCategoryRequest;
import com.tutofox.ecommerce.Model.Response.SubCategoryResponse;

import java.util.List;

public interface SubCategoryService{

    String insertSubCategory(List<SubCategoryRequest> subCategoryRequest);

    void insertSubCategory(SubCategoryRequest subCategoryRequest);

    void updateSubCategory(SubCategoryRequest subCategoryRequest);

    void deleteSubCategory(int subCategory);
}
