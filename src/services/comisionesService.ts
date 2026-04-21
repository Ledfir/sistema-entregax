import apiClient from '@/api/axios';

export const comisionesService = {
  // Obtener reporte de comisiones
  reporteComision: async (fechaInicio: string, fechaFin: string, asesor: string): Promise<any> => {
    const url = '/comisions/report-comision';
    const response = await apiClient.post(url, {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      asesor: asesor
    });
    return response.data;
  },
};
