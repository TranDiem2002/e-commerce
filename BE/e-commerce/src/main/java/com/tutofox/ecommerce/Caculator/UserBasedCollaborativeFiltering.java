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
    private List<UserSimilarity> findSimilarUser(UserEntity user, int subCategoryId) {
        List<UserSimilarity> userSimilarities = new ArrayList<>();

        // Lấy sản phẩm đã mua của người dùng hiện tại
        List<ProductEntity> currentUserProducts = getUserPurchasedProducts(user.getUserId());

        // Nếu người dùng hiện tại không có đơn hàng nào, trả về danh sách trống
        if (currentUserProducts.isEmpty()) {
            return userSimilarities;
        }

        // Tìm tất cả người dùng khác (không phải người dùng hiện tại)
        List<UserEntity> otherUsers = userRepository.findAll().stream()
                .filter(u -> u.getUserId() != user.getUserId())
                .collect(Collectors.toList());

        // Tính độ tương đồng với từng người dùng khác
        for (UserEntity otherUser : otherUsers) {
            // Lấy sản phẩm đã mua của người dùng khác
            List<ProductEntity> otherUserProducts = getUserPurchasedProducts(otherUser.getUserId());

            // Nếu người dùng khác có đơn hàng
            if (!otherUserProducts.isEmpty()) {
                // Tính độ tương đồng
                double similarity = calculateSimilarity(user, otherUser, subCategoryId);

                // Chỉ thêm vào kết quả nếu độ tương đồng > 0
                if (similarity > 0) {
                    userSimilarities.add(new UserSimilarity(otherUser, similarity));
                }
            }
        }

        // Sắp xếp theo độ tương đồng giảm dần
        return userSimilarities.stream()
                .sorted(Comparator.comparing(UserSimilarity::getSimilarity).reversed())
                .collect(Collectors.toList());
    }

    private List<ProductEntity> getUserPurchasedProducts(int userId) {
        // Sử dụng truy vấn hiệu quả hơn để lấy đơn hàng của người dùng cụ thể
        List<PurchasedOrderEntity> userOrders = purchasedOrdersRepository.findAll().stream()
                .filter(p -> p.getUserEntity().getUserId() == userId).collect(Collectors.toList());
        Set<ProductEntity> uniqueProducts = new HashSet<>();

        for (PurchasedOrderEntity order : userOrders) {
            for (PurchasedProductEntity purchasedProduct : order.getPurchasedProducts()) {
                uniqueProducts.add(purchasedProduct.getProductEntity());
            }
        }

        return new ArrayList<>(uniqueProducts);
    }

    private double calculateSimilarity(UserEntity user1, UserEntity user2, int subCategoryId) {
        double similarSkin = calculateSkinSimilarity(user1, user2);
        double similarRating = calculateRatingSimilarity(user1, user2, subCategoryId);

        // Kết hợp hai loại tương đồng với trọng số
        return similarSkin * 0.5 + similarRating * 0.5;
    }

    private double calculateSkinSimilarity(UserEntity user1, UserEntity user2) {
        // Lấy các loại da và vấn đề da của người dùng 1
        Set<Integer> skinType1 = user1.getSkinTypeEntities().stream()
                .map(SkinTypeEntity::getSkinTypeId)
                .collect(Collectors.toSet());
        Set<Integer> skinConcern1 = user1.getSkinConcerns().stream()
                .map(SkinConcernEntity::getConcernId)
                .collect(Collectors.toSet());

        // Lấy các loại da và vấn đề da của người dùng 2
        Set<Integer> skinType2 = user2.getSkinTypeEntities().stream()
                .map(SkinTypeEntity::getSkinTypeId)
                .collect(Collectors.toSet());
        Set<Integer> skinConcern2 = user2.getSkinConcerns().stream()
                .map(SkinConcernEntity::getConcernId)
                .collect(Collectors.toSet());

        // Tính độ tương đồng Jaccard cho từng thuộc tính
        double skinType = calculateJaccardSimilarity(skinType1, skinType2);
        double skinConcern = calculateJaccardSimilarity(skinConcern1, skinConcern2);

        // Trả về trung bình của hai độ tương đồng
        return (skinType + skinConcern) / 2;
    }

    private double calculateRatingSimilarity(UserEntity user1, UserEntity user2, int subCategoryId) {
        // Lấy đánh giá của hai người dùng
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
            int rating1 = productRating1.get(productId);
            int rating2 = productRating2.get(productId);

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

    private Map<Integer, Integer> getRatingUser(UserEntity user, int subCategoryId) {
        // Lấy tất cả đánh giá của người dùng
        List<Rating> userRatings = productRating.getByUserId(user.getUserId());

        // Lấy tất cả sản phẩm thuộc danh mục con
        Set<Integer> productsInSubCategory = new HashSet<>();
        if (subCategoryId > 0) {
            productsInSubCategory = productCustomerRepository.getAllProductBySubCategory(subCategoryId)
                    .stream()
                    .map(ProductEntity::getProductId)
                    .collect(Collectors.toSet());
        }

        // Xây dựng map sản phẩm-đánh giá
        Map<Integer, Integer> productRatingMap = new HashMap<>();

        for (Rating rating : userRatings) {
            Optional<Integer> productIdOpt = productRating.getProductByRatingId(rating.getRatingId());
            if (productIdOpt.isPresent()) {
                Integer productId = productIdOpt.get();
                // Chỉ thêm sản phẩm nếu nó thuộc danh mục con ư
                if (subCategoryId <= 0 || productsInSubCategory.contains(productId)) {
                    productRatingMap.put(productId, rating.getRating());
                }
            }
        }

        return productRatingMap;
    }

    // tính độ tương dồng của 2 người dùng
    private <T> double calculateJaccardSimilarity(Set<T> set1, Set<T> set2) {
        if (set1.isEmpty() && set2.isEmpty()) {
            return 1.0; // Hai tập rỗng được coi là giống nhau
        }

        // sẽ lấy tất cả các vấn đề về da của cả 2 người dùng
        Set<T> union = new HashSet<>(set1);
        union.addAll(set2);

        // lấy vấn đề về da giống nhau của cả 2 người dùng
        Set<T> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);

        return (double) intersection.size() / union.size();
    }

    public Map<Integer, Double> recommendProductsUserBased(UserEntity user, int subCategoryId) {
        // Tìm những người dùng tương tự
        List<UserSimilarity> similarUsers = findSimilarUser(user, subCategoryId);

        // Xây dựng map điểm số cho sản phẩm
        Map<Integer, Double> productScores = new HashMap<>();
        Map<Integer, Integer> productCounts = new HashMap<>();

        // Lấy các sản phẩm mà người dùng hiện tại đã mua/đánh giá
        Set<Integer> userProducts = getUserProducts(user, subCategoryId);

        // Nếu không tìm thấy người dùng tương tự, sử dụng content-based
        if (similarUsers.isEmpty()) {
           return new HashMap<>();
        }

        // Duyệt qua từng người dùng tương tự
        for (UserSimilarity similarUser : similarUsers) {
            UserEntity otherUser = similarUser.getUser();
            double similarity = similarUser.getSimilarity();

            // Bỏ qua người dùng có độ tương đồng thấp
            if (similarity <= 0) continue;

            // Lấy đánh giá từ người dùng tương tự
            List<Rating> otherRatings = productRating.getByUserId(otherUser.getUserId());

            for (Rating rating : otherRatings) {
                Optional<Integer> productOpt = productRating.getProductByRatingId(rating.getRatingId());
                if (productOpt.isPresent()) {
                    int productId = productOpt.get();

                    // Bỏ qua sản phẩm mà người dùng mục tiêu đã mua/đánh giá
                    if (userProducts != null && userProducts.contains(productId)) {
                        continue;
                    }

                    // Tính điểm có trọng số
                    float ratingValue = rating.getRating();
                    double weightedRating = ratingValue * similarity;

                    productScores.put(productId, productScores.getOrDefault(productId, 0.0) + weightedRating);
                    productCounts.put(productId, productCounts.getOrDefault(productId, 0) + 1);
                }
            }
        }

        // Tính điểm trung bình
        Map<Integer, Double> normalizedScores = new HashMap<>();
        for (Map.Entry<Integer, Double> entry : productScores.entrySet()) {
            int productId = entry.getKey();
            double totalScore = entry.getValue();
            int count = productCounts.get(productId);
            normalizedScores.put(productId, totalScore / count);
        }

        // Sắp xếp sản phẩm theo điểm và trả về kết quả
        if (normalizedScores.isEmpty()) {
            return new HashMap<>();
        }

        // Sắp xếp normalizedScores theo value giảm dần
        LinkedHashMap<Integer, Double> sortedNormalizedScores = normalizedScores.entrySet()
                .stream()
                .sorted(Map.Entry.<Integer, Double>comparingByValue().reversed()) // sắp theo value giảm dần
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new // giữ nguyên thứ tự sắp xếp
                ));

        return sortedNormalizedScores;
    }

    // Lấy danh sách sản phẩm mà người dùng đã tương tác
    private Set<Integer> getUserProducts(UserEntity user, int subCategoryId) {
        List<PurchasedOrderEntity> purchasedOrderEntities = purchasedOrdersRepository.findAll().stream()
                .filter(p -> p.getUserEntity().getUserId() == user.getUserId()).collect(Collectors.toList());
        if (purchasedOrderEntities.isEmpty())
            return new HashSet<>();

        Set<Integer> productIds = new HashSet<>();

        for (PurchasedOrderEntity purchasedOrderEntity : purchasedOrderEntities) {
            List<PurchasedProductEntity> purchasedProductEntities = purchasedOrderEntity.getPurchasedProducts();
            for (PurchasedProductEntity purchasedProductEntity : purchasedProductEntities) {
                ProductEntity product = purchasedProductEntity.getProductEntity();

                if (subCategoryId > 0) {
                    if (product.getSubCategory().getSubCategoryId() == subCategoryId) {
                        productIds.add(product.getProductId());
                    }
                } else {
                    productIds.add(product.getProductId());
                }
            }
        }

        return productIds;
    }
}
