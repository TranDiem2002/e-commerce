import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_USER } from "../links/index";

const windowWidth = Dimensions.get("window").width;

interface RecommendedProduct {
  productId: number;
  productName: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  discount: number;
  new: boolean;
}

interface ProductReview {
  ratingId: number;
  userName: string;
  rating: number;
  content: string;
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id, categoryId, subCategoryId, categoryName, subCategoryName } =
    useLocalSearchParams<{
      id: string;
      categoryId: string;
      subCategoryId: string;
      categoryName: string;
      subCategoryName: string;
    }>();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Animation values for notification
  const notificationOpacity = useRef(new Animated.Value(0)).current;
  const notificationTranslateY = useRef(new Animated.Value(-50)).current;

  const [recommendedProducts, setRecommendedProducts] = useState<
    RecommendedProduct[]
  >([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductDetail(id);
      fetchCartCount();
    }
  }, [id]);

  // Handle notification animation
  useEffect(() => {
    if (showNotification) {
      // Animate notification in
      Animated.parallel([
        Animated.timing(notificationOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(notificationTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Automatically hide notification after 3 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(notificationOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(notificationTranslateY, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowNotification(false);
    });
  };

  const fetchCartCount = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_USER}/product/getCart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCartCount(data.length || 0);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const fetchProductDetail = async (productId: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_USER}/product/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải thông tin sản phẩm");
      }

      const data = await response.json();
      setProduct(data);
      setSelectedImageIndex(0); // Reset to first image when product changes
    } catch (error) {
      console.error("Lỗi khi tải thông tin sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add to cart functionality
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        // Redirect to login if not authenticated
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_USER}/product/addCart`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product.productId }),
      });

      if (!response.ok) {
        throw new Error("Không thể thêm vào giỏ hàng");
      }

      // Update cart count after successful addition
      fetchCartCount();

      // Show success notification
      setShowNotification(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Show error notification here if needed
    } finally {
      setAddingToCart(false);
    }
  };

  // Modified to preserve category/subcategory when navigating back
  const handleBackArrowPress = () => {
    // Navigate back to product list with the category/subcategory params
    router.push({
      pathname: "/(tabs)/product",
      params: {
        categoryId: categoryId || product?.categoryId?.toString() || "",
        subCategoryId: subCategoryId || product?.subCtgId?.toString() || "",
        categoryName: categoryName || product?.categoryName || "",
        subCategoryName: subCategoryName || product?.subCtgName || "",
      },
    });
  };

  // Thay thế useEffect cho recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!id) return;

      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_USER}/product/getRecommend`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId: parseInt(id) }),
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setRecommendedProducts(data);
          } else if (data && data.productResponses) {
            setRecommendedProducts(data.productResponses);
          }
        }
      } catch (error) {
        console.error("Error fetching recommended products:", error);
      }
    };

    if (id) {
      fetchRecommendations();
    }
  }, [id]);

  // Thay thế useEffect cho reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;

      try {
        setReviewsLoading(true);
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_USER}/product/review/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setReviews(data);
          }
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  // Thêm sau fetchProductDetail function
  const renderStarRating = (rating: number, size: number = 16) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text
          key={i}
          style={{
            color: i <= rating ? "#ffa000" : "#ddd",
            fontSize: size,
            marginRight: 2,
          }}
        >
          ★
        </Text>
      );
    }
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {stars}
      </View>
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handleRecommendedProductPress = (productId: number) => {
    router.push({
      pathname: "/productDetail",
      params: { id: productId.toString() }, // Convert to string for params
    });
  };

  // Thêm component render review
  const renderReview = ({ item }: { item: ProductReview }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerAvatar}>
          <Text style={styles.reviewerInitial}>
            {item.userName ? item.userName.charAt(0).toUpperCase() : "U"}
          </Text>
        </View>
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>
            {item.userName || "Người dùng"}
          </Text>
          {renderStarRating(item.rating, 14)}
        </View>
      </View>
      {item.content && <Text style={styles.reviewContent}>{item.content}</Text>}
    </View>
  );

  // Thêm component render recommended product
  const renderRecommendedProduct = ({ item }: { item: RecommendedProduct }) => (
    <TouchableOpacity
      style={styles.recommendedProductItem}
      onPress={() => handleRecommendedProductPress(item.productId)}
    >
      <View style={styles.recommendedProductImageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.recommendedProductImage}
          defaultSource={require("@/assets/images/ic_shop.png")}
        />
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discount}%</Text>
          </View>
        )}
        {item.new && (
          <View style={styles.newBadge}>
            <Text style={styles.newText}>Mới</Text>
          </View>
        )}
      </View>
      <View style={styles.recommendedProductInfo}>
        <Text style={styles.recommendedProductName} numberOfLines={2}>
          {item.productName}
        </Text>
        <View style={styles.recommendedPriceContainer}>
          <Text style={styles.recommendedPrice}>
            {item.price.toLocaleString()}đ
          </Text>
          {item.originalPrice !== item.price && (
            <Text style={styles.recommendedOriginalPrice}>
              {item.originalPrice.toLocaleString()}đ
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render image thumbnail
  const renderImageThumbnail = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => (
    <TouchableOpacity
      style={[
        styles.thumbnailContainer,
        selectedImageIndex === index && styles.selectedThumbnailContainer,
      ]}
      onPress={() => setSelectedImageIndex(index)}
    >
      <Image
        source={{ uri: item }}
        style={styles.thumbnailImage}
        defaultSource={require("@/assets/images/ic_shop.png")}
      />
    </TouchableOpacity>
  );

  // Custom back button component
  const BackButton = () => (
    <TouchableOpacity onPress={handleBackArrowPress} style={styles.backButton}>
      <Ionicons name="arrow-back" size={24} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* Success Notification */}
        {showNotification && (
          <Animated.View
            style={[
              styles.notification,
              {
                opacity: notificationOpacity,
                transform: [{ translateY: notificationTranslateY }],
              },
            ]}
          >
            <View style={styles.notificationContent}>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.notificationText}>
                {product?.productName} đã được thêm vào giỏ hàng!
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Custom Header with back arrow */}
        <View style={styles.headerContainer}>
          <BackButton />
          <Image
            source={require("@/assets/images/ic_shop.png")}
            style={styles.logo}
          />
          <View style={styles.rightSection}></View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3e6a13" />
            <Text style={styles.loadingText}>
              Đang tải thông tin sản phẩm...
            </Text>
          </View>
        ) : product ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Main Product Image */}
            {Array.isArray(product.imageUrl) && product.imageUrl.length > 0 ? (
              <View style={styles.imageGalleryContainer}>
                <Image
                  source={{ uri: product.imageUrl[selectedImageIndex] }}
                  style={styles.mainProductImage}
                />

                {/* Image Thumbnails */}
                <FlatList
                  data={product.imageUrl}
                  renderItem={renderImageThumbnail}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.thumbnailList}
                  contentContainerStyle={styles.thumbnailListContent}
                />
              </View>
            ) : (
              <Image
                source={{
                  uri:
                    typeof product.imageUrl === "string"
                      ? product.imageUrl
                      : "",
                }}
                style={styles.productImage}
                defaultSource={require("@/assets/images/ic_shop.png")}
              />
            )}

            {/* Product Info */}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.productName}</Text>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  {product.price?.toLocaleString()}đ
                </Text>
                {product.discount > 0 && (
                  <Text style={styles.originalPrice}>
                    {product.originalPrice?.toLocaleString()}đ
                  </Text>
                )}
              </View>

              {/* Subcategory */}
              {product.subCtgName && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{product.subCtgName}</Text>
                </View>
              )}

              {/* Description */}
              {product.description ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
                  <Text style={styles.description}>{product.description}</Text>
                </View>
              ) : product.shortDescription ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
                  <Text style={styles.description}>
                    {product.shortDescription}
                  </Text>
                </View>
              ) : null}

              {/* Add to Cart Button */}
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="cart" size={20} color="#fff" />
                    <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Recommended Products Section */}
            {recommendedProducts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderContainer}>
                  <Ionicons name="star" size={20} color="#3e6a13" />
                  <Text style={styles.sectionTitle}>Sản phẩm gợi ý</Text>
                </View>
                <FlatList
                  data={recommendedProducts}
                  renderItem={renderRecommendedProduct}
                  keyExtractor={(item) => item.productId.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recommendedProductsList}
                />
              </View>
            )}

            {/* Reviews Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderContainer}>
                <Ionicons name="chatbubbles" size={20} color="#3e6a13" />
                <Text style={styles.sectionTitle}>Đánh giá sản phẩm</Text>
              </View>

              {reviewsLoading ? (
                <View style={styles.reviewsLoadingContainer}>
                  <ActivityIndicator size="small" color="#3e6a13" />
                  <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
                </View>
              ) : reviews.length > 0 ? (
                <>
                  {/* Reviews Summary */}
                  <View style={styles.reviewsSummary}>
                    <View style={styles.averageRatingContainer}>
                      <Text style={styles.averageRating}>
                        {calculateAverageRating()}
                      </Text>
                      {renderStarRating(
                        parseFloat(calculateAverageRating()),
                        18
                      )}
                    </View>
                    <Text style={styles.reviewCount}>
                      {reviews.length} đánh giá
                    </Text>
                  </View>

                  {/* Reviews List */}
                  <View>
                    {reviews.slice(0, 3).map((review) => (
                      <View key={review.ratingId}>
                        {renderReview({ item: review })}
                      </View>
                    ))}
                  </View>

                  {reviews.length > 3 && (
                    <TouchableOpacity style={styles.showMoreReviewsButton}>
                      <Text style={styles.showMoreReviewsText}>
                        Xem thêm {reviews.length - 3} đánh giá
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <View style={styles.noReviewsContainer}>
                  <Ionicons name="chatbubble-outline" size={40} color="#ccc" />
                  <Text style={styles.noReviewsText}>Chưa có đánh giá nào</Text>
                  <Text style={styles.noReviewsSubtext}>
                    Hãy là người đầu tiên đánh giá sản phẩm này!
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={40} color="#e53935" />
            <Text style={styles.errorText}>
              Không tìm thấy thông tin sản phẩm
            </Text>
            <TouchableOpacity
              style={styles.backToHomeButton}
              onPress={handleBackArrowPress}
            >
              <Text style={styles.backButtonText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  notification: {
    position: "absolute",
    top: 88, // Position below header
    left: 16,
    right: 16,
    backgroundColor: "#3e6a13",
    borderRadius: 8,
    padding: 12,
    zIndex: 1000,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  notificationText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "500",
    flex: 1,
  },
  viewCartButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 10,
  },
  viewCartText: {
    color: "#3e6a13",
    fontWeight: "bold",
    fontSize: 12,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#3e6a13",
    marginTop: 32,
  },
  backButton: {
    padding: 5,
  },
  logo: {
    flex: 1,
    height: 30,
    width: 120,
    resizeMode: "contain",
    alignSelf: "center",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartButton: {
    position: "relative",
    marginLeft: 15,
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#f89406",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  backToHomeButton: {
    backgroundColor: "#3e6a13",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  imageGalleryContainer: {
    marginTop: 20,
    width: "100%",
  },
  mainProductImage: {
    width: "100%",
    height: 300,
    resizeMode: "contain",
    borderRadius: 10,
  },
  productImage: {
    width: "100%",
    borderRadius: 10,
    height: 300,
    resizeMode: "cover",
  },
  thumbnailList: {
    backgroundColor: "#f9f9f9",
    paddingVertical: 10,
  },
  thumbnailListContent: {
    paddingHorizontal: 10,
  },
  thumbnailContainer: {
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 2,
    height: 70,
    width: 70,
  },
  selectedThumbnailContainer: {
    borderColor: "#3e6a13",
    borderWidth: 2,
  },
  thumbnailImage: {
    height: "100%",
    width: "100%",
    resizeMode: "cover",
    borderRadius: 3,
  },
  productInfo: {
    padding: 15,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    color: "#e27b32",
    fontWeight: "bold",
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
  },
  categoryBadge: {
    backgroundColor: "#f0f8eb",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  categoryText: {
    color: "#3e6a13",
    fontSize: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333",
  },
  addToCartButton: {
    backgroundColor: "#3e6a13",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 20,
  },
  addToCartText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  // Recommended Products Styles
  recommendedProductsList: {
    paddingHorizontal: 5,
  },
  recommendedProductItem: {
    width: 150,
    marginHorizontal: 5,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recommendedProductImageContainer: {
    position: "relative",
    height: 120,
  },
  recommendedProductImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    resizeMode: "cover",
  },
  discountBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#e74c3c",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  newBadge: {
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "#2ecc71",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  recommendedProductInfo: {
    padding: 10,
  },
  recommendedProductName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
    lineHeight: 16,
  },
  recommendedPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  recommendedPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#e27b32",
    marginRight: 5,
  },
  recommendedOriginalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
  },

  // Reviews Styles
  reviewsLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  reviewsSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  averageRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  averageRating: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3e6a13",
    marginRight: 10,
  },
  reviewCount: {
    fontSize: 14,
    color: "#666",
  },
  reviewItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#3e6a13",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  reviewerInitial: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  reviewContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  showMoreReviewsButton: {
    backgroundColor: "#f0f8eb",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  showMoreReviewsText: {
    color: "#3e6a13",
    fontWeight: "500",
  },
  noReviewsContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  noReviewsText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 5,
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
