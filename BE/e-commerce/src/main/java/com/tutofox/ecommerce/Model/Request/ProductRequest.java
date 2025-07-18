package com.tutofox.ecommerce.Model.Request;

import com.tutofox.ecommerce.Entity.SkinType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class ProductRequest {

    private int productId;

    private String productName;

    private float originalPrice;

    private int discount;

    private List<String> imageLinks;

    private int soldCount;

    private int stockRemaining;

    private int subCategoryId;

    private String shortDescription;

    private String description;

    private List<String> skinConcerns;

    private List<String> skinTypes;

    private List<String> ingredientList;

    private List<String> features;
}
