package com.tutofox.ecommerce.Service;

import com.tutofox.ecommerce.Model.Request.ProductRequest;
import com.tutofox.ecommerce.Model.Request.SubCategoryRequest;
import com.tutofox.ecommerce.Model.Response.ProductDetailResponse;
import com.tutofox.ecommerce.Model.Response.ProductResponse;
import com.tutofox.ecommerce.Model.Response.ProductResponsePage;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

public interface ProductService {
    String insertProduct(ProductRequest productRequest);

    List<ProductResponse> getListBySubCategory(SubCategoryRequest subCategoryRequest);

    ProductResponsePage getListByPage(UserDetails userDetails, int subCategoryId, int page, int sizePage);

    ProductResponsePage getHybridRecommendations(UserDetails userDetails, int subCategoryId, int page, int sizePage);

    ProductDetailResponse getProductDetail(UserDetails userDetails, int productId);
}
