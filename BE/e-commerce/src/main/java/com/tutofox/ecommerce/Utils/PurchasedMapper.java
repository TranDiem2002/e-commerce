package com.tutofox.ecommerce.Utils;

import com.tutofox.ecommerce.Entity.ProductEntity;
import com.tutofox.ecommerce.Entity.PurchasedOrderEntity;
import com.tutofox.ecommerce.Entity.PurchasedProductEntity;
import com.tutofox.ecommerce.Model.Response.PurchasedOrderResponse;
import com.tutofox.ecommerce.Model.Response.PurchasedProductResponse;
import org.modelmapper.ModelMapper;

import java.util.ArrayList;
import java.util.List;

public class PurchasedMapper {

    private ModelMapper mapper = new ModelMapper();

    public PurchasedOrderResponse convertToReponse(PurchasedOrderEntity purchasedOrderEntity){
        PurchasedOrderResponse response = new PurchasedOrderResponse();

        List<PurchasedProductResponse> purchasedProductResponses = new ArrayList<>();
        List<PurchasedProductEntity> purchasedProductEntities = purchasedOrderEntity.getPurchasedProducts();
        purchasedProductEntities.forEach(purchased -> {
            PurchasedProductResponse productResponse = new PurchasedProductResponse();
            ProductEntity product = purchased.getProductEntity();
            productResponse.setProductName(product.getProductName());
            productResponse.setProductImage(product.getImage().get(0).getImageLink());
            productResponse.setPrice(purchased.getPrice());
            productResponse.setMount(purchased.getCount());
            productResponse.setOriginalPrice(product.getOriginalPrice());
            purchasedProductResponses.add(productResponse);
        });

        response.setPurchasedOrderId(purchasedOrderEntity.getPurchasedOrderId());
        response.setPurchasedProductResponses(purchasedProductResponses);
        response.setAddress(purchasedOrderEntity.getAddress());
        response.setPurchaseDateTime(purchasedOrderEntity.getPurchaseDateTime().toString());
        response.setPurchasedOrderStatus(purchasedOrderEntity.getPurchasedOrderStatus().toString());
        response.setTotalMoney(purchasedOrderEntity.getTotalMoney());
        response.setTotalQuantity(purchasedOrderEntity.getQuantity());
        return response;
    }
}
