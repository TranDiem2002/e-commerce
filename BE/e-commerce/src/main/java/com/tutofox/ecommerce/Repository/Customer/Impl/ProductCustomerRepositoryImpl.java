package com.tutofox.ecommerce.Repository.Customer.Impl;

import com.tutofox.ecommerce.Entity.ProductEntity;
import com.tutofox.ecommerce.Entity.SubCategoryEntity;
import com.tutofox.ecommerce.Repository.Customer.ProductCustomerRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ProductCustomerRepositoryImpl implements ProductCustomerRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<ProductEntity> getAllProductBySubCategory(int subCategoryId) {
        StringBuilder sql = new StringBuilder("select * from product where sub_category_id = :subCategoryId");
        Query query = entityManager.createNativeQuery(sql.toString(), ProductEntity.class);
        query.setParameter("subCategoryId", subCategoryId);
        return query.getResultList();
    }

    @Override
    public List<ProductEntity> findByProductIdIn(List<Integer> productIds) {
        String sql = "SELECT * FROM product WHERE product_id IN (:productIds)";
        Query query = entityManager.createNativeQuery(sql, ProductEntity.class);
        query.setParameter("productIds", productIds);
        return query.getResultList();
    }

    @Override
    public List<ProductEntity> searchByProductName(String contentSearch) {
        StringBuilder sql = new StringBuilder("SELECT * FROM product WHERE product_name like '%");
        sql.append(contentSearch + "%'");
        Query query = entityManager.createNativeQuery(sql.toString(), ProductEntity.class);
        return query.getResultList();
    }

    @Override
    public ProductEntity searchByName(String productName) {
        String sql = "SELECT * FROM product WHERE product_name = :productName";
        Query query = entityManager.createNativeQuery(sql, ProductEntity.class);
        query.setParameter("productName", productName);
        List<ProductEntity> results = query.getResultList();
        return results.isEmpty() ? null : results.get(0);
    }
}
