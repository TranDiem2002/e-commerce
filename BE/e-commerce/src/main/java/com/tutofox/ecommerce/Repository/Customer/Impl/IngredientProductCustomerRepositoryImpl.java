package com.tutofox.ecommerce.Repository.Customer.Impl;

import com.tutofox.ecommerce.Entity.IngredientEntity;
import com.tutofox.ecommerce.Repository.Customer.IngredientProductCustomerRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class IngredientProductCustomerRepositoryImpl implements IngredientProductCustomerRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<IngredientEntity> getIngredient(String ingredientName) {
        StringBuilder sql = new StringBuilder("select * from ingredient where ingredient_name = :ingredientName");
        Query query = entityManager.createNativeQuery(sql.toString(), IngredientEntity.class);
        query.setParameter("ingredientName", ingredientName);
        return query.getResultList();
    }
}
