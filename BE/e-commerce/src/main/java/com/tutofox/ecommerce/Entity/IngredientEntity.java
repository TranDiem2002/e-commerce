package com.tutofox.ecommerce.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Entity(name = "ingredient")
public class IngredientEntity {

    @Id
    @GeneratedValue
    @Column(name = "ingredientId")
    private int ingredientId;

    @Column(name = "ingredientName")
    private String ingredientName;
}
