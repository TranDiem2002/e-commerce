package com.tutofox.ecommerce.Repository.Customer;

import com.tutofox.ecommerce.Entity.ImageEntity;

import java.util.List;

public interface ImageCustomerRepository {

    List<ImageEntity> getImageByProductId(int productId);
}
