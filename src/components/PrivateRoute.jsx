import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function PrivateRoute({ children, allowedRoles }) {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/login" replace />;
  return children;
}
