package com.tutofox.ecommerce.Utils;

import com.tutofox.ecommerce.Entity.ImageEntity;
import com.tutofox.ecommerce.Entity.ProductEntity;
import com.tutofox.ecommerce.Entity.SkinType;
import com.tutofox.ecommerce.Model.Request.ProductRequest;
import com.tutofox.ecommerce.Model.Response.ProductResponse;
import org.modelmapper.ModelMapper;

import java.util.List;

public class ProductMapper {

    private ModelMapper mapper = new ModelMapper();

    public ProductEntity convertToEntity(ProductRequest productRequest){
        ProductEntity product = mapper.map(productRequest, ProductEntity.class);
        product.setSkinType(SkinType.valueOf(productRequest.getSkinType()));
        return product;
    }

    public ProductResponse convertToResponse (ProductEntity productEntity, List<ImageEntity> imageEntities){
        ProductResponse productResponse = mapper.map(productEntity, ProductResponse.class);
        if(!imageEntities.isEmpty()){
            productResponse.setImageUrl(imageEntities.get(0).getImageLink());
        }
        productResponse.setPrice((productEntity.getOriginalPrice()/100) * (100 - productResponse.getDiscount()));
        productResponse.setSpecialPrice(false);
        productResponse.setNew(false);
        return productResponse;
    }
}
