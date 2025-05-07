package com.tutofox.ecommerce.Repository;

import com.tutofox.ecommerce.Entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRatingRepository extends JpaRepository<Rating, Integer> {
}
