package com.tutofox.ecommerce.Repository.Customer;

import com.tutofox.ecommerce.Entity.PurchasedOrderEntity;
import com.tutofox.ecommerce.Entity.UserEntity;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

public interface PurchasedOrdersCustomerRepository {

    List<PurchasedOrderEntity> findPurchaseByUser(UserEntity user);
}
