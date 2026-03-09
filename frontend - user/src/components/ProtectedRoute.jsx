import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';

/**
 * Protects routes for given roles. Redirects to login if not authenticated,
 * to /unauthorized if user role is not in allowedRoles.
 * Roles are normalized to uppercase for comparison (e.g. buyer → BUYER).
 */
export function ProtectedRoute({ children, allowedRoles = ['BUYER'] }) {
  const location = useLocation();

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const user = authService.getCurrentUser();
  const role = user?.role != null ? String(user.role).toUpperCase() : '';

  if (!user || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
