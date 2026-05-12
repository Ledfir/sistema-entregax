import apiClient from '@/api/axios';

export const cedisMaritimoService = {
  // Obtener historial de BLs recibidos
  getHistorialBlRecibidos: async (): Promise<any> => {
    const url = '/cedis/maritimo/historial-recibidos';
    const response = await apiClient.get(url);
    return response.data;
  },

  // Obtener detalles de un BL específico
  getDetallesBlRecibido: async (id: string | number): Promise<any> => {
    const url = `/cedis/maritimo/detalles-bl/${id}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Imprimir etiquetas de un BL (retorna PDF o error JSON)
  imprimirEtiquetasBl: async (id: string | number): Promise<Blob> => {
    const url = `/cedis/maritimo/imprimir-etiquetas-bl/${id}`;
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Obtener HTML de instrucciones para imprimir
  getInstruccionesMaritimo: async (guide: string): Promise<any> => {
    const url = `/cedis/imprimir-instrucciones/maritimo/${guide}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Obtener BLs pendientes por recibir en CEDIS
  getBlsPorRecibir: async (): Promise<any> => {
    const url = '/cedis/maritimo/bls-por-recibir';
    const response = await apiClient.get(url);
    return response.data;
  },

  // Registrar salida de LOG marítimo
  salidaLog: async (token: string, guiaunica: string): Promise<any> => {
    const response = await apiClient.post('/cedis/salida', { tipo: 'maritimo', token, guiaunica });
    return response.data;
  },

  // Recibir BL marítimo en CEDIS
  recibirBlMaritimo: async (id: string | number, cedis: string, resp: string): Promise<any> => {
    const response = await apiClient.post('/cedis/maritimo/recepcion-bl', { id, cedis, resp });
    return response.data;
  },

  // Registrar recepción de LOG marítimo
  postRecepcion: async (token: string, guiaunica: string): Promise<any> => {
    const response = await apiClient.post('/cedis/recepcion', {
      tipo: 'maritimo',
      token,
      guiaunica,
    });
    return response.data;
  },
};

export default cedisMaritimoService;
