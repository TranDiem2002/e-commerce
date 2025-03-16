package com.tutofox.ecommerce.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity(name = "cart")
public class CartEntity {

    @Id
    @Column(name = "cartId")
    private int cartId;

    @ManyToMany
    @JoinTable(name = "user_cart",joinColumns = @JoinColumn(name = "cartId"), inverseJoinColumns = @JoinColumn(name = "productId"))
    private List<ProductEntity> products;

    @Column(name = "quantity")
    private int quantity;

}
