import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  styled,
  Alert,
  CircularProgress,
} from "@mui/material";
import background from "../../assets/background-login.jpg";
import useTokenStore from "../../store/tokenStore";
import { API_USER } from "../../links";

const LoginContainer = styled(Box)(() => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "600px",
  backgroundImage: `url(${background})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
}));

const LoginBox = styled(Box)(() => ({
  background: "#fff",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  padding: "30px",
  width: "100%",
  maxWidth: "400px",
}));

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useTokenStore((state) => state.setAuth); // Lấy setAuth từ Zustand

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_USER}/user/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập không thành công");
      }

      console.log(data.token);
      localStorage.setItem("token", "1");
      localStorage.setItem("role", data.role);
      if (data.token && data.role) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        setAuth(data.token, data.role);

        navigate("/home");
      } else {
        throw new Error("Dữ liệu phản hồi không hợp lệ");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi đăng nhập"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header cartItemsCount={0} />
      <LoginContainer>
        <LoginBox>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#4c7d19" }}
          >
            Đăng nhập
          </Typography>

          {/* Hiển thị lỗi nếu có */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form đăng nhập */}
          <Box component="form" noValidate onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email của bạn"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
            />
            <TextField
              fullWidth
              label="Nhập mật khẩu"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                backgroundColor: "#4c7d19",
                color: "#fff",
                marginTop: "20px",
                padding: "10px",
                "&:hover": {
                  backgroundColor: "#3e6a13",
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </Box>

          {/* Đăng ký */}
          <Typography
            variant="body2"
            align="center"
            sx={{ marginTop: "20px", color: "#333" }}
          >
            Bạn chưa có Tài khoản? Vui lòng đăng ký Tài khoản mới{" "}
            <Typography
              component="span"
              sx={{ color: "#4c7d19", cursor: "pointer", fontWeight: "bold" }}
            >
              <Link
                to="/register"
                style={{ textDecoration: "none", color: "#4c7d19" }}
              >
                tại đây
              </Link>
            </Typography>
            .
          </Typography>
        </LoginBox>
      </LoginContainer>
      <Footer />
    </>
  );
};

export default LoginPage;
