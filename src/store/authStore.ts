import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
  email: string;
  type: number;
  token: string;
  tipo_usuario?: string; // Nombre del tipo de usuario (ej: 'SISTEMAS', 'ASESOR')
  tipo_usuario_token?: string;
  ubicacion?: string;
  ubicacion_token?: string;
  asesor?: string;
  asesor_token?: string;
}

// Mapeo de permisos por rol
const ROLE_PERMISSIONS: Record<string, string[]> = {
  // Roles administrativos con acceso completo
  'ADMIN': [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'clients.view', 'clients.create', 'clients.edit', 'clients.delete',
    'tickets.view', 'tickets.create', 'tickets.edit', 'tickets.delete', 'tickets.all',
    'reports.view', 'reports.all',
    'extra-charges.view', 'extra-charges.create', 'extra-charges.edit', 'extra-charges.delete',
    'providers.view', 'providers.create', 'providers.edit', 'providers.delete',
    'news.view', 'news.create', 'news.edit', 'news.delete',
    'packages.view', 'packages.create', 'packages.edit', 'packages.delete',
    'operations.view', 'operations.create', 'operations.edit', 'operations.delete', 'operations.all',
    'nbox.view', 'nbox.edit', 'nbox.delete',
    'settings.view', 'settings.edit',
    'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.delete',
    'deliveries.view', 'deliveries.all',
  ],
  
  'SISTEMAS': [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'clients.view', 'clients.create', 'clients.edit', 'clients.delete',
    'tickets.view', 'tickets.create', 'tickets.edit', 'tickets.delete', 'tickets.all',
    'reports.view', 'reports.all',
    'extra-charges.view', 'extra-charges.create', 'extra-charges.edit', 'extra-charges.delete',
    'providers.view', 'providers.create', 'providers.edit', 'providers.delete',
    'news.view', 'news.create', 'news.edit', 'news.delete',
    'packages.view', 'packages.create', 'packages.edit', 'packages.delete',
    'operations.view', 'operations.create', 'operations.edit', 'operations.delete', 'operations.all',
    'nbox.view', 'nbox.edit', 'nbox.delete',
    'settings.view', 'settings.edit',
    'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.delete',
    'deliveries.view', 'deliveries.all',
  ],

  // Roles de CEDIS (Centros de Distribución)
  'CEDIS MONTERREY': [
    'packages.view', 'packages.create', 'packages.edit',
    'operations.view', 'operations.create', 'operations.edit',
    'nbox.view', 'nbox.edit',
    'reports.view',
    'deliveries.view', 'deliveries.create',
    'tickets.view', 'tickets.create',
  ],

  'CEDIS CDMX': [
    'packages.view', 'packages.create', 'packages.edit',
    'operations.view', 'operations.create', 'operations.edit',
    'nbox.view', 'nbox.edit',
    'reports.view',
    'deliveries.view', 'deliveries.create',
    'tickets.view', 'tickets.create',
  ],

  'CEDIS GUADALAJARA': [
    'packages.view', 'packages.create', 'packages.edit',
    'operations.view', 'operations.create', 'operations.edit',
    'nbox.view', 'nbox.edit',
    'reports.view',
    'deliveries.view', 'deliveries.create',
    'tickets.view', 'tickets.create',
  ],

  'CEDIS USA': [
    'packages.view', 'packages.create', 'packages.edit',
    'operations.view', 'operations.create', 'operations.edit',
    'nbox.view', 'nbox.edit',
    'reports.view',
    'deliveries.view', 'deliveries.create',
    'tickets.view', 'tickets.create',
  ],

  'CEDIS CHINA': [
    'packages.view', 'packages.create', 'packages.edit',
    'operations.view', 'operations.create', 'operations.edit',
    'nbox.view', 'nbox.edit',
    'reports.view',
    'deliveries.view', 'deliveries.create',
    'tickets.view', 'tickets.create',
  ],

  // Roles de asesores
  'ASESOR': [
    'clients.view', 'clients.edit',
    'tickets.view', 'tickets.create', 'tickets.own',
    'extra-charges.view',
    'reports.view',
    'packages.view',
    'operations.view',
  ],

  'SUBASESOR': [
    'clients.view',
    'tickets.view', 'tickets.create', 'tickets.own',
    'extra-charges.view',
    'reports.view',
    'packages.view',
  ],

  // Roles de operación
  'OPERACION': [
    'operations.view', 'operations.create', 'operations.edit', 'operations.all',
    'nbox.view', 'nbox.edit',
    'packages.view', 'packages.create', 'packages.edit',
    'clients.view',
    'reports.view',
    'deliveries.view', 'deliveries.create',
    'tickets.view', 'tickets.create',
    'extra-charges.view', 'extra-charges.create',
  ],

  'OPERACION MARITIMA': [
    'operations.view', 'operations.create', 'operations.edit', 'operations.maritime',
    'packages.view', 'packages.create', 'packages.edit',
    'clients.view',
    'reports.view',
    'tickets.view', 'tickets.create',
    'extra-charges.view', 'extra-charges.create',
  ],

  'USUARIO MARITIMO': [
    'operations.view', 'operations.maritime',
    'packages.view',
    'clients.view',
    'reports.view',
    'tickets.view', 'tickets.create',
  ],

  // Servicio al cliente
  'SERVICIO AL CLIENTE': [
    'clients.view', 'clients.create', 'clients.edit', 'clients.delete',
    'tickets.view', 'tickets.create', 'tickets.edit',
    'extra-charges.view', 'extra-charges.create', 'extra-charges.edit', 'extra-charges.delete',
    'nbox.view', 'nbox.edit',
    'operations.view',
    'packages.view',
    'reports.view',
  ],

  // Facturación
  'FACTURACION': [
    'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.delete',
    'clients.view',
    'reports.view', 'reports.all',
    'extra-charges.view',
    'operations.view',
    'tickets.view', 'tickets.create',
  ],

  // Chofer
  'CHOFER': [
    'deliveries.view', 'deliveries.own', 'deliveries.update',
    'packages.view',
    'tickets.view', 'tickets.create',
  ],

  // Proveedor
  'PROVEEDOR': [
    'providers.view',
    'packages.view',
    'operations.view',
    'tickets.view', 'tickets.create',
  ],

  // Tráfico
  'TRAFICO': [
    'operations.view', 'operations.create', 'operations.edit',
    'packages.view', 'packages.create', 'packages.edit',
    'deliveries.view', 'deliveries.create', 'deliveries.edit',
    'clients.view',
    'reports.view',
    'tickets.view', 'tickets.create',
    'nbox.view',
  ],

  // Custodios
  'CUSTODIOS': [
    'clients.view',
    'reports.view', 'reports.all',
    'operations.view',
    'packages.view',
    'invoices.view',
    'tickets.view',
  ],

  // Grupo Movie
  'GRUPO MOVIE': [
    'clients.view',
    'operations.view',
    'packages.view',
    'reports.view',
    'tickets.view', 'tickets.create',
  ],

  // Ingres
  'INGRES': [
    'operations.view', 'operations.create',
    'packages.view', 'packages.create',
    'clients.view',
    'reports.view',
    'tickets.view', 'tickets.create',
  ],
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  hasRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  getUserRole: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: (user) => set({ user, isAuthenticated: true }),
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('token');
      },
      
      setUser: (user) => set({ user }),
      
      // Verificar si el usuario tiene alguno de los roles especificados
      hasRole: (roles: string[]) => {
        const state = get();
        if (!state.user || !state.user.tipo_usuario) return false;
        const userRole = state.user.tipo_usuario.trim().toUpperCase();
        return roles.some(role => role.trim().toUpperCase() === userRole);
      },
      
      // Verificar si el usuario tiene un permiso específico
      hasPermission: (permission: string) => {
        const state = get();
        if (!state.user || !state.user.tipo_usuario) return false;
        
        const userRole = state.user.tipo_usuario.trim().toUpperCase();
        const permissions = ROLE_PERMISSIONS[userRole] || [];
        
        return permissions.includes(permission);
      },
      
      // Obtener el rol del usuario actual
      getUserRole: () => {
        const state = get();
        return state.user?.tipo_usuario?.trim().toUpperCase() || null;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
