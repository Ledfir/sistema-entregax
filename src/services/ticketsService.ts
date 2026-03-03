import axios from '@/api/axios';

interface TicketsResponse {
  status: string;
  data: any[];
  message?: string;
}

export const ticketsService = {
  /**
   * Obtiene la lista de tickets activos
   */
  getTicketsActivos: async (): Promise<TicketsResponse> => {
    const response = await axios.get('/tickets/actives');
    return response.data;
  },

  /**
   * Obtiene la lista de tickets archivados
   */
  getTicketsArchivados: async (): Promise<TicketsResponse> => {
    const response = await axios.get('/tickets/archivados');
    return response.data;
  },

  /**
   * Finaliza un ticket
   */
  finalizarTicket: async (token: string) => {
    const response = await axios.post('/tickets/finalizar', { token });
    return response.data;
  },

  /**
   * Crea un nuevo ticket
   */
  crearTicket: async (data: any) => {
    const response = await axios.post('/tickets/crear', data);
    return response.data;
  },

  /**
   * Actualiza un ticket
   */
  actualizarTicket: async (token: string, data: any) => {
    const response = await axios.post('/tickets/actualizar', { token, ...data });
    return response.data;
  },

  /**
   * Obtiene los detalles de un ticket
   */
  getTicketDetails: async (token: string) => {
    const response = await axios.get(`/tickets/details/${token}`);
    return response.data;
  },

  /**
   * Obtiene las evidencias de un ticket
   */
  getTicketEvidences: async (token: string) => {
    const response = await axios.get(`/tickets/evidences/${token}`);
    return response.data;
  },
  /**
   * Obtiene las referencias de un ticket
   */
  getTicketReferences: async (token: string) => {
    const response = await axios.get(`/tickets/references/${token}`);
    return response.data;
  },
  /**
   * Archiva un ticket
   */
  archiveTicket: async (token: string) => {
    const response = await axios.post('/tickets/archive', { token });
    return response.data;
  },
};

export default ticketsService;
