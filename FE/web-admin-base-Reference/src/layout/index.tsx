import CssBaseline from "@mui/material/CssBaseline";
import { Route, Routes } from "react-router-dom";
import { INVOICE_LINK, USER_LINK } from "../links";
import { Box } from "@mui/material";
import Register from "../pages/register";
import Home from "../pages/home";

function DashBoardLayout() {
  return (
    <Box>
      <CssBaseline />
      <Box className="app">
        {/* <SideMenu /> */}
        <Box component="main" className="content">
          <Routes>
            {/* <Route path='/*' element={<HomePage />} /> */}
            <Route path={`${INVOICE_LINK}/:username`} />
            <Route path={`${USER_LINK}`} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default DashBoardLayout;
