package com.tutofox.ecommerce.Service.Impl;

import com.tutofox.ecommerce.Entity.ImageEntity;
import com.tutofox.ecommerce.Entity.ProductEntity;
import com.tutofox.ecommerce.Entity.SubCategoryEntity;
import com.tutofox.ecommerce.Model.Request.ProductRequest;
import com.tutofox.ecommerce.Model.Request.SubCategoryRequest;
import com.tutofox.ecommerce.Model.Response.ProductResponse;
import com.tutofox.ecommerce.Model.Response.ProductResponsePage;
import com.tutofox.ecommerce.Repository.Customer.ImageCustomerRepository;
import com.tutofox.ecommerce.Repository.Customer.ProductCustomerRepository;
import com.tutofox.ecommerce.Repository.ImageRepository;
import com.tutofox.ecommerce.Repository.ProductRepository;
import com.tutofox.ecommerce.Repository.SubCategoryRespository;
import com.tutofox.ecommerce.Service.ProductService;
import com.tutofox.ecommerce.Utils.ProductMapper;
import org.apache.coyote.http2.HpackDecoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

    private ProductMapper productMapper;

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

        List<ImageEntity> imageEntities = new ArrayList<>();
        List<ImageEntity> imageEntities1 = new ArrayList<>();
        for(String image : productRequest.getImageLinks()){
            ImageEntity imageEntity = new ImageEntity();
            imageEntity.setProduct(productEntity);
            imageEntity.setImageLink(image);
            imageEntities.add(imageEntity);
        }
        if(!imageEntities.isEmpty()){
            imageEntities1.addAll(imageRepository.saveAll(imageEntities));
        }

        productEntity.setImage(imageEntities1);
        productEntity.setSubCategory(subCategoryEntity.get());
        productRepository.save(productEntity);
        return "Đã thêm sản phẩm thành công";
    }

    @Override
    public List<ProductResponse> getListBySubCategory(SubCategoryRequest subCategoryRequest) {
        List<ProductEntity> productEntities = productCustomerRepository.getAllProductBySubCategory(subCategoryRequest.getSubCategoryId());
        List<ProductResponse> productResponses = new ArrayList<>();
        for(ProductEntity product: productEntities){
            List<ImageEntity> imageEntities = imageCustomerRepository.getImageByProductId(product.getProductId());
            productResponses.add(productMapper.convertToResponse(product,imageEntities));
        }
        return productResponses;
    }

    @Override
    public ProductResponsePage getListByPage(int subCategoryId, int page, int sizePage) {
        List<ProductEntity> productEntities = productCustomerRepository.getAllProductBySubCategory(subCategoryId);
        List<ProductResponse> productResponses = new ArrayList<>();
        List<ProductResponse> products = new ArrayList<>();
        for(int i = 0; i < productEntities.size(); i++ ){
            if(i >= (sizePage*(page -1) - 1) && i <= ((sizePage*page)-1)){
                List<ImageEntity> imageEntities = imageCustomerRepository.getImageByProductId(productEntities.get(i).getProductId());
                productResponses.add(productMapper.convertToResponse(productEntities.get(i),imageEntities));
            }
        }
        int totalPage = (productEntities.size() % sizePage) == 0 ? (productEntities.size() / sizePage) : ((productEntities.size() / sizePage) +1);
        return new ProductResponsePage(productResponses, totalPage);
    }
}
