import { useState, useEffect } from 'react';
import { quinielaService } from '@/services/quinielaService';
import './Resultados.css';

interface Resultado {
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
}

const Resultados = () => {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResultados = async () => {
      try {
        setLoading(true);
        setResultados(await quinielaService.getResultados());
        setError(null);
      } catch (err) {
        setError('Error al cargar los resultados');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResultados();
  }, []);

  const getPrediccionTexto = (homeScore: number, awayScore: number): string => {
    if (homeScore > awayScore) {
      return 'Gana Local';
    } else if (awayScore > homeScore) {
      return 'Gana Visitante';
    } else {
      return 'Empate';
    }
  };

  const formatDate = (dateString: string): { date: string; time: string } => {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
    const day = date.getDate();
    const month = date.toLocaleDateString('es-ES', { month: 'short' });
    const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    return {
      date: `${dayName}, ${day} ${month}`,
      time: time
    };
  };

  if (loading) {
    return <div className="resultados-container">Cargando resultados...</div>;
  }

  if (error) {
    return <div className="resultados-container error">{error}</div>;
  }

  if (resultados.length === 0) {
    return <div className="resultados-container">No hay resultados disponibles</div>;
  }

  return (
    <div className="resultados-container">
      <div className="resultados-header">
        <h1>Resultados</h1>
        <p>Revisa los partidos ya finalizados y sus resultados</p>
      </div>

      <div className="resultados-grid">
        {resultados.map((resultado) => {
          const { date, time } = formatDate(resultado.match_date);
          const prediccionTexto = getPrediccionTexto(resultado.home_score, resultado.away_score);

          return (
            <div key={resultado.id} className="resultado-card">
              <div className="card-header">
                <div className="jornada">Fase: {resultado.stage}</div>
                <div className="fecha-hora">
                  <span>{date}</span>
                  <span className="hora">{time}</span>
                </div>
              </div>

              <div className="card-body">
                <div className="equipos-container">
                  {/* Equipo Local */}
                  <div className="equipo">
                    <img src={resultado.home_flag} alt={resultado.home_team} className="bandera" />
                    <p className="nombre-equipo">{resultado.home_team}</p>
                  </div>

                  {/* Resultado */}
                  <div className="resultado">
                    <div className="marcador">
                      <span className="goles">{resultado.home_score}</span>
                      <span className="vs">vs</span>
                      <span className="goles">{resultado.away_score}</span>
                    </div>
                  </div>

                  {/* Equipo Visitante */}
                  <div className="equipo">
                    <img src={resultado.away_flag} alt={resultado.away_team} className="bandera" />
                    <p className="nombre-equipo">{resultado.away_team}</p>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <div className="prediccion-label">RESULTADO</div>
                <div className="prediccion-texto">{prediccionTexto}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Resultados;
