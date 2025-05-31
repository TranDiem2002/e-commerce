package com.tutofox.ecommerce.Service;

import com.tutofox.ecommerce.Model.Request.PurchasedOrderRequest;
import com.tutofox.ecommerce.Model.Response.PurchasedResponse;
import com.tutofox.ecommerce.Model.Response.RevenueByMonth;
import com.tutofox.ecommerce.Model.Response.RevenueBySubCategoryResponse;
import java.util.List;
import org.springframework.security.core.userdetails.UserDetails;

public interface PurchasedOrderService {

    void addPurchasedOrder(PurchasedOrderRequest request, UserDetails userDetails);

    PurchasedResponse getPurchased(UserDetails userDetails, int page);

    PurchasedResponse getNewPurchases(int page);

    PurchasedResponse getProgress(int page);

    PurchasedResponse getDelivered(int page);

    void updatePurchasedOrder(int purchasedOrderId, String purchasedStatus);

    List<RevenueBySubCategoryResponse> getRevenueBySubCategory();

    List<RevenueByMonth> getRevenueByMonth();
}
