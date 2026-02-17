import { useEffect, useState } from 'react';
import { Button, Spin, message, Modal } from 'antd';
import encuestaService from '../../services/encuestaService';
import '../clientes/Clientes.css';

interface Respuestas {
  asesor: string;
  satisfaccion: string;
  recomendacion: string;
  comentarios: string;
}

interface EncuestaRealizada {
  token: string;
  clavecliente: string;
  nombre: string;
  respuestas: Respuestas;
}

export const EncuestasRealizadas = () => {
  const [loading, setLoading] = useState(false);
  const [allEncuestas, setAllEncuestas] = useState<EncuestaRealizada[]>([]);
  const [filteredEncuestas, setFilteredEncuestas] = useState<EncuestaRealizada[]>([]);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    suite: '',
    nombre: '',
    comentarios: ''
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detalleEncuesta, setDetalleEncuesta] = useState<any>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    document.title = 'Sistema Entregax | Encuestas Realizadas';
    loadEncuestas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEncuestas = async () => {
    try {
      setLoading(true);
      const items = await encuestaService.listRealizadas();
      setAllEncuestas(items);
      setFilteredEncuestas(items);
    } catch (error: any) {
      console.error(error);
      message.error('Error al obtener encuestas realizadas');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros cuando cambian
  useEffect(() => {
    let filtered = [...allEncuestas];

    // Filtro de búsqueda general
    if (query.trim()) {
      const needle = query.toLowerCase();
      filtered = filtered.filter((e) => 
        String(e.clavecliente ?? '').toLowerCase().includes(needle) ||
        String(e.nombre ?? '').toLowerCase().includes(needle) ||
        String(e.respuestas?.comentarios ?? '').toLowerCase().includes(needle)
      );
    }

    // Filtros por columna
    if (filters.suite.trim()) {
      const needle = filters.suite.toLowerCase();
      filtered = filtered.filter((e) => 
        String(e.clavecliente ?? '').toLowerCase().includes(needle)
      );
    }

    if (filters.nombre.trim()) {
      const needle = filters.nombre.toLowerCase();
      filtered = filtered.filter((e) => 
        String(e.nombre ?? '').toLowerCase().includes(needle)
      );
    }

    if (filters.comentarios.trim()) {
      const needle = filters.comentarios.toLowerCase();
      filtered = filtered.filter((e) => 
        String(e.respuestas?.comentarios ?? '').toLowerCase().includes(needle)
      );
    }

    setFilteredEncuestas(filtered);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters, allEncuestas]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleVerDetalles = async (encuesta: EncuestaRealizada) => {
    try {
      setLoadingDetalle(true);
      setIsModalOpen(true);
      const detalle = await encuestaService.getDetalle(encuesta.token);
      setDetalleEncuesta(detalle);
    } catch (error: any) {
      console.error(error);
      message.error('Error al obtener detalles de la encuesta');
      setIsModalOpen(false);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDetalleEncuesta(null);
  };

  // Calcular datos paginados
  const totalRecords = filteredEncuestas.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedData = filteredEncuestas.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="clientes-container">
      <div className="clientes-header-new">
        <h1>✅ Encuestas Realizadas</h1>
        <div className="clientes-actions">
          <input
            type="text"
            placeholder="Buscar registro..."
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="clientes-spinner"><Spin size="large" /></div>
      ) : (
        <>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>SUITE</th>
                  <th style={{ textAlign: 'center' }}>NOMBRE</th>
                  <th style={{ textAlign: 'center' }}>COMENTARIOS</th>
                  <th style={{ textAlign: 'center' }}>ACCIONES</th>
                </tr>
                <tr className="filter-row">
                  <th>
                    <input
                      type="text"
                      placeholder="Filtrar suite"
                      value={filters.suite}
                      onChange={(e) => handleFilterChange('suite', e.target.value)}
                      className="filter-input"
                    />
                  </th>
                  <th>
                    <input
                      type="text"
                      placeholder="Filtrar nombre"
                      value={filters.nombre}
                      onChange={(e) => handleFilterChange('nombre', e.target.value)}
                      className="filter-input"
                    />
                  </th>
                  <th>
                    <input
                      type="text"
                      placeholder="Filtrar comentarios"
                      value={filters.comentarios}
                      onChange={(e) => handleFilterChange('comentarios', e.target.value)}
                      className="filter-input"
                    />
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="no-data" style={{ textAlign: 'center' }}>
                      No hay información de registros
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((encuesta) => {
                    const comentarios = encuesta.respuestas?.comentarios || '';
                    const comentariosTruncados = comentarios.length > 100 
                      ? comentarios.substring(0, 100) + '...' 
                      : comentarios;
                    
                    return (
                      <tr key={encuesta.token}>
                        <td style={{ textAlign: 'center' }}>{encuesta.clavecliente}</td>
                        <td style={{ textAlign: 'center' }}>{encuesta.nombre}</td>
                        <td style={{ textAlign: 'center' }}>{comentariosTruncados}</td>
                        <td style={{ textAlign: 'center' }}>
                          <Button 
                            type="primary"
                            size="middle"
                            style={{ backgroundColor: '#ff6b35', borderColor: '#ff6b35' }}
                            onClick={() => handleVerDetalles(encuesta)}
                          >
                            Ver resultados de encuesta 📋
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <div className="records-info">
              Mostrando {totalRecords > 0 ? startIndex + 1 : 0} a {endIndex} de {totalRecords} registros
            </div>
            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Anterior
              </button>
              <button
                className="pagination-btn"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de detalles de encuesta */}
      <Modal
        title="Resultados de Encuesta de Calidad"
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Cerrar
          </Button>
        ]}
        width={700}
      >
        {loadingDetalle ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : detalleEncuesta ? (
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '25px', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>
              <h3 style={{ color: '#ff6b35', marginBottom: '15px' }}>📋 Información del Cliente</h3>
              <p><strong>Suite:</strong> {detalleEncuesta.customer?.clavecliente}</p>
              <p><strong>Nombre:</strong> {detalleEncuesta.customer?.nombre}</p>
              <p><strong>Teléfono:</strong> {detalleEncuesta.customer?.telefono}</p>
            </div>

            <div style={{ marginBottom: '25px', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>
              <h3 style={{ color: '#ff6b35', marginBottom: '15px' }}>👤 Asesor Asignado</h3>
              <p><strong>Nombre:</strong> {detalleEncuesta.user?.name}</p>
            </div>

            <div style={{ marginBottom: '25px', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>
              <h3 style={{ color: '#ff6b35', marginBottom: '15px' }}>⭐ Respuestas de la Encuesta</h3>
              <p><strong>Calificación del Asesor:</strong> {detalleEncuesta.survey?.respuestas?.asesor}/5</p>
              <p><strong>Nivel de Satisfacción:</strong> {detalleEncuesta.survey?.respuestas?.satisfaccion}/5</p>
              <p><strong>¿Recomendaría el servicio?:</strong> {detalleEncuesta.survey?.respuestas?.recomendacion === 'si' ? 'Sí ✅' : 'No ❌'}</p>
              <p><strong>Comentarios:</strong></p>
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '15px', 
                borderRadius: '8px',
                marginTop: '10px',
                fontStyle: 'italic'
              }}>
                {detalleEncuesta.survey?.respuestas?.comentarios || 'Sin comentarios'}
              </div>
            </div>

            <div>
              <h3 style={{ color: '#ff6b35', marginBottom: '15px' }}>📅 Información Adicional</h3>
              <p><strong>Fecha de Creación:</strong> {detalleEncuesta.survey?.created}</p>
              <p><strong>Fecha de Respuesta:</strong> {detalleEncuesta.survey?.contestada}</p>
              <p><strong>Estado:</strong> {detalleEncuesta.survey?.state === '2' ? 'Completada' : 'Pendiente'}</p>
            </div>
          </div>
        ) : (
          <p>No hay información disponible</p>
        )}
      </Modal>
    </div>
  );
};

export default EncuestasRealizadas;
