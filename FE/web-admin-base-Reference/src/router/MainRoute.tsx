import { Route, Routes, Navigate } from "react-router-dom";
import DashBoardLayout from "../layout";
import { LOGIN_LINK, HOME_LINK } from "../links";
import LoginPage from "../pages/login";
import HomePage from "../pages/home"; // Import trang Home
import PrivateRoute from "./ProtectedRoue";
import Register from "../pages/register"; // Giả định có trang Register

const MainRoute = () => {
  return (
    <Routes>
      {/* Routes công khai - không cần đăng nhập */}
      <Route path={LOGIN_LINK} element={<LoginPage />} />
      <Route path="/register" element={<Register />} />

      {/* Route cho trang Home - không cần đăng nhập */}
      <Route path={HOME_LINK} element={<HomePage />} />
      <Route path="/" element={<Navigate to={HOME_LINK} replace />} />

      {/* Routes cần xác thực */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <DashBoardLayout />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default MainRoute;
