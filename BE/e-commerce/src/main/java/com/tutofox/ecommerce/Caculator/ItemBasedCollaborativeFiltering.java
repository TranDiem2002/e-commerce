package com.tutofox.ecommerce.Caculator;

import com.tutofox.ecommerce.Entity.ProductEntity;
import com.tutofox.ecommerce.Entity.Rating;
import com.tutofox.ecommerce.Entity.UserEntity;
import com.tutofox.ecommerce.Repository.Customer.ProductCustomerRepository;
import com.tutofox.ecommerce.Repository.Customer.ProductRatingCustomerRepository;
import com.tutofox.ecommerce.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ItemBasedCollaborativeFiltering {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductRatingCustomerRepository productRating;

    @Autowired
    private ProductCustomerRepository productCustomerRepository;

    @Autowired
    private ContentBaseCore contentBaseCore;

    public double calculateProductSimilarity(ProductEntity product1, ProductEntity product2){
        // 1. Tương đồng về thành phần (40%)
        double ingredientSimilarity = calculateIngredientSimilarity(product1, product2);

        // 2. Tương đồng về công dụng (30%)
        double featureSimilarity = calculateFeatureSimilarity(product1, product2);

        // 3. Tương đồng về loại da và vấn đề da (20%)
        double skinTargetSimilarity = calculateSkinTargetSimilarity(product1, product2);

        // 4. Tương đồng về danh mục (10%)
        double categorySimilarity = calculateCategorySimilarity(product1, product2);

        // Kết hợp các điểm tương đồng với trọng số
        return (ingredientSimilarity * 0.4) +
                (featureSimilarity * 0.3) +
                (skinTargetSimilarity * 0.2) +
                (categorySimilarity * 0.1);
    }

    //tính độ tương đồng của thành phần
    public double calculateIngredientSimilarity(ProductEntity product1, ProductEntity product2){
        Set<Integer> ingredient1 = product1.getIngredientEntities().stream()
                .map(ingredientEntity -> ingredientEntity.getIngredientId())
                .collect(Collectors.toSet());

        Set<Integer> ingredient2 = product2.getIngredientEntities().stream()
                .map(ingredientEntity -> ingredientEntity.getIngredientId())
                .collect(Collectors.toSet());
        return calculateJaccardSimilarity(ingredient1, ingredient2);
    }

    //tương đồng về công dụng
    public double calculateFeatureSimilarity(ProductEntity product1, ProductEntity product2){
        Set<Integer> feature1 = product1.getFeatureEntities().stream()
                .map(featureEntity -> featureEntity.getFeatureId())
                .collect(Collectors.toSet());
        Set<Integer> feature2 = product2.getFeatureEntities().stream()
                .map(featureEntity -> featureEntity.getFeatureId())
                .collect(Collectors.toSet());
        return calculateJaccardSimilarity(feature1, feature2);
    }

    //tương đồng về loại da và vấn đề về da
    public double calculateSkinTargetSimilarity(ProductEntity product1, ProductEntity product2){
        Set<Integer> skinConcern1 = product1.getSkinConcernEntities().stream()
                .map(skinConcernEntity ->  skinConcernEntity.getConcernId())
                .collect(Collectors.toSet());

        Set<Integer> skinType1 = product1.getSkinTypeEntities().stream()
                .map(skinTypeEntity ->  skinTypeEntity.getSkinTypeId())
                .collect(Collectors.toSet());

        Set<Integer> skinConcern2 = product2.getSkinConcernEntities().stream()
                .map(skinConcernEntity ->  skinConcernEntity.getConcernId())
                .collect(Collectors.toSet());

        Set<Integer> skinType2 = product2.getSkinTypeEntities().stream()
                .map(skinTypeEntity ->  skinTypeEntity.getSkinTypeId())
                .collect(Collectors.toSet());
        return calculateJaccardSimilarity(skinConcern1, skinConcern2) * 0.5 + calculateJaccardSimilarity(skinType1, skinType2)*0.5;
    }

    /**
     * Tính tương đồng về danh mục
     */
    private double calculateCategorySimilarity(ProductEntity product1, ProductEntity product2) {
        // So sánh danh mục con
        boolean sameSubCategory = product1.getSubCategory().getSubCategoryId() ==
                product2.getSubCategory().getSubCategoryId();

        // So sánh danh mục cha
        boolean sameMainCategory = product1.getSubCategory().getCategory().getCategoryId() ==
                product2.getSubCategory().getCategory().getCategoryId();

        if (sameSubCategory) {
            return 1.0; // Cùng danh mục con
        } else if (sameMainCategory) {
            return 0.5; // Cùng danh mục cha
        } else {
            return 0.0; // Khác hoàn toàn
        }
    }

    // tính độ tương dồng
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

    public List<ProductEntity> recommendProductsItemBased(UserEntity user) {
        List<ProductEntity> userLikedProducts = getUserLikedProducts(user);
        Set<Integer> userProductIds = new HashSet<>();
        if (userLikedProducts == null){
            userProductIds = userLikedProducts.stream()
                    .map(ProductEntity::getProductId)
                    .collect(Collectors.toSet());
        }

        // Tìm các sản phẩm tương tự
        Map<Integer, Double> productSimilarityScores = new HashMap<>();

        // Lấy tất cả sản phẩm
        List<ProductEntity> allProducts = productRepository.findAll();

        // Với mỗi sản phẩm người dùng đã thích
        for (ProductEntity likedProduct : userLikedProducts) {
            // Tính điểm tương đồng với tất cả sản phẩm khác
            for (ProductEntity candidateProduct : allProducts) {
                // Bỏ qua sản phẩm người dùng đã đánh giá
                if (userProductIds.contains(candidateProduct.getProductId())) {
                    continue;
                }

                double similarity = calculateProductSimilarity(likedProduct, candidateProduct);

                // giá trị lớn nhất của độ tương đồng
                int productId = candidateProduct.getProductId();
                double currentScore = productSimilarityScores.getOrDefault(productId, 0.0);
                if (similarity > currentScore) {
                    productSimilarityScores.put(productId, similarity);
                }
            }
        }

        // Sắp xếp và lấy N sản phẩm được đề xuất cao nhất
        List<Integer> recommendedProductIds = productSimilarityScores.entrySet().stream()
                .sorted(Map.Entry.<Integer, Double>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        return productCustomerRepository.findByProductIdIn(recommendedProductIds);
    }

    public List<ProductEntity> getUserLikedProducts(UserEntity user){
        List<Integer> productIds = new ArrayList<>();

        List<Rating> ratings = productRating.getByUserId(user.getUserId()).stream()
                .filter(rating -> rating.getRating() > 3)
                .collect(Collectors.toList());
        for(Rating rating : ratings){
            Optional<Integer> productId = productRating.getProductByRatingId(rating.getRatingId());
            if (productId.isPresent()){
                productIds.add(productId.get());
            }
        }
        if (productIds.isEmpty())
            return null;
        return productCustomerRepository.findByProductIdIn(productIds);
    }
}
