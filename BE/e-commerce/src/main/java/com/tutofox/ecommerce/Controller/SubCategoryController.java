package com.tutofox.ecommerce.Controller;

import com.tutofox.ecommerce.Model.Request.CategoryRequest;
import com.tutofox.ecommerce.Model.Request.SubCategoryRequest;
import com.tutofox.ecommerce.Service.SubCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/subCategory")
public class SubCategoryController {

    @Autowired
    private SubCategoryService subCategoryService;

    @PostMapping("/add")
    public ResponseEntity<?> addSubCategory(@RequestBody List<SubCategoryRequest> subCategoryRequest,  Authentication authentication){
        if (authentication == null || !authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ADMIN"))) {
            return new ResponseEntity<>("Bạn không có quyền thêm danh mục!", HttpStatus.FORBIDDEN);
        }
        String response = subCategoryService.insertSubCategory(subCategoryRequest);
        if(response != "Đã thêm sub category thành công")
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/addOne")
    public ResponseEntity<?> addOneCategory(@RequestBody SubCategoryRequest subCategoryRequest, Authentication authentication){
        if (check(authentication) != null) {
            return new ResponseEntity<>(check(authentication), HttpStatus.FORBIDDEN);
        }
        subCategoryService.insertSubCategory(subCategoryRequest);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateCategory(@RequestBody SubCategoryRequest subCategoryRequest, Authentication authentication){
        if (check(authentication) != null) {
            return new ResponseEntity<>(check(authentication), HttpStatus.FORBIDDEN);
        }
        subCategoryService.updateSubCategory(subCategoryRequest);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/delete")
    public ResponseEntity<?> deleteCategory(@RequestBody SubCategoryRequest subCategoryRequest, Authentication authentication){
        if (check(authentication) != null) {
            return new ResponseEntity<>(check(authentication), HttpStatus.FORBIDDEN);
        }
        subCategoryService.deleteSubCategory(subCategoryRequest.getSubCategoryId());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    public  String check(Authentication authentication){
        if (authentication == null || !authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ADMIN"))) {
            return "Bạn không có quyền thêm phân loại sản phẩm!";
        }
        return null;
    }
}
