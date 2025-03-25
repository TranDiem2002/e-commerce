package com.tutofox.ecommerce.Repository.Customer;

import com.tutofox.ecommerce.Entity.SubCategoryEntity;

import java.util.List;

public interface SubCategoryCustomerRespository {

    List<SubCategoryEntity> findByCategoryId(int categoryId);
}
