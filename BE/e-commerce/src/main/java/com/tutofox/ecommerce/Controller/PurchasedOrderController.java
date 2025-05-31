package com.tutofox.ecommerce.Controller;

import com.tutofox.ecommerce.Model.Request.PurchasedOrderRequest;
import com.tutofox.ecommerce.Model.Request.PurchasedRequest;
import com.tutofox.ecommerce.Model.Response.PurchasedResponse;
import com.tutofox.ecommerce.Model.Response.RevenueBySubCategoryResponse;
import com.tutofox.ecommerce.Service.PurchasedOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/purchasedOrder")
public class PurchasedOrderController {

    @Autowired
    private PurchasedOrderService purchasedOrderService;

    @PostMapping("/pay")
    public ResponseEntity<?> payMoney(@AuthenticationPrincipal UserDetails userDetails, @RequestBody PurchasedOrderRequest request){
        purchasedOrderService.addPurchasedOrder(request,userDetails);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/getPurchased")
    public ResponseEntity<?> getPurchasedOrder(@AuthenticationPrincipal UserDetails userDetails,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "5") int size){
        return ResponseEntity.ok(purchasedOrderService.getPurchased(userDetails, page));
    }

    @GetMapping("/getNew")
    public ResponseEntity<?> getNewPurchasedOrder(Authentication authentication, @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "5") int size){
        if (check(authentication) != null) {
            return new ResponseEntity<>("Bạn không có quyền xem sản phẩm!", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(purchasedOrderService.getNewPurchases(page));
    }

    @GetMapping("/getProcess")
    public ResponseEntity<?> getPurchasedProcess(Authentication authentication,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "5") int size){
        if (check(authentication) != null) {
            return new ResponseEntity<>("Bạn không có quyền xem sản phẩm!", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(purchasedOrderService.getProgress(page));
    }

    @GetMapping("/getDelivered")
    public ResponseEntity<?> getPurchasedDelivered(Authentication authentication,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "5") int size){
        if (check(authentication) != null) {
            return new ResponseEntity<>("Bạn không có quyền xem sản phẩm!", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(purchasedOrderService.getDelivered(page));
    }

    @PostMapping("update")
    public ResponseEntity<?> updatePurchase(Authentication authentication,
                                                   @RequestBody PurchasedRequest request){
        if (check(authentication) != null) {
            return new ResponseEntity<>("Bạn không có quyền xem sản phẩm!", HttpStatus.FORBIDDEN);
        }
        purchasedOrderService.updatePurchasedOrder(request.getPurchasedId(), request.getPurchasedOrderStatus());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("revenueCategory")
    public ResponseEntity<?> getRevenueBySubCategory(Authentication authentication){
        if (check(authentication) != null) {
            return new ResponseEntity<>("Bạn không có quyền xem sản phẩm!", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(purchasedOrderService.getRevenueBySubCategory());
    }

    @GetMapping("revenueMonth")
    public ResponseEntity<?> getRevenueByMonth(Authentication authentication){
        if (check(authentication) != null) {
            return new ResponseEntity<>("Bạn không có quyền xem sản phẩm!", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(purchasedOrderService.getRevenueByMonth());
    }

    public  String check(Authentication authentication){
        if (authentication == null || !authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ADMIN"))) {
            return "Bạn không có quyền xem sản phẩm!";
        }
        return null;
    }

}
