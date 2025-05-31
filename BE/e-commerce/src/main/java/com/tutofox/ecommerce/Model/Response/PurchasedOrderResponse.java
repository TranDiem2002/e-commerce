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
public class PurchasedOrderResponse {

    private int purchasedOrderId;

    private List<PurchasedProductResponse> purchasedProductResponses;

    private int totalQuantity;

    private float totalMoney;

    private String address;

    private String purchasedOrderStatus;

    private String purchaseDateTime;
}
