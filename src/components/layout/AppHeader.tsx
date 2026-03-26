import { useState, useEffect } from 'react';
import axios from '@/api/axios';
import { Layout, Input, Avatar, Dropdown, Badge, Space, Button, Tag, List, Typography } from 'antd';
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
  const { logout, user } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
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
            <AppstoreOutlined className="header-icon" />
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
