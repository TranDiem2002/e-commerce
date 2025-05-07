package com.tutofox.ecommerce.Repository;

import com.tutofox.ecommerce.Entity.IngredientEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IngredientProductRepository extends JpaRepository<IngredientEntity, Integer> {
}
