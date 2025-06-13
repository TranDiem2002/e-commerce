// CartPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CartPage.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { API_USER } from "../../links";

const CartPage = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState("cart");

  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    notes: "",
  });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [hasUnavailableItems, setHasUnavailableItems] = useState(false);

  const [purchasedOrders, setPurchasedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Thêm vào phần state declarations (sau line ~29)
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [currentReviewProduct, setCurrentReviewProduct] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const navigate = useNavigate();

  // Fetch cart items when component mounts or tab changes
  useEffect(() => {
    if (activeTab === "cart") {
      fetchCartItems();
    }
  }, [activeTab]);

  useEffect(() => {
    const loadProvinces = async () => {
      const data = await fetchProvinces();
      setProvinces(data);
    };

    loadProvinces();
  }, []);

  // Check for unavailable items
  useEffect(() => {
    const unavailableItems = cartItems.some((item) => item.status === false);
    setHasUnavailableItems(unavailableItems);
  }, [cartItems]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_USER}/product/getCart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cartItems = response.data || [];
      setCartItems(cartItems);
      calculateTotal(cartItems);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_USER}/product/updateCart`,
        {
          productId: productId,
          quantity: newQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedCart = response.data || [];
      setCartItems(updatedCart);
      calculateTotal(updatedCart);
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng sản phẩm:", error);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_USER}/product/deleteCart`,
        {
          productId: productId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      fetchCartItems();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const fetchProvinces = async () => {
    try {
      const response = await axios.get(
        "https://provinces.open-api.vn/api/?depth=1"
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tỉnh/thành:", error);
      return [];
    }
  };

  const fetchDistricts = async (provinceCode) => {
    try {
      const response = await axios.get(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      return response.data.districts;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quận/huyện:", error);
      return [];
    }
  };

  const fetchWards = async (districtCode) => {
    try {
      const response = await axios.get(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      return response.data.wards;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phường/xã:", error);
      return [];
    }
  };

  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);
    setSelectedDistrict("");
    setSelectedWard("");
    setWards([]);

    setFormData({
      ...formData,
      province: provinceCode,
      district: "",
      ward: "",
    });

    if (provinceCode) {
      const districtsData = await fetchDistricts(provinceCode);
      setDistricts(districtsData);
    } else {
      setDistricts([]);
    }
  };

  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    setSelectedDistrict(districtCode);
    setSelectedWard("");

    setFormData({
      ...formData,
      district: districtCode,
      ward: "",
    });

    if (districtCode) {
      const wardsData = await fetchWards(districtCode);
      setWards(wardsData);
    } else {
      setWards([]);
    }
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    setSelectedWard(wardCode);

    setFormData({
      ...formData,
      ward: wardCode,
    });
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (hasUnavailableItems) {
      alert(
        "Giỏ hàng có sản phẩm không khả dụng. Vui lòng xóa sản phẩm không khả dụng trước khi thanh toán."
      );
      return;
    }

    if (cartItems.length === 0) {
      alert("Giỏ hàng đang trống. Vui lòng thêm sản phẩm vào giỏ hàng.");
      return;
    }

    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.address ||
      !selectedProvince ||
      !selectedDistrict ||
      !selectedWard
    ) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    // Chuẩn bị địa chỉ đầy đủ
    const provinceName =
      provinces.find((p) => p.code === parseInt(selectedProvince))?.name || "";
    const districtName =
      districts.find((d) => d.code === parseInt(selectedDistrict))?.name || "";
    const wardName =
      wards.find((w) => w.code === parseInt(selectedWard))?.name || "";
    const fullAddress = `${formData.address}, ${wardName}, ${districtName}, ${provinceName}`;

    try {
      setOrderSubmitting(true);
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Vui lòng đăng nhập để tiếp tục đặt hàng");
        navigate("/login");
        return;
      }

      // Chuẩn bị dữ liệu theo yêu cầu của PurchasedOrderRequest
      const orderRequest = {
        address: fullAddress,
      };

      // Gọi API đặt hàng
      await axios.post(`${API_USER}/purchasedOrder/pay`, orderRequest, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Xử lý phản hồi thành công
      alert("Đặt hàng thành công!");

      // Chuyển tab sang "đơn hàng đã đặt" sau khi đặt hàng thành công
      setActiveTab("orders");
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);

      // Xử lý các trường hợp lỗi khác nhau
      if (error.response) {
        if (error.response.status === 401) {
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          navigate("/login");
        } else {
          alert(
            `Đặt hàng thất bại: ${
              error.response.data || "Vui lòng thử lại sau."
            }`
          );
        }
      } else if (error.request) {
        alert(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại."
        );
      } else {
        alert("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } finally {
      setOrderSubmitting(false);
    }
  };

  const fetchOrders = async (page = 1) => {
    try {
      setIsLoading(true);
      setCurrentPage(page);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_USER}/purchasedOrder/getPurchased?page=${page}&size=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      setPurchasedOrders(data.purchasedOrderResponses);
      setTotalPages(data.totalPage);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Thêm sau hàm fetchOrders (sau line ~385)
  const openReviewModal = (product) => {
    setCurrentReviewProduct(product);
    setReviewRating(5);
    setReviewContent("");
    setReviewModalVisible(true);
  };

  const closeReviewModal = () => {
    setReviewModalVisible(false);
    setCurrentReviewProduct(null);
    setReviewRating(5);
    setReviewContent("");
  };

  const renderStarRating = (rating, onRatingChange) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={() => onRatingChange && onRatingChange(i)}
          style={{
            cursor: onRatingChange ? "pointer" : "default",
            color: i <= rating ? "#ffa000" : "#ccc",
            fontSize: "24px",
            marginRight: "5px",
          }}
        >
          ★
        </span>
      );
    }
    return <div style={{ display: "flex", alignItems: "center" }}>{stars}</div>;
  };

  const submitReview = async () => {
    if (!currentReviewProduct) return;

    try {
      setIsSubmittingReview(true);
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Vui lòng đăng nhập lại");
        return;
      }

      const response = await fetch(`${API_USER}/product/createReview`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName: currentReviewProduct.productName,
          rating: reviewRating,
          content: reviewContent.trim() || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Không thể gửi đánh giá");
      }

      alert("Cảm ơn bạn đã đánh giá sản phẩm!");
      closeReviewModal();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Không thể gửi đánh giá. Vui lòng thử lại sau.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="cart-page">
      <Header />

      <div className="cart-container" style={{ marginBottom: "40px" }}>
        <div className="breadcrumb">
          <h2 className="product-section-title" style={{ color: "#4c503d" }}>
            <img
              src="https://comem.vn/images/collections/flower.png"
              alt="flower decoration"
            />
            Trang Chủ / {activeTab === "cart" ? "Giỏ Hàng" : "Đơn hàng đã đặt"}
          </h2>
        </div>

        {/* Tab Navigation */}
        <div
          className="cart-tabs"
          style={{
            display: "flex",
            borderBottom: "1px solid #e0e0e0",
            marginBottom: "20px",
          }}
        >
          <div
            className={`cart-tab ${activeTab === "cart" ? "active" : ""}`}
            onClick={() => setActiveTab("cart")}
            style={{
              padding: "15px 20px",
              cursor: "pointer",
              borderBottom: activeTab === "cart" ? "2px solid #3e6a13" : "none",
              color: activeTab === "cart" ? "#3e6a13" : "#666",
              fontWeight: activeTab === "cart" ? "bold" : "normal",
              marginRight: "20px",
            }}
          >
            Giỏ hàng
          </div>
          <div
            className={`orders-tab ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
            style={{
              padding: "15px 20px",
              cursor: "pointer",
              borderBottom:
                activeTab === "orders" ? "2px solid #3e6a13" : "none",
              color: activeTab === "orders" ? "#3e6a13" : "#666",
              fontWeight: activeTab === "orders" ? "bold" : "normal",
            }}
          >
            Đơn hàng đã đặt
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "cart" ? (
          <div className="cart-content">
            <div className="shipping-info">
              <h2>Thông tin nhận hàng</h2>
              <form onSubmit={handleCheckout}>
                <div className="form-row">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Họ tên"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Số điện thoại"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email để nhận thông tin đơn hàng"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-row">
                  <input
                    type="text"
                    name="address"
                    placeholder="Địa chỉ (Ví dụ: 123 Hoàng Cầu)"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row location-selects">
                  <select
                    name="province"
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    required
                  >
                    <option value="">Chọn Tỉnh/thành phố</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>

                  <select
                    name="district"
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    required
                    disabled={!selectedProvince}
                  >
                    <option value="">Chọn Quận/huyện</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>

                  <select
                    name="ward"
                    value={selectedWard}
                    onChange={handleWardChange}
                    required
                    disabled={!selectedDistrict}
                  >
                    <option value="">Chọn Phường/xã</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <textarea
                    name="notes"
                    placeholder="Ghi chú thêm (Ví dụ: Giao giờ hành chính)"
                    value={formData.notes}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                {/* Phương thức thanh toán */}
                <div className="payment-methods">
                  <h3 style={{ color: "#3e6806", fontSize: "18px" }}>
                    Phương thức thanh toán
                  </h3>

                  <div className="payment-method-options">
                    <label
                      className="payment-method-option"
                      style={{ display: "flex", marginLeft: "20px" }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={handlePaymentMethodChange}
                        style={{ marginRight: "15px" }}
                      />
                      <div
                        className="payment-method-info"
                        style={{ display: "flex", marginTop: "15px" }}
                      >
                        <img
                          src="https://comem.vn/images/checkout/shipping-box.svg"
                          style={{ paddingRight: "15px" }}
                          alt="COD icon"
                        />
                        <div
                          className="payment-method-details"
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span className="payment-method-name">
                            Thanh toán khi nhận hàng (COD)
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Cảnh báo sản phẩm không khả dụng */}
                {hasUnavailableItems && (
                  <div
                    className="unavailable-items-warning"
                    style={{
                      backgroundColor: "#fff3cd",
                      color: "#856404",
                      padding: "12px",
                      marginBottom: "15px",
                      borderRadius: "4px",
                      textAlign: "center",
                      border: "1px solid #ffeeba",
                    }}
                  >
                    <p>
                      Có sản phẩm trong giỏ hàng không khả dụng. Vui lòng xóa
                      sản phẩm không khả dụng trước khi thanh toán.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="checkout-button"
                  disabled={hasUnavailableItems || orderSubmitting}
                  style={{
                    opacity: hasUnavailableItems || orderSubmitting ? 0.6 : 1,
                    cursor:
                      hasUnavailableItems || orderSubmitting
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {orderSubmitting ? "Đang xử lý..." : "Đặt hàng"}
                </button>
              </form>
            </div>

            <div className="cart-summary">
              <h2>Giỏ hàng của bạn</h2>

              {loading ? (
                <p>Đang tải giỏ hàng...</p>
              ) : cartItems.length === 0 ? (
                <p>Giỏ hàng của bạn đang trống</p>
              ) : (
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div
                      className={`cart-item ${
                        !item.status ? "unavailable-item" : ""
                      }`}
                      key={item.productId}
                      style={{
                        position: "relative",
                        opacity: item.status ? 1 : 0.7,
                        border: !item.status ? "1px solid #ffcccc" : "none",
                      }}
                    >
                      {!item.status && (
                        <div
                          className="unavailable-badge"
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            backgroundColor: "#dc3545",
                            color: "white",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          Không khả dụng
                        </div>
                      )}
                      <div className="item-image">
                        <img src={item.imageUrl} alt={item.productName} />
                      </div>

                      <div className="item-info">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <div>
                            <h3
                              className="item-name"
                              style={{
                                color: "#4c503d",
                                fontSize: "16px",
                                marginBottom: "12px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "200px",
                              }}
                            >
                              {item.productName}
                            </h3>
                          </div>

                          <div style={{ display: "flex" }}>
                            <svg
                              width="12"
                              height="12"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              style={{ cursor: "pointer" }}
                            >
                              <path
                                d="M10.666 3.083v7.584A1.166 1.166 0 019.5 11.833h-7a1.167 1.167 0 01-1.167-1.166V3.083H.167V1.917h11.666v1.166h-1.167zm-8.166 0v7.584h7V3.083h-7zM5.417 4.25h1.166v1.167H5.416V4.25zm0 1.75h1.166v1.167H5.416V6zm0 1.75h1.166v1.167H5.416V7.75zM3.083.167h5.833v1.166H3.083V.167z"
                                fill="currentColor"
                              />
                            </svg>
                            <button
                              className="remove-button"
                              onClick={() => handleRemoveItem(item.productId)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "gray",
                                fontSize: "10px",
                                cursor: "pointer",
                              }}
                            >
                              XÓA
                            </button>
                          </div>
                        </div>

                        <div className="item-actions">
                          <div
                            className="item-quantity"
                            style={{
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    item.quantity - 1
                                  )
                                }
                                className="quantity-button"
                                disabled={!item.status}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                min="1"
                                readOnly
                              />
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    item.quantity + 1
                                  )
                                }
                                className="quantity-button"
                                disabled={!item.status}
                              >
                                +
                              </button>
                            </div>
                            <div className="item-price">
                              {item.price.toLocaleString()}đ
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="bulk-order-note">
                    <p>
                      Nếu bạn muốn mua hàng với số lượng lớn, xin vui lòng liên
                      hệ Hotline: <strong>1800464890</strong> hoặc Zalo:{" "}
                      <strong>0986622511</strong>. Cỏ mềm chân thành cảm ơn bạn!
                    </p>
                  </div>

                  <div className="cart-total">
                    <span>Tổng cộng:</span>
                    <span className="total-price">
                      {totalPrice.toLocaleString()}₫
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Nội dung tab đơn hàng đã đặt
          <div
            className="orders-content"
            style={{
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              padding: "30px",
              minHeight: "400px",
              width: "100%",
            }}
          >
            <h2
              style={{
                color: "#3e6a13",
                marginBottom: "20px",
                fontSize: "24px",
                textAlign: "center",
              }}
            >
              Đơn đã đặt
            </h2>

            {isLoading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "300px",
                }}
              >
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : purchasedOrders.length > 0 ? (
              <>
                {purchasedOrders.map((order, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "20px",
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      marginBottom: "20px",
                    }}
                  >
                    {/* Order header with status and date */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "15px",
                        paddingBottom: "10px",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor:
                            order.purchasedOrderStatus === "Waiting"
                              ? "#FFF8E1"
                              : "#E8F5E9",
                          padding: "5px 10px",
                          borderRadius: "4px",
                        }}
                      >
                        <span
                          style={{
                            color:
                              order.purchasedOrderStatus === "Waiting"
                                ? "#FFA000"
                                : "#388E3C",
                            fontWeight: "500",
                          }}
                        >
                          {order.purchasedOrderStatus === "Waiting"
                            ? "Chờ xử lý"
                            : "Hoàn thành"}
                        </span>
                      </div>
                      <div style={{ color: "#757575", fontSize: "14px" }}>
                        {new Date(order.purchaseDateTime).toLocaleString(
                          "vi-VN"
                        )}
                      </div>
                    </div>

                    {/* Products */}
                    {order.purchasedProductResponses.map(
                      (product, productIndex) => (
                        <div
                          key={productIndex}
                          style={{
                            display: "flex",
                            padding: "10px 0",
                            borderBottom:
                              productIndex <
                              order.purchasedProductResponses.length - 1
                                ? "1px solid #f0f0f0"
                                : "none",
                          }}
                        >
                          <div style={{ marginRight: "15px" }}>
                            <img
                              src={product.productImage}
                              alt={product.productName}
                              style={{
                                width: "70px",
                                height: "70px",
                                borderRadius: "4px",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4
                              style={{
                                fontSize: "16px",
                                margin: "0 0 5px 0",
                                fontWeight: "500",
                              }}
                            >
                              {product.productName}
                            </h4>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div>
                                <span
                                  style={{
                                    color: "#3e6a13",
                                    fontWeight: "500",
                                  }}
                                >
                                  {product.price.toLocaleString("vi-VN")}đ
                                </span>
                              </div>
                              <div style={{ color: "#757575" }}>
                                x{product.mount}
                              </div>
                            </div>

                            {/* Nút đánh giá chỉ hiển thị cho đơn hàng hoàn thành */}
                            {(order.purchasedOrderStatus === "Delivered" ||
                              order.purchasedOrderStatus === "Hoàn thành" ||
                              order.purchasedOrderStatus === "Completed") && (
                              <div style={{ marginTop: "10px" }}>
                                <button
                                  onClick={() => openReviewModal(product)}
                                  style={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #ffa000",
                                    color: "#ffa000",
                                    padding: "5px 12px",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                  }}
                                >
                                  <span>★</span>
                                  Đánh giá
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}

                    {/* Order summary */}
                    <div
                      style={{
                        marginTop: "15px",
                        paddingTop: "15px",
                        borderTop: "1px solid #f0f0f0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "5px",
                        }}
                      >
                        <span style={{ color: "#757575" }}>Tổng số lượng:</span>
                        <span>{order.totalQuantity} sản phẩm</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "10px",
                        }}
                      >
                        <span style={{ color: "#757575" }}>Tổng tiền:</span>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#3e6a13",
                            fontSize: "16px",
                          }}
                        >
                          {order.totalMoney.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      <div style={{ marginTop: "10px" }}>
                        <span
                          style={{
                            color: "#757575",
                            marginBottom: "3px",
                            display: "block",
                          }}
                        >
                          Địa chỉ giao hàng:
                        </span>
                        <div>{order.address}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "20px",
                    }}
                  >
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        style={{
                          width: "30px",
                          height: "30px",
                          margin: "0 5px",
                          borderRadius: "50%",
                          border: "none",
                          backgroundColor:
                            currentPage === i + 1 ? "#3e6a13" : "#fff",
                          color: currentPage === i + 1 ? "#fff" : "#333",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          cursor: "pointer",
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  width: "100%",
                  maxWidth: "600px",
                  margin: "0 auto",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "16px",
                    color: "#666",
                    marginBottom: "15px",
                  }}
                >
                  Bạn chưa có đơn hàng nào.
                </p>
                <a
                  href="/products"
                  style={{
                    backgroundColor: "#3e6a13",
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Mua sắm ngay
                </a>
              </div>
            )}
          </div>
        )}
      </div>
      {reviewModalVisible && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "30px",
              width: "90%",
              maxWidth: "500px",
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                borderBottom: "1px solid #eee",
                paddingBottom: "15px",
              }}
            >
              <h3 style={{ margin: 0, color: "#3e6a13" }}>Đánh giá sản phẩm</h3>
              <button
                onClick={closeReviewModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>
            </div>

            {currentReviewProduct && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>
                    {currentReviewProduct.productName}
                  </h4>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                      color: "#333",
                    }}
                  >
                    Đánh giá của bạn:
                  </label>
                  {renderStarRating(reviewRating, setReviewRating)}
                </div>

                <div style={{ marginBottom: "25px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                      color: "#333",
                    }}
                  >
                    Nhận xét (tùy chọn):
                  </label>
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                    maxLength={500}
                    style={{
                      width: "100%",
                      minHeight: "100px",
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                  <div
                    style={{
                      textAlign: "right",
                      marginTop: "5px",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    {reviewContent.length}/500 ký tự
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={closeReviewModal}
                    disabled={isSubmittingReview}
                    style={{
                      padding: "10px 20px",
                      border: "1px solid #ddd",
                      backgroundColor: "#fff",
                      color: "#666",
                      borderRadius: "4px",
                      cursor: isSubmittingReview ? "not-allowed" : "pointer",
                      opacity: isSubmittingReview ? 0.6 : 1,
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={submitReview}
                    disabled={isSubmittingReview}
                    style={{
                      padding: "10px 20px",
                      border: "none",
                      backgroundColor: "#3e6a13",
                      color: "#fff",
                      borderRadius: "4px",
                      cursor: isSubmittingReview ? "not-allowed" : "pointer",
                      opacity: isSubmittingReview ? 0.6 : 1,
                    }}
                  >
                    {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CartPage;
