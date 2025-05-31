import React from "react";
import SearchBar from "./SearchBar";
import MainNav from "./MainNav";
import { Box } from "@mui/material";

interface HeaderProps {
  cartItemsCount?: number;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount = 0 }) => {
  return (
    <Box component="header">
      <SearchBar cartItemsCount={cartItemsCount} />
      <MainNav />
    </Box>
  );
};

export default Header;
