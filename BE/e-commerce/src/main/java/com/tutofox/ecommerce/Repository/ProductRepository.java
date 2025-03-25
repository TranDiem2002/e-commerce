package com.tutofox.ecommerce.Repository;

import com.tutofox.ecommerce.Entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<ProductEntity, Integer> {
}
