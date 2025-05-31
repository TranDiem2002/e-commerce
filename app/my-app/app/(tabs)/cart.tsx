// app/(tabs)/cart.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_USER } from "../../links";

// Tab types
type TabType = "cart" | "purchased" | "canceled";

// Order item types
interface OrderItem {
  id: number;
  productName: string;
  imageUrl: string;
  price: number;
  quantity: number;
  status: string;
  date?: string;
}

export default function CartScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("cart");
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [purchasedOrders, setPurchasedOrders] = useState<OrderItem[]>([]);
  const [canceledOrders, setCanceledOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập để xem giỏ hàng");
        setLoading(false);
        return;
      }

      // Fetch the appropriate data based on the active tab
      let endpoint = "";
      switch (activeTab) {
        case "cart":
          endpoint = "/product/getCart";
          break;
        case "purchased":
          endpoint = "/orders/completed";
          break;
        case "canceled":
          endpoint = "/orders/canceled";
          break;
      }

      const response = await fetch(`${API_USER}${endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${activeTab} data`);
      }

      const data = await response.json();

      // Update the appropriate state based on the active tab
      switch (activeTab) {
        case "cart":
          setCartItems(data);
          break;
        case "purchased":
          setPurchasedOrders(data);
          break;
        case "canceled":
          setCanceledOrders(data);
          break;
      }
    } catch (err) {
      console.error(`Error fetching ${activeTab} data:`, err);
      setError(`Không thể tải dữ liệu. Vui lòng thử lại sau.`);
    } finally {
      setLoading(false);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const renderTabButton = (tab: TabType, label: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon as any}
        size={22}
        color={activeTab === tab ? "#3e6a13" : "#666"}
      />
      <Text
        style={[
          styles.tabButtonText,
          activeTab === tab && styles.activeTabButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderCartItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.productImage}
        defaultSource={require("@/assets/images/ic_shop.png")}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.productName}
        </Text>
        <Text style={styles.productPrice}>
          {item.price.toLocaleString()}đ x {item.quantity}
        </Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="remove" size={16} color="#666" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="add" size={16} color="#666" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.removeButton}>
        <Ionicons name="trash-outline" size={22} color="#e53935" />
      </TouchableOpacity>
    </View>
  );

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.orderItem}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.orderProductImage}
        defaultSource={require("@/assets/images/ic_shop.png")}
      />
      <View style={styles.orderProductInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.productName}
        </Text>
        <Text style={styles.productPrice}>
          {item.price.toLocaleString()}đ x {item.quantity}
        </Text>
        {item.date && <Text style={styles.orderDate}>{item.date}</Text>}
      </View>
      <View style={styles.statusContainer}>
        <Text
          style={[
            styles.statusText,
            item.status === "completed" && styles.completedStatus,
            item.status === "canceled" && styles.canceledStatus,
          ]}
        >
          {item.status === "completed" ? "Hoàn thành" : "Đã hủy"}
        </Text>
      </View>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.emptyStateContainer}>
          <ActivityIndicator size="large" color="#3e6a13" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#e53935" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchData()}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (activeTab) {
      case "cart":
        if (cartItems.length === 0) {
          return (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="cart-outline" size={60} color="#ccc" />
              <Text style={styles.emptyStateText}>
                Giỏ hàng của bạn đang trống
              </Text>
              <TouchableOpacity
                style={styles.shopButton}
                onPress={() => router.push("/(tabs)/product")}
              >
                <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
              </TouchableOpacity>
            </View>
          );
        }

        return (
          <>
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id?.toString()}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Tổng tiền:</Text>
              <Text style={styles.totalPrice}>
                {getTotalPrice().toLocaleString()}đ
              </Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton}>
              <Text style={styles.checkoutButtonText}>Thanh toán</Text>
            </TouchableOpacity>
          </>
        );

      case "purchased":
        if (purchasedOrders.length === 0) {
          return (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="bag-check-outline" size={60} color="#ccc" />
              <Text style={styles.emptyStateText}>
                Bạn chưa có đơn hàng nào
              </Text>
              <TouchableOpacity
                style={styles.shopButton}
                onPress={() => router.push("/(tabs)/product")}
              >
                <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
              </TouchableOpacity>
            </View>
          );
        }

        return (
          <FlatList
            data={purchasedOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id?.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        );

      case "canceled":
        if (canceledOrders.length === 0) {
          return (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="close-circle-outline" size={60} color="#ccc" />
              <Text style={styles.emptyStateText}>
                Không có đơn hàng đã hủy
              </Text>
            </View>
          );
        }

        return (
          <FlatList
            data={canceledOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id?.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3e6a13" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton("cart", "Giỏ hàng", "cart-outline")}
        {renderTabButton("purchased", "Đơn mua", "bag-check-outline")}
        {renderTabButton("canceled", "Đơn hủy", "close-circle-outline")}
      </View>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#3e6a13",
    marginTop: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: "#3e6a13",
  },
  tabButtonText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  activeTabButtonText: {
    color: "#3e6a13",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
    marginBottom: 20,
    textAlign: "center",
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
  shopButton: {
    backgroundColor: "#3e6a13",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  shopButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  listContainer: {
    padding: 10,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: "#e27b32",
    fontWeight: "500",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  controlButton: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 14,
    paddingHorizontal: 12,
  },
  removeButton: {
    padding: 5,
  },
  orderItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderProductImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 10,
  },
  orderProductInfo: {
    flex: 1,
  },
  orderDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  statusContainer: {
    paddingLeft: 10,
  },
  statusText: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  completedStatus: {
    backgroundColor: "#e6f4ea",
    color: "#1e7e34",
  },
  canceledStatus: {
    backgroundColor: "#feeae9",
    color: "#d32f2f",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  totalText: {
    fontSize: 16,
    color: "#333",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e27b32",
  },
  checkoutButton: {
    margin: 10,
    backgroundColor: "#3e6a13",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
