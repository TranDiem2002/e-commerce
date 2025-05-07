import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  InputBase,
  IconButton,
  Badge,
  Typography,
  styled,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import StoreIcon from "@mui/icons-material/Store";
import logoHome from "../../assets/ic_shop.png";
import { LOGIN_LINK } from "../../links";

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

interface SearchBarProps {
  cartItemsCount: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ cartItemsCount }) => {
  const navigate = useNavigate(); // Hook để điều hướng

  // Hàm xử lý khi nhấp vào icon tài khoản
  const handleAccountClick = () => {
    navigate(LOGIN_LINK); // Chuyển hướng đến trang đăng nhập
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
                placeholder="Tìm sản phẩm, danh mục mong muốn..."
                inputProps={{ "aria-label": "search" }}
              />
              <IconButton type="button" aria-label="search">
                <SearchIcon />
              </IconButton>
            </SearchBox>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
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

            <IconButton
              color="inherit"
              sx={{ color: "white" }}
              onClick={handleAccountClick} // Thêm sự kiện onClick
            >
              <AccountCircleIcon />
            </IconButton>
            <IconButton color="inherit" sx={{ color: "white" }}>
              <Badge badgeContent={cartItemsCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        </Box>
      </Container>
    </SearchBarContainer>
  );
};

export default SearchBar;
