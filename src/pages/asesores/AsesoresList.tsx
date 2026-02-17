import { useState, useEffect } from 'react';
import { Button, Spin, Pagination, Input, Table, Avatar, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  UnorderedListOutlined,
  AppstoreOutlined,
  SearchOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import userService from '../../services/userService';
import Swal from 'sweetalert2';
import '../usuarios/UserGrid.css';

const { Search } = Input;

interface Asesor {
  token: string;
  name: string;
  mail: string;
  phone: string;
  tipo_usuario: string;
  file?: string;
  micapitan: string | null;
  ubicacion: string | null;
}

export const AsesoresList = () => {
  const [loading, setLoading] = useState(false);
  const [asesores, setAsesores] = useState<Asesor[]>([]);
  const [filteredAsesores, setFilteredAsesores] = useState<Asesor[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchAsesores();
  }, []);

  useEffect(() => {
    filterAsesores();
  }, [searchText, asesores]);

  // Ajustar pageSize al cambiar de vista
  useEffect(() => {
    if (viewMode === 'grid') {
      setPageSize(9);
    } else {
      setPageSize(10);
    }
    setCurrentPage(1);
  }, [viewMode]);

  const fetchAsesores = async () => {
    try {
      setLoading(true);
      const items = await userService.listAdvisors();
      setAsesores(items);
      setTotal(items.length);
    } catch (error) {
      console.error('Error al cargar asesores:', error);
      
      const errorMessage = (error as any)?.response?.data?.message || 
                           (error as any)?.response?.data?.error || 
                           (error as any)?.message || 
                           'No se pudieron cargar los asesores';
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        showConfirmButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAsesores = () => {
    if (!searchText.trim()) {
      setFilteredAsesores(asesores);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = asesores.filter((asesor) => {
      const nameMatch = asesor.name?.toLowerCase().includes(searchLower);
      const emailMatch = asesor.mail?.toLowerCase().includes(searchLower);
      const phoneMatch = asesor.phone?.toLowerCase().includes(searchLower);
      const typeMatch = asesor.tipo_usuario?.toLowerCase().includes(searchLower);
      
      return nameMatch || emailMatch || phoneMatch || typeMatch;
    });
    
    setFilteredAsesores(filtered);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderAsesorCard = (asesor: Asesor) => (
    <div key={asesor.token} className="user-card">
      <div className="user-avatar-wrapper">
        {asesor.file ? (
          <img src={asesor.file} alt={asesor.name} className="user-avatar" />
        ) : (
          <div className="user-avatar-placeholder">
            {getInitials(asesor.name)}
          </div>
        )}
      </div>

      <div className="user-info">
        <h3 className="user-name">{asesor.name}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <span style={{ 
            display: 'inline-block',
            padding: '2px 12px',
            background: '#10b981',
            color: 'white',
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 4,
            textTransform: 'uppercase'
          }}>
            TIPO DE USUARIO: {asesor.tipo_usuario || 'Usuario'}
          </span>
          {asesor.micapitan && (
            <span style={{ 
              display: 'inline-block',
              padding: '2px 12px',
              background: '#3b82f6',
              color: 'white',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 4,
              textTransform: 'uppercase'
            }}>
              TEAM LEADER: {asesor.micapitan}
            </span>
          )}
          {asesor.ubicacion && (
            <span style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 12px',
              background: '#f59e0b',
              color: 'white',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 4,
              textTransform: 'uppercase'
            }}>
              <img src="https://img.icons8.com/color/24/place-marker--v1.png" alt="location" style={{ width: 16, height: 16 }} />
              {asesor.ubicacion}
            </span>
          )}
        </div>
      </div>

      <div className="user-card-actions">
        <Button 
          href={`mailto:${asesor.mail}`} 
          icon={<MailOutlined />}
        >
          Enviar correo
        </Button>
        <Button 
          href={`tel:${asesor.phone}`} 
          icon={<PhoneOutlined />}
        >
          Llamar
        </Button>
      </div>
    </div>
  );

  const columns: ColumnsType<Asesor> = [
    {
      title: 'Name',
      key: 'name',
      width: 250,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {record.file ? (
            <Avatar size={40} src={record.file} />
          ) : (
            <Avatar size={40} style={{ backgroundColor: '#5f5af6' }}>
              {getInitials(record.name)}
            </Avatar>
          )}
          <span style={{ fontWeight: 500 }}>{record.name}</span>
        </div>
      ),
    },
    {
      title: 'Position',
      key: 'tipo_usuario',
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ 
            display: 'inline-block',
            padding: '2px 12px',
            background: '#10b981',
            color: 'white',
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 4,
            textTransform: 'uppercase',
            width: 'fit-content'
          }}>
            TIPO DE USUARIO: {record.tipo_usuario || 'Usuario'}
          </span>
          {record.micapitan && (
            <span style={{ 
              display: 'inline-block',
              padding: '2px 12px',
              background: '#3b82f6',
              color: 'white',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 4,
              textTransform: 'uppercase',
              width: 'fit-content'
            }}>
              TEAM LEADER: {record.micapitan}
            </span>
          )}
          {record.ubicacion && (
            <span style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 12px',
              background: '#f59e0b',
              color: 'white',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 4,
              textTransform: 'uppercase',
              width: 'fit-content'
            }}>
              <img src="https://img.icons8.com/color/24/place-marker--v1.png" alt="location" style={{ width: 16, height: 16 }} />
              {record.ubicacion}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Email',
      key: 'mail',
      dataIndex: 'mail',
    },
    {
      title: 'Phone',
      key: 'phone',
      dataIndex: 'phone',
    },
  ];

  return (
    <div className="user-grid-container">
      <div className="user-grid-header">
        <div className="user-grid-title">
          <h1>Lista de asesores</h1>
          <span className="user-grid-count">({searchText ? filteredAsesores.length : total})</span>
        </div>

        <div className="user-grid-actions">
          <div className="view-toggle">
            <Button
              icon={<UnorderedListOutlined />}
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            />
            <Button
              icon={<AppstoreOutlined />}
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            />
          </div>
        </div>
      </div>

      {viewMode === 'list' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Show</span>
            <Select
              value={pageSize}
              onChange={(value) => {
                setPageSize(value);
                setCurrentPage(1);
              }}
              style={{ width: 80 }}
            >
              <Select.Option value={10}>10</Select.Option>
              <Select.Option value={25}>25</Select.Option>
              <Select.Option value={50}>50</Select.Option>
              <Select.Option value={100}>100</Select.Option>
            </Select>
            <span>entries</span>
          </div>

          <Search
            placeholder="Search:"
            allowClear
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 250 }}
          />
        </div>
      )}

      {viewMode === 'grid' && (
        <div style={{ marginBottom: 24 }}>
          <Search
            placeholder="Buscar asesores..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
            enterButton={<SearchOutlined />}
          />
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <>
              <div className="user-cards-container">
                {(() => {
                  const startIndex = (currentPage - 1) * pageSize;
                  const endIndex = startIndex + pageSize;
                  const paginatedAsesores = filteredAsesores.slice(startIndex, endIndex);
                  return paginatedAsesores.map(renderAsesorCard);
                })()}
              </div>

              {(searchText ? filteredAsesores.length : total) > 0 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: 24,
                  padding: '12px 0',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <div style={{ fontSize: 14, color: '#666' }}>
                    {(() => {
                      const actualTotal = searchText ? filteredAsesores.length : total;
                      const start = (currentPage - 1) * pageSize + 1;
                      const end = Math.min(currentPage * pageSize, actualTotal);
                      return `${start}-${end} de ${actualTotal}`;
                    })()}
                  </div>

                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={searchText ? filteredAsesores.length : total}
                    showSizeChanger={false}
                    onChange={(page) => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Select
                      value={pageSize}
                      onChange={(value) => {
                        setPageSize(value);
                        setCurrentPage(1);
                      }}
                      style={{ width: 70 }}
                      dropdownStyle={{ minWidth: 100 }}
                    >
                      <Select.Option value={9}>9</Select.Option>
                      <Select.Option value={18}>18</Select.Option>
                      <Select.Option value={27}>27</Select.Option>
                      <Select.Option value={36}>36</Select.Option>
                    </Select>
                    <span style={{ fontSize: 14, color: '#666' }}>/ page</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredAsesores}
              rowKey="token"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: searchText ? filteredAsesores.length : total,
                showSizeChanger: false,
                showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size || 10);
                },
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AsesoresList;
