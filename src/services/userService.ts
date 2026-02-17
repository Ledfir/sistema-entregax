import apiClient from '@/api/axios';

export const userService = {
  // Lista de usuarios con paginación
  list: async (query = '', page = 1, per_page = 10): Promise<{ items: any[]; total?: number }> => {
    const params: any = {};
    if (query) {
      params.q = query;
      params.search = query;
    }
    params.page = page;
    params.per_page = per_page;
    
    const url = '/users/list';
    const response = await apiClient.get(url, { params });

    const raw = response.data ?? {};
    const items = raw?.data ?? raw ?? [];

    // Intentar inferir total desde varias ubicaciones habituales
    const total = raw?.total ?? raw?.meta?.total ?? raw?.pagination?.total ?? 
                  response.headers?.['x-total-count'] ?? 
                  (Array.isArray(items) ? items.length : undefined);

    return { 
      items: Array.isArray(items) ? items : [], 
      total: total ? Number(total) : undefined 
    };
  },

  // Obtener un usuario específico
  get: async (token: string): Promise<any> => {
    const url = `/users/get/${token}`;
    const response = await apiClient.get(url);
    return response.data?.data ?? response.data;
  },

  // Crear nuevo usuario
  create: async (payload: any): Promise<any> => {
    const url = '/users/create-user';
    const response = await apiClient.post(url, payload);
    return response.data;
  },

  // Actualizar usuario
  update: async (payload: any): Promise<any> => {
    const url = '/users/update-user';
    const response = await apiClient.post(url, payload);
    return response.data;
  },

  // Eliminar usuario
  delete: async (token: string): Promise<any> => {
    const url = '/users/delete-user';
    const response = await apiClient.post(url, { token });
    return response.data;
  },

  // Obtener tipos de usuario
  listTypes: async (): Promise<any[]> => {
    const url = '/users/list-type';
    const response = await apiClient.get(url);
    return response.data?.data ?? response.data ?? [];
  },

  // Obtener ubicaciones
  listUbications: async (): Promise<any[]> => {
    const url = '/users/list-ubication';
    const response = await apiClient.get(url);
    return response.data?.data ?? response.data ?? [];
  },

  // Obtener team leaders
  listTeamLeaders: async (): Promise<any[]> => {
    const url = '/users/team-leaders';
    const response = await apiClient.get(url);
    return response.data?.data ?? response.data ?? [];
  },

  // Obtener lista de asesores para servicio al cliente
  listAdvisors: async (): Promise<any[]> => {
    const url = '/users/list-advisors';
    const response = await apiClient.get(url);
    return response.data?.data ?? response.data ?? [];
  },
};

export default userService;
