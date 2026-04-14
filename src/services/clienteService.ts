import apiClient from '@/api/axios';

export const clienteService = {
  // Obtener todos los clientes para select
  getAll: async (): Promise<any[]> => {
    const url = '/customers';
    const response = await apiClient.get(url);
    const raw = response.data ?? {};
    const items = raw?.data ?? raw ?? [];
    return Array.isArray(items) ? items : [];
  },

  // Obtener clientes de un asesor específico
  getMyCustomers: async (token: string | number): Promise<any[]> => {
    const url = `/customers/my-customers/${token}`;
    const response = await apiClient.get(url);
    const raw = response.data ?? {};
    const items = raw?.data ?? raw ?? [];
    return Array.isArray(items) ? items : [];
  },

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

  // Nuevo: lista de clientes pendientes/recientes desde endpoint 'customers/news'
  listNews: async (query = '', page = 1, per_page = 10): Promise<{ items: any[]; total?: number }> => {
    const params: any = {};
    if (query) {
      params.q = query;
      params.search = query;
    }
    params.page = page;
    params.per_page = per_page;
    const url = '/customers/news';
    const response = await apiClient.get(url, { params });

    const raw = response.data ?? {};
    const items = raw?.data ?? raw ?? [];
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

  // Obtener una dirección de entrega por id
  getDeliveryAddress: async (addressId: string | number): Promise<any> => {
    const url = `/customers/delivery-address/${addressId}`;
    const response = await apiClient.get(url);
    return response.data?.data ?? response.data;
  },

  getHiddenAddresses: async (id: string | number): Promise<any> => {
    const url = `/customers/hide-address/${id}`;
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

  updateDeliveryAddress: async (data: any): Promise<any> => {
    // POST new delivery address for customer
    const url = `/customers/update-delivery-address`;
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

  // Enviar actualización via POST a '/customers/update-customer'
  updateCustomerPost: async (payload: any): Promise<any> => {
    // payload puede ser FormData o un objeto plano
    if (payload instanceof FormData) {
      const response = await apiClient.post('/customers/update-customer', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await apiClient.post('/customers/update-customer', payload);
    return response.data;
  },

  // Bloquear cliente: POST a '/customers/ban-customer'
  banCustomer: async (payload: any): Promise<any> => {
    const url = '/customers/ban-customer';
    const response = await apiClient.post(url, payload);
    return response.data;
  },

  // Bloquear cliente: POST a '/customers/ban-customer'
  desbanCustomer: async (payload: any): Promise<any> => {
    const url = '/customers/desban-customer';
    const response = await apiClient.post(url, payload);
    return response.data;
  },

  // Ocultar dirección de entrega
  hideDeliveryAddress: async (addressId: string | number): Promise<any> => {
    const url = '/customers/hide-delivery-address';
    const response = await apiClient.post(url, { id: addressId });
    return response.data;
  },

  // Reactivar/mostrar dirección de entrega
  showDeliveryAddress: async (addressId: string | number): Promise<any> => {
    const url = '/customers/show-delivery-address';
    const response = await apiClient.post(url, { id: addressId });
    return response.data;
  },
  // Eliminar dirección de entrega (intento optimista de llamada al backend)
  deleteDeliveryAddress: async (addressId: string | number): Promise<any> => {
    const url = '/customers/delete-delivery-address';
    const response = await apiClient.post(url, { id: addressId });
    return response.data;
  },

  // Obtener catálogos fiscales (regimen y uso_cfdi)
  getFiscalData: async (): Promise<{ regimen: any[]; uso_cfdi: any[] }> => {
    const url = '/customers/get-data-fiscal';
    const response = await apiClient.get(url);
    const raw = response.data?.data ?? response.data ?? {};
    return {
      regimen: Array.isArray(raw.regimen) ? raw.regimen : [],
      uso_cfdi: Array.isArray(raw.uso_cfdi) ? raw.uso_cfdi : [],
    };
  },

  // Obtener datos de una dirección de facturación por id
  getBillingAddress: async (id: string | number): Promise<any> => {
    const response = await apiClient.get(`/customers/get-data-billing-address/${id}`);
    return response.data;
  },

  // Guardar datos de facturación del cliente
  saveBillingAddress: async (data: FormData): Promise<any> => {
    const url = '/customers/save-billing-address';
    const response = await apiClient.post(url, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Actualizar datos de facturación del cliente
  updateBillingAddress: async (data: FormData): Promise<any> => {
    const response = await apiClient.post('/customers/update-billing-address', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Eliminar datos de facturación del cliente
  deleteBillingAddress: async (id: string | number): Promise<any> => {
    const response = await apiClient.post('/customers/delete-billing-address', { id });
    return response.data;
  },

  // Obtener datos de facturación del cliente por token
  getBillingAddresses: async (token: string | number): Promise<any[]> => {
    const url = `/customers/billing-data/${token}`;
    const response = await apiClient.get(url);
    const raw = response.data ?? {};
    const items = raw?.data ?? raw ?? [];
    return Array.isArray(items) ? items : [];
  },

  // Listar todos los clientes para panel de administrador
  listCustomersAdmin: async (): Promise<any> => {
    const url = '/customers/list-customers-admin';
    const response = await apiClient.get(url);
    return response.data;
  },

  getBenefits: async (token: string): Promise<any> => {
    const url = '/customers/get-benefits';
    const response = await apiClient.post(url, { token });
    return response.data;
  },

  updateBenefits: async (token: string, benefitId: number): Promise<any> => {
    const url = '/customers/update-benefits';
    const response = await apiClient.post(url, { token, id: benefitId });
    return response.data;
  },

  listServices: async (): Promise<any> => {
    const url = '/customers/list-services';
    const response = await apiClient.get(url);
    return response.data;
  },

  // Obtener historial de servicios del cliente
  getHistory: async (token: string, serviceId: string | number): Promise<any> => {
    const url = '/customers/get-history';
    const response = await apiClient.post(url, { 
      token,
      service_id: serviceId 
    });
    return response.data;
  },
};

export default clienteService;
