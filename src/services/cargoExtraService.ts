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

  get: async (id: string | number): Promise<any> => {
    const url = `/extra-charges/${id}`;
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

  update: async (id: string | number, payload: any): Promise<any> => {
    const url = `/extra-charges/update/${id}`;
    
    if (payload instanceof FormData) {
      const response = await apiClient.post(url, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    
    const response = await apiClient.post(url, payload);
    return response.data;
  },

  delete: async (id: string | number): Promise<any> => {
    const url = `/extra-charges/delete`;
    const response = await apiClient.post(url, { id });
    return response.data;
  },
};

export default cargoExtraService;
