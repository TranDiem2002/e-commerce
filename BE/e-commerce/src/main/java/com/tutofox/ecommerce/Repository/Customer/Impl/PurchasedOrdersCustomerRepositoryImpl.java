package com.tutofox.ecommerce.Repository.Customer.Impl;

import com.tutofox.ecommerce.Entity.ProductEntity;
import com.tutofox.ecommerce.Entity.PurchasedOrderEntity;
import com.tutofox.ecommerce.Entity.UserEntity;
import com.tutofox.ecommerce.Repository.Customer.PurchasedOrdersCustomerRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class PurchasedOrdersCustomerRepositoryImpl implements PurchasedOrdersCustomerRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<PurchasedOrderEntity> findPurchaseByUser(UserEntity user) {
        StringBuilder sql = new StringBuilder("select * from purchased_order where user_id = :userId");
        Query query = entityManager.createNativeQuery(sql.toString(), PurchasedOrderEntity.class);
        query.setParameter("userId", user.getUserId());
        return query.getResultList();
    }
}
