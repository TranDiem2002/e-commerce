// src/pages/RegisterPage.tsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  styled,
  Alert,
} from "@mui/material";
import { API_USER } from "../../links";

// Styled container to center the form
const RegisterContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  padding: theme.spacing(2),
}));

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  // submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // simple validation
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.email ||
      !formData.password ||
      formData.password !== formData.confirmPassword
    ) {
      setError(
        !formData.fullName
          ? "Vui lòng nhập họ tên."
          : !formData.phone
          ? "Vui lòng nhập số điện thoại."
          : !formData.email
          ? "Vui lòng nhập email."
          : formData.password !== formData.confirmPassword
          ? "Mật khẩu xác nhận không khớp."
          : "Vui lòng điền đầy đủ."
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      const res = await fetch(`${API_USER}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || "Đăng ký không thành công");

      // success → navigate to login
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Đã xảy ra lỗi khi đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header cartItemsCount={0} />
      <RegisterContainer maxWidth="sm">
        <Typography
          variant="h4"
          align="center"
          sx={{ mb: 4, color: "#4c7d19", fontWeight: 500 }}
        >
          Đăng Ký Tài khoản
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            label="Họ Tên (*)"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <TextField
            label="Số điện thoại (*)"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <TextField
            label="Email (*)"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            label="Mật khẩu (*)"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <TextField
            label="Xác nhận mật khẩu (*)"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 2,
            }}
          >
            <Link to="/login" style={{ textDecoration: "none" }}>
              <Typography color="textSecondary">
                ← Về trang đăng nhập
              </Typography>
            </Link>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: "#4c7d19",
                px: 3,
                "&:hover": { backgroundColor: "#3e6a13" },
              }}
            >
              {loading ? "Đang xử lý…" : "Đăng ký"}
            </Button>
          </Box>
        </Box>
      </RegisterContainer>
      <Footer />
    </>
  );
};

export default RegisterPage;
