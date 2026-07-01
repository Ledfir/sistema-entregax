import { useState, useEffect } from 'react';
import { quinielaService } from '@/services/quinielaService';
import './Ranking.css';

interface Stage {
  stage: string;
  name: string;
}

interface Tournament {
  id: string;
  name: string;
  stages: Stage[];
}

interface RankingItem {
  position?: number;
  total_points: string;
  username: string;
}

const Ranking = () => {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState('1');
  const [filter, setFilter] = useState('group_stage_1');
  
  const itemsPerPage = 10;

  // Cargar torneos disponibles
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await quinielaService.getTorneos();
        console.log('Torneos cargados:', data);
        if (Array.isArray(data)) {
          setTournaments(data);
          if (data.length > 0) {
            setSelectedTournament(data[0].id);
            setFilter(data[0].stages[0]?.stage || 'group_stage_1');
          }
        }
      } catch (err) {
        console.error('Error al cargar torneos:', err);
      }
    };

    fetchTournaments();
  }, []);

  // Cargar ranking cuando cambia el filtro o torneo
  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        setCurrentPage(1);
        const rankingData = await quinielaService.getRankingPorEtapa(filter, selectedTournament);
        setRanking(rankingData);
        setError(null);
      } catch (err) {
        setError('Error al cargar el ranking');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [filter, selectedTournament]);

  // Obtener top 3
  const topThree = ranking.slice(0, 3);
  
  // Obtener items para la tabla (desde el 4to en adelante)
  const tableItems = ranking.slice(3);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = tableItems.slice(startIndex, endIndex);
  const totalPages = Math.ceil(tableItems.length / itemsPerPage);

  if (loading) {
    return <div className="ranking-container">Cargando ranking...</div>;
  }

  if (error) {
    return <div className="ranking-container error">{error}</div>;
  }

  return (
    <div className="ranking-container">
      <div className="ranking-header">
        <div className="header-left">
          <h1>Tabla de Posiciones</h1>
          <p>Sigue el progreso de tus colegas y compite por el primer lugar.</p>
        </div>
        <div className="header-right">
          <select 
            className="filter-select" 
            value={selectedTournament} 
            onChange={(e) => {
              setSelectedTournament(e.target.value);
              const tournament = tournaments.find(t => t.id === e.target.value);
              if (tournament && tournament.stages.length > 0) {
                setFilter(tournament.stages[0].stage);
              }
            }}
          >
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>

          <select 
            className="filter-select" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            {tournaments.find(t => t.id === selectedTournament)?.stages.map((stage) => (
              <option key={stage.stage} value={stage.stage}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 3 Tarjetas */}
      <div className="top-three-container">
        {topThree.length > 0 && (
          <>
            {/* Segundo lugar */}
            {topThree[1] && (
              <div className="card card-second">
                <div className="card-position">2º</div>
                <div className="card-avatar">👤</div>
                <div className="card-name">{topThree[1].username}</div>
                <div className="card-points">{topThree[1].total_points} pts</div>
              </div>
            )}

            {/* Primer lugar */}
            {topThree[0] && (
              <div className="card card-first">
                <div className="card-crown">👑</div>
                <div className="card-position">1º</div>
                <div className="card-avatar">👤</div>
                <div className="card-name">{topThree[0].username}</div>
                <div className="card-points">{topThree[0].total_points} pts</div>
              </div>
            )}

            {/* Tercer lugar */}
            {topThree[2] && (
              <div className="card card-third">
                <div className="card-position">3º</div>
                <div className="card-avatar">👤</div>
                <div className="card-name">{topThree[2].username}</div>
                <div className="card-points">{topThree[2].total_points} pts</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Tabla de Ranking */}
      <div className="ranking-table-wrapper">
        <table className="ranking-table">
          <thead>
            <tr>
              <th>POSICIÓN</th>
              <th>EMPLEADO</th>
              <th>PUNTOS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item, index) => {
              const actualPosition = startIndex + index + 4;
              return (
                <tr key={actualPosition}>
                  <td className="position-cell">{actualPosition}</td>
                  <td className="name-cell">{item.username}</td>
                  <td className="points-cell">{item.total_points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="pagination">
        <button 
          className="pagination-arrow"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          ←
        </button>
        
        <div className="pagination-numbers">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          {totalPages > 5 && <span className="pagination-dots">...</span>}
          {totalPages > 5 && (
            <button
              className={`pagination-number ${currentPage === totalPages ? 'active' : ''}`}
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </button>
          )}
        </div>

        <button 
          className="pagination-arrow"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          →
        </button>
      </div>

      <p className="ranking-footer">
        Mostrando 10 de {ranking.length} empleados
      </p>
    </div>
  );
};

export default Ranking;
