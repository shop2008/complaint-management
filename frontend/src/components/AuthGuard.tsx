import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types/user.types";
interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: UserRole[] | UserRole;
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/login");
    } else if (
      !loading &&
      requiredRole &&
      (Array.isArray(requiredRole)
        ? !requiredRole.includes(currentUser?.role as UserRole)
        : currentUser?.role !== requiredRole)
    ) {
      switch (currentUser?.role) {
        case "Admin":
          navigate("/users");
          break;
        case "Manager":
          navigate("/manager");
          break;
        case "Staff":
          navigate("/staff");
          break;
        case "Customer":
          navigate("/submit-complaint");
          break;
      }
    }
  }, [currentUser, loading, requiredRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) return null;
  if (
    requiredRole &&
    (Array.isArray(requiredRole)
      ? !requiredRole.includes(currentUser.role)
      : currentUser.role !== requiredRole)
  )
    return null;

  return <>{children}</>;
}
