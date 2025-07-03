// pages/ProfilePage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Chip,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Fade,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Wc as GenderIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import CallIcon from "@mui/icons-material/Call";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { API_USER } from "../../links";

interface UserInfo {
  userName: string;
  email: string;
  phone: string;
  gender: string;
  avatar: string | null;
  skinConcerns: string[];
  skinTypes: string[];
}

interface SkinOption {
  id: string;
  label: string;
}

const SKIN_TYPES: SkinOption[] = [
  { id: "Normal", label: "Da thường" },
  { id: "Dry", label: "Da khô" },
  { id: "Oil", label: "Da dầu" },
  { id: "Combination", label: "Da hỗn hợp" },
  { id: "Sensitive", label: "Da nhạy cảm" },
];

const SKIN_CONCERNS: SkinOption[] = [
  { id: "Acne", label: "Mụn trứng cá" },
  { id: "Melasma", label: "Nám, tàn nhang" },
  { id: "EnlargedPores", label: "Lỗ chân lông to" },
];

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<UserInfo>({
    userName: "",
    email: "",
    phone: "",
    gender: "",
    avatar: null,
    skinConcerns: [],
    skinTypes: [],
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
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
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error("Không thể tải thông tin người dùng");
      }

      const data = await response.json();
      setUserInfo(data);
      setFormData(data);
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field === "phone" || field === "email") {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.userName.trim()) {
      errors.userName = "Tên người dùng không được để trống";
    }

    if (!formData.email.trim()) {
      errors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email không hợp lệ";
    }

    if (!formData.gender) {
      errors.gender = "Vui lòng chọn giới tính";
    }

    if (formData.skinTypes.length === 0) {
      errors.skinTypes = "Vui lòng chọn ít nhất một loại da";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setError("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const updateData = {
        userName: formData.userName,
        gender: formData.gender,
        skinTypes: formData.skinTypes,
        skinConcerns: formData.skinConcerns,
      };

      const response = await fetch(`${API_USER}/user/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật thông tin");
      }

      const updatedUserInfo = {
        ...formData,
        phone: userInfo?.phone || "",
      };

      setUserInfo(updatedUserInfo);
      setFormData(updatedUserInfo);
      setEditMode(false);
      setSuccess("Cập nhật thông tin thành công!");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating user info:", err);
      setError("Không thể cập nhật thông tin. Vui lòng thử lại sau.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(
      userInfo || {
        userName: "",
        email: "",
        phone: "",
        gender: "",
        avatar: null,
        skinConcerns: [],
        skinTypes: [],
      }
    );
    setEditMode(false);
    setFormErrors({});
    setError(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa cập nhật";
    return dateString;
  };

  const handleSkinTypeToggle = (skinType: string) => {
    setFormData((prev) => ({
      ...prev,
      skinTypes: prev.skinTypes.includes(skinType)
        ? prev.skinTypes.filter((type) => type !== skinType)
        : [...prev.skinTypes, skinType],
    }));
  };

  const handleSkinConcernToggle = (concern: string) => {
    setFormData((prev) => ({
      ...prev,
      skinConcerns: prev.skinConcerns.includes(concern)
        ? prev.skinConcerns.filter((c) => c !== concern)
        : [...prev.skinConcerns, concern],
    }));
  };

  const getSkinTypeLabel = (type: string): string => {
    return SKIN_TYPES.find((t) => t.id === type)?.label || type;
  };

  const getSkinConcernLabel = (concern: string): string => {
    return SKIN_CONCERNS.find((c) => c.id === concern)?.label || concern;
  };

  if (loading) {
    return (
      <>
        <Header cartItemsCount={0} />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress size={60} sx={{ color: "#3e6a13" }} />
          </Box>
        </Container>
        <Footer />
      </>
    );
  }

  if (!userInfo) {
    return (
      <>
        <Header cartItemsCount={0} />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error">Không thể tải thông tin người dùng</Alert>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header cartItemsCount={0} />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Typography
              variant="h4"
              sx={{ color: "#3e6a13", fontWeight: "bold" }}
            >
              Thông tin cá nhân
            </Typography>
            {!editMode ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
                sx={{
                  bgcolor: "#3e6a13",
                  "&:hover": { bgcolor: "#2e5103" },
                  borderRadius: 2,
                }}
              >
                Chỉnh sửa
              </Button>
            ) : (
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={saving}
                  sx={{ borderColor: "#999", color: "#999" }}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  startIcon={
                    saving ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    bgcolor: "#3e6a13",
                    "&:hover": { bgcolor: "#2e5103" },
                    minWidth: 120,
                  }}
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </Button>
              </Box>
            )}
          </Box>

          {/* Alerts */}
          {error && (
            <Fade in={Boolean(error)}>
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {success && (
            <Fade in={Boolean(success)}>
              <Alert
                severity="success"
                sx={{ mb: 3 }}
                onClose={() => setSuccess(null)}
              >
                {success}
              </Alert>
            </Fade>
          )}

          <Grid container spacing={4}>
            {/* Avatar Section */}
            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ textAlign: "center", p: 3 }}>
                <Box position="relative" display="inline-block">
                  <Avatar
                    src={
                      editMode
                        ? formData.avatar || undefined
                        : userInfo.avatar || undefined
                    }
                    alt={userInfo.userName}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: "auto",
                      mb: 2,
                      bgcolor: "#3e6a13",
                      fontSize: "3rem",
                    }}
                  >
                    {!userInfo.avatar &&
                      userInfo.userName.charAt(0).toUpperCase()}
                  </Avatar>
                  {editMode && (
                    <IconButton
                      sx={{
                        position: "absolute",
                        bottom: 16,
                        right: -8,
                        bgcolor: "#3e6a13",
                        color: "white",
                        "&:hover": { bgcolor: "#2e5103" },
                        boxShadow: 2,
                      }}
                      size="small"
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#3e6a13" }}
                >
                  {editMode ? formData.userName : userInfo.userName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {editMode ? formData.email : userInfo.email}
                </Typography>
              </Card>
            </Grid>

            {/* User Information */}
            <Grid item xs={12} md={8}>
              <Card elevation={2} sx={{ p: 3 }}>
                <CardContent>
                  <Grid container spacing={3}>
                    {/* Username */}
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <PersonIcon sx={{ mr: 1, color: "#3e6a13" }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          Tên người dùng
                        </Typography>
                      </Box>
                      {editMode ? (
                        <TextField
                          fullWidth
                          value={formData.userName}
                          onChange={(e) =>
                            handleInputChange("userName", e.target.value)
                          }
                          error={!!formErrors.userName}
                          helperText={formErrors.userName}
                          size="small"
                        />
                      ) : (
                        <Typography variant="body1" fontWeight="medium">
                          {userInfo.userName}
                        </Typography>
                      )}
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <EmailIcon sx={{ mr: 1, color: "#3e6a13" }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          Email
                        </Typography>
                        <LockIcon
                          sx={{ ml: 1, fontSize: 16, color: "#999" }}
                          titleAccess="Không thể thay đổi email"
                        />
                      </Box>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: editMode ? "#f5f5f5" : "transparent",
                          borderRadius: 1,
                          border: editMode ? "1px solid #e0e0e0" : "none",
                        }}
                      >
                        <Typography
                          variant="body1"
                          fontWeight="medium"
                          color={editMode ? "text.secondary" : "text.primary"}
                        >
                          {userInfo.email}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* phone - Không cho phép chỉnh sửa */}
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <CallIcon sx={{ mr: 1, color: "#3e6a13" }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          Số điện thoại
                        </Typography>
                        <LockIcon
                          sx={{ ml: 1, fontSize: 16, color: "#999" }}
                          titleAccess="Không thể thay đổi số điện thoại"
                        />
                      </Box>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: editMode ? "#f5f5f5" : "transparent",
                          borderRadius: 1,
                          border: editMode ? "1px solid #e0e0e0" : "none",
                        }}
                      >
                        <Typography
                          variant="body1"
                          fontWeight="medium"
                          color={editMode ? "text.secondary" : "text.primary"}
                        >
                          {formatDate(userInfo.phone)}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Gender */}
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <GenderIcon sx={{ mr: 1, color: "#3e6a13" }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          Giới tính
                        </Typography>
                      </Box>
                      {editMode ? (
                        <FormControl
                          fullWidth
                          size="small"
                          error={!!formErrors.gender}
                        >
                          <Select
                            value={formData.gender}
                            onChange={(e) =>
                              handleInputChange("gender", e.target.value)
                            }
                          >
                            <MenuItem value="Male">Nam</MenuItem>
                            <MenuItem value="Female">Nữ</MenuItem>
                            <MenuItem value="Other">Khác</MenuItem>
                          </Select>
                          {formErrors.gender && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ mt: 0.5 }}
                            >
                              {formErrors.gender}
                            </Typography>
                          )}
                        </FormControl>
                      ) : (
                        <Typography variant="body1" fontWeight="medium">
                          {userInfo.gender === "Male"
                            ? "Nam"
                            : userInfo.gender === "Female"
                            ? "Nữ"
                            : "Khác"}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Skin Information với Checkbox thay vì Dialog */}
            <Grid item xs={12}>
              <Card elevation={2} sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, color: "#3e6a13", fontWeight: "bold" }}
                >
                  Thông tin về da
                </Typography>

                <Grid container spacing={4}>
                  {/* Skin Types */}
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 2, fontWeight: "bold" }}
                    >
                      Loại da *
                    </Typography>

                    {editMode ? (
                      <Box>
                        <FormGroup>
                          {SKIN_TYPES.map((skinType) => (
                            <FormControlLabel
                              key={skinType.id}
                              control={
                                <Checkbox
                                  checked={formData.skinTypes.includes(
                                    skinType.id
                                  )}
                                  onChange={() =>
                                    handleSkinTypeToggle(skinType.id)
                                  }
                                  color="primary"
                                  size="small"
                                />
                              }
                              label={
                                <Typography variant="body2">
                                  {skinType.label}
                                </Typography>
                              }
                              sx={{ mb: 0.5 }}
                            />
                          ))}
                        </FormGroup>
                        {formErrors.skinTypes && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 1, display: "block" }}
                          >
                            {formErrors.skinTypes}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {userInfo.skinTypes.length > 0 ? (
                          userInfo.skinTypes.map((type) => (
                            <Chip
                              key={type}
                              label={getSkinTypeLabel(type)}
                              color="primary"
                              size="small"
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Chưa chọn loại da
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Grid>

                  {/* Skin Concerns */}
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 2, fontWeight: "bold" }}
                    >
                      Vấn đề về da
                    </Typography>

                    {editMode ? (
                      <Box>
                        <FormGroup>
                          {SKIN_CONCERNS.map((concern) => (
                            <FormControlLabel
                              key={concern.id}
                              control={
                                <Checkbox
                                  checked={formData.skinConcerns.includes(
                                    concern.id
                                  )}
                                  onChange={() =>
                                    handleSkinConcernToggle(concern.id)
                                  }
                                  color="secondary"
                                  size="small"
                                />
                              }
                              label={
                                <Typography variant="body2">
                                  {concern.label}
                                </Typography>
                              }
                              sx={{ mb: 0.5 }}
                            />
                          ))}
                        </FormGroup>
                        {/* Note cho skin concerns */}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 1, display: "block", fontStyle: "italic" }}
                        >
                          Có thể chọn nhiều vấn đề hoặc không chọn nếu không có
                        </Typography>
                      </Box>
                    ) : (
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {userInfo.skinConcerns.length > 0 ? (
                          userInfo.skinConcerns.map((concern) => (
                            <Chip
                              key={concern}
                              label={getSkinConcernLabel(concern)}
                              color="secondary"
                              size="small"
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Không có vấn đề đặc biệt
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      <Footer />
    </>
  );
};

export default ProfilePage;
