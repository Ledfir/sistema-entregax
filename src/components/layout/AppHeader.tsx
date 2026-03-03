import { useState, useEffect } from 'react';
import axios from '@/api/axios';
import { Layout, Input, Avatar, Dropdown, Badge, Space, Button } from 'antd';
import {
  SearchOutlined,
  AppstoreOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import './AppHeader.css';

const { Header } = Layout;

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

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

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
            <Badge count={5} size="small">
              <BellOutlined className="header-icon" />
            </Badge>
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
