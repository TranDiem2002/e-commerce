package com.tutofox.ecommerce.Service;

import com.tutofox.ecommerce.Model.Request.ProductRequest;
import com.tutofox.ecommerce.Model.Request.ReviewProductRequest;
import com.tutofox.ecommerce.Model.Request.SubCategoryRequest;
import com.tutofox.ecommerce.Model.Response.*;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

public interface ProductService {
    String insertProduct(ProductRequest productRequest);

    List<ProductResponse> getListBySubCategory(SubCategoryRequest subCategoryRequest);

//    ProductResponsePage getListByPage(UserDetails userDetails, int subCategoryId, int page, int sizePage);

    ProductResponsePage getHybridRecommendations(UserDetails userDetails, int subCategoryId, int page, int sizePage);

    ProductDetailResponse getProductDetail(UserDetails userDetails, int productId);

    int addCartProduct(UserDetails userDetails, int productId);

    List<UserCartResponse> updateCartProduct(UserDetails userDetails, int productId, int quantity);

    List<UserCartResponse> removeCartProduct(UserDetails userDetails, int productId);

    List<UserCartResponse> getCartUser(UserDetails userDetails);

    ProductResponsePage searchProduct(UserDetails userDetails, String contentSearch);

    List<ProductResponse> getRecommend(UserDetails userDetails, int productId);

    void createReviewProduct(UserDetails userDetails,ReviewProductRequest reviewRequest);

    List<ReviewProductResponse> getReviewProduct(UserDetails userDetails, int productId);
}
