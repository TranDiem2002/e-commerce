import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { API_USER } from "../../links";

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get(
          `${API_USER}/product/${productId}`,
          config
        );
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (product && product.imageUrl.length > 0) {
      setMainImage(product.imageUrl[0]);
    }
  }, [product]);

  if (!product) {
    return <div>Loading...</div>;
  }

  const formatDescription = (description: string) => {
    if (!description) return [];

    // Danh sách các từ khóa cần định dạng đậm
    const keywords = [
      "Công dụng của sản phẩm",
      "Công dụng",
      "Ưu điểm nổi bật",
      "Thành phần chính",
      "Cách sử dụng",
      "Lưu ý khi sử dụng",
      "Đặc điểm",
      "Hướng dẫn sử dụng",
    ];

    // Chia văn bản thành các dòng
    const lines = description.split("\n");

    // Xử lý từng dòng
    return lines.map((line, index) => {
      // Kiểm tra xem dòng có chứa từ khóa nào không
      const keyword = keywords.find((kw) => line.includes(kw));

      if (keyword) {
        // Định dạng dòng chứa từ khóa
        return (
          <p
            key={index}
            style={{
              fontWeight: "bold",
              fontSize: "18px",
              color: "#4c503d",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            {line}
          </p>
        );
      }

      // Nếu là dòng trống
      if (line.trim() === "") {
        return <br key={index} />;
      }

      // Dòng văn bản thông thường
      return (
        <p
          key={index}
          style={{
            marginBottom: "10px",
            lineHeight: "1.6",
          }}
        >
          {line}
        </p>
      );
    });
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // Keeping this as it's needed for POST
        },
      };

      await axios.post(
        `${API_USER}/product/addCart`,
        { productId: product.productId },
        config
      );

      alert(`Đã thêm ${product.productName} vào giỏ hàng!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.");
    }
  };

  return (
    <>
      <Header cartItemsCount={0} />
      <h2
        className="product-section-title"
        style={{ color: "#4c503d", marginLeft: "15%" }}
      >
        <img
          src="https://comem.vn/images/collections/flower.png"
          alt="flower decoration"
        />
        {product.productName}
      </h2>
      <div
        style={{
          padding: "10px 20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: "1000px", width: "100%", display: "flex" }}>
          {/* Hình ảnh sản phẩm chính */}
          <div style={{ flex: 1, padding: "20px" }}>
            <img
              src={mainImage} // Hiển thị hình ảnh chính
              alt={product.productName}
              style={{
                width: "100%",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              {/* Hình ảnh thu nhỏ */}
              {product.imageUrl.map((img: string, index: number) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  style={{
                    width: "60px",
                    height: "60px",
                    margin: "0 5px",
                    cursor: "pointer",
                    borderRadius: "4px",
                    border: mainImage === img ? "2px solid #4c503d" : "none",
                  }}
                  onClick={() => setMainImage(img)} // Thay đổi hình ảnh chính khi click
                />
              ))}
            </div>
          </div>

          {/* Thông tin sản phẩm */}
          <div style={{ flex: 1, padding: "20px" }}>
            {/* Tên sản phẩm */}
            <h1
              style={{
                color: "#4c503d",
                fontSize: "22px",
                fontStyle: "normal",
                fontWeight: 700,
                lineHeight: "28px",
                textTransform: "capitalize",
                marginBottom: "10px",
              }}
            >
              {product.productName}
            </h1>
            <div className="product-title2" style={{ color: "#3e6806" }}>
              Làm sạch da - Dịu nhẹ
            </div>

            <div className="product-price-area">
              <span className="current-price">
                {product.price.toLocaleString()}đ
              </span>
              {product.price !== product.originalPrice &&
                product.originalPrice && (
                  <span className="original-price">
                    {product.originalPrice.toLocaleString()}đ
                  </span>
                )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginTop: "10px",
                marginBottom: "15px",
              }}
            >
              <span
                className="label"
                style={{ marginRight: "10px", color: "#3e6806" }}
              >
                Thể tích
              </span>
              <div className="volume-options" style={{ display: "flex" }}>
                <button
                  className="volume-button selected"
                  style={{
                    border: "2px solid transparent",
                    borderRadius: "5px",
                  }}
                >
                  150ml
                </button>
              </div>
            </div>

            {/* <p>{product.shortDescription}</p> */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#e67e22",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
                onClick={handleAddToCart}
              >
                Thêm vào giỏ hàng
              </button>
            </div>

            <div
              className="note-buy-product"
              style={{
                fontWeight: 500,
                letterSpacing: ".2px",
                lineHeight: 1.58,
                WebkitFontSmoothing: "antialiased",
                textSizeAdjust: "100%",
                boxSizing: "border-box",
                outline: "none",
                color: "#3e6806",
                fontSize: "12px",
                marginBottom: "1.4rem",
                marginTop: "10px",
              }}
            >
              <i>
                Nếu bạn muốn mua hàng với số lượng lớn, xin vui lòng liên hệ
                Hotline: <a href="tel:1800646890">1800646890</a> hoặc Zalo:{" "}
                <a href="tel:0968622511">0968622511</a>. Cỏ mềm chân thành cảm
                ơn bạn!
              </i>
            </div>

            <div className="shippingBox_main wrap_pt">
              <div
                style={{
                  backgroundColor: "#f9f9f9",
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "5px",
                  marginRight: "70px",
                }}
              >
                <div
                  style={{
                    fontSize: "14x",
                    fontWeight: "500",
                    color: "#3e6806",
                    marginBottom: "10px",
                  }}
                >
                  Phí ship
                </div>
                <ul
                  style={{
                    listStyleType: "disc",
                    paddingLeft: "70px",
                    margin: "0",
                  }}
                >
                  <li
                    style={{
                      marginBottom: "5px",
                      fontSize: "14px",
                      color: "#3e6806",
                    }}
                  >
                    Nội thành Hà Nội - 20.000đ
                  </li>
                  <li style={{ fontSize: "14px", color: "#3e6806" }}>
                    Các tỉnh còn lại - 25.000đ
                  </li>
                </ul>
              </div>
            </div>

            {/* Thời gian ship dự kiến */}
            <div
              style={{
                backgroundColor: "#f9f9f9",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
                marginRight: "70px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#3e6806",
                  marginBottom: "10px",
                }}
              >
                Thời gian ship dự kiến
              </div>
              <ul
                style={{
                  listStyleType: "disc",
                  paddingLeft: "70px",
                  margin: "0",
                }}
              >
                <li
                  style={{
                    marginBottom: "5px",
                    fontSize: "14px",
                    color: "#3e6806",
                  }}
                >
                  Hà Nội, TP.HCM: 1-2 ngày
                </li>
                <li style={{ fontSize: "14px", color: "#3e6806" }}>
                  Các tỉnh còn lại: 2-5 ngày
                </li>
              </ul>
            </div>
            <div className="shippingBox_footer" style={{ fontSize: "14px" }}>
              <span style={{ color: "#e67e22" }}>Miễn phí</span> đổi trả sản
              phẩm lỗi do vận chuyển, sản xuất
            </div>
          </div>
        </div>
      </div>

      {/* Mô tả sản phẩm */}
      <div
        style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 20px 40px" }}
      >
        <h2
          style={{
            color: "#4c503d",
            fontSize: "20px",
            fontWeight: "700",
            marginBottom: "15px",
          }}
        >
          Thông tin sản phẩm
        </h2>
        <div
          style={{
            whiteSpace: "pre-line",
            lineHeight: "1.6",
          }}
        >
          {product.shortDescription}
        </div>
        <div
          style={{
            whiteSpace: "pre-line",
            lineHeight: "1.6",
          }}
        >
          {product.description}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductDetail;
