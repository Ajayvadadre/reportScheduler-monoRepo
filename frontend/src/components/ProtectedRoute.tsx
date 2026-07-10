import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // If the backend verification request is still in transit, show a clean loader
  // This avoids a jarring visual bug where unauthenticated users flash momentarily
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-layer">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Gatekeeper checkpoint
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;