package com.tutofox.ecommerce.Service;

import com.tutofox.ecommerce.Model.Request.CategoryRequest;
import com.tutofox.ecommerce.Model.Request.SubCategoryRequest;
import com.tutofox.ecommerce.Model.Response.CategoryResponse;

import java.util.List;

public interface CategoryService {

    String insertCatogory(List<CategoryRequest> categoryRequest);

    List<CategoryResponse> findAllActive();

    void insertCategory(CategoryRequest categoryRequest);

    void updateCategory(CategoryRequest categoryRequest);

    void deleteCategory(int categoryId);
}
