package com.tutofox.ecommerce.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity(name = "product")
public class ProductEntity {

    @Id
    @Column(name = "productId")
    private int productId;

    @Column(name = "productName")
    private String productName;

    @Column(name = "price")
    private float price;

    @Column(name = "ingredients")
    private String ingredients;

    @Column(name = "skinType")
    private SkinType skinType;

    @Column(name = "ratingsAvg")
    private float ratingsAvg;

    @Column(name = "reviewCount")
    private int reviewCount;

    @Column(name = "soldCount")
    private int soldCount;

    @Column(name = "stockRemaining")
    private int stockRemaining;

    @ManyToOne
    @JoinColumn(name = "subCategoryId")
    private SubCategoryEntity subCategory;
}
