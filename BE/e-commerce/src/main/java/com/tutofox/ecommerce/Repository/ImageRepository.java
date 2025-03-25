package com.tutofox.ecommerce.Repository;

import com.tutofox.ecommerce.Entity.ImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageRepository extends JpaRepository<ImageEntity, Integer> {
}
