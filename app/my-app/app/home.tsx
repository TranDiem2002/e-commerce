import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter, Stack } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <>
      {/* This hides the default header */}
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#3e6a13" barStyle="light-content" />
        <View style={styles.container}>
          <Image
            source={require("@/assets/images/ic_shop.png")}
            style={styles.icon}
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#3e6a13",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3e6a13",
  },
  icon: {
    width: 180,
    height: 150,
    resizeMode: "contain",
    marginBottom: 80,
  },
  loginButton: {
    backgroundColor: "#71a93b",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginTop: 40,
  },
  loginButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
