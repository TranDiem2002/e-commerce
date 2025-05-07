package com.tutofox.ecommerce.Repository;

import com.tutofox.ecommerce.Entity.SkinConcernEntity;
import com.tutofox.ecommerce.Repository.Customer.SkinConcernCustomerRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkinConcernRepository extends JpaRepository<SkinConcernEntity, Integer> {
}
