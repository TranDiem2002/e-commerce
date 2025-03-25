import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CategoryNavbar from "../../components/CategoryNavbar";
import ProductGrid from "../../components/ProductCard/ProductGrid";
import Pagination from "../../components/ProductCard/Pagination";
import axios from "axios";
import { API_USER } from "../../links";
import { products } from "../../data/products";

interface Category {
  categoryId: number;
  categoryName: string;
  subCategoryResponses: {
    subCategoryId: number;
    subCategoryName: string;
  }[];
}

interface SubCategory {
  subCategoryId: number;
  subCategoryName: string;
}

interface SelectedInfo {
  categoryId?: number;
  categoryName?: string;
  subCategoryId?: number;
  subCategoryName?: string;
}

interface ProductResponse {
  productResponses: products[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedInfo, setSelectedInfo] = useState<SelectedInfo>({});
  const [products, setProducts] = useState<products[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(12);

  useEffect(() => {
    fetchCategories();
    fetchAllProducts(); // Thay thế fetchProducts() bằng fetchAllProducts()
  }, []);

  useEffect(() => {
    if (selectedInfo.categoryId) {
      fetchProductsByCategory(
        selectedInfo.categoryId,
        selectedInfo.subCategoryId
      );
    } else if (currentPage > 1) {
      // Nếu không có category nào được chọn và đang phân trang
      fetchAllProducts();
    }
  }, [selectedInfo, currentPage]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_USER}/category/getAll`, config);
      setCategories(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
  };

  // Tạo hàm fetchAllProducts mới để lấy tất cả sản phẩm
  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get<ProductResponse>(
        `${API_USER}/products?page=${currentPage - 1}&size=${pageSize}`,
        config
      );

      setProducts(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Lỗi khi lấy tất cả sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (
    categoryId: number,
    subCategoryId?: number
  ) => {
    try {
      setLoading(true);

      let url = `${API_USER}/products/category/${categoryId}?page=${currentPage}&size=${pageSize}`;

      if (subCategoryId) {
        url = `${API_USER}/product/subCategory/${subCategoryId}?page=${currentPage}&size=${pageSize}`;
      }

      const response = await axios.get<ProductResponse>(url);

      setProducts(response.data.productResponses);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm theo danh mục:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedInfo({
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      subCategoryId: undefined,
      subCategoryName: undefined,
    });
    setCurrentPage(1); // Reset về trang đầu tiên khi chọn danh mục mới
  };

  const handleSubCategoryClick = (
    category: Category,
    subCategory: SubCategory
  ) => {
    setSelectedInfo({
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      subCategoryId: subCategory.subCategoryId,
      subCategoryName: subCategory.subCategoryName,
    });
    setCurrentPage(1); // Reset về trang đầu tiên khi chọn danh mục con mới
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Header cartItemsCount={0} />
      <div style={{ display: "flex", minHeight: "1000px" }}>
        <div style={{ width: "300px", padding: "20px", marginLeft: "10%" }}>
          <CategoryNavbar
            categories={categories}
            onCategoryClick={handleCategoryClick}
            onSubCategoryClick={handleSubCategoryClick}
          />
        </div>
        <div style={{ flex: 1, padding: "20px" }}>
          {selectedInfo.categoryId ? (
            <div>
              <h2 className="product-section-title">
                {selectedInfo.subCategoryName || selectedInfo.categoryName}
              </h2>
              <ProductGrid products={products} loading={loading} />
              {!loading && totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          ) : (
            <div>
              <h2 className="product-section-title">Tất cả sản phẩm</h2>
              <ProductGrid products={products} loading={loading} />
              {!loading && totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HomePage;
