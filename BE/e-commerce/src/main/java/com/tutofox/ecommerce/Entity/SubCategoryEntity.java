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
@Entity(name = "subcategory")
public class SubCategoryEntity {

    @Id
    @Column(name = "subCategoryId")
    private int subCategoryId;

    @ManyToOne
    @JoinColumn(name = "categoryId")
    private CategoryEntity category;

    @Column(name = "subCategoryName")
    private String subCategoryName;
}
