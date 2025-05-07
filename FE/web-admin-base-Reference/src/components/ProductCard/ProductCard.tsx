import React from "react";
import { products } from "../../data/products";
import "./ProductCard.css";

interface ProductCardProps {
  product: products;
  onProductClick?: (productId: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
}) => {
  const handleClick = () => {
    onProductClick?.(product.productId);
  };

  return (
    <div
      className="product-card"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <div className="product-image-container">
        {product.discount > 0 && (
          <div className="discount-tag">-{product.discount}%</div>
        )}
        <img
          src={product.imageUrl}
          alt={product.productName}
          className="product-image"
        />
      </div>

      <div className="product-details">
        <h3 className="product-name">{product.productName}</h3>

        <div className="product-price-area">
          <span className="current-price">
            {product.price.toLocaleString()}đ
          </span>
          {product.originalPrice && product.discount > 0 && (
            <span className="original-price">
              {product.originalPrice.toLocaleString()}đ
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
