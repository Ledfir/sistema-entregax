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

  // Obtener datos de cotización marítima por CTZ
  getDataQuoteMaritima: async (ctz: string): Promise<any> => {
    const url = '/quotes/get-data-quote-maritime';
    const response = await apiClient.post(url, { ctz });
    return response.data;
  },

  // Obtener pagos de cotización marítima
  getPaymentsQuoteMaritime: async (ctz: string): Promise<any> => {
    const url = '/quotes/get-payments-quote-maritime';
    const response = await apiClient.post(url, { ctz });
    return response.data;
  },

  // Descargar PDF de cotización marítima
  downloadQuoteMaritimePdf: async (ctz: string): Promise<any> => {
    const url = '/quotes/download-quote-maritime-pdf';
    const response = await apiClient.post(url, { ctz });
    return response.data;
  },

  // Listar cotizaciones TDI-USA por cliente o asesor
  listTdiUsa: async (token: string, type: number): Promise<any> => {
    const url = '/quotes/get-list-quotes-tdi-usa';
    const response = await apiClient.post(url, { token, type });
    return response.data;
  },

  // Obtener PDF de cotización TDI-USA
  getQuoteTdiUsaPdf: async (ctz: string): Promise<any> => {
    const url = `/quotes/quote-pdf/${ctz}`;
    const response = await apiClient.get(url);
    return response.data;
  },
};
