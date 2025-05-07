package com.tutofox.ecommerce.Repository.Customer;

import com.tutofox.ecommerce.Entity.Rating;

import java.util.List;
import java.util.Optional;

public interface ProductRatingCustomerRepository {

    List<Rating> getByUserId(int usedId);

    Optional<Integer> getProductByRatingId(int ratingId);
}
