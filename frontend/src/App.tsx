import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import AuthGuard from "./components/AuthGuard";
import ComplaintDetail from "./components/ComplaintDetail";
import CustomerDashboard from "./components/CustomerDashboard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ForgotPassword from "./components/ForgotPassword";
import Login from "./components/Login";
import ManagerDashboard from "./components/ManagerDashboard";
import Navigation from "./components/Navigation";
import Register from "./components/Register";
import RoleBasedRedirect from "./components/RoleBasedRedirect";
import Sidebar from "./components/Sidebar";
import StaffDashboard from "./components/StaffDashboard";
import UserManagement from "./components/UserManagement";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SidebarProvider, useSidebar } from "./contexts/SidebarContext";

function MainLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { isCollapsed, isMobile } = useSidebar();

  const getMainContentClasses = () => {
    if (!currentUser) return "";

    if (isMobile) {
      return "px-4";
    }

    return `${isCollapsed ? "md:ml-20" : "md:ml-64"} px-6`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {currentUser && <Sidebar />}
      <main
        className={`transition-all duration-300 ease-in-out
          ${getMainContentClasses()}
          pt-20 pb-8 min-h-screen
        `}
      >
        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SidebarProvider>
          <MainLayout>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/submit-complaint" element={<CustomerDashboard />} />

              {/* Protected routes */}
              <Route
                path="/manager"
                element={
                  <AuthGuard requiredRole={["Admin", "Manager"]}>
                    <ManagerDashboard />
                  </AuthGuard>
                }
              />
              <Route
                path="/staff"
                element={
                  <AuthGuard requiredRole={["Admin", "Manager", "Staff"]}>
                    <StaffDashboard />
                  </AuthGuard>
                }
              />
              <Route
                path="/users"
                element={
                  <AuthGuard requiredRole="Admin">
                    <UserManagement />
                  </AuthGuard>
                }
              />
              <Route
                path="/complaints/:id"
                element={
                  <ProtectedRoute>
                    <ComplaintDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Root route with role-based redirect */}
              <Route path="/" element={<RoleBasedRedirect />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </MainLayout>
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}

function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <ErrorBoundary>
      <ComplaintDetail complaintId={Number(id)} onClose={handleClose} />
    </ErrorBoundary>
  );
}

export default App;
