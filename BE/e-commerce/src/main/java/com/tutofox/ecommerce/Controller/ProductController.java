package com.tutofox.ecommerce.Controller;

import com.tutofox.ecommerce.Model.Request.CartProductRequest;
import com.tutofox.ecommerce.Model.Request.ProductRequest;
import com.tutofox.ecommerce.Model.Request.SubCategoryRequest;
import com.tutofox.ecommerce.Model.Request.UserCartRequest;
import com.tutofox.ecommerce.Model.Response.ProductDetailResponse;
import com.tutofox.ecommerce.Model.Response.ProductResponse;
import com.tutofox.ecommerce.Model.Response.ProductResponsePage;
import com.tutofox.ecommerce.Service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/product")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping("/add")
    public ResponseEntity<?> addProduct(@RequestBody ProductRequest productRequest, Authentication authentication){
        if (authentication == null || !authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ADMIN"))) {
            return new ResponseEntity<>("Bạn không có quyền thêm danh mục!", HttpStatus.FORBIDDEN);
        }
        String response = productService.insertProduct(productRequest);
        if(response != "Đã thêm sản phẩm thành công")
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/getAll")
    public ResponseEntity<?> getProductBySubCategory(@RequestBody SubCategoryRequest subCategoryRequest){
        return ResponseEntity.ok(productService.getListBySubCategory(subCategoryRequest));
    }

    @GetMapping("/subCategory/{subCategory}")
    public ResponseEntity<?> getProductBySubCategoryRecommend(
            @PathVariable int subCategory,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size, @AuthenticationPrincipal UserDetails userDetails) {

        ProductResponsePage productResponsePage = productService.getHybridRecommendations(userDetails, subCategory, page, size);
        if(productResponsePage == null){
            return ResponseEntity.ok(productService.getListByPage(userDetails, subCategory, page, size));
        }
        return ResponseEntity.ok(productResponsePage);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<?> getProductDetail(
            @PathVariable int productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        ProductDetailResponse productResponse = productService.getProductDetail(userDetails, productId);
        return ResponseEntity.ok(productResponse);
    }

    @PostMapping("/addCart")
    public ResponseEntity<?> addProductCart(@AuthenticationPrincipal UserDetails userDetails, @RequestBody CartProductRequest cart) {
        return ResponseEntity.ok(productService.addCartProduct(userDetails, cart.getProductId()));
    }

    @PostMapping("/updateCart")
    public ResponseEntity<?> updateProductCart(@AuthenticationPrincipal UserDetails userDetails, @RequestBody UserCartRequest cart) {
        return ResponseEntity.ok(productService.updateCartProduct(userDetails, cart.getProductId(), cart.getQuantity()));
    }

    @PostMapping("/deleteCart")
    public ResponseEntity<?> removeProductCart(@AuthenticationPrincipal UserDetails userDetails, @RequestBody CartProductRequest cart) {
        return ResponseEntity.ok(productService.removeCartProduct(userDetails, cart.getProductId()));
    }

    @GetMapping("/getCart")
    public ResponseEntity<?> getCartUser(@AuthenticationPrincipal UserDetails userDetails){
        return ResponseEntity.ok(productService.getCartUser(userDetails));
    }

}
