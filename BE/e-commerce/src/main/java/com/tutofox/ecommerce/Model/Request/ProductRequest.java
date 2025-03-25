package com.tutofox.ecommerce.Model.Request;

import com.tutofox.ecommerce.Entity.SkinType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class ProductRequest {

    private int productId;

    private String productName;

    private float originalPrice;

    private int discount;

    private List<String> imageLinks;

    private String ingredients;

    private String skinType;

    private int soldCount;

    private int stockRemaining;

    private int subCategoryId;
}
