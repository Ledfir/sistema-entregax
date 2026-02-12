import apiClient from '@/api/axios';

export const cargoExtraService = {
  list: async (query = '', page = 1, per_page = 10): Promise<{ items: any[]; total?: number }> => {
    const params: any = {};
    if (query) {
      params.q = query;
      params.search = query;
    }
    params.page = page;
    params.per_page = per_page;
    
    const url = '/extra-charges/list';
    const response = await apiClient.get(url, { params });

    const raw = response.data ?? {};
    const items = raw?.data ?? raw ?? [];
    const total = raw?.total ?? raw?.meta?.total ?? raw?.pagination?.total ?? response.headers?.['x-total-count'] ?? (Array.isArray(items) ? items.length : undefined);

    return { items: Array.isArray(items) ? items : [], total: total ? Number(total) : undefined };
  },

  // Obtener todos los clientes para select
  getCuentas: async (): Promise<any[]> => {
    const url = '/cuentas';
    const response = await apiClient.get(url);
    const raw = response.data ?? {};
    const items = raw?.data ?? raw ?? [];
    return Array.isArray(items) ? items : [];
  },

  get: async (token: string): Promise<any> => {
    const url = `/extra-charges/get/${token}`;
    const response = await apiClient.get(url);
    return response.data?.data ?? response.data;
  },

  create: async (payload: any): Promise<any> => {
    const url = '/extra-charges/create';
    
    if (payload instanceof FormData) {
      const response = await apiClient.post(url, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    
    const response = await apiClient.post(url, payload);
    return response.data;
  },

  update: async (payload: any): Promise<any> => {
    const url = '/extra-charges/update';
    
    if (payload instanceof FormData) {
      const response = await apiClient.post(url, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    
    const response = await apiClient.post(url, payload);
    return response.data;
  },

  delete: async (token: string): Promise<any> => {
    const url = `/extra-charges/delete`;
    const response = await apiClient.post(url, { token });
    return response.data;
  },
};

export default cargoExtraService;
