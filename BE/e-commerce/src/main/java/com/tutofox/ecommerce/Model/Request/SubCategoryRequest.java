package com.tutofox.ecommerce.Model.Request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class SubCategoryRequest {
    private int subCategoryId;

    private int categoryId;

    private String subCategoryName;
}
