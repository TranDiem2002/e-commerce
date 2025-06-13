package com.tutofox.ecommerce.Model.Request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class ReviewProductRequest {
    private String productName;

    private int rating;

    private String content;
}
