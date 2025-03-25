package com.tutofox.ecommerce.Repository.Customer.Impl;

import com.tutofox.ecommerce.Entity.ImageEntity;
import com.tutofox.ecommerce.Repository.Customer.ImageCustomerRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ImageCustomerRepositoryImpl implements ImageCustomerRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<ImageEntity> getImageByProductId(int productId) {
        StringBuilder sql = new StringBuilder("select * from image where product_id = :productId");
        Query query = entityManager.createNativeQuery(sql.toString(), ImageEntity.class);
        query.setParameter("productId", productId);
        return query.getResultList();
    }
}
