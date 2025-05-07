package com.tutofox.ecommerce.Utils;

import com.tutofox.ecommerce.Entity.ImageEntity;
import com.tutofox.ecommerce.Entity.ProductEntity;
import com.tutofox.ecommerce.Entity.SkinType;
import com.tutofox.ecommerce.Model.Request.ProductRequest;
import com.tutofox.ecommerce.Model.Response.ProductDetailResponse;
import com.tutofox.ecommerce.Model.Response.ProductResponse;
import org.modelmapper.ModelMapper;

import java.util.List;
import java.util.stream.Collectors;

public class ProductMapper {

    private ModelMapper mapper = new ModelMapper();

    public ProductEntity convertToEntity(ProductRequest productRequest){
        return mapper.map(productRequest, ProductEntity.class);
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

    public ProductDetailResponse convertToDetailReponse(ProductEntity productEntity, List<ImageEntity> imageEntities){
        ProductDetailResponse productDetailResponse = mapper.map(productEntity, ProductDetailResponse.class);
        if(!imageEntities.isEmpty()){
            productDetailResponse.setImageUrl(imageEntities.stream().map(x -> x.getImageLink()).collect(Collectors.toList()));
        }
        productDetailResponse.setPrice((productEntity.getOriginalPrice()/100) * (100 - productDetailResponse.getDiscount()));
        return productDetailResponse;
    }
}
