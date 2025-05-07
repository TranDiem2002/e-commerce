package com.tutofox.ecommerce.Caculator;

import com.tutofox.ecommerce.Entity.*;
import com.tutofox.ecommerce.Repository.Customer.ProductCustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ContentBaseCore {

    private final UserSetting userSetting;

    @Autowired
    private ProductCustomerRepository productCustomerRepository;

    public ContentBaseCore() {
        this.userSetting = new UserSetting();
    }

    public List<Integer> calculateContentBasedScore(UserEntity userEntity, List<ProductEntity> productEntities){

        Map<String, Double> userMap = calculateUser(userEntity);
        Map<Integer, Map<String, Double>> productList = calculateProductBySubCategory(productEntities);

        List<Map.Entry<Integer, Double>> scoredProducts = new ArrayList<>();
        for (Map.Entry<Integer, Map<String, Double>> entry : productList.entrySet()) {
            int productId = entry.getKey();
            Map<String, Double> productVector = entry.getValue();
            double similarity = cosineSimilarity(userMap, productVector);
            scoredProducts.add(new AbstractMap.SimpleEntry<>(productId, similarity));
        }

        // Sắp xếp giảm dần theo độ tương đồng
        return scoredProducts.stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    public static double cosineSimilarity(Map<String, Double> user, Map<String, Double> product) {
        Set<String> allKeys = new HashSet<>();
        allKeys.addAll(user.keySet());
        allKeys.addAll(product.keySet());

        double dotProduct = 0.0;
        double magnitudeUser = 0.0;
        double magnitudeProduct = 0.0;

        for (String key : allKeys) {
            double a = user.getOrDefault(key, 0.0);
            double b = product.getOrDefault(key, 0.0);
            dotProduct += a * b;
            magnitudeUser += a * a;
            magnitudeProduct += b * b;
        }

        if (magnitudeUser == 0 || magnitudeProduct == 0) return 0.0;
        return dotProduct / (Math.sqrt(magnitudeUser) * Math.sqrt(magnitudeProduct));
    }

    public Map<String, Double> calculateUser(UserEntity userEntity){
        List<SkinTypeEntity> skinTypeEntities = userEntity.getSkinTypeEntities();
        List<SkinConcernEntity> skinConcernEntities = userEntity.getSkinConcerns();
        Map<String, Double> userVector = new HashMap<>();
        // Map kết quả chứa tổng giá trị
        Map<String, Double> sumValues = new HashMap<>();

        // Map đếm số lần xuất hiện của mỗi key
        Map<String, Integer> keyCount = new HashMap<>();

        List<Map<String, Double>> userSkin = new ArrayList<>();

        userSkin.addAll(skinTypeEntities.stream()
                        .map(skinType -> getSkinTypePreferences(SkinType.valueOf(skinType.getSkinTypeName())))
                        .collect(Collectors.toList())
        );

        userSkin.addAll(skinConcernEntities.stream()
                        .map( skinConcern -> getSkinConcernPreferences(SkinConcerns.valueOf(skinConcern.getConcernName())))
                        .collect(Collectors.toList())
                );

        for (Map<String, Double> setting : userSkin) {
            for (Map.Entry<String, Double> entry : setting.entrySet()) {
                String key = entry.getKey();
                Double value = entry.getValue();
                sumValues.put(key, sumValues.getOrDefault(key, 0.0) + value);
                keyCount.put(key, keyCount.getOrDefault(key, 0) + 1);
            }
        }

        // Tính giá trị trung bình cho mỗi key
        for (Map.Entry<String, Double> entry : sumValues.entrySet()) {
            String key = entry.getKey();
            Double sum = entry.getValue();
            Integer count = keyCount.get(key);

            // Tính trung bình và lưu vào kết quả
            userVector.put(key, sum / count);
        }
        skinTypeEntities.forEach(x -> userVector.put(x.getSkinTypeName(), 1.0));
        skinConcernEntities.forEach(x -> userVector.put(x.getConcernName(), 1.0));
        return userVector;
    }

    private Map<String, Double> getSkinTypePreferences(SkinType skinType) {
        switch (skinType) {
            case Oil:
                return userSetting.getSkinOil();
            case Dry:
                return userSetting.getSkinDry();
            case Sensitive:
                return userSetting.getSkinSensitive();
            case Normal:
                return userSetting.getSkinNormal();
            case Combination:
                return userSetting.getSkinCombination();
            default:
                return new HashMap<>();
        }
    }

    private Map<String, Double> getSkinConcernPreferences(SkinConcerns concern) {
        switch (concern) {
            case Acne:
                return userSetting.getSkinAcne();
            case EnlargedPores:
                return userSetting.getSkinEnlargedPores();
            case Melasma:
                Map<String, Double> result = new HashMap<>();
                result.putAll(userSetting.getSkinMelasmaFeature());
                result.putAll(userSetting.getSkinMalasmaIngredient());
                return result;
            default:
                return new HashMap<>();
        }
    }

    private Map<Integer,Map<String, Double>> calculateProductBySubCategory(List<ProductEntity> productEntities){
        Map<Integer,Map<String,Double>> productMap = new HashMap<>();

        if(productEntities.isEmpty())
            return null;
        productEntities.forEach(product -> {
            Map<String, Double> productList = new HashMap<>();

            List<IngredientEntity> ingredientEntities = product.getIngredientEntities();
            if(!ingredientEntities.isEmpty()){
                ingredientEntities.forEach(ingredient -> {
                    productList.put(ingredient.getIngredientName(), 1.0);
                });
            }

            List<FeatureEntity> featureEntities = product.getFeatureEntities();
            if(!featureEntities.isEmpty()){
                featureEntities.forEach(feature -> {
                    productList.put(feature.getFeatureName(), 1.0);
                });
            }

            List<SkinConcernEntity> skinConcernEntities = product.getSkinConcernEntities();
            if(!skinConcernEntities.isEmpty()){
                skinConcernEntities.forEach(concern -> {
                    productList.put(concern.getConcernName(), 1.0);
                });
            }
            List<SkinTypeEntity> skinTypeEntities = product.getSkinTypeEntities();
            if(!skinTypeEntities.isEmpty()){
                skinTypeEntities.forEach(type -> {
                    productList.put(type.getSkinTypeName(), 1.0);
                });
            }

            productMap.put(product.getProductId(), productList);
        });
        return productMap;
    }
}
