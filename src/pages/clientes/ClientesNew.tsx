import { useEffect, useState } from 'react';
import { Button, Spin, message } from 'antd';
// icon removed: PlusOutlined
import { useNavigate } from 'react-router-dom';
import clienteService from '../../services/clienteService';
import dayjs from 'dayjs';
import './Clientes.css';

export const ClientesNew = () => {
  const [loading, setLoading] = useState(false);
  const [allClientes, setAllClientes] = useState<any[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    clave: '',
    nombre: '',
    asesor: '',
    fechaAlta: '',
    opciones: ''
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sistema Entregax | Clientes en espera de validación';
    loadClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const res = await clienteService.listNews('', 1, 10000);
      const items = res.items ?? [];
      setAllClientes(items);
      setFilteredClientes(items);
    } catch (error: any) {
      console.error(error);
      message.error('Error al obtener clientes');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros cuando cambian
  useEffect(() => {
    let filtered = [...allClientes];

    // Filtro de búsqueda general
    if (query.trim()) {
      const needle = query.toLowerCase();
      filtered = filtered.filter((c) => 
        String(c.clave ?? c.id ?? '').toLowerCase().includes(needle) ||
        String(c.nombre ?? c.name ?? '').toLowerCase().includes(needle) ||
        String(c.asesor ?? '').toLowerCase().includes(needle)
      );
    }

    // Filtros por columna
    if (filters.clave.trim()) {
      const needle = filters.clave.toLowerCase();
      filtered = filtered.filter((c) => 
        String(c.clave ?? c.id ?? '').toLowerCase().includes(needle)
      );
    }

    if (filters.nombre.trim()) {
      const needle = filters.nombre.toLowerCase();
      filtered = filtered.filter((c) => 
        String(c.nombre ?? c.name ?? '').toLowerCase().includes(needle)
      );
    }

    if (filters.asesor.trim()) {
      const needle = filters.asesor.toLowerCase();
      filtered = filtered.filter((c) => 
        String(c.asesor ?? '').toLowerCase().includes(needle)
      );
    }

    if (filters.fechaAlta.trim()) {
      const needle = filters.fechaAlta.toLowerCase();
      filtered = filtered.filter((c) => {
        const d = c.fecha_creacion ?? c.created_at ?? c.createdAt;
        const formatted = d ? dayjs(d).format('DD/MM/YYYY') : '';
        return formatted.toLowerCase().includes(needle);
      });
    }

    setFilteredClientes(filtered);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters, allClientes]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Calcular datos paginados
  const totalRecords = filteredClientes.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedData = filteredClientes.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="clientes-container">
      <div className="clientes-header-new">
        <h1> Clientes en espera de validación</h1>
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
                  <th>CLAVE</th>
                  <th>NOMBRE</th>
                  <th>ASESOR</th>
                  <th>FECHA DE ALTA</th>
                  <th>OPCIONES</th>
                </tr>
                <tr className="filter-row">
                  <th>
                    <input
                      type="text"
                      placeholder="Filtrar clave"
                      value={filters.clave}
                      onChange={(e) => handleFilterChange('clave', e.target.value)}
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
                      placeholder="Filtrar asesor"
                      value={filters.asesor}
                      onChange={(e) => handleFilterChange('asesor', e.target.value)}
                      className="filter-input"
                    />
                  </th>
                  <th>
                    <input
                      type="text"
                      placeholder="Filtrar fecha de alta"
                      value={filters.fechaAlta}
                      onChange={(e) => handleFilterChange('fechaAlta', e.target.value)}
                      className="filter-input"
                    />
                  </th>
                  <th>
                    <input
                      type="text"
                      placeholder="Filtrar opciones"
                      value={filters.opciones}
                      onChange={(e) => handleFilterChange('opciones', e.target.value)}
                      className="filter-input"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="no-data">
                      No hay información de registros
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((cliente) => {
                    const fechaCreacion = cliente.fecha_creacion ?? cliente.created_at ?? cliente.createdAt;
                    return (
                      <tr key={cliente.id ?? cliente.clave}>
                        <td>{cliente.clave ?? cliente.id}</td>
                        <td>{cliente.nombre ?? cliente.name}</td>
                        <td>{cliente.asesor ?? '—'}</td>
                        <td>{fechaCreacion ? dayjs(fechaCreacion).format('DD/MM/YYYY') : '—'}</td>
                        <td>
                          <Button 
                            className="btn-edit" 
                            size="small" 
                            onClick={() => navigate(`/clientes/editar/${cliente.id ?? cliente.clave}`)}
                          >
                            Editar
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
    </div>
  );
};

export default ClientesNew;
