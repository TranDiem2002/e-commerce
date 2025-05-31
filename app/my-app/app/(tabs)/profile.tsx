// app/(tabs)/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

// Define skin types and concerns as per backend
const SKIN_TYPES = [
  { id: "Oil", label: "Da dầu" },
  { id: "Dry", label: "Da khô" },
  { id: "Sensitive", label: "Da nhạy cảm" },
  { id: "Normal", label: "Da bình thường" },
  { id: "Combination", label: "Da hỗn hợp" },
];

const SKIN_CONCERNS = [
  { id: "Acne", label: "Mụn" },
  { id: "EnlargedPores", label: "Lỗ chân lông to" },
  { id: "Melasma", label: "Nám" },
];

interface UserData {
  userName: string;
  email: string;
  birthday: string;
  gender: string;
  avatar: string | null;
  skinConcerns: string[];
  skinTypes: string[];
}

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Edit form state
  const [editedName, setEditedName] = useState("");
  const [editedBirthday, setEditedBirthday] = useState("");
  const [editedGender, setEditedGender] = useState("");
  const [editedSkinTypes, setEditedSkinTypes] = useState<string[]>([]);
  const [editedSkinConcerns, setEditedSkinConcerns] = useState<string[]>([]);

  // Date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        // Handle not authenticated
        setError("Vui lòng đăng nhập để xem thông tin của bạn");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_USER}/user/detail`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải thông tin người dùng");
      }

      const data = await response.json();
      setUserData(data);

      // Initialize edit form data
      setEditedName(data.userName || "");
      setEditedBirthday(data.birthday || "");
      setEditedGender(data.gender || "");
      setEditedSkinTypes(data.skinTypes || []);
      setEditedSkinConcerns(data.skinConcerns || []);

      if (data.birthday) {
        const [day, month, year] = data.birthday.split("/").map(Number);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          setDate(new Date(year, month - 1, day));
        }
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Đã xảy ra lỗi khi tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const updatedData = {
        userName: editedName,
        birthday: editedBirthday,
        gender: editedGender,
        skinTypes: editedSkinTypes,
        skinConcerns: editedSkinConcerns,
      };

      const response = await fetch(`${API_USER}/user/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật thông tin người dùng");
      }

      // Update local state with the new data
      if (userData) {
        setUserData({
          ...userData,
          userName: editedName,
          birthday: editedBirthday,
          gender: editedGender,
          skinTypes: editedSkinTypes,
          skinConcerns: editedSkinConcerns,
        });
      }

      setIsEditing(false);
      Alert.alert("Thành công", "Thông tin của bạn đã được cập nhật!");
    } catch (err) {
      console.error("Error updating profile:", err);
      Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại sau.");
    }
  };

  const handleCancelEdit = () => {
    // Reset to original values
    if (userData) {
      setEditedName(userData.userName || "");
      setEditedBirthday(userData.birthday || "");
      setEditedGender(userData.gender || "");
      setEditedSkinTypes(userData.skinTypes || []);
      setEditedSkinConcerns(userData.skinConcerns || []);
    }
    setIsEditing(false);
  };

  const handleToggleSkinType = (skinType: string) => {
    if (editedSkinTypes.includes(skinType)) {
      setEditedSkinTypes(editedSkinTypes.filter((type) => type !== skinType));
    } else {
      setEditedSkinTypes([...editedSkinTypes, skinType]);
    }
  };

  const handleToggleSkinConcern = (skinConcern: string) => {
    if (editedSkinConcerns.includes(skinConcern)) {
      setEditedSkinConcerns(
        editedSkinConcerns.filter((concern) => concern !== skinConcern)
      );
    } else {
      setEditedSkinConcerns([...editedSkinConcerns, skinConcern]);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const year = selectedDate.getFullYear();
      setEditedBirthday(`${day}/${month}/${year}`);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            setLoggingOut(true);
            const token = await AsyncStorage.getItem("token");

            if (!token) {
              // If no token, just redirect to login
              await AsyncStorage.removeItem("token");
              router.replace("/login");
              return;
            }

            // Call logout API
            const response = await fetch(`${API_USER}/logout`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              // Even if API fails, we'll still remove the token and redirect
              await AsyncStorage.removeItem("token");
              router.replace("/login");
            }
          } catch (error) {
            console.error("Error during logout:", error);
            // Still remove token and redirect on error
            await AsyncStorage.removeItem("token");
            router.replace("/login");
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  const CheckboxItem = ({
    label,
    checked,
    onToggle,
  }: {
    label: string;
    checked: boolean;
    onToggle: () => void;
  }) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle}>
      <View style={[styles.checkbox, checked ? styles.checkboxChecked : {}]}>
        {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3e6a13" />
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Tài khoản</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3e6a13" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3e6a13" />
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Tài khoản</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#e53935" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3e6a13" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Tài khoản</Text>
        {!isEditing && (
          <TouchableOpacity
            onPress={handleEditProfile}
            style={styles.editButton}
          >
            <Ionicons name="create-outline" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            {userData?.avatar ? (
              <Image
                source={{ uri: userData.avatar }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person" size={50} color="#aaa" />
            )}
          </View>
          {isEditing && (
            <TouchableOpacity style={styles.changeAvatarButton}>
              <Text style={styles.changeAvatarText}>Đổi ảnh đại diện</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* User Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{userData?.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Họ tên</Text>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Nhập họ tên"
              />
            ) : (
              <Text style={styles.infoValue}>{userData?.userName}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày sinh</Text>
            {isEditing ? (
              <TouchableOpacity
                onPress={showDatepicker}
                style={styles.datePickerButton}
              >
                <Text style={styles.datePickerText}>
                  {editedBirthday || "Chọn ngày sinh"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            ) : (
              <Text style={styles.infoValue}>{userData?.birthday}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giới tính</Text>
            {isEditing ? (
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    editedGender === "Male" && styles.selectedGender,
                  ]}
                  onPress={() => setEditedGender("Male")}
                >
                  <Text
                    style={[
                      styles.genderText,
                      editedGender === "Male" && styles.selectedGenderText,
                    ]}
                  >
                    Nam
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    editedGender === "Female" && styles.selectedGender,
                  ]}
                  onPress={() => setEditedGender("Female")}
                >
                  <Text
                    style={[
                      styles.genderText,
                      editedGender === "Female" && styles.selectedGenderText,
                    ]}
                  >
                    Nữ
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.infoValue}>
                {userData?.gender === "Male"
                  ? "Nam"
                  : userData?.gender === "Female"
                  ? "Nữ"
                  : ""}
              </Text>
            )}
          </View>
        </View>

        {/* Skin Types */}
        <View style={styles.skinSection}>
          <Text style={styles.sectionTitle}>Loại da</Text>
          <View style={styles.checkboxGroup}>
            {SKIN_TYPES.map((skinType) => (
              <CheckboxItem
                key={skinType.id}
                label={skinType.label}
                checked={
                  isEditing
                    ? editedSkinTypes.includes(skinType.id)
                    : userData?.skinTypes?.includes(skinType.id) || false
                }
                onToggle={() => isEditing && handleToggleSkinType(skinType.id)}
              />
            ))}
          </View>
        </View>

        {/* Skin Concerns */}
        <View style={styles.skinSection}>
          <Text style={styles.sectionTitle}>Vấn đề về da</Text>
          <View style={styles.checkboxGroup}>
            {SKIN_CONCERNS.map((concern) => (
              <CheckboxItem
                key={concern.id}
                label={concern.label}
                checked={
                  isEditing
                    ? editedSkinConcerns.includes(concern.id)
                    : userData?.skinConcerns?.includes(concern.id) || false
                }
                onToggle={() =>
                  isEditing && handleToggleSkinConcern(concern.id)
                }
              />
            ))}
          </View>
        </View>

        {/* Edit Actions */}
        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelEdit}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveButtonText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Logout Button */}
        {!isEditing && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color="#fff" />
                <Text style={styles.logoutButtonText}>Đăng xuất</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
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
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#3e6a13",
    marginTop: 32,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  editButton: {
    position: "absolute",
    right: 15,
  },
  content: {
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginVertical: 20,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#3e6a13",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 5,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  changeAvatarButton: {
    marginTop: 10,
    padding: 8,
  },
  changeAvatarText: {
    color: "#3e6a13",
    fontSize: 14,
    fontWeight: "500",
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  editInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  datePickerButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  datePickerText: {
    fontSize: 14,
    color: "#333",
  },
  genderContainer: {
    flex: 1,
    flexDirection: "row",
  },
  genderOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
  },
  genderText: {
    fontSize: 14,
    color: "#333",
  },
  selectedGender: {
    backgroundColor: "#3e6a13",
  },
  selectedGenderText: {
    color: "#fff",
  },
  skinSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  checkboxGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#3e6a13",
    borderColor: "#3e6a13",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#3e6a13",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e53935",
    padding: 12,
    borderRadius: 5,
    marginVertical: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});
