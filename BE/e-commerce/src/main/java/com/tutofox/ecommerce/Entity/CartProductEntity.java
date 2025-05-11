package com.tutofox.ecommerce.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity(name = "cartProduct")
public class CartProductEntity {
    @Id
    @Column(name = "cartProductId")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "cartId")
    private CartEntity cart;

    @ManyToOne
    @JoinColumn(name = "productId")
    private ProductEntity product;

    @Column(name = "quantity")
    private int quantity;

}
