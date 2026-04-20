import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p className="text-white">Loading...</p>;

  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;   // ✅ IMPORTANT FIX
}

export default ProtectedRoute;