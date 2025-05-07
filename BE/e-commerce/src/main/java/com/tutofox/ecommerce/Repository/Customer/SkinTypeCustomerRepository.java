package com.tutofox.ecommerce.Repository.Customer;

import com.tutofox.ecommerce.Entity.SkinType;
import com.tutofox.ecommerce.Entity.SkinTypeEntity;

import java.util.List;
import java.util.Optional;

public interface SkinTypeCustomerRepository {
    List<SkinTypeEntity> getSkinType(String skinType);
}
