import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import Login from "./components/Login";
import Register from "./components/Register";
import CustomerDashboard from "./components/CustomerDashboard";
import ManagerDashboard from "./components/ManagerDashboard";
import StaffDashboard from "./components/StaffDashboard";
import UserManagement from "./components/UserManagement";
import RoleBasedRedirect from "./components/RoleBasedRedirect";
import AuthGuard from "./components/AuthGuard";
import Navigation from "./components/Navigation";
import Sidebar from "./components/Sidebar";
import { useAuth } from "./contexts/AuthContext";
import { useSidebar } from "./contexts/SidebarContext";
import ComplaintDetail from "./components/ComplaintDetail";
import { ErrorBoundary } from "./components/ErrorBoundary";

function MainLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { isCollapsed, isMobile, isMobileOpen } = useSidebar();

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

              {/* Protected routes */}
              <Route
                path="/submit-complaint"
                element={
                  <AuthGuard requiredRole="Customer">
                    <CustomerDashboard />
                  </AuthGuard>
                }
              />
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

              {/* Default redirect */}
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
