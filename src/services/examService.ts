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

  // Obtener resultados de exámenes
  getResultados: async (): Promise<any> => {
    const url = '/exam/list-exams';
    const response = await apiClient.get(url);
    return response.data;
  },

  // Obtener detalles de un examen específico
  getExamenDetalle: async (id: string): Promise<any> => {
    const url = `/exam/get-exam/${id}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Guardar calificación de un examen
  saveCalification: async (id: string, calificaciones: any): Promise<any> => {
    const url = '/exam/save-calification';
    const response = await apiClient.post(url, {
      id,
      ...calificaciones
    });
    return response.data;
  },

  // Obtener resultados de un examen calificado
  getExamenResultados: async (id: string): Promise<any> => {
    const url = `/exam/get-results/${id}`;
    const response = await apiClient.get(url);
    return response.data;
  },
};
