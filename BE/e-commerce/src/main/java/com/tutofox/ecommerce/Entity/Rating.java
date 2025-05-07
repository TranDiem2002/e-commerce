package com.tutofox.ecommerce.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity(name = "rating")
public class Rating {

    @Id
    @GeneratedValue
    @Column(name = "ratingId")
    private int ratingId;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "userId", referencedColumnName = "userId")
    private UserEntity userEntity;

    @Column(name = "rating")
    private int rating;

    @Column(name = "content")
    private String content;
}
