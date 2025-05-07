package com.tutofox.ecommerce.Repository.Customer;

import com.tutofox.ecommerce.Entity.IngredientEntity;

import java.util.List;

public interface IngredientProductCustomerRepository {
    List<IngredientEntity> getIngredient(String ingredientName);
}
