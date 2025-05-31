// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="product"
        options={{
          title: "Sản phẩm",
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="menu"
              size={28}
              color={focused ? "#3e6a13" : "#666666"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Tìm kiếm",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="search"
              size={28}
              color={focused ? "#3e6a13" : "#666666"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Giỏ hàng",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="cart"
              size={28}
              color={focused ? "#3e6a13" : "#666666"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="person"
              size={28}
              color={focused ? "#3e6a13" : "#666666"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
