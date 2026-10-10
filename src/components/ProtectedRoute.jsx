import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const isTokenUsable = (token) => {
  if (!token || token === "undefined" || token === "null") return false;

  // If it's a JWT, reject it when the exp claim has passed.
  // Non-JWT tokens are left to the server to validate.
  const parts = token.split(".");
  if (parts.length !== 3) return true;

  try {
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (payload?.exp && payload.exp * 1000 <= Date.now()) return false;
  } catch {
    return true;
  }

  return true;
};

const ProtectedRoute = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");

  return isTokenUsable(token) ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
