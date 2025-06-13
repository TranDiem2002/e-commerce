import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  InputBase,
  IconButton,
  Badge,
  Typography,
  styled,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import StoreIcon from "@mui/icons-material/Store";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import logoHome from "../../assets/ic_shop.png";
import ProfilePage from "../../pages/profile";
import { LOGIN_LINK, API_USER } from "../../links";

const SearchBarContainer = styled(Box)(() => ({
  backgroundColor: "#3e6a13",
  padding: "5px 0",
}));

const Logo = styled("img")({
  height: 40,
  marginRight: 15,
});

const SearchBox = styled("div")(() => ({
  marginTop: "20px",
  position: "relative",
  borderRadius: 20,
  backgroundColor: "#fff",
  border: "1px solid #ddd",
  width: "100%",
  height: "38px",
  maxWidth: 500,
  display: "flex",
  alignItems: "center",
}));

const SearchInput = styled(InputBase)(() => ({
  padding: "8px 8px",
  width: "100%",
  "&::placeholder": {
    fontStyle: "italic",
  },
}));

const AccountSection = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  cursor: "pointer",
  minWidth: "80px",
}));

interface SearchBarProps {
  cartItemsCount: number;
}

interface UserInfo {
  userName: string;
  email: string;
  birthday: string;
  gender: string;
  avatar: string | null;
  skinConcerns: string[];
  skinTypes: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ cartItemsCount }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra token và lấy thông tin user khi component mount
  useEffect(() => {
    checkTokenAndFetchUserInfo();
  }, []);

  const checkTokenAndFetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoggedIn(false);
        setUserInfo(null);
        setLoading(false);
        return;
      }

      // Gọi API để lấy thông tin user
      const response = await fetch(`${API_USER}/user/detail`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Token không hợp lệ hoặc hết hạn
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setIsLoggedIn(false);
        setUserInfo(null);
        return;
      }

      const userData = await response.json();
      setUserInfo(userData);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error fetching user info:", error);
      // Xóa token nếu có lỗi
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      setIsLoggedIn(false);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi nhấp vào icon tài khoản
  const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isLoggedIn) {
      // Nếu đã đăng nhập, hiển thị menu dropdown
      setAnchorEl(event.currentTarget);
    } else {
      // Nếu chưa đăng nhập, chuyển tới trang login
      navigate(LOGIN_LINK);
    }
  };

  // Đóng menu dropdown
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Chuyển tới trang thông tin cá nhân
  const handleProfileClick = () => {
    handleCloseMenu(); // Đóng menu dropdown trước
    navigate("/profile"); // Chuyển đến trang profile
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    handleCloseMenu();
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setUserInfo(null);
    navigate(LOGIN_LINK);
  };

  // Xử lý khi nhấp vào icon giỏ hàng
  const handleCartClick = () => {
    navigate("/cart");
  };

  // Render phần account
  const renderAccountSection = () => {
    if (loading) {
      return (
        <AccountSection>
          <IconButton color="inherit" sx={{ color: "white" }}>
            <AccountCircleIcon />
          </IconButton>
          <Typography
            variant="caption"
            sx={{ color: "white", fontSize: "0.7rem", textAlign: "center" }}
          >
            Đang tải...
          </Typography>
        </AccountSection>
      );
    }

    if (isLoggedIn && userInfo) {
      return (
        <AccountSection onClick={handleAccountClick}>
          {userInfo.avatar ? (
            <Avatar
              src={userInfo.avatar}
              alt={userInfo.userName}
              sx={{ width: 32, height: 32, mb: 0.5 }}
            />
          ) : (
            <IconButton color="inherit" sx={{ color: "white", p: 0.5 }}>
              <AccountCircleIcon sx={{ fontSize: 32 }} />
            </IconButton>
          )}
          <Typography
            variant="caption"
            sx={{
              color: "white",
              fontSize: "0.7rem",
              textAlign: "center",
              lineHeight: 1.2,
              maxWidth: "80px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {userInfo.userName}
          </Typography>
        </AccountSection>
      );
    }

    return (
      <AccountSection onClick={handleAccountClick}>
        <IconButton color="inherit" sx={{ color: "white", p: 0.5 }}>
          <AccountCircleIcon sx={{ fontSize: 32 }} />
        </IconButton>
        <Typography
          variant="caption"
          sx={{ color: "white", fontSize: "0.7rem", textAlign: "center" }}
        >
          Đăng nhập
        </Typography>
      </AccountSection>
    );
  };

  return (
    <SearchBarContainer>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Logo src={logoHome} alt="Cỏ Mềm" />
          </Box>

          <Box sx={{ width: "500px" }}>
            <SearchBox>
              <SearchInput
                placeholder="Tìm sản phẩm theo tên mong muốn..."
                inputProps={{ "aria-label": "search" }}
              />
              <IconButton type="button" aria-label="search">
                <SearchIcon />
              </IconButton>
            </SearchBox>
          </Box>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <IconButton color="inherit" sx={{ color: "white" }}>
                <StoreIcon />
              </IconButton>
              <Typography
                variant="caption"
                sx={{ color: "white", fontSize: "0.7rem", textAlign: "center" }}
              >
                HỆ THỐNG
                <br />
                CỬA HÀNG
              </Typography>
            </Box>

            {/* Account Section */}
            {renderAccountSection()}

            {/* Cart Section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <IconButton
                color="inherit"
                sx={{ color: "white" }}
                onClick={handleCartClick}
              >
                <Badge badgeContent={cartItemsCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
              <Typography
                variant="caption"
                sx={{ color: "white", fontSize: "0.7rem", textAlign: "center" }}
              >
                Giỏ hàng
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Dropdown Menu cho user đã đăng nhập */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        {userInfo && (
          <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              {userInfo.userName}
            </Typography>
            <Typography variant="caption" sx={{ color: "#666" }}>
              {userInfo.email}
            </Typography>
          </Box>
        )}

        <MenuItem onClick={handleProfileClick}>
          <PersonIcon sx={{ mr: 2, fontSize: 20 }} />
          Thông tin cá nhân
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ color: "#d32f2f" }}>
          <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
          Đăng xuất
        </MenuItem>
      </Menu>
    </SearchBarContainer>
  );
};

export default SearchBar;
