import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CategoryNavbar from "../../components/CategoryNavbar";
import "./home.css";

// Import admin components
import CategoryManagement from "../../components/admin/CategoryManagement";
import ProductTypeManagement from "../../components/admin/ProductTypeManagement";
import AllProducts from "../../components/admin/Product/AllProduct/index";
import NewPurchase from "../../components/admin/Cart/NewPurchase/index";
import ProcessPurchase from "../../components/admin/Cart/ProcessPurchase";
import DeliveredPurchase from "../../components/admin/Cart/DeliveredPurchase";
import UserManagement from "../../components/admin/UserManagement/index";
import RevenueStatistics from "../../components/admin/Revenue/index";

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

const HomePage: React.FC = () => {
  // const navigate = useNavigate();

  // Add state to track which admin section is selected
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedSubSection, setSelectedSubSection] = useState<string | null>(
    null
  );

  // Handle category selection to set the appropriate section
  const handleCategoryClick = (category: Category) => {
    switch (category.categoryId) {
      case 1: // Quản lý danh mục
        setSelectedSection("categories");
        setSelectedSubSection(null);
        break;
      case 2: // Quản lý phân loại sản phẩm
        setSelectedSection("productTypes");
        setSelectedSubSection(null);
        break;
      case 3: // Quản lý sản phẩm
        setSelectedSection("products");
        setSelectedSubSection(null);
        break;
      case 4: // Quản lý đơn hàng
        setSelectedSection("orders");
        setSelectedSubSection(null);
        break;
      case 5: // Quản lý người dùng
        setSelectedSection("users");
        setSelectedSubSection(null);
        break;
      case 6: // Thống kê
        setSelectedSection("statistics");
        setSelectedSubSection("revenue"); // Default to revenue statistics
        break;
      default:
        setSelectedSection(null);
        setSelectedSubSection(null);
    }
  };

  // Handle subcategory selection to set the appropriate sub-section
  const handleSubCategoryClick = (
    category: Category,
    subCategory: SubCategory
  ) => {
    switch (category.categoryId) {
      case 3: // Quản lý sản phẩm subcategories
        setSelectedSection("products");
        break;

      case 4: // Quản lý đơn hàng subcategories
        setSelectedSection("orders");
        switch (subCategory.subCategoryId) {
          case 41: // Đơn hàng mới
            setSelectedSubSection("new");
            break;
          case 42: // Đơn hàng đang xử lý
            setSelectedSubSection("processing");
            break;
          case 43: // Đơn hàng đã giao
            setSelectedSubSection("delivered");
            break;
          default:
            setSelectedSubSection(null);
        }
        break;

      case 6: // Thống kê subcategories
        setSelectedSection("statistics");
        // Only handle revenue statistics now
        if (subCategory.subCategoryId === 61) {
          // Thống kê doanh thu
          setSelectedSubSection("revenue");
        } else {
          setSelectedSubSection("revenue"); // Default to revenue
        }
        break;

      default:
        setSelectedSection(null);
        setSelectedSubSection(null);
    }
  };

  // Function to render the appropriate component based on selectedSection and selectedSubSection
  const renderContent = () => {
    if (!selectedSection) {
      // Show welcome dashboard when no admin section is selected
      return (
        <div className="admin-dashboard-welcome">
          <h2 className="welcome-title">
            Chào mừng đến với Hệ thống Quản trị Cỏ Mềm
          </h2>
          <p className="welcome-desc">
            Vui lòng chọn một mục quản lý từ menu bên trái để bắt đầu.
          </p>
          <div className="welcome-image">
            <img
              src="https://comem.vn/images/collections/flower.png"
              alt="Cỏ Mềm Logo"
            />
          </div>
        </div>
      );
    }

    // Render the appropriate admin component based on selection
    switch (selectedSection) {
      case "categories":
        return <CategoryManagement />;

      case "productTypes":
        return <ProductTypeManagement />;

      case "products":
        return <AllProducts />;

      case "orders":
        switch (selectedSubSection) {
          case "new":
            return <NewPurchase />;
          case "processing":
            return <ProcessPurchase />;
          case "delivered":
            return <DeliveredPurchase />;
          default:
            return;
        }

      case "users":
        return <UserManagement />;

      case "statistics":
        return <RevenueStatistics />;

      default:
        return (
          <div className="empty-state">
            <p>Vui lòng chọn một mục quản lý</p>
          </div>
        );
    }
  };

  return (
    <>
      <Header cartItemsCount={0} />
      <div style={{ display: "flex", minHeight: "1000px" }}>
        <div style={{ width: "300px", padding: "20px" }}>
          <CategoryNavbar
            onCategoryClick={handleCategoryClick}
            onSubCategoryClick={handleSubCategoryClick}
          />
        </div>
        <div style={{ flex: 1, padding: "20px" }}>{renderContent()}</div>
      </div>
      <Footer />
    </>
  );
};

export default HomePage;
