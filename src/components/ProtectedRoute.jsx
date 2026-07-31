import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  const isAuthenticated = Boolean(token) && token !== "undefined" && token !== "null";

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;