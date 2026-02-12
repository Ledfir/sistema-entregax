import { useState, useEffect } from 'react';
import { Button, Dropdown, Menu, Spin, Pagination, Input, Table, Avatar, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  MoreOutlined, 
  UserOutlined, 
  MessageOutlined, 
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
  avatar?: string;
}

export const UserGrid = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, searchText]);

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
      const { items, total: totalItems } = await userService.list(searchText, currentPage, pageSize);
      setUsers(items);
      setTotal(totalItems || 0);
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
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="user-avatar" />
        ) : (
          <div className="user-avatar-placeholder">
            {getInitials(user.name)}
          </div>
        )}
      </div>

      <div className="user-info">
        <h3 className="user-name">{user.name}</h3>
        <p className="user-role">{user.tipo_usuario || 'Usuario'}</p>
      </div>

      <div className="user-card-actions">
        <Button onClick={() => handleViewProfile(user)}>
          Profile
        </Button>
        <Button onClick={() => handleMessage(user)} icon={<MessageOutlined />}>
          Message
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
          {record.avatar ? (
            <Avatar size={40} src={record.avatar} />
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
      dataIndex: 'tipo_usuario',
      render: (tipo_usuario) => tipo_usuario || 'Usuario',
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
          <h1>Contact List</h1>
          <span className="user-grid-count">({total})</span>
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
            Add New
          </Button>

          <Dropdown overlay={<Menu />} trigger={['click']}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
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
                  const paginatedUsers = users.slice(startIndex, endIndex);
                  return paginatedUsers.map(renderUserCard);
                })()}
              </div>

              {total > 0 && (
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
                      const start = (currentPage - 1) * pageSize + 1;
                      const end = Math.min(currentPage * pageSize, total);
                      return `${start}-${end} de ${total}`;
                    })()}
                  </div>

                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={total}
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
              dataSource={users}
              rowKey="token"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
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
