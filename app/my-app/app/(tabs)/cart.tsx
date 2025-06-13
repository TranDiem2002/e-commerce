// app/(tabs)/cart.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_USER } from "../../links";

// Tab types
type TabType = "cart" | "purchased";

// Cart item interface
interface CartItem {
  productId: number;
  id: number;
  productName: string;
  imageUrl: string;
  price: number;
  quantity: number;
  status: string;
}

// Purchased order interfaces
interface PurchasedProduct {
  productName: string;
  productImage: string;
  price: number;
  originalPrice: number;
  mount: number;
}

interface PurchasedOrder {
  purchasedOrderId: number;
  purchasedProductResponses: PurchasedProduct[];
  totalQuantity: number;
  totalMoney: number;
  address: string;
  purchasedOrderStatus: string;
  purchaseDateTime: string;
}

interface ReviewData {
  productName: string;
  rating: number;
  content: string;
}

interface CartItem {
  productId: number;
  id: number;
  productName: string;
  imageUrl: string;
  price: number;
  quantity: number;
  status: string;
}

interface Province {
  code: number;
  name: string;
}

interface District {
  code: number;
  name: string;
}

interface Ward {
  code: number;
  name: string;
}

interface CheckoutForm {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  notes: string;
}

export default function CartScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("cart");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [purchasedOrders, setPurchasedOrders] = useState<PurchasedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  // Review modal state
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [currentReviewProduct, setCurrentReviewProduct] =
    useState<PurchasedProduct | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Pagination for purchased orders
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Checkout modal state
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Address data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Form data
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    notes: "",
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (activeTab === "cart") {
      fetchCartItems();
    } else if (activeTab === "purchased") {
      fetchOrders(1);
    }
  };

  const fetchCartItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập để xem giỏ hàng");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_USER}/product/getCart`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cart data");
      }

      const data = await response.json();
      setCartItems(data);
    } catch (err) {
      console.error("Error fetching cart data:", err);
      setError("Không thể tải dữ liệu giỏ hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (page = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      setCurrentPage(page);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Vui lòng đăng nhập để xem đơn hàng");
        return;
      }

      const response = await fetch(
        `${API_USER}/purchasedOrder/getPurchased?page=${page}&size=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();

      if (page === 1) {
        setPurchasedOrders(data.purchasedOrderResponses || []);
      } else {
        setPurchasedOrders((prev) => [
          ...prev,
          ...(data.purchasedOrderResponses || []),
        ]);
      }

      setTotalPages(data.totalPage || 1);
      setError(null);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreOrders = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      fetchOrders(currentPage + 1);
    }
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("vi-VN") +
      " " +
      date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  // Review functions
  const openReviewModal = (product: PurchasedProduct) => {
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

  const submitReview = async () => {
    if (!currentReviewProduct) return;

    try {
      setIsSubmittingReview(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
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

      Alert.alert("Thành công", "Cảm ơn bạn đã đánh giá sản phẩm!", [
        { text: "OK", onPress: closeReviewModal },
      ]);
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Lỗi", "Không thể gửi đánh giá. Vui lòng thử lại sau.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const renderStarRating = (
    rating: number,
    onRatingChange?: (rating: number) => void
  ) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingChange && onRatingChange(star)}
            disabled={!onRatingChange}
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={24}
              color={star <= rating ? "#ffa000" : "#ccc"}
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Existing cart functions...
  const handleQuantityChange = async (
    productId: number,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    try {
      setUpdatingItems((prev) => new Set([...prev, productId]));

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
        return;
      }

      const response = await fetch(`${API_USER}/product/updateCart`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
          quantity: newQuantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật số lượng");
      }

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      Alert.alert("Lỗi", "Không thể cập nhật số lượng sản phẩm");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (productId: number, productName: string) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa "${productName}" khỏi giỏ hàng?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              setUpdatingItems((prev) => new Set([...prev, productId]));

              const token = await AsyncStorage.getItem("token");
              if (!token) {
                Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
                return;
              }

              const response = await fetch(`${API_USER}/product/deleteCart`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ productId: productId }),
              });

              if (!response.ok) {
                throw new Error("Không thể xóa sản phẩm");
              }

              setCartItems((prevItems) =>
                prevItems.filter((item) => item.productId !== productId)
              );

              Alert.alert("Thành công", "Đã xóa sản phẩm khỏi giỏ hàng");
            } catch (error) {
              console.error("Error removing item:", error);
              Alert.alert("Lỗi", "Không thể xóa sản phẩm khỏi giỏ hàng");
            } finally {
              setUpdatingItems((prev) => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
              });
            }
          },
        },
      ]
    );
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

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const isUpdating = updatingItems.has(item.productId);
    const canDecrease = item.quantity > 1;

    return (
      <View style={[styles.cartItem, isUpdating && styles.updatingItem]}>
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
          <Text style={styles.totalItemPrice}>
            Tổng: {(item.price * item.quantity).toLocaleString()}đ
          </Text>
        </View>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              !canDecrease && styles.disabledButton,
            ]}
            onPress={() => {
              if (canDecrease && !isUpdating) {
                handleQuantityChange(item.productId, item.quantity - 1);
              }
            }}
            disabled={!canDecrease || isUpdating}
          >
            <Ionicons
              name="remove"
              size={16}
              color={!canDecrease || isUpdating ? "#ccc" : "#666"}
            />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity}</Text>

          <TouchableOpacity
            style={[styles.controlButton, isUpdating && styles.disabledButton]}
            onPress={() => {
              if (!isUpdating) {
                handleQuantityChange(item.productId, item.quantity + 1);
              }
            }}
            disabled={isUpdating}
          >
            <Ionicons
              name="add"
              size={16}
              color={isUpdating ? "#ccc" : "#666"}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.removeButton, isUpdating && styles.disabledButton]}
          onPress={() => {
            if (!isUpdating) {
              handleRemoveItem(item.productId, item.productName);
            }
          }}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#e53935" />
          ) : (
            <Ionicons name="trash-outline" size={22} color="#e53935" />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderPurchasedOrder = ({ item }: { item: PurchasedOrder }) => (
    <View style={styles.orderContainer}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Đơn hàng #{item.purchasedOrderId}</Text>
        <Text style={styles.orderDate}>
          {formatDate(item.purchaseDateTime)}
        </Text>
      </View>

      <View style={styles.orderStatus}>
        <Text
          style={[
            styles.statusText,
            item.purchasedOrderStatus === "Delivered" && styles.deliveredStatus,
            item.purchasedOrderStatus === "Progress" && styles.progressStatus,
            item.purchasedOrderStatus === "Waiting" && styles.waitingStatus,
          ]}
        >
          {item.purchasedOrderStatus === "Delivered"
            ? "Đã giao hàng"
            : item.purchasedOrderStatus === "Progress"
            ? "Đang xử lý"
            : "Chờ xác nhận"}
        </Text>
      </View>

      {item.purchasedProductResponses.map((product, index) => (
        <View key={index} style={styles.orderProductItem}>
          <Image
            source={{ uri: product.productImage }}
            style={styles.orderProductImage}
            defaultSource={require("@/assets/images/ic_shop.png")}
          />
          <View style={styles.orderProductInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.productName}
            </Text>
            <Text style={styles.productPrice}>
              {product.price.toLocaleString()}đ x {product.mount}
            </Text>
            {product.originalPrice !== product.price && (
              <Text style={styles.originalPrice}>
                Giá gốc: {product.originalPrice.toLocaleString()}đ
              </Text>
            )}
          </View>

          {item.purchasedOrderStatus === "Delivered" && (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => openReviewModal(product)}
            >
              <Ionicons name="star-outline" size={16} color="#ffa000" />
              <Text style={styles.reviewButtonText}>Đánh giá</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotalText}>
          Tổng tiền: {item.totalMoney.toLocaleString()}đ
        </Text>
        <Text style={styles.orderAddress} numberOfLines={2}>
          Địa chỉ: {item.address}
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
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeTab === "cart") {
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
            keyExtractor={(item) =>
              item.productId?.toString() || item.id?.toString()
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Tổng tiền:</Text>
            <Text style={styles.totalPrice}>
              {getTotalPrice().toLocaleString()}đ
            </Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={openCheckoutModal}
          >
            <Text style={styles.checkoutButtonText}>Thanh toán</Text>
          </TouchableOpacity>
        </>
      );
    } else if (activeTab === "purchased") {
      if (purchasedOrders.length === 0) {
        return (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="bag-check-outline" size={60} color="#ccc" />
            <Text style={styles.emptyStateText}>Bạn chưa có đơn hàng nào</Text>
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
          renderItem={renderPurchasedOrder}
          keyExtractor={(item) => item.purchasedOrderId.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreOrders}
          onEndReachedThreshold={0.1}
          ListFooterComponent={() =>
            isLoadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#3e6a13" />
                <Text style={styles.loadMoreText}>Đang tải thêm...</Text>
              </View>
            ) : null
          }
        />
      );
    }

    return null;
  };

  // Load provinces when checkout modal opens
  useEffect(() => {
    if (checkoutModalVisible) {
      loadProvinces();
    }
  }, [checkoutModalVisible]);

  // Load districts when province changes
  useEffect(() => {
    if (checkoutForm.province) {
      loadDistricts(parseInt(checkoutForm.province));
    } else {
      setDistricts([]);
    }
  }, [checkoutForm.province]);

  // Load wards when district changes
  useEffect(() => {
    if (checkoutForm.district) {
      loadWards(parseInt(checkoutForm.district));
    } else {
      setWards([]);
    }
  }, [checkoutForm.district]);

  // Load provinces from API
  const loadProvinces = async () => {
    try {
      const response = await fetch(
        "https://provinces.open-api.vn/api/?depth=1"
      );
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error("Error loading provinces:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách tỉnh/thành phố");
    }
  };

  // Load districts from API
  const loadDistricts = async (provinceCode: number) => {
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const data = await response.json();
      setDistricts(data.districts || []);
    } catch (error) {
      console.error("Error loading districts:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách quận/huyện");
    }
  };

  // Load wards from API
  const loadWards = async (districtCode: number) => {
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      const data = await response.json();
      setWards(data.wards || []);
    } catch (error) {
      console.error("Error loading wards:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách phường/xã");
    }
  };

  // Handle form input change
  const handleFormChange = (field: string, value: string) => {
    setCheckoutForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Reset dependent fields when parent changes
    if (field === "province") {
      setCheckoutForm((prev) => ({
        ...prev,
        district: "",
        ward: "",
      }));
    } else if (field === "district") {
      setCheckoutForm((prev) => ({
        ...prev,
        ward: "",
      }));
    }
  };

  // Validate checkout form
  const validateCheckoutForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!checkoutForm.fullName.trim()) {
      errors.fullName = "Vui lòng nhập họ tên";
    }

    if (!checkoutForm.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10,11}$/.test(checkoutForm.phone.trim())) {
      errors.phone = "Số điện thoại không hợp lệ";
    }

    if (!checkoutForm.address.trim()) {
      errors.address = "Vui lòng nhập địa chỉ";
    }

    if (!checkoutForm.province) {
      errors.province = "Vui lòng chọn tỉnh/thành phố";
    }

    if (!checkoutForm.district) {
      errors.district = "Vui lòng chọn quận/huyện";
    }

    if (!checkoutForm.ward) {
      errors.ward = "Vui lòng chọn phường/xã";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle checkout submission
  const handleCheckoutSubmit = async () => {
    if (!validateCheckoutForm()) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Lỗi", "Giỏ hàng đang trống");
      return;
    }

    try {
      setIsSubmittingOrder(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập để tiếp tục đặt hàng");
        return;
      }

      // Build full address
      const provinceName =
        provinces.find((p) => p.code.toString() === checkoutForm.province)
          ?.name || "";
      const districtName =
        districts.find((d) => d.code.toString() === checkoutForm.district)
          ?.name || "";
      const wardName =
        wards.find((w) => w.code.toString() === checkoutForm.ward)?.name || "";
      const fullAddress = `${checkoutForm.address}, ${wardName}, ${districtName}, ${provinceName}`;

      const orderRequest = {
        address: fullAddress,
        // Add other fields if needed by API
      };

      const response = await fetch(`${API_USER}/purchasedOrder/pay`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderRequest),
      });

      if (!response.ok) {
        throw new Error("Không thể đặt hàng");
      }

      // Success
      Alert.alert("Thành công", "Đặt hàng thành công!", [
        {
          text: "OK",
          onPress: () => {
            setCheckoutModalVisible(false);
            setActiveTab("purchased"); // Switch to purchased orders tab
            // Reset form
            setCheckoutForm({
              fullName: "",
              phone: "",
              email: "",
              address: "",
              province: "",
              district: "",
              ward: "",
              notes: "",
            });
            // Refresh cart
            fetchCartItems();
          },
        },
      ]);
    } catch (error) {
      console.error("Error submitting order:", error);
      Alert.alert("Lỗi", "Không thể đặt hàng. Vui lòng thử lại sau.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Open checkout modal
  const openCheckoutModal = () => {
    if (cartItems.length === 0) {
      Alert.alert("Thông báo", "Giỏ hàng đang trống");
      return;
    }

    // Check for unavailable items
    const hasUnavailableItems = cartItems.some((item) => !item.status);
    if (hasUnavailableItems) {
      Alert.alert(
        "Thông báo",
        "Giỏ hàng có sản phẩm không khả dụng. Vui lòng xóa sản phẩm không khả dụng trước khi thanh toán."
      );
      return;
    }

    setCheckoutModalVisible(true);
  };

  // Calculate total price
  // const getTotalPrice = () => {
  //   return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // };

  // Existing cart functions (handleQuantityChange, handleRemoveItem, etc.)...
  // [Keep all existing functions unchanged]

  // Render checkout modal
  const renderCheckoutModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={checkoutModalVisible}
      onRequestClose={() => setCheckoutModalVisible(false)}
    >
      <SafeAreaView style={styles.checkoutContainer}>
        <KeyboardAvoidingView style={styles.flex1}>
          {/* Header */}
          <View style={styles.checkoutHeader}>
            <TouchableOpacity
              onPress={() => setCheckoutModalVisible(false)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.checkoutTitle}>Thông tin đặt hàng</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.checkoutContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Order Summary */}
            <View style={styles.orderSummaryCard}>
              <Text style={styles.sectionTitle}>Đơn hàng của bạn</Text>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tổng tiền:</Text>
                <Text style={styles.totalAmount}>
                  {getTotalPrice().toLocaleString()}đ
                </Text>
              </View>
              <Text style={styles.itemCount}>{cartItems.length} sản phẩm</Text>
            </View>

            {/* Shipping Information */}
            <View style={styles.shippingCard}>
              <Text style={styles.sectionTitle}>Thông tin nhận hàng</Text>

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Họ và tên *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    formErrors.fullName && styles.errorInput,
                  ]}
                  placeholder="Nhập họ và tên"
                  value={checkoutForm.fullName}
                  onChangeText={(value) => handleFormChange("fullName", value)}
                />
                {formErrors.fullName && (
                  <Text style={styles.errorText}>{formErrors.fullName}</Text>
                )}
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số điện thoại *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    formErrors.phone && styles.errorInput,
                  ]}
                  placeholder="Nhập số điện thoại"
                  value={checkoutForm.phone}
                  onChangeText={(value) => handleFormChange("phone", value)}
                  keyboardType="phone-pad"
                />
                {formErrors.phone && (
                  <Text style={styles.errorText}>{formErrors.phone}</Text>
                )}
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Email để nhận thông tin đơn hàng"
                  value={checkoutForm.email}
                  onChangeText={(value) => handleFormChange("email", value)}
                  keyboardType="email-address"
                />
              </View>

              {/* Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Địa chỉ *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    formErrors.address && styles.errorInput,
                  ]}
                  placeholder="Số nhà, tên đường"
                  value={checkoutForm.address}
                  onChangeText={(value) => handleFormChange("address", value)}
                />
                {formErrors.address && (
                  <Text style={styles.errorText}>{formErrors.address}</Text>
                )}
              </View>

              {/* Province */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tỉnh/Thành phố *</Text>
                <View
                  style={[
                    styles.pickerContainer,
                    formErrors.province && styles.errorInput,
                  ]}
                >
                  <Picker
                    selectedValue={checkoutForm.province}
                    onValueChange={(value) =>
                      handleFormChange("province", value)
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Chọn tỉnh/thành phố" value="" />
                    {provinces.map((province) => (
                      <Picker.Item
                        key={province.code}
                        label={province.name}
                        value={province.code.toString()}
                      />
                    ))}
                  </Picker>
                </View>
                {formErrors.province && (
                  <Text style={styles.errorText}>{formErrors.province}</Text>
                )}
              </View>

              {/* District */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quận/Huyện *</Text>
                <View
                  style={[
                    styles.pickerContainer,
                    formErrors.district && styles.errorInput,
                  ]}
                >
                  <Picker
                    selectedValue={checkoutForm.district}
                    onValueChange={(value) =>
                      handleFormChange("district", value)
                    }
                    style={styles.picker}
                    enabled={districts.length > 0}
                  >
                    <Picker.Item label="Chọn quận/huyện" value="" />
                    {districts.map((district) => (
                      <Picker.Item
                        key={district.code}
                        label={district.name}
                        value={district.code.toString()}
                      />
                    ))}
                  </Picker>
                </View>
                {formErrors.district && (
                  <Text style={styles.errorText}>{formErrors.district}</Text>
                )}
              </View>

              {/* Ward */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phường/Xã *</Text>
                <View
                  style={[
                    styles.pickerContainer,
                    formErrors.ward && styles.errorInput,
                  ]}
                >
                  <Picker
                    selectedValue={checkoutForm.ward}
                    onValueChange={(value) => handleFormChange("ward", value)}
                    style={styles.picker}
                    enabled={wards.length > 0}
                  >
                    <Picker.Item label="Chọn phường/xã" value="" />
                    {wards.map((ward) => (
                      <Picker.Item
                        key={ward.code}
                        label={ward.name}
                        value={ward.code.toString()}
                      />
                    ))}
                  </Picker>
                </View>
                {formErrors.ward && (
                  <Text style={styles.errorText}>{formErrors.ward}</Text>
                )}
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ghi chú</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Ghi chú thêm (ví dụ: Giao giờ hành chính)"
                  value={checkoutForm.notes}
                  onChangeText={(value) => handleFormChange("notes", value)}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Payment Method */}
              <View style={styles.paymentMethodCard}>
                <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                <View style={styles.paymentMethod}>
                  <Ionicons name="cash-outline" size={24} color="#3e6a13" />
                  <Text style={styles.paymentMethodText}>
                    Thanh toán khi nhận hàng (COD)
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.checkoutFooter}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmittingOrder && styles.disabledButton,
              ]}
              onPress={handleCheckoutSubmit}
              disabled={isSubmittingOrder}
            >
              {isSubmittingOrder ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Đặt hàng</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

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
      </View>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>

      {renderCheckoutModal()}

      {/* Review Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reviewModalVisible}
        onRequestClose={closeReviewModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đánh giá sản phẩm</Text>
              <TouchableOpacity onPress={closeReviewModal}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {currentReviewProduct && (
                <>
                  <Text style={styles.reviewProductName}>
                    {currentReviewProduct.productName}
                  </Text>

                  <Text style={styles.ratingLabel}>Đánh giá của bạn:</Text>
                  {renderStarRating(reviewRating, setReviewRating)}

                  <Text style={styles.commentLabel}>Nhận xét (tùy chọn):</Text>
                  <TextInput
                    style={styles.commentInput}
                    multiline
                    numberOfLines={4}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                    value={reviewContent}
                    onChangeText={setReviewContent}
                    maxLength={500}
                  />
                  <Text style={styles.characterCount}>
                    {reviewContent.length}/500 ký tự
                  </Text>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeReviewModal}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isSubmittingReview && styles.disabledButton,
                ]}
                onPress={submitReview}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  updatingItem: {
    opacity: 0.7,
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
  totalItemPrice: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  controlButton: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  disabledButton: {
    backgroundColor: "#f5f5f5",
    borderColor: "#eee",
  },
  quantityText: {
    fontSize: 14,
    paddingHorizontal: 12,
    minWidth: 40,
    textAlign: "center",
  },
  removeButton: {
    padding: 5,
    borderRadius: 4,
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
  // Purchased orders styles
  orderContainer: {
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  orderDate: {
    fontSize: 12,
    color: "#666",
  },
  orderStatus: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  statusText: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: "hidden",
  },
  deliveredStatus: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
  },
  progressStatus: {
    backgroundColor: "#fff3e0",
    color: "#f57c00",
  },
  waitingStatus: {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
  },
  orderProductItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
  originalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff8e1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ffa000",
  },
  reviewButtonText: {
    fontSize: 12,
    color: "#ffa000",
    marginLeft: 4,
    fontWeight: "500",
  },
  orderFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  orderTotalText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#e27b32",
    marginBottom: 5,
  },
  orderAddress: {
    fontSize: 12,
    color: "#666",
  },
  loadMoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
  },
  loadMoreText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalContent: {
    padding: 16,
    maxHeight: 400,
  },
  reviewProductName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  star: {
    marginRight: 8,
  },
  commentLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    fontSize: 14,
  },
  characterCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#3e6a13",
    marginLeft: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  checkoutContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  flex1: {
    flex: 1,
  },
  checkoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 4,
  },
  checkoutTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 32,
  },
  checkoutContent: {
    flex: 1,
    padding: 16,
  },
  orderSummaryCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shippingCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 16,
    color: "#333",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3e6a13",
  },
  itemCount: {
    fontSize: 14,
    color: "#666",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  errorInput: {
    borderColor: "#e53935",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  paymentMethodCard: {
    marginTop: 8,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#3e6a13",
  },
  paymentMethodText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
    fontWeight: "500",
  },
  checkoutFooter: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
});
