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

interface PrediccionAPI {
  id?: string;
  id_partido?: string;
  home_team: string;
  flag_home: string;
  away_team: string;
  flag_away: string;
  prediction: 'HOME' | 'DRAW' | 'AWAY';
  fecha?: string;
  match_date?: string;
  estado?: 'activa' | 'finalizada';
  resultado?: {
    goles1: number;
    goles2: number;
  };
  home_score?: number;
  away_score?: number;
}

interface Prediccion {
  id: string;
  id_partido: string;
  liga: string;
  jornada: string;
  fecha: string;
  estado: 'activa' | 'finalizada';
  equipo1: {
    nombre: string;
    logo: string;
  };
  equipo2: {
    nombre: string;
    logo: string;
  };
  resultado_actual?: {
    goles1: number;
    goles2: number;
  };
  en_vivo?: boolean;
  tu_prediccion: {
    goles1: number;
    goles2: number;
    prediccion: 'HOME' | 'DRAW' | 'AWAY';
  };
  puntos_proyectados?: number;
  estado_prediccion?: string;
}

interface ProximoPartido {
  id: string;
  home_team: string;
  flag_home: string;
  away_team: string;
  flag_away: string;
  match_date: string;
  fecha_formateada: string;
  hora: string;
  liga: string;
}

interface TorneoAPI {
  id: string;
  name: string;
  stages?: Array<{ stage: string; name: string }>;
}

export interface TorneoStage {
  stage: string;
  name: string;
}

export interface Torneo {
  id: string;
  name: string;
  stages: TorneoStage[];
}

export const quinielaService = {
  /**
   * Obtiene la lista de torneos disponibles
   */
  async getTorneos(): Promise<Torneo[]> {
    const response = await apiClient.get('/quiniela/torneos');

    if (response.data.status === 'success' && Array.isArray(response.data.data)) {
      return response.data.data.map((torneo: TorneoAPI) => ({
        id: String(torneo.id),
        name: torneo.name,
        stages: Array.isArray(torneo.stages)
          ? torneo.stages.map((fase) => ({
              stage: fase.stage,
              name: fase.name,
            }))
          : [],
      }));
    }

    return [];
  },

  /**
   * Obtiene los próximos partidos desde la API
   */
  async getPartidos(idTorneo?: string): Promise<Partido[]> {
    try {
      const response = await apiClient.get('/quiniela/partidos', {
        params: idTorneo ? { id_torneo: idTorneo } : undefined,
      });
      
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
   * @param golesLocal Goles del equipo local
   * @param golesVisitante Goles del equipo visitante
   * @param primerGoleador Quién anotará primero (home o away)
   * @param nombreJugador Nombre del jugador que anotará
   */
  async guardarPrediccion(idUsuario: string, idPartido: string, prediccion: number, golesLocal?: number, golesVisitante?: number, idPrediccion?: string, primerGoleador?: string, nombreJugador?: string, golDescansoLocal?: number, golDescansoVisitante?: number, totalCorners?: number, habraPenal?: string): Promise<void> {
    try {
      const response = await apiClient.post('/quiniela/guardar-prediccion', {
        id_usuario: idUsuario,
        id_partido: idPartido,
        prediccion: prediccion,
        goles_local: golesLocal,
        goles_visitante: golesVisitante,
        ...(idPrediccion ? { id_prediccion: idPrediccion } : {}),
        ...(primerGoleador ? { primer_goleador: primerGoleador } : {}),
        ...(nombreJugador ? { nombre_jugador: nombreJugador } : {}),
        ...(golDescansoLocal !== undefined ? { gol_descanso_local: golDescansoLocal } : {}),
        ...(golDescansoVisitante !== undefined ? { gol_descanso_visitante: golDescansoVisitante } : {}),
        ...(totalCorners !== undefined ? { total_corners: totalCorners } : {}),
        ...(habraPenal ? { habra_penal: habraPenal } : {})
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
    prediccion: {
      id?: string;
      prediction: 'HOME' | 'DRAW' | 'AWAY';
      home_score: number;
      away_score: number;
      primer_goleador?: string;
      nombre_jugador?: string;
    } | null;
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
  async getMisQuinielas(idUsuario: string | number): Promise<Prediccion[]> {
    try {
      const response = await apiClient.post('/quiniela/mis-predicciones', {
        id_usuario: idUsuario
      });

      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        return response.data.data.map((item: PrediccionAPI) => {
          // Convertir la predicción a número de goles (asumimos 1-1 por defecto)
          const prediccionDefault = { goles1: 1, goles2: 1 };
          const prediccionMap: Record<string, {goles1: number; goles2: number}> = {
            'HOME': { goles1: 1, goles2: 0 },
            'DRAW': { goles1: 1, goles2: 1 },
            'AWAY': { goles1: 0, goles2: 1 }
          };

          const fecha = new Date(item.fecha || item.match_date || new Date());
          const fechaFormato = fecha.toLocaleDateString('es-ES', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          }) + ' ' + fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          });

          return {
            id: item.id || `pred_${Math.random()}`,
            id_partido: item.id_partido || item.id || `partido_${Math.random()}`,
            liga: 'QUINIELA',
            jornada: 'Jornada Actual',
            fecha: fechaFormato,
            fecha_unix: fecha.getTime(),
            estado: item.estado || 'activa',
            equipo1: {
              nombre: item.home_team,
              logo: item.flag_home
            },
            equipo2: {
              nombre: item.away_team,
              logo: item.flag_away
            },
            resultado_actual: item.resultado ? {
              goles1: item.resultado.goles1,
              goles2: item.resultado.goles2
            } : (item.home_score !== undefined ? {
              goles1: item.home_score,
              goles2: item.away_score || 0
            } : undefined),
            tu_prediccion: {
              ...( prediccionMap[item.prediction] || prediccionDefault),
              prediccion: item.prediction
            },
            en_vivo: false,
            puntos_proyectados: undefined,
            estado_prediccion: undefined
          };
        });
      }

      return [];
    } catch (error) {
      console.error('Error al obtener mis quinielas:', error);
      throw error;
    }
  },

  /**
   * Obtiene el próximo partido a realizarse
   */
  async getProximoPartido(): Promise<ProximoPartido | null> {
    try {
      const response = await apiClient.get('/quiniela/proximo-partido');
      console.log('Respuesta del servicio:', response);

      if (response.data.status === 'success' && response.data.data) {
        const datos = response.data.data;
        
        // Si es un array, devolver el array (nueva estructura)
        if (Array.isArray(datos)) {
          console.log('Datos es array, devolviendo directamente');
          return datos as any;
        }
        
        // Si es un objeto individual (estructura antigua)
        const partido = datos;
        const fecha = new Date(partido.match_date);
        
        const fecha_formateada = fecha.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short'
        });

        const hora = fecha.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        });

        return {
          id: partido.id,
          home_team: partido.home_team,
          flag_home: partido.flag_home || partido.home_flag,
          away_team: partido.away_team,
          flag_away: partido.flag_away || partido.away_flag,
          match_date: partido.match_date,
          fecha_formateada,
          hora,
          liga: `Grupo ${partido.group_letter || 'A'}`
        };
      }

      return null;
    } catch (error) {
      console.error('Error al obtener próximo partido:', error);
      return null;
    }
  },

  /**
   * Obtiene el historial de predicciones del usuario (últimas 3)
   * @param idUsuario ID del usuario
   */
  async getHistorialPredicciones(idUsuario: string | number): Promise<Prediccion[]> {
    try {
      const response = await apiClient.post('/quiniela/mis-predicciones', {
        id_usuario: idUsuario
      });

      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        // Mapear y tomar los últimos 3
        const predicciones = response.data.data.map((item: PrediccionAPI) => {
          const prediccionMap: Record<string, {goles1: number; goles2: number}> = {
            'HOME': { goles1: 1, goles2: 0 },
            'DRAW': { goles1: 1, goles2: 1 },
            'AWAY': { goles1: 0, goles2: 1 }
          };

          const fecha = new Date(item.match_date || item.fecha || new Date());
          const fechaFormato = fecha.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
          }) + ' ' + fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          });

          return {
            id: item.id || `pred_${Math.random()}`,
            id_partido: item.id_partido || item.id || `partido_${Math.random()}`,
            liga: 'QUINIELA',
            jornada: 'Jornada Actual',
            fecha: fechaFormato,
            estado: item.estado || 'activa',
            equipo1: {
              nombre: item.home_team,
              logo: item.flag_home
            },
            equipo2: {
              nombre: item.away_team,
              logo: item.flag_away
            },
            resultado_actual: item.resultado ? {
              goles1: item.resultado.goles1,
              goles2: item.resultado.goles2
            } : (item.home_score !== undefined ? {
              goles1: item.home_score,
              goles2: item.away_score || 0
            } : undefined),
            tu_prediccion: {
              ...(prediccionMap[item.prediction] || { goles1: 1, goles2: 1 }),
              prediccion: item.prediction
            },
            en_vivo: false,
            puntos_proyectados: undefined,
            estado_prediccion: undefined
          };
        });

        // Retornar los últimos 3 en orden invertido (más recientes primero)
        return predicciones.slice(-3).reverse();
      }

      return [];
    } catch (error) {
      console.error('Error al obtener historial de predicciones:', error);
      return [];
    }
  },

  /**
   * Obtiene el ranking de posiciones de puntos
   */
  async getRanking(): Promise<Array<{total_points: string; username: string; position?: number}>> {
    try {
      const response = await apiClient.get('/quiniela/ranking');

      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        // Agregar posición a cada jugador
        return response.data.data.map((item: {total_points: string; username: string}, index: number) => ({
          ...item,
          position: index + 1
        }));
      }

      return [];
    } catch (error) {
      console.error('Error al obtener ranking:', error);
      throw error;
    }
  },

  /**
   * Obtiene los resultados de partidos finalizados
   */
  async getResultados(): Promise<Array<{
    id: string;
    match_number: string;
    stage: string;
    group_letter: string;
    home_team: string;
    home_flag: string;
    away_team: string;
    away_flag: string;
    home_score: number;
    away_score: number;
    status: string;
    match_date: string;
  }>> {
    try {
      const response = await apiClient.get('/quiniela/resultados');

      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error('Error al obtener resultados:', error);
      throw error;
    }
  },

  /**
   * Obtiene el count de predicciones pendientes del usuario
   * @param idUsuario ID del usuario
   */
  async getPrediccionesPendientes(idUsuario: string | number): Promise<number> {
    try {
      const response = await apiClient.post('/quiniela/predicciones-pendientes', {
        id_usuario: idUsuario
      });

      if (response.data.status === 'success') {
        // Retorna el count directamente o del array/objeto de datos
        if (typeof response.data.data === 'number') {
          return response.data.data;
        } else if (Array.isArray(response.data.data)) {
          return response.data.data.length;
        } else if (typeof response.data.data === 'object' && response.data.data !== null) {
          // Si es un objeto con índices numéricos
          return Object.keys(response.data.data).length;
        }
      }

      return 0;
    } catch (error) {
      console.error('Error al obtener predicciones pendientes:', error);
      return 0;
    }
  },

  /**
   * Obtiene los puntos totales del usuario
   * @param idUsuario ID del usuario
   */
  async getPuntosTotales(idUsuario: string | number): Promise<number> {
    try {
      const response = await apiClient.post('/quiniela/puntos-totales', {
        id_usuario: idUsuario
      });

      if (response.data.status === 'success' && response.data.data) {
        // El backend retorna total_points en data
        const totalPoints = response.data.data.total_points || response.data.data;
        return typeof totalPoints === 'string' ? parseInt(totalPoints, 10) : totalPoints;
      }

      return 0;
    } catch (error) {
      console.error('Error al obtener puntos totales:', error);
      return 0;
    }
  },

  /**
   * Obtiene el ranking filtrado por etapa/grupo
   * @param stage Etapa/grupo a filtrar (ej: 'group_stage_1', 'group_stage_2', 'group_stage_3')
   */
  async getRankingPorEtapa(stage: string, torneoId: string): Promise<Array<{total_points: string; username: string; position?: number}>> {
    try {
      const response = await apiClient.post('/quiniela/ranking-por-etapa', {
        stage: stage,
        torneo_id: torneoId
      });

      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        // Agregar posición a cada jugador
        return response.data.data.map((item: {total_points: string; username: string}, index: number) => ({
          ...item,
          position: index + 1
        }));
      }

      return [];
    } catch (error) {
      console.error('Error al obtener ranking por etapa:', error);
      throw error;
    }
  }
};
