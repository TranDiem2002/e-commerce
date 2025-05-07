package com.tutofox.ecommerce.Repository;

import com.tutofox.ecommerce.Entity.FeatureEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeatureRepository extends JpaRepository<FeatureEntity, Integer> {
}
