import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { API_USER } from "../../links";

interface RecommendedProduct {
  productId: number;
  productName: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  discount: number;
  specialPrice: boolean;
  ratingsAvg: number;
  reviewCount: number;
  new: boolean;
}

interface ProductReview {
  ratingId: number;
  userName: string;
  rating: number;
  content: string;
}

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<
    RecommendedProduct[]
  >([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(false);

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
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        const response = await axios.post(
          `${API_USER}/product/getRecommend`,
          { productId: productId },
          config
        );

        // Sửa lỗi: kiểm tra response.data là mảng
        if (response.data && Array.isArray(response.data)) {
          setRecommendedProducts(response.data);
        } else if (response.data && response.data.productResponses) {
          setRecommendedProducts(response.data.productResponses);
        }
      } catch (error) {
        console.error("Error fetching recommended products:", error);
      }
    };

    if (productId) {
      fetchRecommendations();
    }
  }, [productId]);

  // Fetch reviews for the product
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get(
          `${API_USER}/product/review/${productId}`,
          config
        );

        if (response.data && Array.isArray(response.data)) {
          setReviews(response.data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  useEffect(() => {
    if (product && product.imageUrl.length > 0) {
      setMainImage(product.imageUrl[0]);
    }
  }, [product]);

  // Function to render star rating
  const renderStarRating = (rating: number, size: string = "16px") => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= rating ? "#f39c12" : "#ddd",
            fontSize: size,
            marginRight: "2px",
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // Function to calculate average rating
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  // Function to get rating distribution
  const getRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  if (!product) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          fontSize: "18px",
          color: "#4c503d",
        }}
      >
        Đang tải thông tin sản phẩm...
      </div>
    );
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
          "Content-Type": "application/json",
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

  const averageRating = calculateAverageRating();
  const ratingDistribution = getRatingDistribution();

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
              src={mainImage}
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
                  onClick={() => setMainImage(img)}
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

            {/* Hiển thị đánh giá trung bình */}
            {reviews.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "10px",
                  marginBottom: "15px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginRight: "15px",
                  }}
                >
                  {renderStarRating(parseFloat(averageRating), "18px")}
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#4c503d",
                    }}
                  >
                    {averageRating}
                  </span>
                </div>
                <span style={{ fontSize: "14px", color: "#666" }}>
                  ({reviews.length} đánh giá)
                </span>
              </div>
            )}

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

      {/* Phần Sản phẩm gợi ý */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
        <h2
          className="product-section-title"
          style={{
            color: "#4c503d",
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <img
            src="https://comem.vn/images/collections/flower.png"
            alt="flower decoration"
            style={{ marginRight: "10px" }}
          />
          Sản phẩm gợi ý cho bạn
        </h2>

        {/* Thiết lập flex container cho các sản phẩm gợi ý trên cùng một hàng */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
            marginBottom: "40px",
            flexWrap: "nowrap",
            overflowX: "auto",
            paddingBottom: "5px",
          }}
        >
          {recommendedProducts.map((item) => (
            <Link
              to={`/product/${item.productId}`}
              key={item.productId}
              style={{
                textDecoration: "none",
                color: "inherit",
                flex: "0 0 18%",
                minWidth: "150px",
              }}
            >
              <div
                style={{
                  border: "1px solid #f0f0f0",
                  borderRadius: "8px",
                  overflow: "hidden",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0 5px 15px rgba(0,0,0,0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ position: "relative", paddingTop: "100%" }}>
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {item.discount > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        backgroundColor: "#e74c3c",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      -{item.discount}%
                    </div>
                  )}
                  {item.new && (
                    <div
                      style={{
                        position: "absolute",
                        top: "5px",
                        left: "5px",
                        backgroundColor: "#2ecc71",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      Mới
                    </div>
                  )}
                </div>
                <div
                  style={{
                    padding: "8px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "12px",
                      margin: "0 0 6px 0",
                      fontWeight: 500,
                      color: "#4c503d",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      lineHeight: "1.2",
                    }}
                  >
                    {item.productName}
                  </h3>
                  <div style={{ marginTop: "auto" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                      }}
                    >
                      <span
                        style={{
                          color: "#e67e22",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                      >
                        {item.price.toLocaleString()}đ
                      </span>
                      {item.price !== item.originalPrice && (
                        <span
                          style={{
                            color: "#999",
                            textDecoration: "line-through",
                            fontSize: "10px",
                            marginLeft: "3px",
                          }}
                        >
                          {item.originalPrice.toLocaleString()}đ
                        </span>
                      )}
                    </div>
                    {item.ratingsAvg > 0 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginTop: "3px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            color: "#f39c12",
                            marginRight: "2px",
                          }}
                        >
                          ★
                        </span>
                        <span style={{ fontSize: "10px", color: "#666" }}>
                          {item.ratingsAvg.toFixed(1)} ({item.reviewCount})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Phần Đánh giá sản phẩm */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
        <h2
          className="product-section-title"
          style={{
            color: "#4c503d",
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <img
            src="https://comem.vn/images/collections/flower.png"
            alt="flower decoration"
            style={{ marginRight: "10px" }}
          />
          Đánh giá sản phẩm
        </h2>

        {reviewsLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100px",
              fontSize: "16px",
              color: "#666",
            }}
          >
            Đang tải đánh giá...
          </div>
        ) : reviews.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              color: "#666",
            }}
          >
            <p style={{ fontSize: "16px", margin: "0" }}>
              Chưa có đánh giá nào cho sản phẩm này.
            </p>
          </div>
        ) : (
          <div>
            {/* Tổng quan đánh giá */}
            <div
              style={{
                backgroundColor: "#f9f9f9",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ textAlign: "center", marginRight: "30px" }}>
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: "bold",
                      color: "#4c503d",
                    }}
                  >
                    {averageRating}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "5px",
                    }}
                  >
                    {renderStarRating(parseFloat(averageRating), "20px")}
                  </div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    {reviews.length} đánh giá
                  </div>
                </div>

                {/* Phân bố đánh giá */}
                <div style={{ flex: 1 }}>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div
                      key={star}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "5px",
                      }}
                    >
                      <span
                        style={{
                          minWidth: "15px",
                          fontSize: "14px",
                          color: "#666",
                        }}
                      >
                        {star}
                      </span>
                      <span
                        style={{
                          color: "#f39c12",
                          marginLeft: "5px",
                          marginRight: "10px",
                        }}
                      >
                        ★
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: "8px",
                          backgroundColor: "#e0e0e0",
                          borderRadius: "4px",
                          marginRight: "10px",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            backgroundColor: "#f39c12",
                            borderRadius: "4px",
                            width: `${
                              reviews.length > 0
                                ? (ratingDistribution[
                                    star as keyof typeof ratingDistribution
                                  ] /
                                    reviews.length) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#666",
                          minWidth: "30px",
                        }}
                      >
                        {
                          ratingDistribution[
                            star as keyof typeof ratingDistribution
                          ]
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Danh sách đánh giá */}
            <div>
              {reviews.map((review, index) => (
                <div
                  key={review.ratingId}
                  style={{
                    border: "1px solid #f0f0f0",
                    borderRadius: "8px",
                    padding: "20px",
                    marginBottom: "15px",
                    backgroundColor: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "#4c503d",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                        marginRight: "15px",
                      }}
                    >
                      {`U${review.userName}`}
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "5px",
                        }}
                      >
                        {renderStarRating(review.rating, "16px")}
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#4c503d",
                          }}
                        >
                          {review.rating}/5
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#999",
                        }}
                      >
                        Người dùng #{review.userId}
                      </div>
                    </div>
                  </div>

                  {review.content && (
                    <div
                      style={{
                        fontSize: "14px",
                        lineHeight: "1.5",
                        color: "#333",
                        marginLeft: "55px",
                      }}
                    >
                      {review.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default ProductDetail;
