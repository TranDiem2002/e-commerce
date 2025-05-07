package com.tutofox.ecommerce.Repository.Customer.Impl;

import com.tutofox.ecommerce.Entity.Rating;
import com.tutofox.ecommerce.Repository.Customer.ProductRatingCustomerRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ProductRatingCustomerRepositoryImpl implements ProductRatingCustomerRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Rating> getByUserId(int usedId) {
        StringBuilder sql = new StringBuilder("select * from rating where user_id = :userId");
        Query query = entityManager.createNativeQuery(sql.toString(), Rating.class);
        query.setParameter("userId", usedId);
        return query.getResultList();
    }

    @Override
    public Optional<Integer> getProductByRatingId(int ratingId) {
        String sql = "select product_id from product_rating where rating_id = :ratingId";
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("ratingId", ratingId);

        List<?> results = query.getResultList();

        if (results.isEmpty()) {
            return Optional.empty();
        }

        Object result = results.get(0);
        if (result instanceof Integer) {
            return Optional.of((Integer) result);
        } else {
            return Optional.of(((Number) result).intValue());
        }
    }
}
