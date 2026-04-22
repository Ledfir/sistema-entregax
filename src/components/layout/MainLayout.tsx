import { useState, useMemo, useEffect } from 'react';
import { Layout, Menu, notification } from 'antd';
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
  PercentageOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  GlobalOutlined,
  WalletOutlined,
  PayCircleOutlined,
  SwapOutlined,
  SolutionOutlined,
  ShopOutlined,
  CalculatorOutlined,
  ControlOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  ContainerOutlined,
  EditOutlined,
  BarChartOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { useAuthStore } from '@/store/authStore';
import { ActivarDesactivarPagosModal } from '@/components/common';
import { pagosService } from '@/services/pagosService';
import './MainLayout.css';

const { Sider, Content } = Layout;

export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [modalPagosOpen, setModalPagosOpen] = useState(false);
  const [estadoPagos, setEstadoPagos] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      notification.error({
        key: 'network-status',
        message: 'Sin conexión a internet',
        description: 'Se perdió la conexión. Verifica tu red para continuar navegando.',
        duration: 0,
        placement: 'topRight',
      });
    };

    const handleOnline = () => {
      setIsOnline(true);
      notification.destroy('network-status');
      notification.success({
        key: 'network-restored',
        message: 'Conexión restablecida',
        description: 'La conexión a internet se ha recuperado.',
        duration: 4,
        placement: 'topRight',
      });
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);
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
        { key: '/operaciones/descuentos', label: 'Descuentos' },
        { key: '/operaciones/editar-guia-dhl', label: 'Editar guía DHL' },
        { key: '/operaciones/nbox', label: 'N. B.O.X.' },
        { key: '/operaciones/nbox-maritimo', label: 'N. B.O.X. Marítimo' },
        { key: '/operaciones/operacion-maritima', label: 'Operación Marítima' },
        { key: '/operaciones/reasignar-guia', label: 'Reasignar guía' },
        { key: '/operaciones/reasignar-cliente', label: 'Reasignar cliente' },
        { key: '/operaciones/usa-remp', label: 'USA REMP.' },
        
      ],
    },
    {
      key: 'cotizaciones',
      icon: <FileTextOutlined />,
      label: 'Cotizaciones',
      children: [
        { key: '/cotizaciones/instrucciones', label: 'Instrucciones' },
      ],
    },
    {
      key: 'polizas',
      icon: <FileProtectOutlined />,
      label: 'Pólizas',
      children: [
        { key: '/polizas/nuevas', label: 'Nuevas pólizas por aprobar' },
        { key: '/polizas/pagadas', label: 'Pólizas pagadas pendientes de aprobación' },
      ],
    },
    {
      key: 'tickets',
      icon: <CustomerServiceOutlined />,
      label: 'Tickets',
      children: [
        { key: '/tickets/reporte-estadistico', label: 'Reporte estadístico' },
        { key: '/tickets/activos', label: 'Tickets activos' },
        { key: '/tickets/archivados', label: 'Tickets archivados' },
      ],
    },
  ];

  // Menú para ASESOR
  const asesorMenuItems = [
    { key: '/dashboard', icon: <HomeOutlined />, label: 'Home' },
    { key: 'cargos-extras', icon: <DollarOutlined />, label: 'Cargos extras', children: [ { key: '/cargos-extras/historial', label: 'Historial' }, { key: '/cargos-extras/pendientes', label: 'Pendientes de pago' } ] },
    { key: '/clientes/mis-clientes', icon: <UserOutlined />, label: 'Clientes' },
    { key: '/comisiones', icon: <PercentageOutlined />, label: 'Comisiones' },
    { key: 'cotizaciones', icon: <FileTextOutlined />, label: 'Cotizaciones', children: [
      { key: '/cotizaciones/lista', label: 'Cotizaciones' },
      { key: '/cotizaciones/instrucciones', label: 'Instrucciones' },
      { key: '/cotizaciones/pendientes', label: 'Pendientes de cotizar' },
      { key: '/cotizaciones/guias-archivadas', label: 'Guias archivadas' },
      { key: '/cotizaciones/validar-tdi-dhl', label: 'Validar TDI - DHL' },
    ] },
    { key: 'dolares', icon: <DollarOutlined />, label: 'Dolares', children: [
      { key: 'dolares-solicitud', label: 'Solicitud de envío', children: [
        { key: '/dolares/solicitud/con-factura', label: 'Con factura' },
        { key: '/dolares/solicitud/sin-factura', label: 'Sin factura' },
      ]},
      { key: '/dolares/mis-envios', label: 'Mis envíos' },
      { key: '/dolares/envios-archivados', label: 'Envíos archivados' },
      { key: '/dolares/catalogo-servicios', label: 'Catálogo de servicios' },
    ] },
    { key: '/faqs', icon: <QuestionCircleOutlined />, label: 'FAQs' },
    { key: 'maritimos', icon: <GlobalOutlined />, label: 'Maritimos', children: [
      { key: '/maritimos/cotizaciones', label: 'Cotizaciones' },
      { key: '/maritimos/panel-pl-instrucciones', label: 'Panel PL instrucciones' },
    ] },
    { key: 'monedero', icon: <WalletOutlined />, label: 'Monedero', children: [
      { key: '/monedero/historial', label: 'Historial' },
      { key: '/monedero/saldo', label: 'Saldo' },
      { key: '/monedero/subir-pagos', label: 'Subir pagos' },
    ] },
    { key: 'polizas', icon: <FileProtectOutlined />, label: 'Polizas', children: [ 
      { key: '/polizas/crear', label: 'Generar póliza' }, 
      { key: '/polizas/mis-polizas', label: 'Mis pólizas' } 
    ] },
    { key: 'rmbs', icon: <PayCircleOutlined />, label: 'RMBs', children: [
      { key: 'rmbs-solicitud', label: 'Solicitud de envio', children: [
        { key: '/rmbs/solicitud/con-factura', label: 'Con factura' },
        { key: '/rmbs/solicitud/sin-factura', label: 'Sin factura' },
      ]},
      { key: '/rmbs/mis-envios', label: 'Mis envíos' },
      { key: '/rmbs/envios-archivados', label: 'Envíos archivados' },
      { key: '/rmbs/catalogo-servicios', label: 'Catálogo de servicios' },
    ] },
    { key: '/usdts', icon: <SwapOutlined />, label: 'USDTs', children: [
      { key: 'usdts-solicitud', label: 'Solicitud de envio', children: [
        { key: '/usdts/solicitud/con-factura', label: 'Con factura' },
        { key: '/usdts/solicitud/sin-factura', label: 'Sin factura' },
      ]},
      { key: '/usdts/mis-envios', label: 'Mis envíos' },
      { key: '/usdts/envios-archivados', label: 'Envíos archivados' },
      { key: '/usdts/catalogo-servicios', label: 'Catálogo de servicios' },
    ] },
  ];

  // Menú para OPERACION MARITIMA
  const operacionMaritimaMenuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: '/maritima/clientes',
      icon: <UserOutlined />,
      label: 'Clientes',
    },
    {
      key: '/maritima/consignatarios',
      icon: <SolutionOutlined />,
      label: 'Consignatarios',
    },
    {
      key: '/maritima/cotizaciones',
      icon: <FileTextOutlined />,
      label: 'Cotizaciones Maritimas',
    },
    {
      key: '/maritima/control-gastos',
      icon: <CalculatorOutlined />,
      label: 'Control de gastos',
    },
    {
      key: '/maritima/navieras',
      icon: <ShopOutlined />,
      label: 'Navieras',
    },
    {
      key: '/maritima/pctl',
      icon: <ControlOutlined />,
      label: 'PCTL',
    },
    {
      key: '/maritima/pls-pendientes',
      icon: <ClockCircleOutlined />,
      label: 'PLs Pendientes',
    },
    {
      key: '/maritima/subir-week',
      icon: <CloudUploadOutlined />,
      label: 'Subir nuevo Week',
    },
    {
      key: '/maritima/dhl',
      icon: <RocketOutlined />,
      label: 'DHL',
    },
    {
      key: '/maritima/validar-manifiesto',
      icon: <SafetyCertificateOutlined />,
      label: 'Validar Manifiesto',
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

  // Menú para el rol ADMIN
  const adminMenuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: 'bancos',
      icon: <BankOutlined />,
      label: 'Bancos',
      children: [
        { 
          key: 'estado-cuenta',
          label: 'Estado cuenta',
          children: [
            { key: '/admin/bancos/estado-cuenta/ctz-lsd', label: 'CTZ LSD' },
            { key: '/admin/bancos/estado-cuenta/ctz-ece', label: 'CTZ ECE' },
            { key: '/admin/bancos/estado-cuenta/ctz-urban', label: 'CTZ URBAN' },
            { key: '/admin/bancos/estado-cuenta/ctz-rcm', label: 'CTZ RCM' },
            { key: '/admin/bancos/estado-cuenta/ctz-ba', label: 'CTZ BA' },
          ],
        },
        { 
          key: 'validar-estado-cuenta',
          label: 'Validar estado cuenta',
          children: [
            { key: '/admin/bancos/validar-estado-cuenta/lsd', label: 'LSD' },
            { key: '/admin/bancos/validar-estado-cuenta/ece', label: 'ECE' },
            { key: '/admin/bancos/validar-estado-cuenta/urban', label: 'URBAN' },
            { key: '/admin/bancos/validar-estado-cuenta/rcm', label: 'RCM' },
            { key: '/admin/bancos/validar-estado-cuenta/ba', label: 'BA' },
          ],
        },
        { key: '/admin/bancos/listado-archivos', label: 'Listado de archivos de cuentas' },
        { key: '/admin/bancos/reporte-estado-cuenta', label: 'Reporte estado cuenta (Multiple)' },
        { key: '/admin/bancos/subir-estado-cuenta', label: 'Subir estado cuenta (Multiple)' },
        { key: '/admin/bancos/transferir-saldo', label: 'Transferir saldo' },
      ],
    },
    {
      key: 'bls',
      icon: <FileTextOutlined />,
      label: 'BLs',
      children: [
        { key: '/admin/bls/agregar-usuario-maritimo', label: 'Agregar nuevo usuario marítimo' },
        { key: '/admin/bls/cargados', label: "BL'S cargados" },
      ],
    },
    {
      key: '/admin/clientes',
      icon: <UserOutlined />,
      label: 'Clientes',
    },
    {
      key: 'comisiones',
      icon: <PercentageOutlined />,
      label: 'Comisiones',
      children: [
        { key: '/admin/comisiones/reporte', label: 'Reporte de comisiones' },
      ],
    },
    {
      key: 'configuracion',
      icon: <SettingOutlined />,
      label: 'Configuracion',
      children: [
        {
          key: 'beneficios',
          label: 'Beneficios',
          children: [
            { key: '/admin/configuracion/beneficios/listado', label: 'Listado' },
            { key: '/admin/configuracion/beneficios/estadisticas', label: 'Estadísticas' },
          ],
        },
        { key: '/admin/configuracion/activar-desactivar-pagos', label: "Activar/Desactivar pagos de CTZ'S" },
        { key: '/configuracion/bancos', label: 'Bancos' },
        { key: '/configuracion/cuentas', label: 'Cuentas' },
        { key: '/configuracion/servicios', label: 'Servicios' },
      ],
    },
    {
      key: 'cotizaciones',
      icon: <FormOutlined />,
      label: 'Cotizaciones',
      children: [
        { key: '/admin/cotizaciones/maritimas', label: 'Marítimas' },
        { key: '/admin/cotizaciones/tdi-usa', label: 'TDI-USA' },
      ],
    },
    {
      key: 'examen',
      icon: <EditOutlined />,
      label: 'Examen',
      children: [
        { key: '/admin/examen/generar-pin', label: 'Generar PIN' },
        { key: '/admin/examen/observar-resultados', label: 'Observar resultados' },
      ],
    },
    {
      key: 'control-gastos',
      icon: <CalculatorOutlined />,
      label: 'Control de gastos',
      children: [
        { key: '/admin/control-gastos/tdi', label: 'TDI' },
        { key: '/admin/control-gastos/maritimo', label: 'Marítimo' },
      ],
    },
    {
      key: '/admin/pctl',
      icon: <ContainerOutlined />,
      label: 'PCTL',
    },
    {
      key: '/polizas/pagadas',
      icon: <FileProtectOutlined />,
      label: 'Polizas',
    },
    {
      key: 'proveedores',
      icon: <ShopOutlined />,
      label: 'Proveedores',
      children: [
        { key: '/admin/proveedores/agregar', label: 'Agregar proveedor' },
        { key: '/admin/proveedores/en-espera', label: 'En espera de aprobación' },
        { key: '/admin/proveedores/listado', label: 'Listado de proveedores' },
        { key: '/admin/proveedores/solicitudes-pago', label: 'Lista de solicitudes de pago' },
      ],
    },
    {
      key: '/admin/gastos-week/reporte',
      icon: <BarChartOutlined />,
      label: 'Reporte de gastos Week',
    },
    {
      key: '/admin/reporte-us',
      icon: <DollarCircleOutlined />,
      label: 'Reporte US',
    },
  ];

  // Seleccionar menú según el rol
  const menuItems = useMemo(() => {
    if (hasRole(['ADMIN'])) {
      return adminMenuItems;
    } else if (hasRole(['SISTEMAS'])) {
      return sistemasMenuItems;
    } else if (hasRole(['ASESOR'])) {
      return asesorMenuItems;
    } else if (hasRole(['ATENCION A CLIENTES', 'SERVICIO AL CLIENTE'])) {
      return servicioClienteMenuItems;
    } else if (hasRole(['OPERACION MARITIMA'])) {
      return operacionMaritimaMenuItems;
    }
    return generalMenuItems;
  }, [hasRole, user?.tipo_usuario]);

  const handleMenuClick = ({ key }: { key: string }) => {
    // Interceptar clic en activar/desactivar pagos para abrir modal
    if (key === '/admin/configuracion/activar-desactivar-pagos') {
      handleAbrirModalPagos();
      if (isMobile) {
        setMobileMenuOpen(false);
      }
      return;
    }

    if (!navigator.onLine) {
      notification.error({
        key: 'network-status',
        message: 'Sin conexión a internet',
        description: 'No puedes cambiar de módulo sin conexión. Verifica tu red e intenta de nuevo.',
        duration: 4,
        placement: 'topRight',
      });
      return;
    }
    navigate(key);
    // Cerrar el menú móvil después de navegar
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const handleAbrirModalPagos = async () => {
    try {
      const response = await pagosService.getEstadoPagos(user?.id || 0);
      
      if (response.status === 'success') {
        // Guardar el estado (0 o 1) como booleano
        setEstadoPagos(response.data?.state || false);
        setModalPagosOpen(true);
      } else {
        notification.error({
          message: 'Error',
          description: response.message || 'No se pudo obtener la configuración de pagos',
          duration: 4,
          placement: 'topRight',
        });
      }
    } catch (error: any) {
      console.error('Error al cargar configuración de pagos:', error);
      notification.error({
        message: 'Error',
        description: error?.response?.data?.message || 'Error al cargar la configuración de pagos',
        duration: 4,
        placement: 'topRight',
      });
    }
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
      {/* Banner de sin conexión */}
      {!isOnline && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#ff4d4f', color: '#fff', textAlign: 'center',
          padding: '6px 16px', fontWeight: 600, fontSize: 14,
        }}>
          ⚠️ Sin conexión a internet — no puedes cambiar de módulo hasta recuperarla
        </div>
      )}
      {/* Backdrop para móvil */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <Sider
        collapsible={!isMobile}
        collapsed={isMobile ? false : collapsed}
        onCollapse={setCollapsed}
        width={240}
        className={`main-sider ${isMobile && mobileMenuOpen ? 'mobile-open' : ''} ${isMobile && !mobileMenuOpen ? 'mobile-closed' : ''}`}
        theme="light"
        trigger={isMobile ? null : undefined}
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
        <AppHeader 
          onMenuClick={isMobile ? () => setMobileMenuOpen(!mobileMenuOpen) : undefined}
        />
        <Content className="main-content">
          <Outlet />
        </Content>
        <div className="main-footer">
          <span>2026 © Entregax Paquetería.</span>
        </div>
      </Layout>

      <ActivarDesactivarPagosModal
        open={modalPagosOpen}
        onCancel={() => setModalPagosOpen(false)}
        estadoInicial={estadoPagos}
        userId={user?.id || 0}
      />
    </Layout>
  );
};

export default MainLayout;
