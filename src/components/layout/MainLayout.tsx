import { useState, useMemo } from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  DollarOutlined,
  TeamOutlined,
  NotificationOutlined,
  FormOutlined,
  SettingOutlined,
  FileProtectOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { useAuthStore } from '@/store/authStore';
import './MainLayout.css';

const { Sider, Content } = Layout;

export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole, user } = useAuthStore();

  // Menú completo para SISTEMAS
  const sistemasMenuItems = [
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
  ];

  // Menú para SERVICIO AL CLIENTE / ATENCION A CLIENTES
  const servicioClienteMenuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: 'cargos-extras',
      icon: <DollarOutlined />,
      label: 'Cargos Extra',
      children: [
        { key: '/cargos-extras/lista', label: 'Lista de cargos' },
        { key: '/cargos-extras/nuevo', label: 'Nuevo cargo' },
      ],
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
      key: 'encuestas',
      icon: <FormOutlined />,
      label: 'Encuestas de calidad',
      children: [
        { key: '/encuestas/pendientes', label: 'Pendientes de enviar' },
        { key: '/encuestas/realizadas', label: 'Encuestas realizadas' },
      ],
    },
    {
      key: '/asesores',
      icon: <TeamOutlined />,
      label: 'Lista de Asesores',
    },
    {
      key: 'operaciones',
      icon: <SettingOutlined />,
      label: 'Operaciones',
      children: [
        { key: '/operaciones/actualizar-costo-kilo-tc', label: 'Actualizar costo por kilo | TC (TDI)' },
        { key: '/operaciones/actualizar-tc-aumento-maritimo', label: 'Actualizar TC aumento marítimo' },
        { key: '/operaciones/actualizar-tc-costo', label: 'Actualizar TC / costo' },
        { key: '/operaciones/cambio-inst', label: 'Cambio Inst.' },
        { key: '/operaciones/descuentos', label: 'Descuentos' },
        { key: '/operaciones/editar-guia-dhl', label: 'Editar guía DHL' },
        { key: '/operaciones/nbox', label: 'N. B.O.X.' },
        { key: '/operaciones/nbox-maritimo', label: 'N. B.O.X. Marítimo' },
        { key: '/operaciones/operacion-maritima', label: 'Operación Marítima' },
        { key: '/operaciones/reasignar-guia', label: 'Reasignar guía' },
        { key: '/operaciones/reasignar-cliente', label: 'Reasignar cliente' },
        { key: '/operaciones/solo-adm-ctz-pasadas', label: 'SÓLO ADM CTZ PASADAS' },
        { key: '/operaciones/usa-remp', label: 'USA REMP.' },
      ],
    },
    {
      key: 'polizas',
      icon: <FileProtectOutlined />,
      label: 'Pólizas',
      children: [
        { key: '/polizas/lista', label: 'Lista de pólizas' },
        { key: '/polizas/nueva', label: 'Nueva póliza' },
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
  ];

  // Menú para otros roles (sin Usuarios)
  const generalMenuItems = [
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
      key: '/comunicados',
      icon: <NotificationOutlined />,
      label: 'Comunicados',
    },
  ];

  // Seleccionar menú según el rol
  const menuItems = useMemo(() => {
    if (hasRole(['SISTEMAS'])) {
      return sistemasMenuItems;
    } else if (hasRole(['ATENCION A CLIENTES', 'SERVICIO AL CLIENTE'])) {
      return servicioClienteMenuItems;
    }
    return generalMenuItems;
  }, [hasRole, user?.tipo_usuario]);

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
