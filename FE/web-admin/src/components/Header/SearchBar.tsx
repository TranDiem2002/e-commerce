import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, IconButton, Typography, styled } from "@mui/material";
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

interface SearchBarProps {
  cartItemsCount: number;
}

const SearchBar: React.FC<SearchBarProps> = () => {
  const navigate = useNavigate();

  // Hàm xử lý khi nhấp vào icon tài khoản
  const handleAccountClick = () => {
    navigate(LOGIN_LINK);
  };

  return (
    <SearchBarContainer>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            width: "800px",
            marginLeft: "20%",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Logo src={logoHome} alt="Cỏ Mềm" />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <IconButton
              color="inherit"
              sx={{ color: "white" }}
              onClick={handleAccountClick}
            >
              <AccountCircleIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </SearchBarContainer>
  );
};

export default SearchBar;
