import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import useTokenStore from "../store/tokenStore";
import { ReactNode } from "react";
import { LOGIN_LINK } from "../links";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps): any => {
  // Lấy token từ localStorage
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Lấy setAuth từ useTokenStore
  const { setAuth } = useTokenStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Nếu không có token, chuyển hướng đến trang đăng nhập
    if (!token) {
      // Lưu URL hiện tại để sau khi đăng nhập có thể quay lại
      localStorage.setItem("redirectUrl", window.location.pathname);
      navigate(LOGIN_LINK);
    } else if (!useTokenStore.getState().token) {
      // Nếu có token trong localStorage nhưng không có trong state
      // => Cập nhật state với token từ localStorage
      setAuth(token, role || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Chỉ trả về children nếu có token
  return token ? children || <Outlet /> : null;
};

export default PrivateRoute;
