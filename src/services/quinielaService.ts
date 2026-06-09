import apiClient from '@/api/axios';

interface PartidoAPI {
  id: string;
  match_number: string;
  group_letter: string;
  stage: string;
  home_team: string;
  home_flag: string;
  away_team: string;
  away_flag: string;
  match_date: string;
}

interface Partido {
  id: string;
  stage: string;
  liga: string;
  ligaColor: string;
  hora: string;
  equipo1: {
    nombre: string;
    logo: string;
  };
  equipo2: {
    nombre: string;
    logo: string;
  };
  estadio?: string;
  enVivo?: boolean;
  verDetalles?: boolean;
  fecha: 'hoy' | 'mañana' | 'proximamente';
  matchNumber: string;
  groupLetter: string;
}

export const quinielaService = {
  /**
   * Obtiene los próximos partidos desde la API
   */
  async getPartidos(): Promise<Partido[]> {
    try {
      const response = await apiClient.get('/quiniela/partidos');
      
      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        return response.data.data.map((partido: PartidoAPI) => {
          const matchDate = new Date(partido.match_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          let fecha: 'hoy' | 'mañana' | 'proximamente' = 'proximamente';
          const matchDateNormalized = new Date(matchDate);
          matchDateNormalized.setHours(0, 0, 0, 0);
          
          if (matchDateNormalized.getTime() === today.getTime()) {
            fecha = 'hoy';
          } else if (matchDateNormalized.getTime() === tomorrow.getTime()) {
            fecha = 'mañana';
          }

          const hora = new Date(partido.match_date).toLocaleString('es-ES', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/^\w/, (c) => c.toUpperCase());

          return {
            id: partido.id,
            stage: partido.stage,
            matchNumber: partido.match_number,
            groupLetter: partido.group_letter,
            liga: `Grupo ${partido.group_letter}`,
            ligaColor: '#0066cc',
            hora: hora,
            equipo1: {
              nombre: partido.home_team,
              logo: partido.home_flag
            },
            equipo2: {
              nombre: partido.away_team,
              logo: partido.away_flag
            },
            fecha: fecha
          };
        });
      }
      
      return [];
    } catch (error) {
      console.error('Error al obtener partidos:', error);
      throw error;
    }
  },

  /**
   * Obtiene un partido específico por ID
   */
  async getPartidoById(id: string): Promise<Partido | null> {
    try {
      const response = await apiClient.get(`/quiniela/partidos/${id}`);
      
      if (response.data.status === 'success' && response.data.data) {
        const partido = response.data.data;
        return {
          id: partido.id,
          stage: partido.stage,
          matchNumber: partido.match_number,
          groupLetter: partido.group_letter,
          liga: `Grupo ${partido.group_letter}`,
          ligaColor: '#0066cc',
          hora: new Date(partido.match_date).toLocaleString('es-ES'),
          equipo1: {
            nombre: partido.home_team,
            logo: partido.home_flag
          },
          equipo2: {
            nombre: partido.away_team,
            logo: partido.away_flag
          },
          fecha: 'proximamente'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error al obtener partido:', error);
      throw error;
    }
  },

  /**
   * Guarda una predicción para un partido
   * @param idUsuario Token del usuario
   * @param idPartido ID del partido
   * @param prediccion Predicción (1=Home, 2=Draw, 3=Away)
   */
  async guardarPrediccion(idUsuario: string, idPartido: string, prediccion: number): Promise<void> {
    try {
      const response = await apiClient.post('/quiniela/guardar-prediccion', {
        id_usuario: idUsuario,
        id_partido: idPartido,
        prediccion: prediccion
      });

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Error al guardar la predicción');
      }
    } catch (error) {
      console.error('Error al guardar predicción:', error);
      throw error;
    }
  },

  /**
   * Valida si ya existe una predicción previa para un partido
   * @param idUsuario ID del usuario
   * @param idPartido ID del partido
   */
  async validarPrediccion(idUsuario: string, idPartido: string): Promise<{
    valida: boolean;
    prediccion: 'HOME' | 'DRAW' | 'AWAY' | null;
  }> {
    try {
      const response = await apiClient.post('/quiniela/validar-prediccion', {
        id_usuario: idUsuario,
        id_partido: idPartido
      });

      if (response.data.status === 'success') {
        return response.data.data;
      }

      throw new Error('Error al validar predicción');
    } catch (error) {
      console.error('Error al validar predicción:', error);
      throw error;
    }
  },

  /**
   * Obtiene las quinielas (predicciones) del usuario
   * @param idUsuario ID del usuario
   */
  async getMisQuinielas(idUsuario: string | number): Promise<any[]> {
    try {
      const response = await apiClient.get(`/quiniela/mis-quinielas/${idUsuario}`);

      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error('Error al obtener mis quinielas:', error);
      throw error;
    }
  }
};
