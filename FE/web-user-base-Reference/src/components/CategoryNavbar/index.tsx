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
  autoSelectFirst?: boolean; // Thêm prop để control auto-select
}

const CategoryNavbar: React.FC<CategoryNavbarProps> = ({
  categories: propCategories,
  onCategoryClick,
  onSubCategoryClick,
  autoSelectFirst = true, // Default là true
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<number, boolean>
  >({});
  const [hasAutoSelected, setHasAutoSelected] = useState(false); // Flag để chỉ auto-select một lần

  // useEffect để set categories từ props
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

  // useEffect để auto-select category = 1 và subcategory = 1
  useEffect(() => {
    if (
      autoSelectFirst &&
      !hasAutoSelected &&
      categories.length > 0 &&
      onCategoryClick &&
      onSubCategoryClick
    ) {
      // Tìm category có categoryId = 1
      const targetCategory = categories.find((cat) => cat.categoryId === 1);

      if (targetCategory) {
        // Gọi onCategoryClick cho category = 1
        onCategoryClick(targetCategory);

        // Tìm subcategory có subCategoryId = 1 trong category này
        const targetSubCategory = targetCategory.subCategoryResponses?.find(
          (sub) => sub.subCategoryId === 1
        );

        if (targetSubCategory) {
          // Gọi onSubCategoryClick cho subcategory = 1
          onSubCategoryClick(targetCategory, targetSubCategory);
        } else {
          // Nếu không tìm thấy subcategory = 1, chọn subcategory đầu tiên
          const firstSubCategory = targetCategory.subCategoryResponses?.[0];
          if (firstSubCategory) {
            onSubCategoryClick(targetCategory, firstSubCategory);
          }
        }

        // Đánh dấu đã auto-select để không làm lại
        setHasAutoSelected(true);
      } else {
        // Nếu không tìm thấy category = 1, chọn category đầu tiên
        const firstCategory = categories[0];
        if (firstCategory) {
          onCategoryClick(firstCategory);

          const firstSubCategory = firstCategory.subCategoryResponses?.[0];
          if (firstSubCategory) {
            onSubCategoryClick(firstCategory, firstSubCategory);
          }

          setHasAutoSelected(true);
        }
      }
    }
  }, [
    categories,
    autoSelectFirst,
    hasAutoSelected,
    onCategoryClick,
    onSubCategoryClick,
  ]);

  // Reset hasAutoSelected khi categories thay đổi (nếu cần)
  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setHasAutoSelected(false);
    }
  }, [propCategories]);

  const toggleCategory = (e: React.MouseEvent, categoryId: number) => {
    e.preventDefault();
    e.stopPropagation();
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
