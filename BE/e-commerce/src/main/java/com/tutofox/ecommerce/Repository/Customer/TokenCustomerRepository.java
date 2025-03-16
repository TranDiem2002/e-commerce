package com.tutofox.ecommerce.Repository.Customer;

import com.tutofox.ecommerce.Entity.TokenEntity;

public interface TokenCustomerRepository {

    TokenEntity findByToken(String jwt);
}
