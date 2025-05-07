package com.tutofox.ecommerce.Service.Impl;

import com.tutofox.ecommerce.Caculator.ContentBaseCore;
import com.tutofox.ecommerce.Caculator.UserBasedCollaborativeFiltering;
import com.tutofox.ecommerce.Entity.*;
import com.tutofox.ecommerce.Model.Request.ProductRequest;
import com.tutofox.ecommerce.Model.Request.SubCategoryRequest;
import com.tutofox.ecommerce.Model.Response.ProductDetailResponse;
import com.tutofox.ecommerce.Model.Response.ProductResponse;
import com.tutofox.ecommerce.Model.Response.ProductResponsePage;
import com.tutofox.ecommerce.Repository.*;
import com.tutofox.ecommerce.Repository.Customer.*;
import com.tutofox.ecommerce.Service.ProductService;
import com.tutofox.ecommerce.Service.UserDetailService;
import com.tutofox.ecommerce.Utils.ProductMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

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
    private UserRepository userRepository;

    private ProductMapper productMapper;

    private List<ProductResponse> productPage;

    public ProductServiceImpl() {
        this.productMapper = new ProductMapper();
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

    @Override
    public ProductResponsePage getListByPage(UserDetails userDetail, int subCategoryId, int page, int sizePage) {
       Optional<UserEntity> user = userRepository.findByEmail(userDetail.getUsername());
        List<ProductResponse> result = new ArrayList<>();
        List<ProductEntity> productEntities = productCustomerRepository.getAllProductBySubCategory(subCategoryId);
        if(page == 1){
            productPage = new ArrayList<>();
            List<Integer> productList = contentBaseCore.calculateContentBasedScore(user.get(), productEntities);
            Map<Integer, ProductEntity> productMap = new HashMap<>();
            for (ProductEntity product : productEntities) {
                productMap.put(product.getProductId(), product);
            }

            productList.forEach(productId -> {
                ProductEntity productEntity = productMap.get(productId);
                List<ImageEntity> imageEntities = imageCustomerRepository.getImageByProductId(productId);
                productPage.add(productMapper.convertToResponse(productEntity,imageEntities));
            });
        }
        for(int i = (sizePage*(page -1) == 0 ? sizePage*(page -1): sizePage*(page -1)-1); i < productPage.size(); i++ ){
            if(i >= (sizePage*(page -1) - 1) && i <= ((sizePage*page)-1)){
                result.add(productPage.get(i));
            }
        }
        int totalPage = (productEntities.size() % sizePage) == 0 ? (productEntities.size() / sizePage) : ((productEntities.size() / sizePage) +1);
        return new ProductResponsePage(result, totalPage);
    }

    @Override
    public ProductResponsePage getHybridRecommendations(UserDetails userDetails, int subCategoryId, int page, int sizePage) {
        Optional<UserEntity> user = userRepository.findByEmail(userDetails.getUsername());
        List<ProductEntity> productEntities = userBased.recommendProductsUserBased(user.get(), subCategoryId);
        if (productEntities.isEmpty())
            return null;
        List<ProductResponse> productResponses = new ArrayList<>();

        productEntities.forEach(product -> {
            List<ImageEntity> imageEntities = imageCustomerRepository.getImageByProductId(product.getProductId());
            productResponses.add(productMapper.convertToResponse(product, imageEntities));
        });

        int totalPage = (productEntities.size() % sizePage) == 0 ? (productEntities.size() / sizePage) : ((productEntities.size() / sizePage) +1);
        return new ProductResponsePage(productResponses, totalPage);
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
}
