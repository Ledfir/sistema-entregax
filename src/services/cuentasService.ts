import apiClient from '@/api/axios';

export const cuentasService = {
  // Listar archivos de estados de cuenta
  listFilesAccounts: async (): Promise<any[]> => {
    const url = '/cuentas/list-files-accounts';
    const response = await apiClient.get(url);
    
    const data = response.data?.data ?? [];
    return Array.isArray(data) ? data : [];
  },

  // Listar cuentas disponibles
  list: async (): Promise<any[]> => {
    const url = '/cuentas/list-payments-account';
    const response = await apiClient.get(url);
    
    const raw = response.data ?? {};
    const data = raw?.data ?? [];
    return Array.isArray(data) ? data : [];
  },

  // Listar todas las cuentas (para selects)
  listCuentas: async (): Promise<any[]> => {
    const url = '/cuentas';
    const response = await apiClient.get(url);
    
    const raw = response.data ?? {};
    const data = raw?.data ?? [];
    return Array.isArray(data) ? data : [];
  },

  // Listar bancos disponibles
  listBanks: async (): Promise<any[]> => {
    const url = '/cuentas/list-banks';
    const response = await apiClient.get(url);
    
    const raw = response.data ?? {};
    const data = raw?.data ?? [];
    return Array.isArray(data) ? data : [];
  },

  // Generar reporte de estado de cuenta
  generarReporte: async (payload: any): Promise<any> => {
    const url = '/cuentas/report-account';
    const response = await apiClient.post(url, payload);
    return response.data;
  },

  // Obtener detalles de cotización para el reporte
  getDetailsReportQuote: async (ctz: string): Promise<any> => {
    const url = '/cuentas/details-report-quote';
    const response = await apiClient.post(url, { ctz });
    return response.data;
  },

  // Guardar línea manual
  saveLineaManual: async (payload: any): Promise<any> => {
    const url = '/cuentas/save-line-manual';
    const response = await apiClient.post(url, payload);
    return response.data;
  },

  // Subir estado de cuenta (archivo)
  subirEstadoCuenta: async (formData: FormData): Promise<any> => {
    const url = '/cuentas/upload-file-account';
    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Buscar pagos de un cliente
  searchPaymentsCustomer: async (tokenCliente: string): Promise<any> => {
    const url = '/cuentas/search-payments-customer';
    const response = await apiClient.post(url, { tokenCliente });
    return response.data;
  },

  // Transferir pago entre cuentas
  transferPayment: async (idPago: string | number, idCuentaDestino: string | number): Promise<any> => {
    const url = '/cuentas/transfer-payment';
    const response = await apiClient.post(url, { idPago, idCuentaDestino });
    return response.data;
  },

  // Crear nueva cuenta bancaria
  create: async (data: {
    name: string;
    banco: string;
    cuenta: string;
    clabe: string;
    tarjeta?: string;
    rfc?: string;
    corto: string;
  }): Promise<any> => {
    const url = '/cuentas/add-account-payment';
    const response = await apiClient.post(url, data);
    return response.data;
  },

  // Actualizar cuenta bancaria existente
  update: async (token: string, data: {
    name?: string;
    banco?: string;
    cuenta?: string;
    clabe?: string;
    tarjeta?: string;
    rfc?: string;
    corto?: string;
  }): Promise<any> => {
    const url = '/cuentas/update-account-payment';
    const response = await apiClient.post(url, { ...data, token });
    return response.data;
  },

  // Eliminar cuenta bancaria
  delete: async (token: string): Promise<any> => {
    const url = '/cuentas/delete-account-payment';
    const response = await apiClient.post(url, { token });
    return response.data;
  },

  // Obtener información de una cuenta específica
  get: async (token: string): Promise<any> => {
    const url = `/cuentas/get-data-account/${token}`;
    const response = await apiClient.get(url);
    return response.data;
  },
};
