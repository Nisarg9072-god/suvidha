import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';

type Role = 'admin' | 'dept_admin' | 'staff';

export default function ProtectedRoute({ allowedRoles }: { allowedRoles?: Role[] } = {}) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('admin_token')) : null;

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as Role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
