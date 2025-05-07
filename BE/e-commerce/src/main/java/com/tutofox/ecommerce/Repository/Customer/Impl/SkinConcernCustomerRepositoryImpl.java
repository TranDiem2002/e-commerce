package com.tutofox.ecommerce.Repository.Customer.Impl;

import com.tutofox.ecommerce.Entity.SkinConcernEntity;
import com.tutofox.ecommerce.Repository.Customer.SkinConcernCustomerRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SkinConcernCustomerRepositoryImpl implements SkinConcernCustomerRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<SkinConcernEntity> getConcernByName(String concernName) {
        StringBuilder sql = new StringBuilder("select * from skin_concern where concern_name = :concernName");
        Query query = entityManager.createNativeQuery(sql.toString(), SkinConcernEntity.class);
        query.setParameter("concernName", concernName);
        return query.getResultList();
    }
}
