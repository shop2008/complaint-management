import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LandingPage from "./LandingPage";

export default function RoleBasedRedirect() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!currentUser) {
    return <LandingPage />;
  }

  // Redirect based on user role
  switch (currentUser.role) {
    case "Admin":
      return <Navigate to="/users" replace />;
    case "Manager":
      return <Navigate to="/manager" replace />;
    case "Staff":
      return <Navigate to="/staff" replace />;
    case "Customer":
      return <Navigate to="/submit-complaint" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}
