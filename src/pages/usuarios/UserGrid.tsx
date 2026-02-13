import { useState, useEffect } from 'react';
import { Button, Dropdown, Menu, Spin, Pagination, Input, Table, Avatar, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  MoreOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import Swal from 'sweetalert2';
import './UserGrid.css';

const { Search } = Input;

interface User {
  token: string;
  name: string;
  mail: string;
  phone: string;
  tipo_usuario: string;
  file?: string;
  micapitan: string | null;
  ubicacion: string | null;
}

export const UserGrid = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

  useEffect(() => {
    filterUsers();
  }, [searchText, users]);

  // Ajustar pageSize al cambiar de vista
  useEffect(() => {
    if (viewMode === 'grid') {
      setPageSize(9);
    } else {
      setPageSize(10);
    }
    setCurrentPage(1);
  }, [viewMode]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { items, total: totalItems } = await userService.list('', 1, 1000);
      setUsers(items);
      setTotal(totalItems || items.length);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      
      const errorMessage = (error as any)?.response?.data?.message || 
                           (error as any)?.response?.data?.error || 
                           (error as any)?.message || 
                           'No se pudieron cargar los usuarios';
      
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

  const filterUsers = () => {
    if (!searchText.trim()) {
      setFilteredUsers(users);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = users.filter((user) => {
      const nameMatch = user.name?.toLowerCase().includes(searchLower);
      const emailMatch = user.mail?.toLowerCase().includes(searchLower);
      const phoneMatch = user.phone?.toLowerCase().includes(searchLower);
      const typeMatch = user.tipo_usuario?.toLowerCase().includes(searchLower);
      
      return nameMatch || emailMatch || phoneMatch || typeMatch;
    });
    
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleViewProfile = (user: User) => {
    // Navegar al perfil del usuario
    navigate(`/usuarios/perfil/${user.token}`);
  };

  const handleMessage = (user: User) => {
    // Implementar funcionalidad de mensaje
    Swal.fire({
      icon: 'info',
      title: 'Mensaje',
      text: `Enviar mensaje a ${user.name}`,
      showConfirmButton: true,
    });
  };

  const handleEdit = (user: User) => {
    navigate(`/usuarios/editar/${user.token}`);
  };

  const handleDelete = async (user: User) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al usuario ${user.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userService.delete(user.token);
          
          await fetchUsers();
          
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El usuario ha sido eliminado',
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 
                               error?.response?.data?.error || 
                               error?.message || 
                               'No se pudo eliminar el usuario';
          
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
            showConfirmButton: true,
          });
        }
      }
    });
  };

  const getMenu = (user: User) => (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => handleViewProfile(user)}>
        Ver perfil
      </Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(user)}>
        Editar
      </Menu.Item>
      {viewMode === 'list' && (
        <>
          <Menu.Item key="email" icon={<MailOutlined />}>
            <a href={`mailto:${user.mail}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              Enviar correo
            </a>
          </Menu.Item>
          <Menu.Item key="phone" icon={<PhoneOutlined />}>
            <a href={`tel:${user.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              Llamar
            </a>
          </Menu.Item>
        </>
      )}
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDelete(user)}>
        Eliminar
      </Menu.Item>
    </Menu>
  );

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderUserCard = (user: User) => (
    <div key={user.token} className="user-card">
      <div className="user-card-menu">
        <Dropdown overlay={getMenu(user)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      </div>

      <div className="user-avatar-wrapper">
        {user.file ? (
          <img src={user.file} alt={user.name} className="user-avatar" />
        ) : (
          <div className="user-avatar-placeholder">
            {getInitials(user.name)}
          </div>
        )}
      </div>

      <div className="user-info">
        <h3 className="user-name">{user.name}</h3>
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
            TIPO DE USUARIO: {user.tipo_usuario || 'Usuario'}
          </span>
          {user.micapitan && (
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
              TEAM LEADER: {user.micapitan}
            </span>
          )}
          {user.ubicacion && (
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
              {user.ubicacion}
            </span>
          )}
        </div>
      </div>

      <div className="user-card-actions">
        <Button 
          href={`mailto:${user.mail}`} 
          icon={<MailOutlined />}
        >
          Enviar correo
        </Button>
        <Button 
          href={`tel:${user.phone}`} 
          icon={<PhoneOutlined />}
        >
          Llamar
        </Button>
      </div>
    </div>
  );

  const columns: ColumnsType<User> = [
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
      title: 'Action',
      key: 'action',
      width: 100,
      align: 'center' as const,
      render: (_, record) => (
        <Dropdown overlay={getMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="user-grid-container">
      <div className="user-grid-header">
        <div className="user-grid-title">
          <h1>Lista de usuarios</h1>
          <span className="user-grid-count">({searchText ? filteredUsers.length : total})</span>
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

          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/usuarios/nuevo')}
            style={{ backgroundColor: '#5f5af6', borderColor: '#5f5af6' }}
          >
            Nuevo Usuario
          </Button>
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
            placeholder="Buscar usuarios..."
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
                  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
                  return paginatedUsers.map(renderUserCard);
                })()}
              </div>

              {(searchText ? filteredUsers.length : total) > 0 && (
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
                      const actualTotal = searchText ? filteredUsers.length : total;
                      const start = (currentPage - 1) * pageSize + 1;
                      const end = Math.min(currentPage * pageSize, actualTotal);
                      return `${start}-${end} de ${actualTotal}`;
                    })()}
                  </div>

                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={searchText ? filteredUsers.length : total}
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
              dataSource={filteredUsers}
              rowKey="token"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: searchText ? filteredUsers.length : total,
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

export default UserGrid;
