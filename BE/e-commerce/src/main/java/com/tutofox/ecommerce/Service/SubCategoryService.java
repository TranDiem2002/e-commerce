package com.tutofox.ecommerce.Service;

import com.tutofox.ecommerce.Model.Request.SubCategoryRequest;
import com.tutofox.ecommerce.Model.Response.SubCategoryResponse;

import java.util.List;

public interface SubCategoryService{

    String insertSubCategory(List<SubCategoryRequest> subCategoryRequest);
}
