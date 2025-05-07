// src/utils/cart.ts
import { useState, useEffect } from "react";

// Định nghĩa kiểu dữ liệu cho sản phẩm trong giỏ hàng
export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

// Hook quản lý giỏ hàng
export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load giỏ hàng từ localStorage khi component mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Lỗi khi đọc giỏ hàng:", error);
      }
    }
  }, []);

  // Lưu giỏ hàng vào localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product: any) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.productId === product.productId
      );

      if (existingItemIndex >= 0) {
        // Nếu sản phẩm đã tồn tại, tăng số lượng
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
        return updatedItems;
      } else {
        // Nếu sản phẩm chưa có, thêm mới
        return [
          ...prevItems,
          {
            productId: product.productId,
            productName: product.productName,
            price: product.price,
            imageUrl: Array.isArray(product.imageUrl)
              ? product.imageUrl[0]
              : product.imageUrl,
            quantity: 1,
          },
        ];
      }
    });
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (productId: number) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId)
    );
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  // Lấy tổng số sản phẩm trong giỏ hàng
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Lấy tổng giá trị giỏ hàng
  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Xóa tất cả sản phẩm trong giỏ hàng
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
    clearCart,
  };
}

// Singleton instance để lưu trữ trạng thái giỏ hàng toàn cục
let listeners: ((items: CartItem[]) => void)[] = [];
let cartItems: CartItem[] = [];

// Load giỏ hàng từ localStorage khi khởi tạo
try {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cartItems = JSON.parse(savedCart);
  }
} catch (error) {
  console.error("Lỗi khi đọc giỏ hàng từ localStorage:", error);
}

// Hàm helper để thông báo cho các listener khi giỏ hàng thay đổi
function notifyListeners() {
  listeners.forEach((listener) => listener(cartItems));
  localStorage.setItem("cart", JSON.stringify(cartItems));
}

// API toàn cục để thao tác với giỏ hàng
export const CartAPI = {
  subscribe: (listener: (items: CartItem[]) => void) => {
    listeners.push(listener);
    listener(cartItems);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getItems: () => cartItems,
  addItem: (product: any) => {
    const existingItemIndex = cartItems.findIndex(
      (item) => item.productId === product.productId
    );

    if (existingItemIndex >= 0) {
      cartItems = cartItems.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      cartItems = [
        ...cartItems,
        {
          productId: product.productId,
          productName: product.productName,
          price: product.price,
          imageUrl: Array.isArray(product.imageUrl)
            ? product.imageUrl[0]
            : product.imageUrl,
          quantity: 1,
        },
      ];
    }
    notifyListeners();
  },
  removeItem: (productId: number) => {
    cartItems = cartItems.filter((item) => item.productId !== productId);
    notifyListeners();
  },
  updateQuantity: (productId: number, quantity: number) => {
    if (quantity <= 0) {
      CartAPI.removeItem(productId);
      return;
    }
    cartItems = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    notifyListeners();
  },
  getTotalItems: () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  },
  getTotalPrice: () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  },
  clearCart: () => {
    cartItems = [];
    localStorage.removeItem("cart");
    notifyListeners();
  },
};

// Hook để sử dụng CartAPI trong component
export function useCartAPI() {
  const [items, setItems] = useState<CartItem[]>(cartItems);

  useEffect(() => {
    return CartAPI.subscribe(setItems);
  }, []);

  return {
    cartItems: items,
    addToCart: CartAPI.addItem,
    removeFromCart: CartAPI.removeItem,
    updateQuantity: CartAPI.updateQuantity,
    getTotalItems: CartAPI.getTotalItems,
    getTotalPrice: CartAPI.getTotalPrice,
    clearCart: CartAPI.clearCart,
  };
}
