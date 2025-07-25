package com.tutofox.ecommerce.Service.Impl;

import com.tutofox.ecommerce.Caculator.ContentBaseCore;
import com.tutofox.ecommerce.Caculator.ItemBasedCollaborativeFiltering;
import com.tutofox.ecommerce.Caculator.UserBasedCollaborativeFiltering;
import com.tutofox.ecommerce.Entity.*;
import com.tutofox.ecommerce.Model.Request.ProductRequest;
import com.tutofox.ecommerce.Model.Request.ReviewProductRequest;
import com.tutofox.ecommerce.Model.Request.SubCategoryRequest;
import com.tutofox.ecommerce.Model.Response.*;
import com.tutofox.ecommerce.Repository.*;
import com.tutofox.ecommerce.Repository.Customer.*;
import com.tutofox.ecommerce.Service.ProductService;
import com.tutofox.ecommerce.Utils.ProductMapper;
import com.tutofox.ecommerce.Utils.RatingMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private ProductCustomerRepository productCustomerRepository;

    @Autowired
    private ImageCustomerRepository imageCustomerRepository;

    @Autowired
    private SubCategoryRespository subCategoryRespository;

    @Autowired
    private SkinTypeCustomerRepository skinTypeCustomerRepository;

    @Autowired
    private SkinTypeRepository skinTypeRepository;

    @Autowired
    private IngredientProductRepository ingredientRepository;

    @Autowired
    private IngredientProductCustomerRepository ingredientCustomerRepository;

    @Autowired
    private FeatureRepository featureRepository;

    @Autowired
    private FeatureCustomerRepository featureCustomerRepository;

    @Autowired
    private SkinConcernCustomerRepository skinConcernCustomerRepository;

    @Autowired
    private SkinConcernRepository skinConcernRepository;

    @Autowired
    private ContentBaseCore contentBaseCore;

    @Autowired
    private UserBasedCollaborativeFiltering userBased;

    @Autowired
    private ItemBasedCollaborativeFiltering itemBased;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductCartRepository productCartRepository;

    @Autowired
    private RatingReponsitory ratingReponsitory;

    private ProductMapper productMapper;

    private RatingMapper ratingMapper;

    private List<ProductResponse> productPage;

    public ProductServiceImpl() {
        this.productMapper = new ProductMapper();
        this.ratingMapper = new RatingMapper();
    }

    @Override
    public String insertProduct(ProductRequest productRequest) {
        Optional<ProductEntity> product = productRepository.findById(productRequest.getProductId());
        if(product.isPresent())
            return "Sản phẩm có id: " + productRequest.getProductId() + "đã tồn tại";

        Optional<SubCategoryEntity> subCategoryEntity = subCategoryRespository.findById(productRequest.getSubCategoryId());
        if(!subCategoryEntity.isPresent())
            return "SubCategory không tồn tại";

        ProductEntity productEntity = productMapper.convertToEntity(productRequest);
        productRepository.save(productEntity);

        List<ImageEntity> imageEntities1 = saveImage(productRequest.getImageLinks(),productEntity);

        if(!productRequest.getSkinTypes().isEmpty()){
            productEntity.setSkinTypeEntities(saveSkinType(productRequest.getSkinTypes(), productEntity));
        }

        if(!productRequest.getIngredientList().isEmpty()){
            productEntity.setIngredientEntities(saveIngredient(productRequest.getIngredientList(),productEntity));
        }

        if(!productRequest.getFeatures().isEmpty()){
            productEntity.setFeatureEntities(saveFeatureProduct(productRequest.getFeatures(), productEntity));
        }

        if(productRequest.getSkinConcerns() != null){
            productEntity.setSkinConcernEntities(saveConcern(productRequest.getSkinConcerns(), productEntity));
        }

        productEntity.setImage(imageEntities1);
        productEntity.setSubCategory(subCategoryEntity.get());
        productEntity.setShortDescription(productRequest.getShortDescription());
        productEntity.setDescription(productRequest.getDescription());
        productRepository.save(productEntity);
        return "Đã thêm sản phẩm thành công";
    }

    public List<ImageEntity> saveImage(List<String> imageLinks, ProductEntity product) {
        List<ImageEntity> images = imageLinks.stream().map(link -> {
            ImageEntity image = new ImageEntity();
            image.setProduct(product);
            image.setImageLink(link);
            return image;
        }).collect(Collectors.toList());
        return imageRepository.saveAll(images);
    }

    //lưu loại da phù hợp với sản phẩm
    public List<SkinTypeEntity> saveSkinType(List<String> skinTypes, ProductEntity productEntity){
        List<SkinTypeEntity> skinTypeEntities = new ArrayList<>();
            for(String skin : skinTypes){
                List<SkinTypeEntity> skinTypeEntity = skinTypeCustomerRepository.getSkinType(skin);
                if(skinTypeEntity.isEmpty()){
                    SkinTypeEntity skinType = new SkinTypeEntity();
                    skinType.setSkinTypeName(skin);
                    skinTypeEntities.add(skinTypeRepository.save(skinType));
                }
                else {
                    skinTypeEntities.add(skinTypeEntity.get(0));
                }
            }

            List<SkinTypeEntity> skinTypeEntities1 = productEntity.getSkinTypeEntities();
            if(skinTypeEntities1 != null){
                skinTypeEntities1.addAll(skinTypeEntities);
                return skinTypeEntities1;
            }
            return skinTypeEntities;
    }

    public List<SkinConcernEntity> saveConcern(List<String> concerns, ProductEntity productEntity){
        List<SkinConcernEntity> concernEntities = new ArrayList<>();

        for (String concern: concerns){
            List<SkinConcernEntity> skinConcernEntities = skinConcernCustomerRepository.getConcernByName(concern);
            if(skinConcernEntities.isEmpty()){
                SkinConcernEntity skinConcernEntity = new SkinConcernEntity();
                skinConcernEntity.setConcernName(concern);
                concernEntities.add(skinConcernRepository.save(skinConcernEntity));
            }
            else{
               concernEntities.add(skinConcernEntities.get(0));
            }
        }

        List<SkinConcernEntity> skinConcernEntities = productEntity.getSkinConcernEntities();
        if(skinConcernEntities != null){
            skinConcernEntities.addAll(concernEntities);
            return skinConcernEntities;
        }
        return concernEntities;
    }

    //lưu thành phần của sản phẩm
    public List<IngredientEntity> saveIngredient(List<String> ingredients, ProductEntity productEntity){
        List<IngredientEntity> ingredientEntities = new ArrayList<>();

            for (String ingredient: ingredients){
                List<IngredientEntity> ingredientEntities1 = ingredientCustomerRepository.getIngredient(ingredient);
                //check thành phần đó đã có chưa
                if(ingredientEntities1.isEmpty()){
                    IngredientEntity ingredientEntity = new IngredientEntity();
                    ingredientEntity.setIngredientName(ingredient);
                    ingredientEntities.add(ingredientRepository.save(ingredientEntity));
                }
                else{
                    ingredientEntities.add(ingredientEntities1.get(0));
                }
            }

            List<IngredientEntity> ingredientEntities1 = productEntity.getIngredientEntities();
            if(ingredientEntities1 != null){
                ingredientEntities1.addAll(ingredientEntities);
               return ingredientEntities1;
            }
           return ingredientEntities;
    }

    public List<FeatureEntity> saveFeatureProduct(List<String> features, ProductEntity productEntity){
        List<FeatureEntity> featureEntities = new ArrayList<>();

            for (String feature : features) {
                List<FeatureEntity> featureEntities1 = featureCustomerRepository.getFeature(feature);
                if (featureEntities1.isEmpty()) {
                    FeatureEntity featureEntity = new FeatureEntity();
                    featureEntity.setFeatureName(feature);
                    featureEntities.add(featureRepository.save(featureEntity));
                } else {
                    featureEntities.add(featureEntities1.get(0));
                }
            }

            List<FeatureEntity> featureEntities1 = productEntity.getFeatureEntities();

            if (featureEntities1 != null) {
                featureEntities1.addAll(featureEntities);
                return featureEntities1;
            }
           return featureEntities;
    }

    @Override
    public List<ProductResponse> getListBySubCategory(SubCategoryRequest subCategoryRequest) {
        //lấy danh sách sản phẩm theo subCategory
        List<ProductEntity> productEntities = productCustomerRepository.getAllProductBySubCategory(subCategoryRequest.getSubCategoryId());
        List<ProductResponse> productResponses = new ArrayList<>();
        for(ProductEntity product: productEntities){
            List<ImageEntity> imageEntities = imageCustomerRepository.getImageByProductId(product.getProductId());
            productResponses.add(productMapper.convertToResponse(product,imageEntities));
        }
        return productResponses;
    }

//    @Override
//    public ProductResponsePage getListByPage(UserDetails userDetail, int subCategoryId, int page, int sizePage) {
//       Optional<UserEntity> user = userRepository.findByEmail(userDetail.getUsername());
//        List<ProductResponse> result = new ArrayList<>();
//        List<ProductEntity> productEntities = productCustomerRepository.getAllProductBySubCategory(subCategoryId);
//        if(page == 1){
//            productPage = new ArrayList<>();
//            List<Integer> productList = contentBaseCore.calculateContentBasedScore(user.get(), productEntities);
//            Map<Integer, ProductEntity> productMap = new HashMap<>();
//            for (ProductEntity product : productEntities) {
//                productMap.put(product.getProductId(), product);
//            }
//
//            productList.forEach(productId -> {
//                ProductEntity productEntity = productMap.get(productId);
//                List<ImageEntity> imageEntities = imageCustomerRepository.getImageByProductId(productId);
//                productPage.add(productMapper.convertToResponse(productEntity,imageEntities));
//            });
//        }
//        for(int i = (sizePage*(page -1) == 0 ? sizePage*(page -1): sizePage*(page -1)-1); i < productPage.size(); i++ ){
//            if(i >= (sizePage*(page -1) - 1) && i <= ((sizePage*page)-1)){
//                result.add(productPage.get(i));
//            }
//        }
//        int totalPage = (productEntities.size() % sizePage) == 0 ? (productEntities.size() / sizePage) : ((productEntities.size() / sizePage) +1);
//        return new ProductResponsePage(result, totalPage);
//    }

    @Override
    public ProductResponsePage getHybridRecommendations(UserDetails userDetails, int subCategoryId, int page, int sizePage) {
        List<ProductResponse> result = new ArrayList<>();
        List<ProductEntity> productEntities = new ArrayList<>();

        if (page == 1){
            productPage = new ArrayList<>();
            Map<Integer, Double> hybridScores = new HashMap<>();
            Optional<UserEntity> user = userRepository.findByEmail(userDetails.getUsername());
            UserEntity userEntity = user.get();
            List<ProductEntity> productEntityList = productRepository.findAll().stream()
                    .filter(product -> product.getSubCategory().getSubCategoryId() == subCategoryId)
                    .collect(Collectors.toList());
            Map<Integer, Double> contentBased = contentBaseCore.calculateContentBasedScore(userEntity, productEntityList);
            Map<Integer, Double> userBasedCore =  userBased.recommendProductsUserBased(user.get(), subCategoryId);
            Map<Integer, Double> itemBasedCore = itemBased.recommendProductsItemBased(user.get(), subCategoryId);
            // Tập hợp tất cả productId từ ba map
            Set<Integer> allProductIds = new HashSet<>();
            allProductIds.addAll(contentBased.keySet());
            allProductIds.addAll(userBasedCore.keySet());
            allProductIds.addAll(itemBasedCore.keySet());
            // Tính điểm tổng hợp cho mỗi sản phẩm
            for (Integer productId : allProductIds) {
                // Lấy điểm từ mỗi hệ gợi ý (mặc định là 0 nếu không có)
                double contentScore = contentBased.getOrDefault(productId, 0.0);
                double userScore = userBasedCore.getOrDefault(productId, 0.0);
                double itemScore = itemBasedCore.getOrDefault(productId, 0.0);
                // Tính điểm tổng hợp theo trọng số
                double combinedScore =
                        contentScore * 0.5 +
                                userScore * 0.2 +
                                itemScore * 0.3;
                // Thêm vào map kết quả
                hybridScores.put(productId, combinedScore);
            }

//            hybridScores.forEach((key, value) -> {
//                System.out.println("key: " + key + " value: " + value);
//            });

            productEntities.addAll(hybridScores.entrySet().stream()
                    .sorted(Map.Entry.<Integer, Double>comparingByValue().reversed())
                    .map(entry -> productRepository.findById(entry.getKey()).orElse(null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList()));
        }

        productEntities.forEach(product -> {
            List<ImageEntity> imageEntities = imageCustomerRepository.getImageByProductId(product.getProductId());
            productPage.add(productMapper.convertToResponse(product, imageEntities));
        });

        for(int i = (sizePage*(page -1) == 0 ? sizePage*(page -1): sizePage*(page -1)-1); i < productPage.size(); i++ ){
            if(i >= (sizePage*(page -1) - 1) && i <= ((sizePage*page)-1)){
                result.add(productPage.get(i));
            }
        }

        int totalPage = (productPage.size() % sizePage) == 0 ? (productPage.size() / sizePage) : ((productPage.size() / sizePage) +1);
        return new ProductResponsePage(result, totalPage);
    }

    @Override
    public ProductDetailResponse getProductDetail(UserDetails userDetails, int productId) {
        Optional<ProductEntity> productEntity = productRepository.findById(productId);
        if (productEntity.isPresent()){
            ProductEntity product = productEntity.get();
            List<ImageEntity> imageEntities = imageCustomerRepository.getImageByProductId(product.getProductId());
            return productMapper.convertToDetailReponse(product, imageEntities);
        }
        return null;
    }

    @Override
    public int addCartProduct(UserDetails userDetails, int productId) {
        Optional<UserEntity> user = userRepository.findByEmail(userDetails.getUsername());

        CartEntity cartEntity = user.get().getCartEntity();
        List<CartProductEntity> cartProductEntities = new ArrayList<>();
        List<CartProductEntity> cartProducts = new ArrayList<>();
        if(cartEntity == null){
            cartEntity = new CartEntity();
            cartEntity = cartRepository.save(cartEntity);

            UserEntity userEntity = user.get();
            userEntity.setCartEntity(cartEntity);
            userRepository.save(userEntity);

            CartProductEntity cartProductEntity = saveCartProductEntity(new CartProductEntity(), 1, cartEntity, productId);
            cartProductEntities.add(cartProductEntity);

            cartEntity.setCartProducts(cartProductEntities);
            cartRepository.save(cartEntity);
            return 1;
        }
        cartProductEntities = cartEntity.getCartProducts();
        if (cartProductEntities.isEmpty()){
            cartProductEntities.add(saveCartProductEntity(new CartProductEntity(), 1,cartEntity,productId));
            cartEntity.setCartProducts(cartProductEntities);
            cartRepository.save(cartEntity);
        }
        else{
            cartProductEntities.forEach( productCart -> {
                if(productCart.getProduct().getProductId() == productId)
                    cartProducts.add(productCart);
            });
            if(cartProducts.isEmpty()){
                cartProductEntities.add(saveCartProductEntity(new CartProductEntity(), 1,cartEntity,productId));
                cartEntity.setCartProducts(cartProductEntities);
                cartRepository.save(cartEntity);
            }
            else {
                cartProductEntities.add(saveCartProductEntity(cartProducts.get(0), cartProducts.get(0).getQuantity()+1,cartEntity,productId));
                cartEntity.setCartProducts(cartProductEntities);
                cartRepository.save(cartEntity);
            }
        }
        return user.get().getCartEntity().getCartProducts().size();
    }

    @Override
    public List<UserCartResponse> updateCartProduct(UserDetails userDetails, int productId, int quantity) {
        UserEntity userEntity = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        CartEntity cartEntity = userEntity.getCartEntity();
        List<CartProductEntity> cartProductEntities = cartEntity.getCartProducts();

        for (CartProductEntity cartProduct : cartProductEntities) {
            if (cartProduct.getProduct().getProductId() == productId) {
                cartProduct.setQuantity(quantity);
                productCartRepository.save(cartProduct);
                break;
            }
        }

        return getCartUser(userDetails);
    }

    @Override
    public List<UserCartResponse> removeCartProduct(UserDetails userDetails, int productId) {
        UserEntity userEntity = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        CartEntity cartEntity = userEntity.getCartEntity();
        List<CartProductEntity> cartProductEntities = cartEntity.getCartProducts();

        for (CartProductEntity cartProduct : cartProductEntities) {
            if (cartProduct.getProduct().getProductId() == productId) {
                productCartRepository.delete(cartProduct);
                break;
            }
        }
        return getCartUser(userDetails);
    }

    @Override
    public List<UserCartResponse> getCartUser(UserDetails userDetails) {
        UserEntity userEntity = userRepository.findByEmail(userDetails.getUsername()).get();
        CartEntity cartEntity = userEntity.getCartEntity();
        if(cartEntity == null)
            return new ArrayList<>();
        List<CartProductEntity> cartProductEntities = cartEntity.getCartProducts();
        if(cartProductEntities.isEmpty())
            return new ArrayList<>();
        return cartProductEntities.stream()
                .map(x -> {
                    return productMapper.convertToProductCart(
                            x,
                            imageCustomerRepository.getImageByProductId(x.getProduct().getProductId())
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    public ProductResponsePage searchProduct(UserDetails userDetails, String contentSearch) {
        List<ProductEntity> productEntityList = productCustomerRepository.searchByProductName(contentSearch);
        Map<Integer, Double> productIds = contentBaseCore.calculateContentBasedScore(userRepository.findByEmail(userDetails.getUsername()).get(), productEntityList);
       List<ProductEntity> productEntities = productCustomerRepository.findByProductIdIn(new ArrayList<>(productIds.keySet()));
        List<ProductResponse> productResponses = new ArrayList<>();

        productEntities.forEach(product -> {
            List<ImageEntity> imageEntities = imageCustomerRepository.getImageByProductId(product.getProductId());
            productResponses.add(productMapper.convertToResponse(product, imageEntities));
        });
        int totalPage = (productEntities.size() % 8) == 0 ? (productEntities.size() / 8) : ((productEntities.size() / 8) +1);
        return new ProductResponsePage(productResponses, totalPage);
    }

    @Override
    public List<ProductResponse> getRecommend(UserDetails userDetails, int productId) {
        List<ProductResponse> productResponses = new ArrayList<>();

        UserEntity userEntity = userRepository.findByEmail(userDetails.getUsername()).get();
        List<ProductEntity> productEntities = productRepository.findAll().stream()
                .filter(x -> x.getProductId() != productId).collect(Collectors.toList());
        Map<Integer, Double> contentBase = contentBaseCore.calculateContentBasedScore(userEntity, productEntities);

        Map<Integer, Double> top5ContentBase = contentBase.entrySet().stream()
                .sorted(Map.Entry.<Integer, Double>comparingByValue().reversed())
                .limit(5)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));

        List<Integer> productIds = new ArrayList<>(top5ContentBase.keySet());
        List<ProductEntity> productEntityList = productCustomerRepository.findByProductIdIn(productIds);

        productEntityList.forEach(product -> {
            List<ImageEntity> imageEntities = imageCustomerRepository.getImageByProductId(product.getProductId());
            productResponses.add(productMapper.convertToResponse(product, imageEntities));
        });

        return productResponses;
    }

    @Override
    public void createReviewProduct(UserDetails userDetails, ReviewProductRequest reviewRequest) {
        UserEntity userEntity = userRepository.findByEmail(userDetails.getUsername()).get();

        ProductEntity product = productCustomerRepository.searchByName(reviewRequest.getProductName());
        List<Rating> ratings = product.getProductRatings();
        if (ratings == null)
            ratings = new ArrayList<>();
        Rating addRating = new Rating();
        addRating = ratingReponsitory.save(addRating);
        addRating.setUserEntity(userEntity);
        addRating.setRating(reviewRequest.getRating());
        addRating.setContent(reviewRequest.getContent());
        addRating = ratingReponsitory.save(addRating);

        ratings.add(addRating);
        product.setProductRatings(ratings);
        productRepository.save(product);
    }

    @Override
    public List<ReviewProductResponse> getReviewProduct(UserDetails userDetails, int productId) {
        ProductEntity product = productRepository.findById(productId).get();
        List<Rating> ratings = product.getProductRatings();
        if (ratings == null)
            return null;
        return ratings.stream().map(rating -> ratingMapper.convertToResponse(rating))
                .collect(Collectors.toList());
    }


    private CartProductEntity saveCartProductEntity(CartProductEntity cartProductEntity, int quantity, CartEntity cart, int productId){
        cartProductEntity = productCartRepository.save(cartProductEntity);
        cartProductEntity.setProduct(productRepository.findById(productId).get());
        cartProductEntity.setQuantity(quantity);
        cartProductEntity.setCart(cart);
       return productCartRepository.save(cartProductEntity);
    }

}
