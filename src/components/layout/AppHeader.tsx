import { useState } from 'react';
import { Layout, Input, Avatar, Dropdown, Badge, Space } from 'antd';
import {
  SearchOutlined,
  AppstoreOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import './AppHeader.css';

const { Header } = Layout;

export const AppHeader = () => {
  const [searchValue, setSearchValue] = useState('');
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
          <div className="banner-scroll">
            <span className="banner-item">🏠 PRECIO DE CONTENEDOR: $29,000.00 USD</span>
            <span className="banner-item">💵 TCO: $18.00 MXN</span>
            <span className="banner-item">📦 TDI KILO: $15.40 USD</span>
            <span className="banner-item">🚀 ENVÍO DE DÓLARES: $18.06</span>
          </div>
          <div className="banner-scroll">
            <span className="banner-item">🏠 PRECIO DE CONTENEDOR: $29,000.00 USD</span>
            <span className="banner-item">💵 TCO: $18.00 MXN</span>
            <span className="banner-item">📦 TDI KILO: $15.40 USD</span>
            <span className="banner-item">🚀 ENVÍO DE DÓLARES: $18.06</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppHeader;
