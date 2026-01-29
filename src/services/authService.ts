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
    await apiClient.post('/logout');
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
