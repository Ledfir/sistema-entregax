import apiClient from '@/api/axios';

export const pagosService = {
  // Obtener estado actual de los pagos (activo/inactivo)
  getEstadoPagos: async (token: string | number): Promise<any> => {
    const url = '/operations/get-config-button-payment-ctz';
    const response = await apiClient.post(url, { token });
    return response.data;
  },

  // Activar o desactivar el botón de pagos
  toggleEstadoPagos: async (token: string | number): Promise<any> => {
    const url = '/operations/update-config-button-payment-ctz';
    const response = await apiClient.post(url, { token });
    return response.data;
  },
};
