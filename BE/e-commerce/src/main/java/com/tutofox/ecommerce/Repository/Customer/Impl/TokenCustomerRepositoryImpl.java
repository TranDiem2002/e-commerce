package com.tutofox.ecommerce.Repository.Customer.Impl;

import com.tutofox.ecommerce.Entity.TokenEntity;
import com.tutofox.ecommerce.Repository.Customer.TokenCustomerRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

@Repository
public class TokenCustomerRepositoryImpl implements TokenCustomerRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public TokenEntity findByToken(String jwt) {
        StringBuilder sql = new StringBuilder("select * from token where token = :jwt");
        Query query = entityManager.createNativeQuery(sql.toString(), TokenEntity.class);
        query.setParameter("jwt", jwt);
        return (TokenEntity) query.getResultList().get(0);
    }
}
