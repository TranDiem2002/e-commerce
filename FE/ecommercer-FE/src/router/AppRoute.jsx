import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Route, Routes } from "react-router-dom";
import DashBoardLayout from "../components/layouts/dashboardLayout/dashBoardLayout";
import { LOGIN_LINK, REGISTER_LINK } from "../links/link";
import LoginPage from "../pages/login/login";
import RegisterPage from "../pages/register/register";
import { setToken } from "../slice/userSlice";
import PrivateRoute from "./PrivateRoute";

const AppRoute = () => {
  const authToken = localStorage.getItem("token");
  const dispatch = useDispatch();

  useEffect(() => {
    if (authToken) {
      dispatch(setToken(authToken));
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  return (
    <Routes>
      <Route path={LOGIN_LINK} element={<LoginPage />} />
      <Route path={REGISTER_LINK} element={<RegisterPage />} />
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

export default AppRoute;
