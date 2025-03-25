package com.tutofox.ecommerce.Entity;

import com.tutofox.ecommerce.Model.Response.ProductResponse;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

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

    @OneToMany(mappedBy = "productId")
    private List<ProductEntity> productEntities;
}
