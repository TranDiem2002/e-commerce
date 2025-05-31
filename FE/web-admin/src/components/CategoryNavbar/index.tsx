import React, { useState, useEffect } from "react";
import "./CategoryNavbar.css";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// Định nghĩa interfaces
interface SubCategory {
  subCategoryId: number;
  subCategoryName: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
  subCategoryResponses: SubCategory[];
}

interface CategoryNavbarProps {
  onCategoryClick?: (category: Category) => void;
  onSubCategoryClick?: (category: Category, subCategory: SubCategory) => void;
}

const CategoryNavbar: React.FC<CategoryNavbarProps> = ({
  onCategoryClick,
  onSubCategoryClick,
}) => {
  // Hardcoded categories and subcategories
  const hardcodedCategories: Category[] = [
    {
      categoryId: 1,
      categoryName: "Quản lý danh mục",
      subCategoryResponses: [],
    },
    {
      categoryId: 2,
      categoryName: "Quản lý phân loại sản phẩm",
      subCategoryResponses: [],
    },
    {
      categoryId: 3,
      categoryName: "Quản lý sản phẩm",
      subCategoryResponses: [],
    },
    {
      categoryId: 4,
      categoryName: "Quản lý đơn hàng",
      subCategoryResponses: [
        { subCategoryId: 41, subCategoryName: "Đơn hàng mới" },
        { subCategoryId: 42, subCategoryName: "Đơn hàng đang giao" },
        { subCategoryId: 43, subCategoryName: "Đơn hàng đã giao" },
      ],
    },
    {
      categoryId: 5,
      categoryName: "Quản lý người dùng",
      subCategoryResponses: [],
    },
    {
      categoryId: 6,
      categoryName: "Thống kê doanh thu",
      subCategoryResponses: [],
    },
  ];

  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    // Set the hardcoded categories
    setCategories(hardcodedCategories);

    // Initialize expanded state
    const expandedState: Record<number, boolean> = {};
    hardcodedCategories.forEach((category) => {
      expandedState[category.categoryId] = true;
    });
    setExpandedCategories(expandedState);
  }, []);

  const toggleCategory = (e: React.MouseEvent, categoryId: number) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định
    e.stopPropagation(); // Ngăn lan truyền sự kiện
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Xử lý khi click vào category
  const handleCategoryClick = (e: React.MouseEvent, category: Category) => {
    e.preventDefault();
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  // Xử lý khi click vào subcategory
  const handleSubCategoryClick = (
    e: React.MouseEvent,
    category: Category,
    subCategory: SubCategory
  ) => {
    e.preventDefault();
    if (onSubCategoryClick) {
      onSubCategoryClick(category, subCategory);
    }
  };

  return (
    <div className="category-navbar">
      <h3 className="category-navbar-title">DANH MỤC QUẢN LÝ</h3>
      <ul className="category-list">
        {categories.map((category) => (
          <li key={category.categoryId} className="category-item">
            <div className="category-header">
              <a
                href="#"
                className="category-name"
                onClick={(e) => handleCategoryClick(e, category)}
              >
                {category.categoryName}
              </a>
              {category.subCategoryResponses.length > 0 && (
                <button
                  className={`category-toggle ${
                    expandedCategories[category.categoryId] ? "expanded" : ""
                  }`}
                  onClick={(e) => toggleCategory(e, category.categoryId)}
                >
                  {expandedCategories[category.categoryId] ? (
                    <KeyboardArrowUpIcon fontSize="small" />
                  ) : (
                    <KeyboardArrowDownIcon fontSize="small" />
                  )}
                </button>
              )}
            </div>

            {expandedCategories[category.categoryId] &&
              category.subCategoryResponses.length > 0 && (
                <ul className="subcategory-list">
                  {category.subCategoryResponses.map((subCategory) => (
                    <li
                      key={subCategory.subCategoryId}
                      className="subcategory-item"
                    >
                      <a
                        href="#"
                        className="subcategory-name"
                        onClick={(e) =>
                          handleSubCategoryClick(e, category, subCategory)
                        }
                      >
                        &nbsp; {subCategory.subCategoryName}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryNavbar;
