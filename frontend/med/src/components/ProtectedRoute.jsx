import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }

  if (adminOnly && user?.role !== "ROLE_ADMIN") {
    return <Navigate to="/products" />;
  }

  return children;
};

export default ProtectedRoute;
