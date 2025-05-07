package com.tutofox.ecommerce.Repository.Customer;

import com.tutofox.ecommerce.Entity.SkinConcernEntity;

import java.util.List;

public interface SkinConcernCustomerRepository {

    List<SkinConcernEntity> getConcernByName(String concernName);
}
