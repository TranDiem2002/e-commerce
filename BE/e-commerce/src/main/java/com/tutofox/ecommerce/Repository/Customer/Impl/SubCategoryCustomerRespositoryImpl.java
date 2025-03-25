package com.tutofox.ecommerce.Repository.Customer.Impl;

import com.tutofox.ecommerce.Entity.SubCategoryEntity;
import com.tutofox.ecommerce.Entity.TokenEntity;
import com.tutofox.ecommerce.Repository.Customer.SubCategoryCustomerRespository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SubCategoryCustomerRespositoryImpl implements SubCategoryCustomerRespository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<SubCategoryEntity> findByCategoryId(int categoryId) {
        StringBuilder sql = new StringBuilder("select * from subcategory where category_id = :categoryId");
        Query query = entityManager.createNativeQuery(sql.toString(), SubCategoryEntity.class);
        query.setParameter("categoryId", categoryId);
        return query.getResultList();
    }
}
