import apiClient from '@/api/axios';

export const serviciosService = {
  // Listar servicios disponibles
  list: async (): Promise<any[]> => {
    const url = '/operations/list-services';
    const response = await apiClient.get(url);
    
    const raw = response.data ?? {};
    const data = raw?.data ?? [];
    return Array.isArray(data) ? data : [];
  },

  // Obtener información de un servicio específico
  get: async (token: string): Promise<any> => {
    const url = `/operations/get-service/${token}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Crear nuevo servicio
  create: async (data: any): Promise<any> => {
    const url = '/operations/create-service';
    const response = await apiClient.post(url, data);
    return response.data;
  },

  // Actualizar servicio existente
  update: async (id: string | number, data: any): Promise<any> => {
    const url = '/operations/update-service';
    const response = await apiClient.post(url, { ...data, id });
    return response.data;
  },

  // Eliminar servicio
  delete: async (id: string | number): Promise<any> => {
    const url = '/operations/delete-service';
    const response = await apiClient.post(url, { id });
    return response.data;
  },
};
