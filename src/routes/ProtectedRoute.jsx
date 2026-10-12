import { Navigate, Outlet } from "react-router-dom";
import { isTokenUsable, clearAuthSession, getAuthToken } from "../utils/auth";

const ProtectedRoute = () => {
  const token = getAuthToken();

  if (!isTokenUsable(token)) {
    clearAuthSession();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
