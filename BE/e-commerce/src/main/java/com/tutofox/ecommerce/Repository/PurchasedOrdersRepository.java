package com.tutofox.ecommerce.Repository;

import com.tutofox.ecommerce.Entity.PurchasedOrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchasedOrdersRepository extends JpaRepository<PurchasedOrderEntity, Integer> {

}
