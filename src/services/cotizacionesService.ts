import apiClient from '@/api/axios';

export const cotizacionesService = {
  // Listar cotizaciones marítimas
  listMaritimas: async (): Promise<any[]> => {
    const url = '/quotes/list-quote-maritime';
    const response = await apiClient.get(url);
    
    const raw = response.data ?? {};
    const data = raw?.data ?? [];
    return Array.isArray(data) ? data : [];
  },
};
