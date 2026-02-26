import axios from '@/api/axios';

interface PolizaPendienteAprobacion {
  token: string;
  gex: string;
  suite: string;
  asesor: string;
  cajas: string;
  volumen: string;
  costo_usd: string;
  created: string;
  total_factura: string;
  file_pl: string;
  file_factura: string;
}

interface ListaPendientesResponse {
  status: string;
  data: PolizaPendienteAprobacion[];
}

export const polizasService = {
  /**
   * Obtiene la lista de pólizas pagadas pendientes de aprobación
   */
  getPolizasPagadasPendientes: async (): Promise<ListaPendientesResponse> => {
    const response = await axios.get('/policies/list-pending-aproved-admin');
    return response.data;
  },

  /**
   * Aprobar una póliza
   */
  aprobarPoliza: async (token: string) => {
    const response = await axios.post('/policies/approve', { token });
    return response.data;
  },

  /**
   * Rechazar una póliza
   */
  rechazarPoliza: async (token: string, motivo?: string) => {
    const response = await axios.post('/policies/reject-policy-admin', { token, motivo });
    return response.data;
  },
};
