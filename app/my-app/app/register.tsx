// app/register.tsx
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { API_USER } from "../links/index";

interface SkinOption {
  id: string;
  label: string;
}

const SKIN_TYPES: SkinOption[] = [
  { id: "Normal", label: "Da thường" },
  { id: "Dry", label: "Da khô" },
  { id: "Oily", label: "Da dầu" },
  { id: "Combination", label: "Da hỗn hợp" },
  { id: "Sensitive", label: "Da nhạy cảm" },
];

const SKIN_CONCERNS: SkinOption[] = [
  { id: "Acne", label: "Mụn trứng cá" },
  { id: "Melasma", label: "Nám, tàn nhang" },
  { id: "EnlargedPores", label: "Lỗ chân lông to" },
];

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
  });

  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);
  const [selectedSkinConcerns, setSelectedSkinConcerns] = useState<string[]>(
    []
  );

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showSkinTypesModal, setShowSkinTypesModal] = useState(false);
  const [showSkinConcernsModal, setShowSkinConcernsModal] = useState(false);

  const genderOptions = [
    { id: "Male", label: "Nam" },
    { id: "Female", label: "Nữ" },
    { id: "Other", label: "Khác" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const toggleSkinType = (skinType: string) => {
    setSelectedSkinTypes((prev) => {
      if (prev.includes(skinType)) {
        return prev.filter((item) => item !== skinType);
      } else {
        return [...prev, skinType];
      }
    });
  };

  const toggleSkinConcern = (concern: string) => {
    setSelectedSkinConcerns((prev) => {
      if (prev.includes(concern)) {
        return prev.filter((item) => item !== concern);
      } else {
        return [...prev, concern];
      }
    });
  };

  const validateForm = () => {
    if (!formData.userName.trim()) {
      setError("Vui lòng nhập tên người dùng");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Vui lòng nhập email");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email không hợp lệ");
      return false;
    }

    if (!formData.password) {
      setError("Vui lòng nhập mật khẩu");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return false;
    }

    if (!formData.gender) {
      setError("Vui lòng chọn giới tính");
      return false;
    }

    if (selectedSkinTypes.length === 0) {
      setError("Vui lòng chọn ít nhất một loại da");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const registerData = {
        userName: formData.userName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone,
        gender: formData.gender,
        skinType: selectedSkinTypes,
        skinConcerns: selectedSkinConcerns,
      };

      const response = await fetch(`${API_USER}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.text(); // API trả về string

      if (!response.ok) {
        throw new Error(data || "Đăng ký không thành công");
      }

      // Success
      Alert.alert(
        "Thành công",
        "Đăng ký tài khoản thành công! Vui lòng đăng nhập.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi đăng ký"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.replace("/login");
  };

  const renderMultiSelectModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    options: SkinOption[],
    selectedItems: string[],
    onToggle: (item: string) => void
  ) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={options}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => onToggle(item.id)}
              >
                <Text style={styles.optionText}>{item.label}</Text>
                <Ionicons
                  name={
                    selectedItems.includes(item.id)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={24}
                  color={selectedItems.includes(item.id) ? "#3e6a13" : "#ccc"}
                />
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Xong</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Đăng ký",
          headerStyle: { backgroundColor: "#3e6a13" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#3e6a13" barStyle="light-content" />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Text style={styles.title}>Tạo tài khoản mới</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Username */}
            <TextInput
              style={styles.input}
              placeholder="Tên người dùng"
              value={formData.userName}
              onChangeText={(value) => handleInputChange("userName", value)}
              placeholderTextColor="#999"
              editable={!loading}
            />

            {/* Email */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
              editable={!loading}
            />

            {/* Password */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Mật khẩu"
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                disabled={loading}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  handleInputChange("confirmPassword", value)
                }
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#999"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
                disabled={loading}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            {/* Birthday */}
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              value={formData.phone}
              onChangeText={(value) => handleInputChange("phone", value)}
              keyboardType="phone-pad"
              autoCapitalize="none"
              placeholderTextColor="#999"
              editable={!loading}
            />

            {/* Gender */}
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowGenderModal(true)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.selectText,
                  formData.gender && styles.selectedText,
                ]}
              >
                {formData.gender
                  ? genderOptions.find((g) => g.id === formData.gender)?.label
                  : "Chọn giới tính"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>

            {/* Skin Types */}
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowSkinTypesModal(true)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.selectText,
                  selectedSkinTypes.length > 0 && styles.selectedText,
                ]}
              >
                {selectedSkinTypes.length > 0
                  ? `Đã chọn ${selectedSkinTypes.length} loại da`
                  : "Chọn loại da"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>

            {/* Skin Concerns */}
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowSkinConcernsModal(true)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.selectText,
                  selectedSkinConcerns.length > 0 && styles.selectedText,
                ]}
              >
                {selectedSkinConcerns.length > 0
                  ? `Đã chọn ${selectedSkinConcerns.length} vấn đề`
                  : "Chọn vấn đề về da (tùy chọn)"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                loading && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.registerButtonText}>Đăng ký</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={handleLogin} disabled={loading}>
                <Text style={styles.loginLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Date Picker
        {showDatePicker && (
          <DateTimePicker
            value={formData.birthday}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )} 

        {/* Gender Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showGenderModal}
          onRequestClose={() => setShowGenderModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn giới tính</Text>
                <TouchableOpacity onPress={() => setShowGenderModal(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.optionItem}
                  onPress={() => {
                    handleInputChange("gender", option.id);
                    setShowGenderModal(false);
                  }}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                  <Ionicons
                    name={
                      formData.gender === option.id
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={24}
                    color={formData.gender === option.id ? "#3e6a13" : "#ccc"}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        {/* Skin Types Modal */}
        {renderMultiSelectModal(
          showSkinTypesModal,
          () => setShowSkinTypesModal(false),
          "Chọn loại da",
          SKIN_TYPES,
          selectedSkinTypes,
          toggleSkinType
        )}

        {/* Skin Concerns Modal */}
        {renderMultiSelectModal(
          showSkinConcernsModal,
          () => setShowSkinConcernsModal(false),
          "Chọn vấn đề về da",
          SKIN_CONCERNS,
          selectedSkinConcerns,
          toggleSkinConcern
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    color: "#3e6a13",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputPassword: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeButton: {
    padding: 15,
  },
  selectInput: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontSize: 16,
    color: "#999",
    flex: 1,
  },
  selectedText: {
    color: "#333",
  },
  registerButton: {
    backgroundColor: "#3e6a13",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  registerButtonDisabled: {
    backgroundColor: "#ccc",
  },
  registerButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  errorText: {
    color: "#e53935",
    marginBottom: 15,
    textAlign: "center",
    fontSize: 14,
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  loginText: {
    color: "#666",
    fontSize: 14,
  },
  loginLink: {
    color: "#3e6a13",
    fontSize: 14,
    fontWeight: "bold",
  },
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
    maxHeight: "70%",
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
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  doneButton: {
    backgroundColor: "#3e6a13",
    padding: 16,
    alignItems: "center",
    margin: 16,
    borderRadius: 8,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
