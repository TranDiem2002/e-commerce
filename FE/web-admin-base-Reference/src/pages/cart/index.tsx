// CartPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CartPage.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { API_USER } from "../../links";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Added setFormData
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
  // Thêm state cho phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  useEffect(() => {
    const loadProvinces = async () => {
      const data = await fetchProvinces();
      setProvinces(data);
    };

    loadProvinces();
  }, []);

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
    // Removed TypeScript annotations
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

      // Cập nhật giỏ hàng với dữ liệu mới trả về từ API
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

  // Lấy danh sách tỉnh/thành phố
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

  // Lấy danh sách quận/huyện theo tỉnh/thành
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

  // Lấy danh sách phường/xã theo quận/huyện
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

    // Reset form data
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

  // Added missing handleDistrictChange function
  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    setSelectedDistrict(districtCode);
    setSelectedWard("");

    // Update form data
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

    // Update form data
    setFormData({
      ...formData,
      ward: wardCode,
    });
  };

  // Xử lý thay đổi phương thức thanh toán
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    // Kiểm tra thông tin form
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

    // Tìm tên dựa trên code đã chọn
    const provinceName =
      provinces.find((p) => p.code === parseInt(selectedProvince))?.name || "";
    const districtName =
      districts.find((d) => d.code === parseInt(selectedDistrict))?.name || "";
    const wardName =
      wards.find((w) => w.code === parseInt(selectedWard))?.name || "";

    // Tạo địa chỉ đầy đủ
    const fullAddress = `${formData.address}, ${wardName}, ${districtName}, ${provinceName}`;

    // Tạo dữ liệu đơn hàng với địa chỉ đầy đủ
    const orderData = {
      ...formData,
      fullAddress,
      provinceName,
      districtName,
      wardName,
      paymentMethod,
      cartItems: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      const token = localStorage.getItem("token");

      if (paymentMethod === "cod") {
        // Thanh toán khi nhận hàng - gửi thông tin trực tiếp đến API
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/orders`,
          orderData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        alert("Đặt hàng thành công!");
        navigate("/order-success", { state: { orderId: response.data.id } });
      } else if (paymentMethod === "vnpay") {
        // Thanh toán qua VNPAY - gọi API để tạo URL thanh toán
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/payment/vnpay/create`,
          {
            amount: totalPrice,
            orderInfo: `Thanh toan don hang Comem - ${formData.fullName}`,
            orderData: orderData, // Truyền thông tin đơn hàng để lưu vào session
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Chuyển hướng đến trang thanh toán VNPAY
        window.location.href = response.data.paymentUrl;
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.");
      console.error(error);
    }
  };

  return (
    <div className="cart-page">
      <Header />

      <div
        className="cart-container"
        style={{
          marginBottom: "40px",
        }}
      >
        <div className="breadcrumb">
          <h2 className="product-section-title" style={{ color: "#4c503d" }}>
            <img
              src="https://comem.vn/images/collections/flower.png"
              alt="flower decoration"
            />
            Trang Chủ / Giỏ Hàng
          </h2>
        </div>

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
                  placeholder="Để lại email để nhận thông tin đơn hàng"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
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

              {/* Phần chọn phương thức thanh toán */}
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
                      ></img>
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

                  <label
                    className="payment-method-option"
                    style={{ display: "flex", marginLeft: "20px" }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="vnpay"
                      checked={paymentMethod === "vnpay"}
                      onChange={handlePaymentMethodChange}
                      style={{ marginRight: "15px" }}
                    />
                    <div
                      className="payment-method-info"
                      style={{
                        display: "flex",
                        marginTop: "15px",
                      }}
                    >
                      <img
                        src="https://comem.vn/images/checkout/vnpay.png"
                        className="small-img"
                        alt="VNPay"
                      />
                      <div
                        className="payment-method-details"
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <span className="payment-method-name">
                          Thanh toán qua VNPAY
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" className="checkout-button">
                Tiến hành thanh toán
              </button>
            </form>
          </div>

          <div className="cart-summary">
            <h2>Giỏ hàng của bạn</h2>

            {/* <div className="cart-notification">
              <span className="notification-icon">i</span>
              <p>
                Có 12 người đang thêm cùng sản phẩm giống bạn vào giỏ hàng. Mua
                ngay trước khi các sản phẩm này hết hàng nhé!
              </p>
            </div> */}

            {loading ? (
              <p>Đang tải giỏ hàng...</p>
            ) : cartItems.length === 0 ? (
              <p>Giỏ hàng của bạn đang trống</p>
            ) : (
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div className="cart-item" key={item.productId}>
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
                          {" "}
                          <h3
                            className="item-name"
                            style={{
                              color: "#4c503d",
                              fontSize: "16px",
                              marginBottom: "12px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "200px", // thay đổi chiều rộng tùy ý
                            }}
                          >
                            {item.productName}
                          </h3>
                        </div>

                        <div style={{ display: "flex" }}>
                          {" "}
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
                    Nếu bạn muốn mua hàng với số lượng lớn, xin vui lòng liên hệ
                    Hotline: <strong>1800464890</strong> hoặc Zalo:{" "}
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
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;
