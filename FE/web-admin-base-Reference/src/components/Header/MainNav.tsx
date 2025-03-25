import React from "react";
import {
  Box,
  Container,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const NavContainer = styled(Box)(() => ({
  backgroundColor: "#3e6a13",
  padding: "5px 0",
}));

const NavLink = styled(Typography)(() => ({
  margin: "0 12px",
  fontSize: "0.95rem",
  color: "#fff",
  cursor: "pointer",
  whiteSpace: "nowrap",
  "&:hover": {
    textDecoration: "underline",
  },
}));

const ScrollableNav = styled(Box)({
  display: "flex",
  justifyContent: "center",
  overflowX: "auto",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  scrollbarWidth: "none",
});

const MainNav: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  return (
    <NavContainer>
      <Container maxWidth="xl">
        <ScrollableNav>
          <NavLink sx={{ fontWeight: "bold" }}>Da</NavLink>
          <NavLink>Trang điểm</NavLink>
          <NavLink>Cơ thể</NavLink>
          <NavLink>Khác</NavLink>
          <NavLink>Về Cỏ Mềm</NavLink>
          <NavLink>Blog Làm Đẹp</NavLink>
        </ScrollableNav>
      </Container>
    </NavContainer>
  );
};

export default MainNav;
