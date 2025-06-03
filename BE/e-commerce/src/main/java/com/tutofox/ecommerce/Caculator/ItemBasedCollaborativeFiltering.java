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

    // Cache để lưu trữ kết quả tính toán tương đồng giữa các sản phẩm
    private Map<String, Double> similarityCache = new HashMap<>();

    //Tính độ tương đồng tổng thể giữa hai sản phẩm
    public double calculateProductSimilarity(ProductEntity product1, ProductEntity product2) {
        // Tạo khóa cache để tránh tính toán lặp lại
        String cacheKey = getCacheKey(product1.getProductId(), product2.getProductId());

        // Kiểm tra cache
        if (similarityCache.containsKey(cacheKey)) {
            return similarityCache.get(cacheKey);
        }

        // 1. Tương đồng về thành phần (40%)
        double ingredientSimilarity = calculateIngredientSimilarity(product1, product2);

        // 2. Tương đồng về công dụng (30%)
        double featureSimilarity = calculateFeatureSimilarity(product1, product2);

        // 3. Tương đồng về loại da và vấn đề da (20%)
        double skinTargetSimilarity = calculateSkinTargetSimilarity(product1, product2);

        // 4. Tương đồng về danh mục (10%)
        double categorySimilarity = calculateCategorySimilarity(product1, product2);

        // Kết hợp các điểm tương đồng với trọng số
        double similarity = (ingredientSimilarity * 0.4) +
                (featureSimilarity * 0.3) +
                (skinTargetSimilarity * 0.2) +
                (categorySimilarity * 0.1);

        // Lưu kết quả vào cache
        similarityCache.put(cacheKey, similarity);

        return similarity;
    }

    // Tạo khóa duy nhất cho cache similarity
    private String getCacheKey(int id1, int id2) {
        // Đảm bảo thứ tự id không ảnh hưởng đến khóa
        return id1 < id2 ? id1 + "_" + id2 : id2 + "_" + id1;
    }

    // Tính độ tương đồng của thành phần
    public double calculateIngredientSimilarity(ProductEntity product1, ProductEntity product2) {
        Set<Integer> ingredient1 = product1.getIngredientEntities().stream()
                .map(ingredientEntity -> ingredientEntity.getIngredientId())
                .collect(Collectors.toSet());

        Set<Integer> ingredient2 = product2.getIngredientEntities().stream()
                .map(ingredientEntity -> ingredientEntity.getIngredientId())
                .collect(Collectors.toSet());

        return calculateJaccardSimilarity(ingredient1, ingredient2);
    }

    // Tính tương đồng về công dụng
    public double calculateFeatureSimilarity(ProductEntity product1, ProductEntity product2) {
        Set<Integer> feature1 = product1.getFeatureEntities().stream()
                .map(featureEntity -> featureEntity.getFeatureId())
                .collect(Collectors.toSet());

        Set<Integer> feature2 = product2.getFeatureEntities().stream()
                .map(featureEntity -> featureEntity.getFeatureId())
                .collect(Collectors.toSet());

        return calculateJaccardSimilarity(feature1, feature2);
    }

    // Tính tương đồng về loại da và vấn đề về da
    public double calculateSkinTargetSimilarity(ProductEntity product1, ProductEntity product2) {
        Set<Integer> skinConcern1 = product1.getSkinConcernEntities().stream()
                .map(skinConcernEntity -> skinConcernEntity.getConcernId())
                .collect(Collectors.toSet());

        Set<Integer> skinType1 = product1.getSkinTypeEntities().stream()
                .map(skinTypeEntity -> skinTypeEntity.getSkinTypeId())
                .collect(Collectors.toSet());

        Set<Integer> skinConcern2 = product2.getSkinConcernEntities().stream()
                .map(skinConcernEntity -> skinConcernEntity.getConcernId())
                .collect(Collectors.toSet());

        Set<Integer> skinType2 = product2.getSkinTypeEntities().stream()
                .map(skinTypeEntity -> skinTypeEntity.getSkinTypeId())
                .collect(Collectors.toSet());

        return calculateJaccardSimilarity(skinConcern1, skinConcern2) * 0.5 +
                calculateJaccardSimilarity(skinType1, skinType2) * 0.5;
    }

    // Tính tương đồng về danh mục
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

    // Tính độ tương đồng Jaccard giữa hai tập hợp
    private <T> double calculateJaccardSimilarity(Set<T> set1, Set<T> set2) {
        if (set1.isEmpty() && set2.isEmpty()) {
            return 1.0; // Hai tập rỗng được coi là giống nhau
        }

        // Tạo union (tập hợp của cả hai)
        Set<T> union = new HashSet<>(set1);
        union.addAll(set2);

        // Tạo intersection (phần chung của cả hai)
        Set<T> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);

        return (double) intersection.size() / union.size();
    }

     // Đề xuất sản phẩm dựa trên phương pháp Item-Based CF
    public Map<Integer, Double> recommendProductsItemBased(UserEntity user, int subCategoryId) {
        // Lấy sản phẩm người dùng đã thích
        List<ProductEntity> userLikedProducts = getUserLikedProducts(user);

        // Nếu người dùng chưa thích sản phẩm nào
        if (userLikedProducts == null || userLikedProducts.isEmpty()) {
           return new HashMap<>();
        }

        // Tạo tập hợp ID sản phẩm người dùng đã thích để tìm kiếm nhanh
        Set<Integer> userProductIds = userLikedProducts.stream()
                .map(ProductEntity::getProductId)
                .collect(Collectors.toSet());

        // Map để lưu điểm tương đồng cho mỗi sản phẩm
        Map<Integer, Double> productSimilarityScores = new HashMap<>();

        // Lấy tất cả sản phẩm - hiệu quả hơn nếu chỉ lấy sản phẩm chưa được đánh giá
        List<ProductEntity> candidateProducts = productRepository.findAll().stream()
                .filter(p ->
                        !userProductIds.contains(p.getProductId()) &&
                                p.getSubCategory().getSubCategoryId() == subCategoryId
                )
                .collect(Collectors.toList());


        // Với mỗi sản phẩm người dùng đã thích
        for (ProductEntity likedProduct : userLikedProducts) {
            // Tính điểm tương đồng với các sản phẩm chưa đánh giá
            for (ProductEntity candidateProduct : candidateProducts) {
                double similarity = calculateProductSimilarity(likedProduct, candidateProduct);

                // Cập nhật điểm số cao nhất cho mỗi sản phẩm
                int productId = candidateProduct.getProductId();
                double currentScore = productSimilarityScores.getOrDefault(productId, 0.0);
                if (similarity > currentScore) {
                    productSimilarityScores.put(productId, similarity);
                }
            }
        }

        // Nếu không có sản phẩm gợi ý, trả về danh sách rỗng
        if (productSimilarityScores.isEmpty()) {
            return new HashMap<>();
        }

        // Sắp xếp
        LinkedHashMap<Integer, Double> sortedProductSimilar = productSimilarityScores.entrySet()
                .stream()
                .sorted(Map.Entry.<Integer, Double>comparingByValue().reversed()) // sắp theo value giảm dần
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new // giữ nguyên thứ tự sắp xếp
                ));

        return sortedProductSimilar;
    }

    //Lấy sản phẩm mà người dùng đã đánh giá cao (thích)
    public List<ProductEntity> getUserLikedProducts(UserEntity user) {
        if (user == null) {
            return Collections.emptyList();
        }

        List<Integer> productIds = new ArrayList<>();

        // Lấy các đánh giá cao từ người dùng (> 3 điểm)
        List<Rating> ratings = productRating.getByUserId(user.getUserId()).stream()
                .filter(rating -> rating.getRating() > 3)
                .collect(Collectors.toList());

        // Thu thập ID sản phẩm từ đánh giá
        for (Rating rating : ratings) {
            Optional<Integer> productId = productRating.getProductByRatingId(rating.getRatingId());
            if (productId.isPresent()) {
                productIds.add(productId.get());
            }
        }

        // Trả về danh sách rỗng nếu không có sản phẩm
        if (productIds.isEmpty()) {
            return Collections.emptyList();
        }

        return productCustomerRepository.findByProductIdIn(productIds);
    }
}
