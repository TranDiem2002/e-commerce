package com.tutofox.ecommerce.Model.Response;

import com.tutofox.ecommerce.Entity.SkinType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class ProductResponse {
    private int productId;

    private String productName;

    private String imageUrl;

    private float price;

    private float originalPrice;

    private int discount;

    private boolean  isNew;

    private boolean  specialPrice;

    private float ratingsAvg;

    private int reviewCount;

}
