package com.tutofox.ecommerce.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GeneratedColumn;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Entity(name = "image")
public class ImageEntity {

    @Id
    @Column(name = "imageId")
    @GeneratedValue
    private int imageId;

    @Column(name = "imageLink")
    private String imageLink;

    @ManyToOne
    @JoinColumn(name = "productId")
    private ProductEntity product;
}
