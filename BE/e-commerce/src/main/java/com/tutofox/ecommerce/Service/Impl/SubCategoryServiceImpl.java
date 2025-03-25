package com.tutofox.ecommerce.Service.Impl;

import com.tutofox.ecommerce.Entity.CategoryEntity;
import com.tutofox.ecommerce.Entity.SubCategoryEntity;
import com.tutofox.ecommerce.Model.Request.SubCategoryRequest;
import com.tutofox.ecommerce.Repository.CategoryRepository;
import com.tutofox.ecommerce.Repository.SubCategoryRespository;
import com.tutofox.ecommerce.Service.SubCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubCategoryServiceImpl implements SubCategoryService {

    @Autowired
    private SubCategoryRespository subCategoryRespository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public String insertSubCategory(List<SubCategoryRequest> subCategoryRequests) {
        // Lấy danh sách categoryId và subCategoryId từ request
        List<Integer> categoryIds = subCategoryRequests.stream()
                .map(SubCategoryRequest::getCategoryId)
                .collect(Collectors.toList());

        List<Integer> subCategoryIds = subCategoryRequests.stream()
                .map(SubCategoryRequest::getSubCategoryId)
                .collect(Collectors.toList());

        // Lấy danh sách category có sẵn trong database
        List<Integer> existingCategoryIds = categoryRepository.findAllById(categoryIds)
                .stream()
                .map(CategoryEntity::getCategoryId)
                .collect(Collectors.toList());

        // Lấy danh sách subCategory có sẵn trong database
        List<Integer> existingSubCategoryIds = subCategoryRespository.findAllById(subCategoryIds)
                .stream()
                .map(SubCategoryEntity::getSubCategoryId)
                .collect(Collectors.toList());

        // Tìm categoryId không tồn tại
        List<Integer> missingCategoryIds = categoryIds.stream()
                .filter(id -> !existingCategoryIds.contains(id))
                .collect(Collectors.toList());

        // Tìm subCategoryId đã tồn tại
        List<Integer> duplicateSubCategoryIds = subCategoryIds.stream()
                .filter(existingSubCategoryIds::contains)
                .collect(Collectors.toList());

        // Nếu có categoryId không tồn tại, báo lỗi
        if (!missingCategoryIds.isEmpty()) {
            return "CategoryId không tồn tại: " + missingCategoryIds;
        }

        // Nếu có subCategoryId bị trùng, báo lỗi
        if (!duplicateSubCategoryIds.isEmpty()) {
            return "SubCategoryId đã tồn tại: " + duplicateSubCategoryIds;
        }

        // Tạo danh sách SubCategoryEntity từ request
        List<SubCategoryEntity> subCategoryEntities = subCategoryRequests.stream()
                .map(req -> {
                    SubCategoryEntity subCategoryEntity = new SubCategoryEntity();
                    subCategoryEntity.setCategory(categoryRepository.findById(req.getCategoryId()).get());
                    subCategoryEntity.setSubCategoryId(req.getSubCategoryId());
                    subCategoryEntity.setSubCategoryName(req.getSubCategoryName());
                    return subCategoryEntity;
                })
                .collect(Collectors.toList());

        subCategoryRespository.saveAll(subCategoryEntities);

        return "Đã thêm sub category thành công";
    }

}
