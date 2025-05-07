package com.tutofox.ecommerce.Repository.Customer;

import com.tutofox.ecommerce.Entity.FeatureEntity;

import java.util.List;

public interface FeatureCustomerRepository {

    List<FeatureEntity> getFeature(String featureName);
}
