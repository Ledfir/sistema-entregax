import apiClient from '@/api/axios';

export const operacionesService = {
  // Obtener datos actuales de TDI
  getTdi: async (): Promise<any> => {
    const url = '/operations/getTdi';
    const response = await apiClient.get(url);
    return response.data?.data ?? response.data;
  },

  // Actualizar datos de TDI
  updateTdi: async (data: any): Promise<any> => {
    const url = '/operations/update-tdi-tc';
    const response = await apiClient.post(url, data);
    return response.data;
  },

  // Obtener aumento marítimo
  getAumentoMaritimo: async (): Promise<any> => {
    const url = '/operations/get-tc-aumento-maritimo';
    const response = await apiClient.get(url);
    return response.data?.data ?? response.data;
  },

  // Actualizar aumento marítimo
  updateAumentoMaritimo: async (data: any): Promise<any> => {
    const url = '/operations/update-tc-aumento-maritimo';
    const response = await apiClient.post(url, data);
    return response.data;
  },

  // Obtener tipos de costo
  getTiposCosto: async (): Promise<any[]> => {
    const url = '/operations/getTiposCosto';
    const response = await apiClient.get(url);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  // Actualizar TC/Costo
  updateTCCosto: async (data: any): Promise<any> => {
    const url = '/operations/update-list-waybills';
    const response = await apiClient.post(url, data);
    return response.data;
  },

  // Obtener lista de advisors (usuarios)
  listAdvisors: async (): Promise<any[]> => {
    const url = '/operations/list-advisors';
    const response = await apiClient.get(url);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  // Obtener lista de descuentos
  listDiscounts: async (): Promise<any[]> => {
    const url = '/operations/list-discounts';
    const response = await apiClient.get(url);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  // Obtener datos para crear descuento (productos y clientes)
  getDataCreateDiscount: async (): Promise<any> => {
    const url = '/operations/get-data-create-discount';
    const response = await apiClient.get(url);
    return response.data?.data ?? response.data;
  },

  // Crear nuevo descuento
  createDiscount: async (data: { producto: string; cliente: string; costo: string; usuario: number }): Promise<any> => {
    const url = '/operations/create-discount';
    const response = await apiClient.post(url, data);
    return response.data;
  },
};

export default operacionesService;
