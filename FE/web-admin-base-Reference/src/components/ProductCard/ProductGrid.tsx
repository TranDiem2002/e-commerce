import React from "react";
import { products as ProductType } from "../../data/products";
import ProductCard from "./ProductCard";
import "./ProductGrid.css";

interface ProductGridProps {
  products: ProductType[] | undefined;
  loading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading }) => {
  if (loading) {
    return <div className="loading-products">Đang tải sản phẩm...</div>;
  }

  if (!products || products.length === 0) {
    return <div className="no-products">Không có sản phẩm nào</div>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.productId} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
