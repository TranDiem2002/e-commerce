import React from "react";
import "./Pagination.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-arrow"
      >
        &lt;
      </button>

      {[...Array(totalPages)].map((_, index) => {
        const pageNumber = index + 1;
        // Giới hạn số nút hiển thị
        if (
          pageNumber === 1 ||
          pageNumber === totalPages ||
          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
        ) {
          return (
            <button
              key={index}
              onClick={() => onPageChange(pageNumber)}
              className={`pagination-button ${
                currentPage === pageNumber ? "active" : ""
              }`}
            >
              {pageNumber}
            </button>
          );
        } else if (
          (pageNumber === currentPage - 2 && currentPage > 3) ||
          (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
        ) {
          return (
            <span key={index} className="pagination-dots">
              ...
            </span>
          );
        }
        return null;
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-arrow"
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;
