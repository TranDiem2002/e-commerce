package com.tutofox.ecommerce.Service.Impl;

import com.tutofox.ecommerce.Entity.CategoryEntity;
import com.tutofox.ecommerce.Entity.ProductEntity;
import com.tutofox.ecommerce.Entity.SubCategoryEntity;
import com.tutofox.ecommerce.Model.Request.CategoryRequest;
import com.tutofox.ecommerce.Model.Request.SubCategoryRequest;
import com.tutofox.ecommerce.Model.Response.CategoryResponse;
import com.tutofox.ecommerce.Repository.CategoryRepository;
import com.tutofox.ecommerce.Repository.Customer.ProductCustomerRepository;
import com.tutofox.ecommerce.Repository.Customer.SubCategoryCustomerRespository;
import com.tutofox.ecommerce.Repository.ProductRepository;
import com.tutofox.ecommerce.Repository.SubCategoryRespository;
import com.tutofox.ecommerce.Service.CategoryService;
import com.tutofox.ecommerce.Utils.CategoryMapper;
import com.tutofox.ecommerce.Utils.SubCategoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubCategoryRespository subCategoryRespository;

    @Autowired
    private SubCategoryCustomerRespository subCategoryCustomerRespository;

    @Autowired
    private ProductCustomerRepository productCustomerRepository;

    @Autowired
    private ProductRepository productRepository;

    private CategoryMapper categoryMapper;

    private SubCategoryMapper subCategoryMapper;

    public CategoryServiceImpl() {
        this.categoryMapper = new CategoryMapper();
        this.subCategoryMapper = new SubCategoryMapper();
    }

    @Override
    public String insertCatogory(List<CategoryRequest> categoryRequests) {
        List<Integer> existingIds = new ArrayList<>();

        for (CategoryRequest categoryRequest : categoryRequests) {
            if (categoryRepository.existsById(categoryRequest.getCatogoryId())) {
                existingIds.add(categoryRequest.getCatogoryId());
            }
        }

        if (!existingIds.isEmpty()) {
            return "CategoryId đã tồn tại: " + existingIds;
        }

        List<CategoryEntity> categoryEntities = categoryRequests.stream()
                .map(categoryMapper::convertToEntity)
                .collect(Collectors.toList());

        categoryRepository.saveAll(categoryEntities);

        return "Đã thêm thành công Category!";
    }


    @Override
    public List<CategoryResponse> findAllActive() {
        List<CategoryEntity> categoryEntities = categoryRepository.findAll().stream()
                .filter(x -> x.isCategoryStatus()).collect(Collectors.toList());
        List<CategoryResponse> categoryResponses = new ArrayList<>();
        for(CategoryEntity category: categoryEntities){
            CategoryResponse categoryResponse = categoryMapper.convertToResponse(category);
            List<SubCategoryEntity> subCategoryEntities = subCategoryCustomerRespository.findByCategoryId(category.getCategoryId());
            categoryResponse.setSubCategoryResponses(subCategoryEntities.stream()
                    .map(subCategoryMapper::convertToResponse)
                    .collect(Collectors.toList()));
            categoryResponses.add(categoryResponse);
        }
        return categoryResponses;
    }

    @Override
    public void insertCategory(CategoryRequest categoryRequest) {
        CategoryEntity category = new CategoryEntity();
        List<CategoryEntity> categoryEntities = categoryRepository.findAll();
        if(!categoryEntities.isEmpty()){
            category.setCategoryId(categoryEntities.get(categoryEntities.size()-1).getCategoryId() + 1);
        }
        else
            category.setCategoryId(1);
        category.setCategoryName(categoryRequest.getCatogoryName());
        category.setCategoryStatus(true);
        categoryRepository.save(category);
    }

    @Override
    public void updateCategory(CategoryRequest categoryRequest) {
        Optional<CategoryEntity> category = categoryRepository.findById(categoryRequest.getCatogoryId());
        if(category.isPresent()){
            CategoryEntity categoryEntity = category.get();
            categoryEntity.setCategoryName(categoryRequest.getCatogoryName());
            categoryEntity.setCategoryStatus(categoryRequest.isCategoryStatus());
            categoryRepository.save(categoryEntity);
        }
    }

    @Override
    public void deleteCategory(int categoryId) {
       Optional<CategoryEntity> category = categoryRepository.findById(categoryId);
       if(category.isPresent()){
           CategoryEntity categoryEntity = category.get();
           categoryEntity.setCategoryStatus(false);
           categoryRepository.save(categoryEntity);
       }
    }
}
