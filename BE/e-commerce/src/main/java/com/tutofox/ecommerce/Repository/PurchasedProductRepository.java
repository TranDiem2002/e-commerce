package com.tutofox.ecommerce.Repository;

import com.tutofox.ecommerce.Entity.PurchasedProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchasedProductRepository extends JpaRepository<PurchasedProductEntity, Integer> {
}
