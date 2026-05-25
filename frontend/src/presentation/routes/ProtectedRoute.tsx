import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { APP_ROUTES } from './paths';
import { isAdminRole, isSuperAdminRole } from '@/domain/entities/role';

type ProtectedRouteProps = {
  children: JSX.Element;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
};

export function ProtectedRoute({ children, requireAdmin = false, requireSuperAdmin = false }: ProtectedRouteProps) {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.auth} replace state={{ from: location.pathname }} />;
  }

  if (requireSuperAdmin && !isSuperAdminRole(currentUser?.role)) {
    return <Navigate to={APP_ROUTES.admin} replace />;
  }

  if (requireAdmin && !isAdminRole(currentUser?.role)) {
    return <Navigate to={APP_ROUTES.orders} replace />;
  }

  return children;
}
