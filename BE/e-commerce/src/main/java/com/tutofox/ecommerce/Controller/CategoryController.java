package com.tutofox.ecommerce.Controller;

import com.tutofox.ecommerce.Model.Request.CategoryRequest;
import com.tutofox.ecommerce.Model.Response.CategoryResponse;
import com.tutofox.ecommerce.Service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/category")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @PostMapping("/add")
    public ResponseEntity<?>  addCategory(@RequestBody List<CategoryRequest> categoryRequest, Authentication authentication){
        if (check(authentication) != null) {
            return new ResponseEntity<>("Bạn không có quyền thêm danh mục!", HttpStatus.FORBIDDEN);
        }
        String response = categoryService.insertCatogory(categoryRequest);
        if(response != "Đã thêm thành công Category!"){
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getAll")
    public ResponseEntity<?> getAll(){
        List<CategoryResponse> categoryResponses = categoryService.findAllActive();
        return ResponseEntity.ok(categoryResponses);
    }

    @PostMapping("/addOne")
    public ResponseEntity<?> addOneCategory(@RequestBody CategoryRequest categoryRequest, Authentication authentication){
        if (check(authentication) != null) {
            return new ResponseEntity<>("Bạn không có quyền thêm danh mục!", HttpStatus.FORBIDDEN);
        }
        categoryService.insertCategory(categoryRequest);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateCategory(@RequestBody CategoryRequest categoryRequest, Authentication authentication){
        if (check(authentication) != null) {
            return new ResponseEntity<>("Bạn không có quyền update danh mục!", HttpStatus.FORBIDDEN);
        }
        categoryService.updateCategory(categoryRequest);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/delete")
    public ResponseEntity<?> deleteCategory(@RequestBody CategoryRequest categoryRequest, Authentication authentication){
        if (check(authentication) != null) {
            return new ResponseEntity<>("Bạn không có quyền update danh mục!", HttpStatus.FORBIDDEN);
        }
        categoryService.deleteCategory(categoryRequest.getCatogoryId());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    public  String check(Authentication authentication){
        if (authentication == null || !authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ADMIN"))) {
            return "Bạn không có quyền thêm danh mục!";
        }
        return null;
    }
}
