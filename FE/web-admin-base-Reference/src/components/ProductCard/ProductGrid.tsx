import React from "react";
import { products as ProductType } from "../../data/products";
import ProductCard from "./ProductCard";
import "./ProductGrid.css";

interface ProductGridProps {
  products: ProductType[] | undefined;
  loading?: boolean;
  onProductClick?: (productId: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  onProductClick,
}) => {
  if (loading) {
    return <div className="loading-products">Đang tải sản phẩm...</div>;
  }

  if (!products || products.length === 0) {
    return <div className="no-products">Không có sản phẩm nào</div>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.productId}
          product={product}
          onProductClick={onProductClick}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
