package com.tutofox.ecommerce.Repository;

import com.tutofox.ecommerce.Entity.CartProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductCartRepository extends JpaRepository<CartProductEntity, Integer> {
}
