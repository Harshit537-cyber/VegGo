import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const isTokenUsable = (token) => {
  if (!token || token === "undefined" || token === "null") return false;

  const parts = token.split(".");
  if (parts.length !== 3) return true;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded));
    if (payload?.exp && payload.exp * 1000 <= Date.now()) return false;
  } catch {
    return false;
  }

  return true;
};

const ProtectedRoute = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");

  if (!isTokenUsable(token)) {
    clearAuthSession();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
