import React from "react";
import { Box, Container, Typography, styled } from "@mui/material";
import { useMediaQuery, useTheme } from "@mui/material";

const HeaderContainer = styled(Box)(() => ({
  backgroundColor: "#3e6a13",
  color: "#ffffff",
  padding: "5px 0",
}));

const HeaderLink = styled(Typography)(() => ({
  margin: "0 8px",
  fontSize: "0.9rem",
  color: "#fff",
  cursor: "pointer",
  whiteSpace: "nowrap",
  "&:hover": {
    textDecoration: "underline",
  },
}));

const HeaderTop: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) return null;

  return (
    <HeaderContainer>
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center"></Box>
      </Container>
    </HeaderContainer>
  );
};

export default HeaderTop;
