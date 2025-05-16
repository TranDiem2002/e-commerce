import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { API_USER } from "../../links/index";

const { width } = Dimensions.get("window");

interface SubCategory {
  subCategoryId: number;
  subCategoryName: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
  subCategoryResponses: SubCategory[];
}

interface CategoryDrawerProps {
  visible: boolean;
  onClose: () => void;
  onCategorySelect?: (categoryId: number, subCategoryId?: number) => void;
}

const CategoryDrawer: React.FC<CategoryDrawerProps> = ({
  visible,
  onClose,
  onCategorySelect,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: number]: boolean;
  }>({});
  const router = useRouter();

  const drawerAnimation = useRef(new Animated.Value(-width)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate drawer in
      Animated.parallel([
        Animated.timing(drawerAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnimation, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Fetch categories when drawer opens
      fetchCategories();
    } else {
      // Animate drawer out
      Animated.parallel([
        Animated.timing(drawerAnimation, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập để xem danh mục");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_USER}/category/getAll`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải danh mục");
      }

      const data = await response.json();
      setCategories(data);

      // Initialize expanded state for categories
      const initialExpandedState: { [key: number]: boolean } = {};
      data.forEach((category: Category) => {
        initialExpandedState[category.categoryId] = false;
      });
      setExpandedCategories(initialExpandedState);
    } catch (err: any) {
      console.error("Lỗi khi tải danh mục:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleSubCategoryPress = (
    categoryId: number,
    categoryName: string,
    subCategoryId: number,
    subCategoryName: string
  ) => {
    // Navigate to the product tab screen with the subCategoryId
    router.push({
      pathname: "/(tabs)/product",
      params: {
        categoryId,
        categoryName,
        subCategoryId,
        subCategoryName,
      },
    });

    // Call the callback if provided, passing both IDs
    if (onCategorySelect) {
      onCategorySelect(categoryId, subCategoryId);
    }

    // Close the drawer
    onClose();
  };

  return (
    <View style={[styles.container, { display: visible ? "flex" : "none" }]}>
      <Animated.View
        style={[styles.overlay, { opacity: overlayAnimation }]}
        onTouchEnd={onClose}
      />

      <Animated.View
        style={[
          styles.drawer,
          { transform: [{ translateX: drawerAnimation }] },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.drawerHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.drawerTitle}>Danh mục sản phẩm</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3e6a13" />
              <Text style={styles.loadingText}>Đang tải danh mục...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={40} color="#e53935" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchCategories}
              >
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.categoryList}>
              {categories.map((category) => (
                <View key={category.categoryId}>
                  <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => toggleCategoryExpansion(category.categoryId)}
                  >
                    <Text style={styles.categoryText}>
                      {category.categoryName}
                    </Text>
                    <Ionicons
                      name={
                        expandedCategories[category.categoryId]
                          ? "chevron-down"
                          : "chevron-forward"
                      }
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>

                  {/* Subcategories */}
                  {expandedCategories[category.categoryId] &&
                    category.subCategoryResponses && (
                      <View style={styles.subCategoryContainer}>
                        {category.subCategoryResponses.map((subCategory) => (
                          <TouchableOpacity
                            key={subCategory.subCategoryId}
                            style={styles.subCategoryItem}
                            onPress={() =>
                              handleSubCategoryPress(
                                category.categoryId,
                                category.categoryName,
                                subCategory.subCategoryId,
                                subCategory.subCategoryName
                              )
                            }
                          >
                            <Text style={styles.subCategoryText}>
                              {subCategory.subCategoryName}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                </View>
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  safeArea: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    zIndex: 1000,
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "80%",
    height: "100%",
    backgroundColor: "#fff",
    zIndex: 1001,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#f8f8f8",
    paddingTop: 40, // Account for status bar
  },
  closeButton: {
    marginRight: 15,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3e6a13",
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
  categoryList: {
    flex: 1,
  },
  specialItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
  specialItemText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffa000",
    justifyContent: "center",
    alignItems: "center",
  },
  saleIconContainer: {
    backgroundColor: "#ff6b00",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoryText: {
    fontSize: 16,
    color: "#333",
  },
  subCategoryContainer: {
    backgroundColor: "#f5f5f5",
  },
  subCategoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  subCategoryText: {
    fontSize: 14,
    color: "#666",
  },
});

export default CategoryDrawer;
