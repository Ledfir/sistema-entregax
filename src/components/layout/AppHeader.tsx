import { useState, useEffect } from 'react';
import axios from '@/api/axios';
import { Layout, Input, Avatar, Dropdown, Badge, Space, Button, Tag, List, Typography, Drawer, Row, Col, message, Spin } from 'antd';
import {
  SearchOutlined,
  AppstoreOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
  MenuOutlined,
  BulbOutlined,
  CustomerServiceOutlined,
  PlusCircleOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/context/ThemeContext';
import './AppHeader.css';

const { Header } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  onMenuClick?: () => void;
}

interface MarqueeData {
  generico: string;
  tc: string;
  contenedor: string;
  dolar: string;
}

export const AppHeader = ({ onMenuClick }: AppHeaderProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [marqueeData, setMarqueeData] = useState<MarqueeData | null>(null);
  const [rolesDrawerOpen, setRolesDrawerOpen] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);

  const fetchMarqueeData = async () => {
    try {
      const response = await axios.get('/get-data-marquee');
      if (response.data?.status === 'success' && response.data?.data) {
        setMarqueeData(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener datos de la marquesina:', error);
    }
  };

  useEffect(() => {
    fetchMarqueeData();
    const interval = setInterval(fetchMarqueeData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  const navigate = useNavigate();
  const { logout, user, setUser } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get('/users/list-type');
      if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
        setRoles(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching roles list:', err);
    }
  };

  const openRolesDrawer = () => {
    setRolesDrawerOpen(true);
    // fetch when opening to keep data fresh
    fetchRoles();
  };

  const closeRolesDrawer = () => setRolesDrawerOpen(false);

  const [rolesLoadingId, setRolesLoadingId] = useState<number | null>(null);

  const changeRole = async (role: any) => {
    if (!user || !user.id) {
      message.error('No hay sesión activa');
      return;
    }
    setRolesLoadingId(role.id);
    message.loading({ content: 'Cambiando rol...', key: 'changeRole', duration: 0 });
    try {
      const res = await axios.post('/users/change-rol', {
        user_id: user.id,
        role_id: role.id,
      });

      if (res.data?.status === 'success') {
        // Mostrar mensaje del servidor
        message.success({ content: res.data.message || 'Rol actualizado', key: 'changeRole' });

        // Mapear la respuesta de la API a la forma que espera el store
        const apiUser = res.data.data || {};
        const mappedUser = {
          // mantener campos previos y sobreescribir con los que trae la API
          ...(user as any),
          id: apiUser.user_id || apiUser.id || (user as any).id,
          user_id: apiUser.user_id || apiUser.id || (user as any).user_id || (user as any).id,
          name: apiUser.name || apiUser.nombre || (user as any).name,
          // algunas APIs usan 'mail' en lugar de 'email'
          email: apiUser.mail || apiUser.email || (user as any).email,
          mail: apiUser.mail || apiUser.email || (user as any).email,
          profile_image: apiUser.profile_image || (user as any).profile_image,
          login_time: apiUser.login_time || (user as any).login_time,
          // 'type' viene como nombre de rol; lo usamos también como 'tipo_usuario'
          type: apiUser.type || (user as any).type,
          tipo_usuario: apiUser.type || (user as any).tipo_usuario,
          token: res.data.token || (user as any).token,
        } as any;

        setUser(mappedUser as any);

        // Además sincronizamos manualmente el localStorage que usa zustand-persist
        try {
          const key = 'auth-storage';
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            // compat con diferentes formas de persistencia
            if (parsed && parsed.state) {
              parsed.state.user = mappedUser;
              parsed.state.isAuthenticated = true;
            } else {
              parsed.user = mappedUser;
              parsed.isAuthenticated = true;
            }
            localStorage.setItem(key, JSON.stringify(parsed));
            // disparar evento storage manualmente en la misma pestaña para listeners
            window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(parsed) }));
          }
        } catch (e) {
          console.warn('No se pudo sincronizar localStorage auth-storage', e);
        }
        // Cerrar drawer
        setRolesDrawerOpen(false);
      } else {
        message.error({ content: res.data?.message || 'Error al cambiar rol', key: 'changeRole' });
      }
    } catch (err: any) {
      console.error(err);
      // Si la API respondió con JSON de error, mostrar ese mensaje
      const serverMessage = err?.response?.data?.message || err?.response?.data?.error;
      if (serverMessage) {
        message.error({ content: serverMessage, key: 'changeRole' });
      } else {
        message.error({ content: 'Error de red al cambiar rol', key: 'changeRole' });
      }
    } finally {
      setRolesLoadingId(null);
    }
  };

  // Notificaciones de ejemplo
  const notificaciones = [
    {
      id: 1,
      avatar: <Avatar style={{ backgroundColor: '#f56a00' }} icon={<UserOutlined />} />,
      titulo: 'James Lemire',
      descripcion: 'It will seem like simplified English.',
      tiempo: '1 hour ago',
    },
    {
      id: 2,
      avatar: <Avatar style={{ backgroundColor: '#7265e6' }} icon={<ShoppingCartOutlined />} />,
      titulo: 'Your order is placed',
      descripcion: 'If several languages coalesce the grammar',
      tiempo: '3 min ago',
    },
    {
      id: 3,
      avatar: <Avatar style={{ backgroundColor: '#00a65a' }} icon={<TruckOutlined />} />,
      titulo: 'Your item is shipped',
      descripcion: 'If several languages coalesce the grammar',
      tiempo: '5 min ago',
    },
  ];

  const notificationsDropdown = (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <Text strong>Notifications</Text>
        <Button type="link" size="small" style={{ padding: 0 }}>
          Unread (3)
        </Button>
      </div>
      <List
        className="notifications-list"
        dataSource={notificaciones}
        renderItem={(item) => (
          <List.Item className="notification-item">
            <List.Item.Meta
              avatar={item.avatar}
              title={
                <div>
                  <Text strong>{item.titulo}</Text>
                </div>
              }
              description={
                <div>
                  <Text type="secondary" className="notification-description">
                    {item.descripcion}
                  </Text>
                  <div className="notification-time">
                    <ClockCircleOutlined style={{ fontSize: 11, marginRight: 4 }} />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {item.tiempo}
                    </Text>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
      <div className="notifications-footer">
        <Button type="link" icon={<BellOutlined />} style={{ width: '100%' }}>
          View More..
        </Button>
      </div>
    </div>
  );

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Mi Perfil',
      onClick: () => navigate('/perfil'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configuración',
      onClick: () => navigate('/configuracion'),
    },
    {
      key: 'tickets',
      icon: <CustomerServiceOutlined />,
      label: 'Tickets',
      children: [
        {
          key: 'tickets-create',
          icon: <PlusCircleOutlined />,
          label: 'Crear ticket',
          onClick: () => navigate('/tickets/crear'),
        },
        {
          key: 'tickets-my',
          icon: <FileTextOutlined />,
          label: 'Mis tickets',
          onClick: () => navigate('/tickets/mis-tickets'),
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: 'darkmode',
      icon: <BulbOutlined />,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span>Modo Oscuro</span>
          <Tag color={isDarkMode ? 'success' : 'error'} style={{ marginLeft: '8px' }}>
            {isDarkMode ? 'ON' : 'OFF'}
          </Tag>
        </div>
      ),
      onClick: toggleDarkMode,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: handleLogout,
    },
  ];

  return (
    <>
      <Header className="app-header">
        {onMenuClick && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={onMenuClick}
            className="mobile-menu-btn"
          />
        )}
        <div className="header-left">
          <Input
            placeholder="Buscar..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="header-search"
            size="large"
          />
        </div>
        <div className="header-right">
          <Space size="middle">
            <AppstoreOutlined className="header-icon" onClick={openRolesDrawer} />
            <Dropdown 
              dropdownRender={() => notificationsDropdown}
              placement="bottomRight" 
              arrow
              trigger={['click']}
            >
              <Badge count={5} size="small">
                <BellOutlined className="header-icon" style={{ cursor: 'pointer' }} />
              </Badge>
            </Dropdown>
            <SettingOutlined className="header-icon" />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div className="user-dropdown">
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  src={(user as any)?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Usuario')}&background=f39915&color=fff`}
                  className="user-avatar"
                />
                <span className="user-name">{user?.name || 'Usuario'}</span>
              </div>
            </Dropdown>
          </Space>
        </div>
      </Header>
      <Drawer
        title="Seleccionar área"
        placement="right"
        onClose={closeRolesDrawer}
        open={rolesDrawerOpen}
        width={360}
      >
        <div style={{ padding: 8 }}>
          <Row className="roles-grid" gutter={[24, 24]}>
            {roles.length === 0 && (
              <Col span={24} className="text-center">
                <span style={{ color: '#888' }}>Cargando...</span>
              </Col>
            )}
            {roles.map((r) => {
              // intentar extraer src de url_image si viene como <img ... src="..." />
              let src;
              try {
                const m = (r.url_image || '').toString().match(/src=\"([^\"]+)\"/);
                src = m ? m[1] : undefined;
              } catch (e) {
                src = undefined;
              }
              return (
                <Col key={r.id} span={8} style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '100%', maxWidth: 120, padding: 6 }}>
                    <div
                      role="button"
                      className="role-item-btn"
                      onClick={() => changeRole(r)}
                    >
                      <Avatar size={56} src={src} icon={!src ? <UserOutlined /> : undefined} />
                      <div className="role-item-name">{r.name}</div>
                      {rolesLoadingId === r.id && (
                        <div style={{ position: 'absolute', top: 8, right: 8 }}>
                          <Spin size="small" />
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      </Drawer>
      <div className="info-banner">
        <div className="banner-content">
          {[0, 1].map((i) => (
            <div className="banner-scroll" key={i}>
              <span className="banner-item">🏠 PRECIO DE CONTENEDOR: ${marqueeData ? Number(marqueeData.contenedor).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'} USD</span>
              <span className="banner-item">💵 TCO: ${marqueeData ? Number(marqueeData.tc).toFixed(2) : '---'} MXN</span>
              <span className="banner-item">📦 TDI KILO: ${marqueeData ? Number(marqueeData.generico).toFixed(2) : '---'} USD</span>
              <span className="banner-item">🚀 ENVÍO DE DÓLARES: ${marqueeData ? Number(marqueeData.dolar).toFixed(2) : '---'}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AppHeader;
