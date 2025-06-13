package com.tutofox.ecommerce.Repository;

import com.tutofox.ecommerce.Entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RatingReponsitory extends JpaRepository<Rating, Integer> {
}
