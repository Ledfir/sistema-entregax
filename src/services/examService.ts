import apiClient from '@/api/axios';

export const examService = {
  // Guardar PIN de examen
  savePin: async (nombre: string, telefono: string): Promise<any> => {
    const url = '/exam/save-pin';
    const response = await apiClient.get(url, {
      params: { nombre, telefono }
    });
    return response.data;
  },
};
