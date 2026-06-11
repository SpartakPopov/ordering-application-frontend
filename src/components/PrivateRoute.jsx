import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// allowedRoles: optional array e.g. ["ROLE_MANAGER", "ROLE_KITCHEN"]
// If omitted, any authenticated user is allowed.
export default function PrivateRoute({ children, allowedRoles }) {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/login" replace />;
  return children;
}
