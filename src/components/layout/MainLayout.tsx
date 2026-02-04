import { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  DollarOutlined,
  TeamOutlined,
  NotificationOutlined,
  ShopOutlined,
  CustomerServiceOutlined,
  BellOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import './MainLayout.css';

const { Sider, Content } = Layout;

export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: 'Inicio',
    },
    {
      key: 'clientes',
      icon: <UserOutlined />,
      label: 'Clientes',
      children: [
        { key: '/clientes/lista', label: 'Lista de clientes' },
        { key: '/clientes/nuevo', label: 'Nuevo cliente' },
      ],
    },
    {
      key: 'cargos-extras',
      icon: <DollarOutlined />,
      label: 'Cargos Extras',
      children: [
        { key: '/cargos-extras/lista', label: 'Lista de cargos' },
        { key: '/cargos-extras/nuevo', label: 'Nuevo cargo' },
      ],
    },
    {
      key: 'usuarios',
      icon: <TeamOutlined />,
      label: 'Usuarios',
      children: [
        { key: '/usuarios/lista', label: 'Lista de usuarios' },
        { key: '/usuarios/nuevo', label: 'Nuevo usuario' },
      ],
    },
    {
      key: '/comunicados',
      icon: <NotificationOutlined />,
      label: 'Comunicados',
    },
    {
      key: 'paqueterias',
      icon: <ShopOutlined />,
      label: 'Paqueterías',
      children: [
        { key: '/paqueterias/lista', label: 'Lista de paqueterías' },
        { key: '/paqueterias/nueva', label: 'Nueva paquetería' },
      ],
    },
    {
      key: 'tickets',
      icon: <CustomerServiceOutlined />,
      label: 'Tickets',
      children: [
        { key: '/tickets/lista', label: 'Lista de tickets' },
        { key: '/tickets/nuevo', label: 'Nuevo ticket' },
      ],
    },
    {
      key: 'noticias',
      icon: <BellOutlined />,
      label: 'Noticias',
      children: [
        { key: '/noticias/lista', label: 'Lista de noticias' },
        { key: '/noticias/nueva', label: 'Nueva noticia' },
      ],
    },
    {
      key: 'proveedores',
      icon: <FileTextOutlined />,
      label: 'Proveedores',
      children: [
        { key: '/proveedores/lista', label: 'Lista de proveedores' },
        { key: '/proveedores/nuevo', label: 'Nuevo proveedor' },
      ],
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };
  // Decidir qué item marcar como seleccionado en el sidebar
  const pathname = location.pathname || '';
  const selectedKey = (() => {
    // Rutas específicas dentro de /clientes deben mapear a Lista de clientes
    if (pathname === '/clientes/nuevo') return '/clientes/nuevo';
    if (pathname.startsWith('/clientes')) return '/clientes/lista';
    // por defecto usa la ruta completa
    return pathname;
  })();

  return (
    <Layout className="main-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        className="main-sider"
        theme="light"
      >
        <div className="logo-section">
          <img
            src={collapsed 
              ? "https://www.sistemaentregax.com/public/images/favicon.png"
              : "https://www.sistemaentregax.com/assets/img/logo.png"
            }
            alt="EntregaX"
            className={collapsed ? "sidebar-logo-small" : "sidebar-logo"}
          />
        </div>
        <div className="menu-label">Menú</div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          className="sidebar-menu"
        />
      </Sider>
      <Layout>
        <AppHeader />
        <Content className="main-content">
          <Outlet />
        </Content>
        <div className="main-footer">
          <span>2026 © Entregax Paquetería.</span>
          <span className="footer-link">
            Creado por <a href="https://appsync.mx" target="_blank" rel="noreferrer">Appsync Agencia Digital</a>
          </span>
        </div>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
