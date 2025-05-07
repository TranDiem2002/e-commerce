package com.tutofox.ecommerce.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Entity(name = "product_vector")
public class ProductVectorEntity {

    @Id
    @GeneratedValue
    @Column(name = "productVectorId")
    private int productVectorId;

    @OneToOne
    @JoinColumn(name = "productId")
    private ProductEntity productEntity;

    @Column(name = "ingredientVector")
    private String ingredientVector;

    @Column(name = "featureVector")
    private String featureVector;

    @Column(name = "subCategoryVector")
    private String subCategoryVector;
}
