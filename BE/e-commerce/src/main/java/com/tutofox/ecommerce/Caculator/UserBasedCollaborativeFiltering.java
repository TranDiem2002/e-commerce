package com.tutofox.ecommerce.Caculator;

import com.tutofox.ecommerce.Entity.*;
import com.tutofox.ecommerce.Repository.Customer.ProductCustomerRepository;
import com.tutofox.ecommerce.Repository.Customer.ProductRatingCustomerRepository;
import com.tutofox.ecommerce.Repository.PurchasedOrdersRepository;
import com.tutofox.ecommerce.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserBasedCollaborativeFiltering {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRatingCustomerRepository productRating;

    @Autowired
    private ProductCustomerRepository productCustomerRepository;

    @Autowired
    private ContentBaseCore contentBaseCore;

    @Autowired
    private PurchasedOrdersRepository purchasedOrdersRepository;

    // tìm người dùng tương đồng với người dùng đăng nhập
    private List<UserSimilarity> findSimilarUser (UserEntity user,int subCategoryId){
        List<UserSimilarity> userSimilarities = new ArrayList<>();
        List<ProductEntity> productEntities = new ArrayList<>();
        List<UserEntity> userEntities = userRepository.findAll();
        for(UserEntity userEntity : userEntities){
            if(userEntity.getUserId() == user.getUserId()){
                continue;
            }
            List<PurchasedOrderEntity> purchasedOrderEntities = purchasedOrdersRepository.findAll().stream()
                    .filter(x -> x.getUserEntity().getUserId() == user.getUserId())
                    .collect(Collectors.toList());
            if(purchasedOrderEntities.isEmpty())
                continue;
            purchasedOrderEntities.forEach(purchasedOrderEntity -> {
                List<PurchasedProductEntity> purchasedProductEntities = purchasedOrderEntity.getPurchasedProducts();
                purchasedProductEntities.forEach(purchasedProductEntity -> {
                    if (!productEntities.contains(purchasedProductEntity.getProductEntity()))
                        productEntities.add(purchasedProductEntity.getProductEntity());});
            });
            if(!productEntities.isEmpty()){
                double similar = calculateSimilarity(user, userEntity, subCategoryId);
                userSimilarities.add(new UserSimilarity(userEntity, similar));
            }
        }
        return userSimilarities.stream()
                .sorted(Comparator.comparing(UserSimilarity::getSimilarity).reversed())
                .collect(Collectors.toList());
    }

    private double calculateSimilarity(UserEntity user1, UserEntity user2,int subCategoryId){
        double similarSkin = calculateSkinSimilarity(user1, user2);

        double similarRating = calculateRatingSimilarity(user1, user2, subCategoryId);
        return similarSkin * 0.4 + similarRating* 0.6;
    }

    private double calculateSkinSimilarity(UserEntity user1, UserEntity user2){
        Set<Integer> skinType1  = user1.getSkinTypeEntities().stream()
                .map(SkinTypeEntity::getSkinTypeId)
                .collect(Collectors.toSet());
        Set<Integer> skinConcern1 = user1.getSkinConcerns().stream()
                .map(SkinConcernEntity::getConcernId)
                .collect(Collectors.toSet());
        Set<Integer> skinType2  = user2.getSkinTypeEntities().stream()
                .map(SkinTypeEntity::getSkinTypeId)
                .collect(Collectors.toSet());
        Set<Integer> skinConcern2 = user2.getSkinConcerns().stream()
                .map(SkinConcernEntity::getConcernId)
                .collect(Collectors.toSet());
        double skinType = calculateJaccardSimilarity(skinType1, skinType2);
        double skinConcern = calculateJaccardSimilarity(skinConcern1, skinConcern2);
        return (skinType + skinConcern)/2;
    }

    private double calculateRatingSimilarity(UserEntity user1, UserEntity user2,int subCategoryId){
        Map<Integer, Integer> productRating1 = getRatingUser(user1, subCategoryId);
        Map<Integer, Integer> productRating2 = getRatingUser(user2, subCategoryId);

        // Tìm các sản phẩm mà cả hai người dùng đã đánh giá
        Set<Integer> commonProducts = new HashSet<>(productRating1.keySet());
        commonProducts.retainAll(productRating2.keySet());

        // Nếu không có sản phẩm chung, trả về 0
        if (commonProducts.isEmpty()) {
            return 0.0;
        }

        // Tính tương đồng cosine
        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;

        for (Integer productId : commonProducts) {
            float rating1 = productRating1.get(productId);
            float rating2 = productRating2.get(productId);

            dotProduct += rating1 * rating2;
            norm1 += Math.pow(rating1, 2);
            norm2 += Math.pow(rating2, 2);
        }

        if (norm1 == 0 || norm2 == 0) {
            return 0.0;
        }

        // theo công thức tính Cosine Similarity
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    private Map<Integer, Integer> getRatingUser(UserEntity user,int subCategoryId){
        Map<Integer, Integer> productRating1 = productRating.getByUserId(user.getUserId()).stream()
                .collect(Collectors.toMap(
                        rating -> rating.getRatingId(),
                        rating -> rating.getRating()));

        Set<Integer> productEntities = productCustomerRepository.getAllProductBySubCategory(subCategoryId)
                .stream().map(product -> product.getProductId())
                .collect(Collectors.toSet());
        if(!productRating1.isEmpty()){
            productRating1.forEach((ratingId, ratingValue) -> {
                Optional<Integer> productId = productRating.getProductByRatingId(ratingId);
                if(productId.isPresent()){
                    productRating1.remove(ratingId);
                    if(productEntities.contains(productId.get()))
                        productRating1.put(productId.get(), ratingValue);
                }
            });
        }

        return productRating1;
    }

    // tính độ tương dồng của 2 người dùng
    private <T> double calculateJaccardSimilarity(Set<T> set1, Set<T> set2) {
        if (set1.isEmpty() && set2.isEmpty()) {
            return 1.0; // Hai tập rỗng được coi là giống nhau
        }

        // sẽ lấy tất cả các vấn đề về da của cả 2 người dùng
        Set<T> union = new HashSet<>(set1);
        union.addAll(set2);

        // lấy ván đề về da giống nhau của cả 2 người dùng
        Set<T> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);

        return (double) intersection.size() / union.size();
    }


    public List<ProductEntity> recommendProductsUserBased(UserEntity user,int subCategoryId) {
        //  Tìm những người dùng tương tự
        List<UserSimilarity> similarUsers = findSimilarUser(user, subCategoryId);
        //  Xây dựng map điểm số cho sản phẩm
        Map<Integer, Double> productScores = new HashMap<>();
        Map<Integer, Integer> productCounts = new HashMap<>();
        // Lấy các sản phẩm mà người dùng hiện tại đã mua/đánh giá
        Set<Integer> userProducts = getUserProducts(user, subCategoryId);
        if(similarUsers.isEmpty()){
            contentBaseCore.calculateContentBasedScore(user, productCustomerRepository.getAllProductBySubCategory(subCategoryId));}
        // Duyệt qua từng người dùng tương tự
        for (UserSimilarity similarUser : similarUsers) {
            UserEntity otherUser = similarUser.getUser();
            double similarity = similarUser.getSimilarity();
            // Lấy đánh giá từ người dùng tương tự
            List<Rating> otherRatings = productRating.getByUserId(otherUser.getUserId());
            for (Rating rating : otherRatings) {
                Optional<Integer> product = productRating.getProductByRatingId(rating.getRatingId());
                if (product.isPresent()) {
                    int productId = product.get();
                    // Bỏ qua sản phẩm mà người dùng mục tiêu đã mua/đánh giá
                    if (userProducts.contains(productId)) {continue;}
                    // Tính điểm có trọng số
                    float ratingValue = rating.getRating();
                    double weightedRating = ratingValue * similarity;
                    productScores.put(productId, productScores.getOrDefault(productId, 0.0) + weightedRating);
                    productCounts.put(productId, productCounts.getOrDefault(productId, 0) + 1);
                }}}
        //  Tính điểm trung bình
        Map<Integer, Double> normalizedScores = new HashMap<>();
        for (Map.Entry<Integer, Double> entry : productScores.entrySet()) {
            int productId = entry.getKey();
            double totalScore = entry.getValue();
            int count = productCounts.get(productId);
            normalizedScores.put(productId, totalScore / count);
        }
        // Sắp xếp sản phẩm theo điểm và trả về kết quả
        List<Integer> recommendedProductIds;
        if (normalizedScores == null || normalizedScores.isEmpty()) {
            return new ArrayList<>();
        } else {
            recommendedProductIds = normalizedScores.entrySet().stream()
                    .sorted(Map.Entry.<Integer, Double>comparingByValue().reversed())
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());
        }
        return productCustomerRepository.findByProductIdIn(recommendedProductIds);
    }

    //Lấy danh sách sản phẩm mà người dùng đã tương tác
    private Set<Integer> getUserProducts(UserEntity user,int subCategoryId) {

        List<Integer> productIds = new ArrayList<>();

        List<PurchasedOrderEntity> purchasedOrderEntities = purchasedOrdersRepository.findAll().stream()
                .filter(x -> x.getUserEntity().getUserId() == user.getUserId())
                .collect(Collectors.toList());

        if(purchasedOrderEntities.isEmpty())
            return null;

        purchasedOrderEntities.forEach(purchasedOrderEntity -> {
            List<PurchasedProductEntity> purchasedProductEntities = purchasedOrderEntity.getPurchasedProducts();
            purchasedProductEntities.forEach(purchasedProductEntity -> {
                if (!productIds.contains(purchasedProductEntity.getProductEntity().getProductId()))
                    productIds.add(purchasedProductEntity.getProductEntity().getProductId());
            });
        });

        return new HashSet<>(productIds);
    }
}
