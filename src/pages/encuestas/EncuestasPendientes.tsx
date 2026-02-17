import { useEffect, useState } from 'react';
import { Button, Spin, message } from 'antd';
import encuestaService from '../../services/encuestaService';
import '../clientes/Clientes.css';

interface EncuestaPendiente {
  token: string;
  clavecliente: string;
  nombre: string;
  state_encuesta: string;
  token_encuesta: string;
  telefono: string;
}

export const EncuestasPendientes = () => {
  const [loading, setLoading] = useState(false);
  const [allEncuestas, setAllEncuestas] = useState<EncuestaPendiente[]>([]);
  const [filteredEncuestas, setFilteredEncuestas] = useState<EncuestaPendiente[]>([]);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    suite: '',
    nombre: ''
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    document.title = 'Sistema Entregax | Encuestas Pendientes';
    loadEncuestas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEncuestas = async () => {
    try {
      setLoading(true);
      const items = await encuestaService.listPendientes();
      setAllEncuestas(items);
      setFilteredEncuestas(items);
    } catch (error: any) {
      console.error(error);
      message.error('Error al obtener encuestas pendientes');
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
        String(e.nombre ?? '').toLowerCase().includes(needle)
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

    setFilteredEncuestas(filtered);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters, allEncuestas]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleCrear = async (encuesta: EncuestaPendiente) => {
    try {
      await encuestaService.create(encuesta.token);
      message.success('Encuesta creada exitosamente');
      loadEncuestas(); // Recargar lista
    } catch (error: any) {
      console.error(error);
      message.error('Error al crear encuesta');
    }
  };

  // Generar enlace de WhatsApp para enviar encuesta
  const generarEnlaceWhatsApp = (encuesta: EncuestaPendiente): string => {
    const telefono = encuesta.telefono || '528332557946';
    const nombre = encuesta.nombre;
    const tokenEncuesta = encuesta.token_encuesta;
    
    const mensaje = `¡Hola ${nombre}! Nos gustaría saber tu opinión. ¿Podrías tomarte un momento para completar nuestra encuesta de calidad? ¡Tu feedback es muy importante para nosotros! Muchas gracias. https://www.sistemaentregax.com/encuesta-de-calidad?ec=${tokenEncuesta}`;
    
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    return `https://api.whatsapp.com/send?phone=${telefono}&text=${mensajeCodificado}`;
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
        <h1>📋 Encuestas Pendientes de Enviar</h1>
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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="no-data" style={{ textAlign: 'center' }}>
                      No hay información de registros
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((encuesta) => {
                    const isCreated = encuesta.token_encuesta !== "0";
                    return (
                      <tr key={encuesta.token}>
                        <td style={{ textAlign: 'center' }}>{encuesta.clavecliente}</td>
                        <td style={{ textAlign: 'center' }}>{encuesta.nombre}</td>
                        <td style={{ textAlign: 'center' }}>
                          {isCreated ? (
                            <Button 
                              type="primary"
                              size="small"
                              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                              onClick={() => {
                                const enlace = generarEnlaceWhatsApp(encuesta);
                                window.open(enlace, '_blank');
                              }}
                            >
                              Enviar encuesta ✈️
                            </Button>
                          ) : (
                            <Button 
                              type="primary"
                              size="small"
                              style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                              onClick={() => handleCrear(encuesta)}
                            >
                              Crear encuesta 📝
                            </Button>
                          )}
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
    </div>
  );
};

export default EncuestasPendientes;
