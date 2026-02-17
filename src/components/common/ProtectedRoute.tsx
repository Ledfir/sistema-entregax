import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[]; // Roles permitidos para acceder a esta ruta
  permission?: string; // Permiso específico requerido
  redirectTo?: string; // Ruta de redirección personalizada
}

export const ProtectedRoute = ({ 
  children, 
  roles, 
  permission,
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { isAuthenticated, hasRole, hasPermission } = useAuthStore();

  // Verificar autenticación
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Verificar roles si se especificaron
  if (roles && roles.length > 0 && !hasRole(roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Verificar permiso específico si se especificó
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
