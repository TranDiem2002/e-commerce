package com.tutofox.ecommerce.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
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

    @OneToMany(mappedBy = "purchasedOrdersEntity")
    private List<PurchasedProductEntity> purchasedProducts;

    @ManyToOne
    @JoinColumn(name = "userId")
    private UserEntity userEntity;

    @Column(name = "quantity")
    private int quantity;

    @Column(name = "totalMoney")
    private int totalMoney;

    @Column(name = "purchasedOrderStatus")
    private PurchasedOrderStatus purchasedOrderStatus;

    @Column(name = "purchaseDateTime")
    private LocalDateTime purchaseDateTime;

    @Column(name = "address")
    private String address;

}
