package com.tutofox.ecommerce.Model.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class UserCartResponse {
    private int productId;

    private String productName;

    private String imageUrl;

    private float price;

    private float originalPrice;

    private int quantity;

    private boolean status;
}
