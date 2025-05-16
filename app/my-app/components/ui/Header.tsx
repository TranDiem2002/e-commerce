// components/ui/Header.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View, Text } from "react-native";

interface HeaderProps {
  cartCount?: number;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onCartPress?: () => void;
  onLocationPress?: () => void;
  showMenu?: boolean;
  showSearch?: boolean;
  showLocation?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  cartCount = 0,
  onMenuPress,
  onSearchPress,
  onCartPress,
  onLocationPress,
  showMenu = true,
  showSearch = true,
  showLocation = true,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {showMenu && (
          <TouchableOpacity onPress={onMenuPress}>
            <Ionicons name="menu-outline" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerSection}>
        <Image
          source={require("@/assets/images/ic_shop.png")}
          style={styles.logo}
        />
      </View>

      <View style={styles.rightSection}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#3e6a13",
    marginTop: 32,
  },
  leftSection: {
    flex: 1,
    alignItems: "flex-start",
  },
  centerSection: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  rightSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  iconButton: {
    marginLeft: 15,
  },
  logo: {
    height: 30,
    width: 120,
    resizeMode: "contain",
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
});

export default Header;
