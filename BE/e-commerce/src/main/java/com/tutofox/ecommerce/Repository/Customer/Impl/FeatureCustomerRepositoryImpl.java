package com.tutofox.ecommerce.Repository.Customer.Impl;

import com.tutofox.ecommerce.Entity.FeatureEntity;
import com.tutofox.ecommerce.Repository.Customer.FeatureCustomerRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class FeatureCustomerRepositoryImpl implements FeatureCustomerRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<FeatureEntity> getFeature(String featureName) {
        StringBuilder sql = new StringBuilder("select * from feature where feature_name = :featureName");
        Query query = entityManager.createNativeQuery(sql.toString(), FeatureEntity.class);
        query.setParameter("featureName", featureName);
        return query.getResultList();
    }
}
