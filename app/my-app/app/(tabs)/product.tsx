import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import Header from "../../components/ui/Header";
import CategoryDrawer from "../../components/ui/CategoryDrawer";
import { API_USER } from "../../links/index";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the product type based on API response
interface ProductItem {
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

interface ProductResponse {
  productResponses: ProductItem[];
  totalPages: number;
}

export default function ProductScreen() {
  const router = useRouter();
  const { categoryId, subCategoryId, categoryName, subCategoryName } =
    useLocalSearchParams<{
      categoryId: string;
      subCategoryId: string;
      categoryName: string;
      subCategoryName: string;
    }>();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0); // This is the UI page (0-indexed)
  const [totalPages, setTotalPages] = useState(1);
  const [isCategoryDrawerVisible, setIsCategoryDrawerVisible] = useState(false);
  const [showPagination, setShowPagination] = useState(false); // Control pagination visibility
  const pageSize = 8;

  // Fetch cart count on component mount
  useEffect(() => {
    fetchCartCount();
  }, []);

  // Fetch products when component mounts or category/subcategory changes
  useEffect(() => {
    if (categoryId || subCategoryId) {
      fetchProductsByCategory(
        categoryId ? parseInt(categoryId) : 0,
        subCategoryId ? parseInt(subCategoryId) : undefined
      );
    } else {
      // Fetch all products if no category is specified
      fetchProductsByCategory(0);
    }
  }, [categoryId, subCategoryId, currentPage]);

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

  const fetchProductsByCategory = async (
    categoryId: number,
    subCategoryId?: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      setShowPagination(false); // Hide pagination while loading

      // Use currentPage directly for API call (0-indexed)
      let url = `${API_USER}/products/category/${categoryId}?page=${
        currentPage - 1
      }&size=${pageSize}`;

      if (subCategoryId) {
        url = `${API_USER}/product/subCategory/${subCategoryId}?page=${
          currentPage + 1
        }&size=${pageSize}`;
      }

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data.productResponses);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (catId: number, subCatId?: number) => {
    setCurrentPage(0); // Reset to first page when category changes
    if (subCatId) {
      fetchProductsByCategory(catId, subCatId);
    } else {
      fetchProductsByCategory(catId);
    }
  };

  const handleMenuPress = () => {
    setIsCategoryDrawerVisible(true);
  };

  const handleSearchPress = () => {
    router.push("/search");
  };

  // const handleCartPress = () => {
  //   router.push("/cart");
  // };

  // const handleLocationPress = () => {
  //   router.push("/store-locations");
  // };

  // Handle end of list reached - show pagination
  const handleEndReached = () => {
    if (products.length > 0 && totalPages > 1) {
      setShowPagination(true);
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    if (!showPagination) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.pageButton,
            currentPage === 1 && styles.disabledButton,
          ]}
          onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 0}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentPage === 1 ? "#ccc" : "#3e6a13"}
          />
        </TouchableOpacity>

        {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
          // Show limited number of page buttons for better UI
          let pageNum = index;
          if (totalPages > 5) {
            if (currentPage > 2) {
              pageNum = currentPage - 2 + index;
              if (pageNum >= totalPages) {
                pageNum = totalPages - 5 + index;
              }
            }
          }

          if (pageNum < totalPages) {
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.pageButton,
                  currentPage === pageNum && styles.activePageButton,
                ]}
                onPress={() => setCurrentPage(pageNum)}
              >
                <Text
                  style={[
                    styles.pageButtonText,
                    currentPage === pageNum && styles.activePageButtonText,
                  ]}
                >
                  {pageNum + 1}
                </Text>
              </TouchableOpacity>
            );
          }
          return null;
        })}

        <TouchableOpacity
          style={[
            styles.pageButton,
            currentPage === totalPages - 1 && styles.disabledButton,
          ]}
          onPress={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          disabled={currentPage === totalPages - 1}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={currentPage === totalPages - 1 ? "#ccc" : "#3e6a13"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // Render a product item
  const renderProductItem = ({ item }: { item: ProductItem }) => (
    <TouchableOpacity
      style={styles.productCard}
      // onPress={() => router.push(`/product-detail/${item.productId}`)}
    >
      <View style={styles.imageContainer}>
        {item.discount > 0 && (
          <View style={styles.discountTag}>
            <Text style={styles.discountText}>-{item.discount}%</Text>
          </View>
        )}
        {item.new && (
          <View style={[styles.discountTag, styles.newTag]}>
            <Text style={styles.newTagText}>New</Text>
          </View>
        )}
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.productImage}
          defaultSource={require("@/assets/images/ic_shop.png")}
        />
        {item.specialPrice && (
          <View style={styles.giftTag}>
            <Text style={styles.giftText}>QUÀ TẶNG</Text>
          </View>
        )}
      </View>

      <View style={styles.productDetails}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.productName}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{item.price.toLocaleString()}đ</Text>
          {item.discount > 0 && (
            <Text style={styles.originalPrice}>
              {item.originalPrice.toLocaleString()}đ
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Get page title based on category/subcategory
  const getPageTitle = () => {
    if (subCategoryName) {
      return subCategoryName;
    } else if (categoryName) {
      return categoryName;
    } else {
      return "TẤT CẢ SẢN PHẨM";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3e6a13" />

      {/* Header */}
      <Header
        cartCount={cartCount}
        onMenuPress={handleMenuPress}
        onSearchPress={handleSearchPress}
        // onCartPress={handleCartPress}
        // onLocationPress={handleLocationPress}
      />

      {/* Category Drawer */}
      <CategoryDrawer
        visible={isCategoryDrawerVisible}
        onClose={() => setIsCategoryDrawerVisible(false)}
        onCategorySelect={handleCategorySelect}
      />

      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <TouchableOpacity
          style={styles.breadcrumbItem}
          onPress={() => router.push("/home")}
        >
          <Ionicons name="home-outline" size={16} color="#3e6a13" />
          <Text style={styles.breadcrumbText}>Sản phẩm</Text>
        </TouchableOpacity>
        <Text style={styles.breadcrumbSeparator}>/</Text>
        <Text style={[styles.breadcrumbText, styles.activeBreadcrumb]}>
          {getPageTitle()}
        </Text>
      </View>

      {/* Loading indicator */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3e6a13" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#e53935" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() =>
              fetchProductsByCategory(
                categoryId ? parseInt(categoryId) : 0,
                subCategoryId ? parseInt(subCategoryId) : undefined
              )
            }
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="basket-outline" size={40} color="#999" />
          <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
        </View>
      ) : (
        <>
          {/* Product Grid */}
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.productId.toString()}
            numColumns={2}
            contentContainerStyle={styles.productGrid}
            showsVerticalScrollIndicator={false}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.1}
            ListFooterComponent={
              <>
                {/* Pagination */}
                {renderPagination()}
              </>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  retryButton: {
    backgroundColor: "#3e6a13",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    color: "#666",
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  breadcrumbItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  breadcrumbText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  breadcrumbSeparator: {
    marginHorizontal: 5,
    color: "#666",
  },
  activeBreadcrumb: {
    color: "#3e6a13",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  productGrid: {
    padding: 10,
  },
  productsCountContainer: {
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 5,
  },
  productsCountText: {
    color: "#666",
    fontSize: 14,
  },
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageContainer: {
    position: "relative",
    aspectRatio: 1,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  discountTag: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#e53935",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    zIndex: 1,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  newTag: {
    backgroundColor: "#3e6a13",
  },
  newTagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  giftTag: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#3a6e21",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    zIndex: 1,
  },
  giftText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  productDetails: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
    height: 40,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e27b32",
    marginRight: 5,
  },
  originalPrice: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#f0f0f0",
  },
  activePageButton: {
    backgroundColor: "#3e6a13",
  },
  pageButtonText: {
    color: "#333",
  },
  activePageButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
