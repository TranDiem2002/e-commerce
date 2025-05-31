package com.tutofox.ecommerce.Model.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class ProductDetailResponse {
    private int productId;

    private String productName;

    private List<String> imageUrl;

    private float price;

    private float originalPrice;

    private int discount;

    private String shortDescription;

    private String description;

    private int subCtgId;

    private String subCtgName;
    
}
