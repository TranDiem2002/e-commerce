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
  categories?: Category[];
  onCategoryClick?: (category: Category) => void;
  onSubCategoryClick?: (category: Category, subCategory: SubCategory) => void;
}

const CategoryNavbar: React.FC<CategoryNavbarProps> = ({
  categories: propCategories,
  onCategoryClick,
  onSubCategoryClick,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories);
      const expandedState: Record<number, boolean> = {};
      propCategories.forEach((category) => {
        expandedState[category.categoryId] = true;
      });
      setExpandedCategories(expandedState);
    }
  }, [propCategories]);

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
      <h3 className="category-navbar-title">DANH MỤC SẢN PHẨM</h3>
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
            </div>

            {expandedCategories[category.categoryId] && (
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
                      - &nbsp; {subCategory.subCategoryName}
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
