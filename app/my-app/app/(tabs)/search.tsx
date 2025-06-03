// app/(tabs)/search.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_USER } from "../../links";

interface Product {
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

interface SearchResponse {
  productResponses: Product[];
  totalPages: number;
}

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập để tìm kiếm");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_USER}/product/searchProduct`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productName: searchQuery }),
      });

      if (!response.ok) {
        throw new Error("Không thể tìm kiếm sản phẩm");
      }

      const data: SearchResponse = await response.json();
      setProducts(data.productResponses);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Search error:", err);
      setError("Đã xảy ra lỗi khi tìm kiếm");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductDetail = (productId: number) => {
    router.push({
      pathname: "/productDetail",
      params: { id: productId },
    });
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductDetail(item.productId)}
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
          <Text style={styles.price}>{item.price?.toLocaleString()}đ</Text>
          {item.discount > 0 && (
            <Text style={styles.originalPrice}>
              {item.originalPrice?.toLocaleString()}đ
            </Text>
          )}
        </View>
        {item.ratingsAvg > 0 && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFC107" />
            <Text style={styles.ratingText}>
              {item.ratingsAvg.toFixed(1)} ({item.reviewCount})
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3e6a13" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Tìm kiếm</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên sản phẩm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery("")}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#3e6a13" />
            <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Ionicons name="alert-circle-outline" size={48} color="#e53935" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : products.length > 0 ? (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                Tìm thấy {products.length} sản phẩm
              </Text>
            </View>
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.productId.toString()}
              numColumns={2}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={styles.row}
            />
          </>
        ) : searchQuery ? (
          <View style={styles.centerContent}>
            <Ionicons name="search-outline" size={48} color="#aaa" />
            <Text style={styles.noResultText}>Không tìm thấy sản phẩm</Text>
            <Text style={styles.suggestionText}>Hãy thử từ khóa khác</Text>
          </View>
        ) : (
          <View style={styles.centerContent}>
            <Ionicons name="search-outline" size={48} color="#aaa" />
            <Text style={styles.instructionText}>
              Nhập từ khóa để tìm kiếm sản phẩm
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");
const cardWidth = (width - 30) / 2; // Adjusted for better fit

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#3e6a13",
    justifyContent: "center",
    marginTop: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: "#3e6a13",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  errorText: {
    marginTop: 10,
    color: "#e53935",
    fontSize: 16,
    textAlign: "center",
  },
  noResultText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
    fontWeight: "bold",
  },
  suggestionText: {
    marginTop: 5,
    color: "#999",
    fontSize: 14,
  },
  instructionText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
  resultsHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultsText: {
    color: "#666",
    fontSize: 14,
  },
  listContent: {
    padding: 10,
  },
  row: {
    justifyContent: "space-between",
    marginHorizontal: 5,
  },
  productCard: {
    width: cardWidth,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  discountTag: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#e53935",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
    marginBottom: 6,
    height: 40,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
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
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
});
