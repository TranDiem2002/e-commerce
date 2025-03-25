package com.tutofox.ecommerce.Model.Request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CategoryRequest {

    private int catogoryId;

    private String catogoryName;

    private boolean categoryStatus;
}
