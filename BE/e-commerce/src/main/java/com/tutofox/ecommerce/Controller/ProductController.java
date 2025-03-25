package com.tutofox.ecommerce.Controller;

import com.tutofox.ecommerce.Model.Request.ProductRequest;
import com.tutofox.ecommerce.Model.Request.SubCategoryRequest;
import com.tutofox.ecommerce.Model.Response.ProductResponse;
import com.tutofox.ecommerce.Service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    public ResponseEntity<?> getProductBySubCategory(
            @PathVariable int subCategory,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        return ResponseEntity.ok(productService.getListByPage(subCategory, page, size));
    }
}
