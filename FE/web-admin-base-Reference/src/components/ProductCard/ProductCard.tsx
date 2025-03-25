import React from "react";
import { products } from "../../data/products";
import { FaStar } from "react-icons/fa";
import "./ProductCard.css";

interface ProductCardProps {
  product: products;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={product.imageUrl}
          alt={product.productName}
          className="product-image"
        />
        {product.new && <span className="product-tag new-tag">New</span>}
        {product.discount && product.discount > 0 && (
          <span className="product-tag discount-tag">-{product.discount}%</span>
        )}
        {product.specialPrice && (
          <span className="product-tag special-tag">Giá ưu đãi</span>
        )}
      </div>
      <h3 className="product-name">{product.productName}</h3>
      <div className="product-price-container">
        <span className="product-price">{product.price.toLocaleString()}₫</span>
        {product.originalPrice && (
          <span className="product-original-price">
            {product.originalPrice.toLocaleString()}₫
          </span>
        )}
      </div>
      {product.ratingsAvg && (
        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                size={14}
                color={
                  i < Math.floor(product.ratingsAvg || 0)
                    ? "#FFC107"
                    : "#e4e5e9"
                }
              />
            ))}
          </div>
          <span className="rating-text">
            {product.ratingsAvg?.toFixed(1)} / {product.reviewCount} đánh giá
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
