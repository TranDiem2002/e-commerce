package com.tutofox.ecommerce.Repository;

import com.tutofox.ecommerce.Entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Integer> {

}
