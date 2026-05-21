import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="auth-loading">
        <LoadingSpinner text="Checking session..." variant="compact" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
}

export default ProtectedRoute;
