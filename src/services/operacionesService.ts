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

  // Buscar guía DHL para editar
  searchDHLWaybill: async (data: { guia: string }): Promise<any> => {
    const url = '/operations/search-dhl-waybill';
    const response = await apiClient.post(url, data);
    return response.data;
  },

  // Actualizar guía DHL
  updateDHLWaybill: async (data: any): Promise<any> => {
    const url = '/operations/update-dhl-waybill';
    const response = await apiClient.post(url, data);
    return response.data;
  },

  // Obtener cotizaciones marítimas
  getMaritimeQuotes: async (): Promise<any[]> => {
    const url = '/operations/get-maritime-quotes';
    const response = await apiClient.get(url);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  // Actualizar cotización marítima
  updateMaritimeQuote: async (data: any): Promise<any> => {
    const url = '/operations/update-maritime-quote';
    const response = await apiClient.post(url, data);
    return response.data;
  },

  // Obtener lista de reempaques USA
  getListReempaque: async (): Promise<any[]> => {
    const url = '/operations/get-list-reempaque';
    const response = await apiClient.get(url);
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  // Ver guías de reempaque
  viewWaybillsReempaque: async (data: { id: string; idu: string }): Promise<any> => {
    const url = '/operations/view-waybils-reempaque';
    const response = await apiClient.post(url, data);
    return response.data;
  },

  // Obtener cotizaciones pendientes (registers y pending)
  getCotizacionesPendientes: async (): Promise<any> => {
    const url = '/operations/get-quote-pending';
    const response = await apiClient.get(url);
    return response.data;
  },

  // Obtener cajas en CTZ validadas (Paquete Express)
  getCajasValidadasPaquete: async (): Promise<any> => {
    const url = '/operations/get-waybills-apaquete';
    const response = await apiClient.get(url);
    return response.data;
  },

  // Obtener detalle de cotización pendiente para asignar costo
  getDetalleCotizacionPendiente: async (id: string): Promise<any> => {
    const url = `/operations/get-data-ctz-pending-shipping/${id}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Asignar costos a las guías de una cotización
  asignarCostosCotizacion: async (data: any): Promise<any> => {
    const url = '/operations/assign-shipping-costs';
    const response = await apiClient.post(url, data);
    return response.data;
  },
};

export default operacionesService;
