package com.tutofox.ecommerce.Service.Impl;

import com.tutofox.ecommerce.Entity.*;
import com.tutofox.ecommerce.Model.Request.PurchasedOrderRequest;
import com.tutofox.ecommerce.Model.Response.PurchasedOrderResponse;
import com.tutofox.ecommerce.Model.Response.PurchasedResponse;
import com.tutofox.ecommerce.Model.Response.RevenueByMonth;
import com.tutofox.ecommerce.Model.Response.RevenueBySubCategoryResponse;
import com.tutofox.ecommerce.Repository.*;
import com.tutofox.ecommerce.Repository.Customer.PurchasedOrdersCustomerRepository;
import com.tutofox.ecommerce.Service.PurchasedOrderService;
import com.tutofox.ecommerce.Utils.PurchasedMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Month;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PurchasedOrderServiceImpl implements PurchasedOrderService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PurchasedOrdersRepository purchasedOrdersRepository;

    @Autowired
    private PurchasedProductRepository purchasedProductRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductCartRepository productCartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PurchasedOrdersCustomerRepository purchasedOrdersCustomerRepository;

    private List<PurchasedOrderResponse> purchasedOrderResponses;

    private PurchasedMapper purchasedMapper;

    public PurchasedOrderServiceImpl() {
        this.purchasedMapper = new PurchasedMapper();
    }

    @Override
    public void addPurchasedOrder(PurchasedOrderRequest request, UserDetails userDetails) {
        Optional<UserEntity> userEntity = userRepository.findByEmail(userDetails.getUsername());
        if(!userEntity.isPresent())
            return;
        CartEntity cartEntity = userEntity.get().getCartEntity();
        if (cartEntity == null)
            return;
        List<CartProductEntity> cartProductEntities = cartEntity.getCartProducts();
        if(cartProductEntities.isEmpty())
            return;

        PurchasedOrderEntity purchasedOrdersEntity = new PurchasedOrderEntity();
        purchasedOrdersEntity.setPurchasedOrderId((int) (Math.random() * 90000) + 10000);
        purchasedOrdersEntity.setPurchaseDateTime(LocalDateTime.now());
        purchasedOrdersEntity.setAddress(request.getAddress());
        purchasedOrdersEntity.setUserEntity(userEntity.get());
        purchasedOrdersEntity.setPurchasedOrderStatus(PurchasedOrderStatus.Waiting);
        purchasedOrdersEntity = purchasedOrdersRepository.save(purchasedOrdersEntity);

        int quantity = 0;
        int totalMoney = 0;
        List<PurchasedProductEntity> purchasedProductEntities = new ArrayList<>();
        for (CartProductEntity productEntity : cartProductEntities) {
            ProductEntity product = productEntity.getProduct();
            float price = (product.getOriginalPrice() / 100) * (100 - product.getDiscount());
            quantity += productEntity.getQuantity();
            totalMoney += productEntity.getQuantity() * price;

            PurchasedProductEntity purchasedProduct = new PurchasedProductEntity();
            purchasedProduct.setPurchasedProductId(purchasedProductRepository.findAll().size());
            purchasedProduct.setPurchasedOrdersEntity(purchasedOrdersEntity);
            purchasedProduct.setCount(productEntity.getQuantity());
            purchasedProduct.setPrice(price);
            purchasedProduct.setProductEntity(productEntity.getProduct());
            purchasedProductEntities.add(purchasedProductRepository.save(purchasedProduct));

            product.setStockRemaining(product.getStockRemaining() - productEntity.getQuantity());
            productRepository.save(product);
        }

        purchasedOrdersEntity.setTotalMoney(totalMoney);
        purchasedOrdersEntity.setPurchasedProducts(purchasedProductEntities);
        purchasedOrdersEntity.setQuantity(quantity);
        purchasedOrdersRepository.save(purchasedOrdersEntity);

       List<CartProductEntity> cartProductEntities1 = cartEntity.getCartProducts();
       productCartRepository.deleteAll(cartProductEntities1);
       UserEntity user = userEntity.get();
       user.setCartEntity(null);
       userRepository.save(user);
       cartRepository.delete(cartEntity);
    }

    @Override
    public PurchasedResponse getPurchased(UserDetails userDetails, int page) {
        UserEntity user = userRepository.findByEmail(userDetails.getUsername()).get();
        if(page == 1){
            purchasedOrderResponses = new ArrayList<>();
            List<PurchasedOrderEntity> purchasedOrderEntities = purchasedOrdersCustomerRepository.findPurchaseByUser(user);
            if(purchasedOrderEntities.isEmpty())
                return null;
            List<Integer> purchasedOrderId = purchasedOrderEntities.stream()
                    .map(x -> x.getPurchasedOrderId())
                    .collect(Collectors.toList());
            List<PurchasedOrderEntity> purchasedOrderEntities1 = purchasedOrdersRepository.findAllById(purchasedOrderId);

            purchasedOrderEntities1.sort(
                    Comparator.comparing(PurchasedOrderEntity::getPurchaseDateTime).reversed()
            );

            purchasedOrderEntities1.forEach(purchasedOrder -> {
                purchasedOrderResponses.add(purchasedMapper.convertToReponse(purchasedOrder));
            });
        }

        int totalPage = (purchasedOrderResponses.size() % 5) == 0 ? (purchasedOrderResponses.size() / 5) : ((purchasedOrderResponses.size()/5)+1);
        List<PurchasedOrderResponse> purchasedOrders = new ArrayList<>();
        for(int i = 0; i < purchasedOrderResponses.size(); i++){
            if(i >= (5*(page -1) - 1) && i <= ((5*page)-1)){
                purchasedOrders.add(purchasedOrderResponses.get(i));
            }
        }
        return new PurchasedResponse(purchasedOrders, totalPage);
    }

    @Override
    public PurchasedResponse getNewPurchases(int page) {
        if(page == 1){
            purchasedOrderResponses = new ArrayList<>();
            List<PurchasedOrderEntity> purchasedOrderEntities = purchasedOrdersRepository.findAll();
            if(purchasedOrderEntities.isEmpty())
                return null;

            purchasedOrderEntities = purchasedOrderEntities.stream()
                    .filter(purchasedOrderEntity ->
                        purchasedOrderEntity.getPurchasedOrderStatus() == PurchasedOrderStatus.Waiting
                    ).collect(Collectors.toList());

            purchasedOrderEntities.sort(
                    Comparator.comparing(PurchasedOrderEntity::getPurchaseDateTime)
            );

            purchasedOrderEntities.forEach(purchasedOrder -> {
                purchasedOrderResponses.add(purchasedMapper.convertToReponse(purchasedOrder));
            });
        }

        int totalPage = (purchasedOrderResponses.size() % 5) == 0 ? (purchasedOrderResponses.size() / 5) : ((purchasedOrderResponses.size()/5)+1);
        List<PurchasedOrderResponse> purchasedOrders = new ArrayList<>();
        for(int i = 0; i < purchasedOrderResponses.size(); i++){
            if(i >= (5*(page -1) - 1) && i <= ((5*page)-1)){
                purchasedOrders.add(purchasedOrderResponses.get(i));
            }
        }
        return new PurchasedResponse(purchasedOrders, totalPage);
    }

    @Override
    public PurchasedResponse getProgress(int page) {
        if(page == 1){
            purchasedOrderResponses = new ArrayList<>();
            List<PurchasedOrderEntity> purchasedOrderEntities = purchasedOrdersRepository.findAll();
            if(purchasedOrderEntities.isEmpty())
                return null;

            purchasedOrderEntities = purchasedOrderEntities.stream()
                    .filter(purchasedOrderEntity ->
                            purchasedOrderEntity.getPurchasedOrderStatus() == PurchasedOrderStatus.Process
                    ).collect(Collectors.toList());

            purchasedOrderEntities.sort(
                    Comparator.comparing(PurchasedOrderEntity::getPurchaseDateTime)
            );

            purchasedOrderEntities.forEach(purchasedOrder -> {
                purchasedOrderResponses.add(purchasedMapper.convertToReponse(purchasedOrder));
            });
        }

        int totalPage = (purchasedOrderResponses.size() % 5) == 0 ? (purchasedOrderResponses.size() / 5) : ((purchasedOrderResponses.size()/5)+1);
        List<PurchasedOrderResponse> purchasedOrders = new ArrayList<>();
        for(int i = 0; i < purchasedOrderResponses.size(); i++){
            if(i >= (5*(page -1) - 1) && i <= ((5*page)-1)){
                purchasedOrders.add(purchasedOrderResponses.get(i));
            }
        }
        return new PurchasedResponse(purchasedOrders, totalPage);
    }

    @Override
    public PurchasedResponse getDelivered(int page) {
        if(page == 1){
            purchasedOrderResponses = new ArrayList<>();
            List<PurchasedOrderEntity> purchasedOrderEntities = purchasedOrdersRepository.findAll();
            if(purchasedOrderEntities.isEmpty())
                return null;

            purchasedOrderEntities = purchasedOrderEntities.stream()
                    .filter(purchasedOrderEntity ->
                            purchasedOrderEntity.getPurchasedOrderStatus() == PurchasedOrderStatus.Delivered
                    ).collect(Collectors.toList());

            purchasedOrderEntities.sort(
                    Comparator.comparing(PurchasedOrderEntity::getPurchaseDateTime)
            );

            purchasedOrderEntities.forEach(purchasedOrder -> {
                purchasedOrderResponses.add(purchasedMapper.convertToReponse(purchasedOrder));
            });
        }

        int totalPage = (purchasedOrderResponses.size() % 5) == 0 ? (purchasedOrderResponses.size() / 5) : ((purchasedOrderResponses.size()/5)+1);
        List<PurchasedOrderResponse> purchasedOrders = new ArrayList<>();
        for(int i = 0; i < purchasedOrderResponses.size(); i++){
            if(i >= (5*(page -1) - 1) && i <= ((5*page)-1)){
                purchasedOrders.add(purchasedOrderResponses.get(i));
            }
        }
        return new PurchasedResponse(purchasedOrders, totalPage);
    }

    @Override
    public void updatePurchasedOrder(int purchasedOrderId, String purchasedStatus) {
        Optional<PurchasedOrderEntity> purchasedOrderEntity = purchasedOrdersRepository.findById(purchasedOrderId);
        if(purchasedOrderEntity.isPresent()){
            PurchasedOrderEntity purchasedOrder = purchasedOrderEntity.get();
            purchasedOrder.setPurchasedOrderStatus(PurchasedOrderStatus.valueOf(purchasedStatus));
            purchasedOrdersRepository.save(purchasedOrder);
        }
    }

    @Override
    public List<RevenueBySubCategoryResponse> getRevenueBySubCategory() {
        List<RevenueBySubCategoryResponse> revenue = new ArrayList<>();
        List<PurchasedProductEntity> purchasedProductEntities = purchasedProductRepository.findAll();
        if (purchasedProductEntities.isEmpty())
            return null;
        Map<String, Long> productCountMap = purchasedProductEntities.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getProductEntity().getSubCategory().getCategory().getCategoryName(),
                        Collectors.counting()
                ));

        long total = productCountMap.values().stream()
                .mapToLong(Long::longValue)
                .sum();

        productCountMap.forEach((key, value) -> {
            float percent = ((float) value / total) * 100;
            float roundedPercent = Math.round(percent * 10f) / 10f;
            revenue.add(new RevenueBySubCategoryResponse(key, roundedPercent));
        });
        return revenue;
    }

    @Override
    public List<RevenueByMonth> getRevenueByMonth() {
        List<PurchasedOrderEntity> purchasedOrderEntities = purchasedOrdersRepository.findAll().stream()
                .filter(p -> p.getPurchasedOrderStatus() == PurchasedOrderStatus.Delivered)
                .collect(Collectors.toList());
        if(purchasedOrderEntities.isEmpty())
            return null;
        Map<Month, Integer> revenueByMonth = purchasedOrderEntities.stream()
                .collect(Collectors.groupingBy(
                        order -> Month.from(order.getPurchaseDateTime()),
                        Collectors.summingInt(PurchasedOrderEntity::getTotalMoney)
                ));
        List<RevenueByMonth> revenue = new ArrayList<>();
        revenueByMonth.forEach((month, revenues) -> {
            revenue.add(new RevenueByMonth(month, revenues));
        });
        return revenue;
    }
}
