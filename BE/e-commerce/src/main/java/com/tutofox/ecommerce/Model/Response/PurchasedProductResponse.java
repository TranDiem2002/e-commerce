package com.tutofox.ecommerce.Model.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class PurchasedProductResponse {

    private String productName;

    private String productImage;

    private float price;

    private float originalPrice;

    private int mount;

}
