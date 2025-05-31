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

    @Column(name = "reviewCount")
    private int reviewCount;

    @Column(name = "soldCount")
    private int soldCount;

    @Column(name = "stockRemaining")
    private int stockRemaining;

    @Column(name = "shortDescription", columnDefinition = "TEXT")
    private String shortDescription;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "subCategoryId")
    private SubCategoryEntity subCategory;

    @OneToMany(mappedBy = "imageId")
    private List<ImageEntity> image;

    @ManyToMany
    @JoinTable(name = "product_concern", joinColumns = @JoinColumn(name = "productId"), inverseJoinColumns = @JoinColumn(name = "skinConcernId"))
    private List<SkinConcernEntity> skinConcernEntities;

    @ManyToMany
    @JoinTable(name = "product_skin", joinColumns = @JoinColumn(name = "productId"),inverseJoinColumns = @JoinColumn(name = "skinTypeId"))
    private List<SkinTypeEntity> skinTypeEntities;

    @ManyToMany
    @JoinTable(name = "product_ingredient", joinColumns = @JoinColumn(name = "productId"), inverseJoinColumns = @JoinColumn(name = "ingredientId"))
    private List<IngredientEntity> ingredientEntities;

    @ManyToMany
    @JoinTable(name = "product_feature", joinColumns = @JoinColumn(name = "productId"), inverseJoinColumns = @JoinColumn(name = "featureId"))
    private List<FeatureEntity> featureEntities;

    @ManyToMany
    @JoinTable(name = "product_rating", joinColumns = @JoinColumn(name = "productId"), inverseJoinColumns = @JoinColumn(name = "ratingId"))
    private List<Rating> productRatings;

}
