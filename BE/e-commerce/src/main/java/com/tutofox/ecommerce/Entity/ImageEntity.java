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
@Entity(name = "image")
public class ImageEntity {

    @Id
    @Column(name = "imageId")
    private int imageId;

    @ManyToOne
    @JoinColumn(name = "productId")
    private ProductEntity product;

    @Column(name = "imageLink")
    private String imageLink;
}
