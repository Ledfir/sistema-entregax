import apiClient from '@/api/axios';

export const clienteService = {
  // Devuelve { items: any[], total?: number }
  list: async (query = '', page = 1, per_page = 10): Promise<{ items: any[]; total?: number }> => {
    const params: any = {};
    if (query) {
      params.q = query;
      params.search = query; // some APIs expect 'search' instead of 'q'
    }
    params.page = page;
    params.per_page = per_page;
    // Llamar ruta relativa para permitir proxy en desarrollo y evitar CORS
    const url = '/customers/list';
    const response = await apiClient.get(url, { params });

    const raw = response.data ?? {};
    const items = raw?.data ?? raw ?? [];

    // Intentar inferir total desde varias ubicaciones habituales
    const total = raw?.total ?? raw?.meta?.total ?? raw?.pagination?.total ?? response.headers?.['x-total-count'] ?? (Array.isArray(items) ? items.length : undefined);

    return { items: Array.isArray(items) ? items : [], total: total ? Number(total) : undefined };
  },

  get: async (id: string | number): Promise<any> => {
    // Usar ruta relativa para que el dev proxy (/api) redirija a la API remota
    const url = `/customers/getCustomer/${id}`;
    const response = await apiClient.get(url);
    return response.data?.data ?? response.data;
  },

  getDeliveryAddresses: async (id: string | number): Promise<any> => {
    const url = `/customers/delivery-addresses/${id}`;
    const response = await apiClient.get(url);
    return response.data?.data ?? response.data;
  },

  getDeliveryOptions: async (): Promise<any> => {
    const url = `/delivery/get`;
    const response = await apiClient.get(url);
    return response.data?.data ?? response.data;
  },

  addDeliveryAddress: async (data: any): Promise<any> => {
    // POST new delivery address for customer
    const url = `/customers/add-delivery-address`;
    const response = await apiClient.post(url, data);
    return response.data?.data ?? response.data;
  },

  searchAddress: async (postalCode: string): Promise<any> => {
    const url = `/customers/search-address`;
    const response = await apiClient.post(url, { postal_code: postalCode });
    return response.data?.data ?? response.data;
  },

  create: async (payload: any): Promise<any> => {
    const response = await apiClient.post('/clientes', payload);
    return response.data;
  },

  update: async (id: string | number, payload: any): Promise<any> => {
    // If payload is FormData (file upload), set multipart header
    if (payload instanceof FormData) {
      const response = await apiClient.put(`/customers/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await apiClient.put(`/customers/${id}`, payload);
    return response.data;
  },
};

export default clienteService;
