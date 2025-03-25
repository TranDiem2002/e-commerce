package com.tutofox.ecommerce.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Entity(name = "feature")
public class FeatureEntity {

    @Id
    @GeneratedValue
    @Column(name = "featureId")
    private  int featureId;

    @Column(name = "featureName")
    private String featureName;
}
