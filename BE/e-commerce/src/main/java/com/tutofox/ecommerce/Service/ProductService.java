package com.tutofox.ecommerce.Service;

import com.tutofox.ecommerce.Model.Request.ProductRequest;
import com.tutofox.ecommerce.Model.Request.SubCategoryRequest;
import com.tutofox.ecommerce.Model.Response.ProductResponse;
import com.tutofox.ecommerce.Model.Response.ProductResponsePage;

import java.util.List;

public interface ProductService {
    String insertProduct(ProductRequest productRequest);

    List<ProductResponse> getListBySubCategory(SubCategoryRequest subCategoryRequest);

    ProductResponsePage getListByPage(int subCategoryId, int page, int sizePage);
}
