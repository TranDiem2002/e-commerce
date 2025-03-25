package com.tutofox.ecommerce.Repository.Customer;

import com.tutofox.ecommerce.Entity.ProductEntity;

import java.util.List;

public interface ProductCustomerRepository {

    List<ProductEntity> getAllProductBySubCategory(int subCategoryId);
}
