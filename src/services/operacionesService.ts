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

  // Obtener instrucciones pendientes por usuario
  getPendingInstructions: async (iduser: number | string): Promise<any> => {
    const response = await apiClient.get(`/quotes/pending-instructions/${iduser}`);
    return response.data;
  },

  // Obtener lista de guías pendientes de un registro específico
  getPendingInstructionsList: async (idc: number | string, idtp: number | string): Promise<any> => {
    const response = await apiClient.get(`/quotes/pending-list/${idc}/${idtp}`);
    return response.data;
  },

  // Obtener registros listos para asignar instrucciones
  getReadyForInstructions: async (idc: number | string, idtp: number | string): Promise<any> => {
    const response = await apiClient.get(`/quotes/ready-for-instructions/${idc}/${idtp}`);
    return response.data;
  },

  // Obtener direcciones de entrega del cliente para el selector de instrucciones
  getBillingAddressForQuote: async (idc: number | string): Promise<any> => {
    const response = await apiClient.get(`/quotes/billing-address/${idc}`);
    return response.data;
  },

  // Obtener listado de paqueterías
  getPackings: async (): Promise<any> => {
    const response = await apiClient.get('/quotes/packings');
    return response.data;
  },

  // Obtener reporte WEEK
  getReportWeek: async (payload: { week: string | number; year: string | number }): Promise<any> => {
    const url = '/operations/get-report-week';
    const response = await apiClient.post(url, payload);
    return response.data;
  },

  // Descargar reporte WEEK (retorna archivo .xlsx/.csv en blob)
  downloadReportWeek: async (payload: { week: string | number; year: string | number }) => {
    const url = '/operations/download-report-week';
    const response = await apiClient.post(url, payload, { responseType: 'blob' });
    return response;
  },

  // Obtener reporte US
  getReportUS: async (payload: { fecha_inicio: string; fecha_fin: string }): Promise<any> => {
    const url = '/operations/get-report-us';
    const response = await apiClient.post(url, payload);
    return response.data;
  },

  // Listado de productos (para DHL)
  getListProducts: async (): Promise<any> => {
    const response = await apiClient.get('/quotes/list-products');
    return response.data;
  },

  // Asignar instrucciones a registros seleccionados
  updateInstruction: async (payload: { ids: string[]; direccion: string; paqueteria: string; iduser: string; idtp: string }): Promise<any> => {
    const response = await apiClient.post('/quotes/update-instruction', payload);
    return response.data;
  },

  // Archivar guía
  archivedWaybill: async (payload: { id: string; iduser: string }): Promise<any> => {
    const response = await apiClient.post('/quotes/archived-waybill', payload);
    return response.data;
  },

  // Obtener listado de guías archivadas
  getArchivedWaybills: async (iduser: number | string): Promise<any> => {
    const response = await apiClient.get(`/quotes/archived/${iduser}`);
    return response.data;
  },

  // Quitar pago vinculado de cotización
  removePayment: async (payload: { id: string | number }): Promise<any> => {
    const response = await apiClient.post('/quotes/remove-payment', payload);
    return response.data;
  },

  // Vincular pago a cotización
  addPayment: async (payload: { id: string | number; ctz: string }): Promise<any> => {
    const response = await apiClient.post('/quotes/add-payment', payload);
    return response.data;
  },

  // Solicitar 5 días más a cargo extra
  addDayToExtraCharge: async (payload: { id: string | number }): Promise<any> => {
    const response = await apiClient.post('/quotes/add-day-to-extra-charge', payload);
    return response.data;
  },

  // Generar PDF de cotización
  getQuotePdf: async (ctz: string): Promise<any> => {
    const response = await apiClient.get(`/quotes/quote-pdf/${ctz}`);
    return response.data;
  },

  // Eliminar cotización
  deleteQuote: async (payload: { ctz: string; motivo: string }): Promise<any> => {
    const response = await apiClient.post('/quotes/delete-quote', payload);
    return response.data;
  },

  // Proveedores de dólares
  getDollarProviders: async (): Promise<any> => {
    const response = await apiClient.get('/dolars/list-providers');
    return response.data;
  },

  // Tipos de servicio para catálogo de dólares
  getDollarServiceTypes: async (): Promise<{ id: string | number; name: string }[]> => {
    const response = await apiClient.get('/dolars/list-services');
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  // Desarchivar guía
  desarchivedWaybill: async (payload: { id: string | number; iduser: string | number }): Promise<any> => {
    const response = await apiClient.post('/quotes/desarchived-waybill', payload);
    return response.data;
  },

  // Pendientes de cotizar
  getPendingQuotes: async (iduser: number | string): Promise<any> => {
    const response = await apiClient.get(`/quotes/pending-quotes/${iduser}`);
    return response.data;
  },

  // Detalle de pendientes a cotizar por suite e idtp
  getListPendingQuotes: async (suite: string | number, idtp: string | number): Promise<any> => {
    const response = await apiClient.get(`/quotes/list-pending-quotes/${suite}/${idtp}`);
    return response.data;
  },

  // Mis cotizaciones
  getMyQuotes: async (iduser: number | string): Promise<any> => {
    const response = await apiClient.get(`/quotes/my-quotes/${iduser}`);
    return response.data;
  },

  // Obtener detalle de una cotización por ctz
  getQuote: async (ctz: string): Promise<any> => {
    const response = await apiClient.get(`/quotes/quote/${ctz}`);
    return response.data;
  },

  // Generar cotización
  generateQuote: async (payload: { ids: (string | number)[]; idtp: string | number; iduser: string | number; idc: string | number }): Promise<any> => {
    const response = await apiClient.post('/quotes/generate-quote', payload);
    return response.data;
  },

  // Buscar servicios en catálogo de dólares
  searchDollarServices: async (payload: { clave?: string; ids?: string; servicio?: string }): Promise<any> => {
    const response = await apiClient.post('/dolars/search-service', payload);
    return response.data;
  },

  // Buscar clave en catálogo de dólares
  searchClave: async (payload: { clave: string; idprov: number }): Promise<any> => {
    const response = await apiClient.post('/dolars/search-clave', payload);
    return response.data;
  },

  // Obtener cuentas con factura para envío de dólares
  listAccountsWithInvoice: async (payload: { idprov: number }): Promise<any> => {
    const response = await apiClient.post('/dolars/list-acounts-with-invoice', payload);
    return response.data;
  },

  // Guardar orden de dólares con factura
  saveOrderWithInvoice: async (formData: FormData): Promise<any> => {
    const response = await apiClient.post('/dolars/save-order-with-invoice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
};

export default operacionesService;
