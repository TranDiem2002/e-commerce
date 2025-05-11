package com.tutofox.ecommerce.Repository;

import com.tutofox.ecommerce.Entity.CartEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<CartEntity, Integer> {
}
