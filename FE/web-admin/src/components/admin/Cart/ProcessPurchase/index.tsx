import React, { useState, useEffect } from "react";
import "../NewPurchase/NewPurchase.css";
import { API_USER } from "../../../../links/index";

function ProcessPurchase() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const fetchOrders = async (page) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_USER}/purchasedOrder/getProcess?page=${page}&size=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setOrders(data.purchasedOrderResponses);
      setTotalPages(data.totalPage);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Waiting":
        return "status-waiting";
      case "Process": // Đã sửa từ "Processing" thành "Process"
        return "status-processing";
      case "Delivered":
        return "status-delivered";
      default:
        return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Waiting":
        return "Chờ xử lý";
      case "Process": // Đã sửa từ "Processing" thành "Process"
        return "Đang xử lý";
      case "Delivered":
        return "Đã giao hàng";
      default:
        return status;
    }
  };

  const handleMarkAsDelivered = async (purchasedId) => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_USER}/purchasedOrder/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purchasedId: purchasedId,
          purchasedOrderStatus: "Delivered",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      // Cập nhật trạng thái đơn hàng trong state hoặc tải lại danh sách
      fetchOrders(currentPage);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="admin-orders-container">
      <h1>Quản Lý Đơn Hàng</h1>

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Ngày đặt</th>
                  {/* <th>Trạng thái</th> */}
                  <th>Sản phẩm</th>
                  <th>Tổng tiền</th>
                  <th>Địa chỉ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.purchasedOrderId}>
                      <td className="order-id">#{order.purchasedOrderId}</td>
                      <td>{formatDate(order.purchaseDateTime)}</td>
                      <td>
                        <div className="products-column">
                          {order.purchasedProductResponses.map(
                            (product, index) => (
                              <div key={index} className="product-item">
                                <img
                                  src={product.productImage}
                                  alt={product.productName}
                                  className="product-thumbnail"
                                />
                                <div className="product-details">
                                  <div className="product-name">
                                    {product.productName}
                                  </div>
                                  <div className="product-price">
                                    {product.price.toLocaleString("vi-VN")}đ x{" "}
                                    {product.mount}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                          <div className="total-quantity">
                            {order.totalQuantity} sản phẩm
                          </div>
                        </div>
                      </td>
                      <td className="order-total">
                        {order.totalMoney.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="order-address">{order.address}</td>
                      <td
                        className="action-buttons"
                        style={{
                          paddingBottom: "41px",
                          paddingTop: "40px",
                        }}
                      >
                        {/* Đã sửa điều kiện từ "Processing" thành "Process" */}
                        {order.purchasedOrderStatus === "Process" && (
                          <>
                            <button
                              className="btn btn-success"
                              onClick={() =>
                                handleMarkAsDelivered(order.purchasedOrderId)
                              }
                              disabled={isUpdating}
                            >
                              {isUpdating
                                ? "Đang cập nhật..."
                                : "Đã giao thành công"}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-orders">
                      Không có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                &laquo; Trước
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={`pagination-btn ${
                    currentPage === index + 1 ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Sau &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProcessPurchase;
