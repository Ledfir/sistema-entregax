import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';

interface RoleGuardProps {
  children: ReactNode;
  roles?: string[]; // Roles permitidos para ver este contenido
  permission?: string; // Permiso específico requerido
  fallback?: ReactNode; // Contenido alternativo si no tiene permisos
}

/**
 * Componente para proteger elementos de la UI basado en roles y permisos
 * 
 * @example
 * // Mostrar botón solo para SISTEMAS
 * <RoleGuard roles={['SISTEMAS']}>
 *   <Button>Crear Usuario</Button>
 * </RoleGuard>
 * 
 * @example
 * // Mostrar botón solo si tiene el permiso users.delete
 * <RoleGuard permission="users.delete">
 *   <Button>Eliminar</Button>
 * </RoleGuard>
 * 
 * @example
 * // Mostrar contenido alternativo si no tiene permisos
 * <RoleGuard roles={['SISTEMAS', 'ADMINISTRACIÓN']} fallback={<div>Sin acceso</div>}>
 *   <div>Contenido protegido</div>
 * </RoleGuard>
 */
export const RoleGuard = ({ 
  children, 
  roles, 
  permission, 
  fallback = null 
}: RoleGuardProps) => {
  const { hasRole, hasPermission } = useAuthStore();

  // Verificar roles si se especificaron
  if (roles && roles.length > 0 && !hasRole(roles)) {
    return <>{fallback}</>;
  }

  // Verificar permiso específico si se especificó
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;
