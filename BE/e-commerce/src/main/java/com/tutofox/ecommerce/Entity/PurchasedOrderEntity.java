package com.tutofox.ecommerce.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Entity(name = "purchasedOrder")
public class PurchasedOrderEntity {

    @Id
    @Column(name = "purchasedOrderId")
    private int purchasedOrderId;

    @ManyToMany
    @JoinTable(name = "product_ordered", joinColumns = @JoinColumn(name = "purchasedOrderId"), inverseJoinColumns = @JoinColumn(name = "productId"))
    private List<ProductEntity> products;

    @Column(name = "quantity")
    private int quantity;

    @Column(name = "totalMoney")
    private int totalMoney;
}
