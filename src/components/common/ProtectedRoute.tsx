import { useEffect, useState } from 'react';
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
  // Inicializar con el valor actual (ya hidratado si la navegación es interna)
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    // Si aún no hidratô (recarga de página), esperar el evento
    if (!hydrated) {
      const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
      return unsub;
    }
  }, [hydrated]);

  // Pantalla en blanco mientras Zustand lee localStorage
  if (!hydrated) return null;

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
