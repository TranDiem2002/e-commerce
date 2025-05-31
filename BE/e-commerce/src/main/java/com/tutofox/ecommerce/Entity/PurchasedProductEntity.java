package com.tutofox.ecommerce.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Entity(name = "purchasedProduct")
public class PurchasedProductEntity {

    @Id
    @Column(name = "purchasedProductId")
    private int purchasedProductId;

    @ManyToOne
    @JoinColumn(name = "purchasedOrderId")
    private PurchasedOrderEntity purchasedOrdersEntity;

    @ManyToOne
    @JoinColumn(name = "productId")
    private ProductEntity productEntity;

    @Column(name = "count")
    private int count;

    @Column(name = "price")
    private float price;
}
