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
    const url = '/operations/updateAumentoMaritimo';
    const response = await apiClient.post(url, data);
    return response.data;
  },
};

export default operacionesService;
