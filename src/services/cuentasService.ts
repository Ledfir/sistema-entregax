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
    const url = '/cuentas';
    const response = await apiClient.get(url);
    
    const data = response.data?.data ?? [];
    return Array.isArray(data) ? data : [];
  },

  // Generar reporte de estado de cuenta
  generarReporte: async (payload: any): Promise<any> => {
    const url = '/cuentas/report-account';
    const response = await apiClient.post(url, payload);
    return response.data;
  },
};
