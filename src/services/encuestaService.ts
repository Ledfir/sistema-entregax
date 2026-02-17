import apiClient from '@/api/axios';

export const encuestaService = {
  // Obtener encuestas pendientes de enviar
  listPendientes: async (): Promise<any[]> => {
    const url = '/customers/pending-surveys';
    const response = await apiClient.get(url);
    const raw = response.data ?? {};
    const items = raw?.data ?? raw ?? [];
    return Array.isArray(items) ? items : [];
  },

  // Crear encuesta
  create: async (token: string): Promise<any> => {
    const url = '/customers/create-survey';
    const response = await apiClient.post(url, { token });
    return response.data;
  },

  // Enviar encuesta
  send: async (tokenEncuesta: string): Promise<any> => {
    const url = '/surveys/send';
    const response = await apiClient.post(url, { token_encuesta: tokenEncuesta });
    return response.data;
  },

  // Obtener encuestas realizadas
  listRealizadas: async (): Promise<any[]> => {
    const url = '/customers/surveys';
    const response = await apiClient.get(url);
    const raw = response.data ?? {};
    const items = raw?.data ?? raw ?? [];
    return Array.isArray(items) ? items : [];
  },

  // Obtener detalle de una encuesta
  getDetalle: async (token: string): Promise<any> => {
    const url = `/customers/survey/${token}`;
    const response = await apiClient.get(url);
    return response.data?.data ?? response.data;
  },
};

export default encuestaService;
