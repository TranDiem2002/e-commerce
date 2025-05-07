package com.tutofox.ecommerce.Repository.Customer.Impl;

import com.tutofox.ecommerce.Entity.SkinTypeEntity;
import com.tutofox.ecommerce.Repository.Customer.SkinTypeCustomerRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SkinTypeCustomerRepositoryImpl implements SkinTypeCustomerRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<SkinTypeEntity> getSkinType(String skinType) {
        StringBuilder sql = new StringBuilder("select * from skin_type where skin_type_name = :skinType");
        Query query = entityManager.createNativeQuery(sql.toString(), SkinTypeEntity.class);
        query.setParameter("skinType", skinType);
        return query.getResultList();
    }
}
