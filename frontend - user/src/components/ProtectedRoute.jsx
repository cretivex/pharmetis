import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Protects routes for given roles. Redirects to login if not authenticated,
 * to /unauthorized if user role is not in allowedRoles.
 * Roles are normalized to uppercase for comparison (e.g. buyer → BUYER).
 */
export function ProtectedRoute({ children, allowedRoles = ['BUYER'] }) {
  const location = useLocation();
  const status = useSelector((state) => state.auth.status);
  const user = useSelector((state) => state.auth.user);

  if (status === 'loading') {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const role = user?.role != null ? String(user.role).toUpperCase() : '';

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
