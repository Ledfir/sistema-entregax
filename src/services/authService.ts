import apiClient from '../api/axios';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  status: string;
  message: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    type: number;
    [key: string]: any;
  };
}

// Decodifica el payload del JWT sin validar la firma (solo para leer el exp)
const decodeJwtPayload = (token: string): Record<string, any> | null => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

export const authService = {
  /**
   * Autenticar usuario
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth', credentials);
    return response.data;
  },

  /**
   * Cerrar sesión
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/logout');
    } finally {
      localStorage.removeItem('token');
    }
  },

  /**
   * Obtiene el JWT almacenado
   */
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  /**
   * Verifica si el JWT almacenado es válido (sin validar expiración)
   * La sesión permanece activa hasta que el usuario se desconecte explícitamente
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    const payload = decodeJwtPayload(token);
    // Siempre retorna true si el token existe - la sesión no expira por tiempo
    return !!payload;
  },

  /**
   * Retorna el payload decodificado del JWT actual
   */
  getTokenPayload: (): Record<string, any> | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return decodeJwtPayload(token);
  },

  /**
   * Obtener información del perfil de usuario
   */
  getProfile: async (userId: string | number): Promise<any> => {
    const response = await apiClient.get(`/users/perfil/${userId}`);
    return response.data;
  },

  /**
   * Actualizar datos de contacto del perfil
   */
  updateProfileContact: async (userId: string | number, data: any): Promise<any> => {
    const response = await apiClient.post('/users/update-profile-contact', {
      user_id: userId,
      ...data
    });
    return response.data;
  },
};
