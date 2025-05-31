import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  styled,
} from "@mui/material";

// Tạo styled component cho container chính
const RegisterContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  padding: theme.spacing(2),
}));

// Giữ nguyên RegisterForm như styled Box
// const RegisterForm = styled(Box)(({ theme }) => ({
//   width: "100%",
//   maxWidth: "500px",
//   display: "flex",
//   flexDirection: "column",
//   gap: theme.spacing(2),
// }));

// Component trang đăng ký
const RegisterPage: React.FC = () => {
  // State để lưu trữ dữ liệu form
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Giữ nguyên kiểu cho handleSubmit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form data submitted:", formData);
    // Thêm logic xử lý đăng ký tại đây
  };

  return (
    <>
      <Header cartItemsCount={0} />
      <RegisterContainer>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          sx={{ mb: 4, color: "#4c7d19", fontWeight: "500" }}
        >
          Đăng Ký Tài khoản
        </Typography>

        <Box sx={{ width: "100%", maxWidth: "500px" }}>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Các TextField và các element khác */}
            <TextField
              fullWidth
              required
              id="fullName"
              name="fullName"
              label="Họ Tên (*)"
              variant="outlined"
              value={formData.fullName}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              required
              id="phone"
              name="phone"
              label="Số điện thoại (*)"
              variant="outlined"
              value={formData.phone}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              required
              id="email"
              name="email"
              label="Email (*)"
              type="email"
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              required
              id="password"
              name="password"
              label="Nhập mật khẩu (*)"
              type="password"
              variant="outlined"
              value={formData.password}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              required
              id="confirmPassword"
              name="confirmPassword"
              label="Nhập lại mật khẩu (*)"
              type="password"
              variant="outlined"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </form>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Link to="/login" style={{ textDecoration: "none", color: "#666" }}>
            <Typography variant="body2">Về trang đăng nhập</Typography>
          </Link>

          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "#4c7d19",
              color: "#fff",
              padding: "10px 20px",
              minWidth: "120px",
              "&:hover": {
                backgroundColor: "#3e6a13",
              },
            }}
          >
            Đăng ký
          </Button>
        </Box>
      </RegisterContainer>
      <Footer />
    </>
  );
};

export default RegisterPage;
