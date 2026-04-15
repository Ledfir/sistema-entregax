import apiClient from '@/api/axios';

export const bancosService = {
  // Listar bancos disponibles
  list: async (): Promise<any[]> => {
    const url = '/cuentas/list-banks-system';
    const response = await apiClient.get(url);
    
    const raw = response.data ?? {};
    const data = raw?.data ?? [];
    return Array.isArray(data) ? data : [];
  },

  // Obtener información de un banco específico
  get: async (id: string | number): Promise<any> => {
    const url = `/bancos/get-data/${id}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Crear nuevo banco
  create: async (data: FormData | {
    name: string;
    logo?: string;
    state?: string;
  }): Promise<any> => {
    const url = '/cuentas/add-bank';
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' },
    } : {};
    const response = await apiClient.post(url, data, config);
    return response.data;
  },

  // Actualizar banco existente
  update: async (id: string | number, data: FormData | {
    name?: string;
    logo?: string;
    state?: string;
  }): Promise<any> => {
    const url = '/cuentas/update-bank';
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' },
    } : {};
    const payload = data instanceof FormData ? data : { ...data, id };
    const response = await apiClient.post(url, payload, config);
    return response.data;
  },

  // Eliminar banco
  delete: async (id: string | number): Promise<any> => {
    const url = '/cuentas/delete-bank';
    const response = await apiClient.post(url, { id });
    return response.data;
  },
};
