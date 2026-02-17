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
  'SISTEMAS': [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'clients.view', 'clients.create', 'clients.edit', 'clients.delete',
    'tickets.view', 'tickets.create', 'tickets.edit', 'tickets.delete', 'tickets.all',
    'reports.view', 'reports.all',
    'extra-charges.view', 'extra-charges.create', 'extra-charges.edit', 'extra-charges.delete',
    'providers.view', 'providers.create', 'providers.edit', 'providers.delete',
    'news.view', 'news.create', 'news.edit', 'news.delete',
    'packages.view', 'packages.create', 'packages.edit', 'packages.delete',
    'settings.view', 'settings.edit',
  ],
  'ADMINISTRACIÓN': [
    'users.view',
    'clients.view', 'clients.create', 'clients.edit',
    'tickets.view', 'tickets.all',
    'reports.view', 'reports.all',
    'extra-charges.view', 'extra-charges.create', 'extra-charges.edit',
    'providers.view', 'providers.create', 'providers.edit',
    'news.view', 'news.create', 'news.edit',
  ],
  'ASESOR': [
    'clients.view',
    'tickets.view', 'tickets.create', 'tickets.own',
    'extra-charges.view',
  ],
  'SERVICIO AL CLIENTE': [
    'clients.view', 'clients.create', 'clients.edit', 'clients.delete',
    'tickets.view', 'tickets.create',
    'extra-charges.view', 'extra-charges.create', 'extra-charges.edit', 'extra-charges.delete',
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
