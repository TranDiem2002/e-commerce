import React from "react";
import SearchBar from "./SearchBar";
import { Box } from "@mui/material";

interface HeaderProps {
  cartItemsCount?: number;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount = 0 }) => {
  return (
    <Box component="header">
      <SearchBar cartItemsCount={cartItemsCount} />
    </Box>
  );
};

export default Header;
