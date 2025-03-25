package com.tutofox.ecommerce.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

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

    @Column(name = "originalPrice")
    private float originalPrice;

    @Column(name = "discount")
    private int discount;

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

    @OneToMany(mappedBy = "imageId")
    private List<ImageEntity> image;

    @ManyToMany
    @JoinTable(name = "product_skin", joinColumns = @JoinColumn(name = "product_id"),inverseJoinColumns = @JoinColumn(name = "skinTypeId"))
    private List<SkinTypeEntity> skinTypeEntities;

    @ManyToMany
    @JoinTable(name = "product_ingredient", joinColumns = @JoinColumn(name = "product_id"), inverseJoinColumns = @JoinColumn(name = "ingredientId"))
    private List<IngredientEntity> ingredientEntities;

    @ManyToMany
    @JoinTable(name = "product_feature", joinColumns = @JoinColumn(name = "product_id"), inverseJoinColumns = @JoinColumn(name = "featureId"))
    private List<FeatureEntity> featureEntities;
}
