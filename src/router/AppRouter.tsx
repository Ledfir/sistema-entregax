import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '@/pages/auth/Login';
import { Unauthorized } from '@/pages/auth/Unauthorized';
import { Dashboard } from '@/pages/dashboard/Dashboard';
import { Profile } from '@/pages/profile/Profile';
import { ClientesLista } from '@/pages/clientes/ClientesLista';
import { ClientesNew } from '@/pages/clientes/ClientesNew';
import { ClienteEdit } from '@/pages/clientes/ClienteEdit';
import { ClienteAddAddress } from '@/pages/clientes/ClienteAddAddress';
import { ClienteEditAddress } from '@/pages/clientes/ClienteEditAddress';
import { CargoExtraCreate, CargoExtraList } from '@/pages/cargosextra';
import { UserGrid, UserCreate, UserEdit } from '@/pages/usuarios';
import { EncuestasPendientes, EncuestasRealizadas } from '@/pages/encuestas';
import { AsesoresList } from '@/pages/asesores';
import { ActualizarCostoKiloTC } from '@/pages/operaciones/ActualizarCostoKiloTC';
import { ActualizarTCAumentoMaritimo } from '@/pages/operaciones/ActualizarTCAumentoMaritimo';
import { ActualizarTCCosto } from '@/pages/operaciones/ActualizarTCCosto';
import { Descuentos } from '@/pages/operaciones/Descuentos';
import { EditarGuiaDHL } from '@/pages/operaciones/EditarGuiaDHL';
import { OperacionMaritima } from '@/pages/operaciones/OperacionMaritima';
import { UsaRemp } from '@/pages/operaciones/UsaRemp';
import { NBox } from '@/pages/operaciones/NBox';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Rutas protegidas con layout */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Rutas de usuarios - Solo SISTEMAS */}
          <Route 
            path="/usuarios/lista" 
            element={
              <ProtectedRoute roles={['SISTEMAS']} permission="users.view">
                <UserGrid />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/usuarios/nuevo" 
            element={
              <ProtectedRoute roles={['SISTEMAS']} permission="users.create">
                <UserCreate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/usuarios/editar/:token" 
            element={
              <ProtectedRoute roles={['SISTEMAS']} permission="users.edit">
                <UserEdit />
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas de clientes - Múltiples roles */}
          <Route 
            path="/clientes/lista" 
            element={
              <ProtectedRoute roles={['SISTEMAS', 'ADMINISTRACIÓN', 'ASESOR', 'TEAM LEADER', 'ATENCION A CLIENTES', 'SERVICIO AL CLIENTE']} permission="clients.view">
                <ClientesLista />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/clientes/nuevo" 
            element={
              <ProtectedRoute roles={['SISTEMAS', 'ADMINISTRACIÓN', 'ATENCION A CLIENTES', 'SERVICIO AL CLIENTE']} permission="clients.create">
                <ClientesNew />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/clientes/editar/:id" 
            element={
              <ProtectedRoute roles={['SISTEMAS', 'ADMINISTRACIÓN', 'ATENCION A CLIENTES', 'SERVICIO AL CLIENTE']} permission="clients.edit">
                <ClienteEdit />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/clientes/:id/direcciones/nueva" 
            element={
              <ProtectedRoute roles={['SISTEMAS', 'ADMINISTRACIÓN', 'ATENCION A CLIENTES', 'SERVICIO AL CLIENTE']} permission="clients.edit">
                <ClienteAddAddress />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/clientes/:clientId/direccion/editar/:id" 
            element={
              <ProtectedRoute roles={['SISTEMAS', 'ADMINISTRACIÓN', 'ATENCION A CLIENTES', 'SERVICIO AL CLIENTE']} permission="clients.edit">
                <ClienteEditAddress />
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas de cargos extras */}
          <Route 
            path="/cargos-extras/lista" 
            element={
              <ProtectedRoute roles={['SISTEMAS', 'ADMINISTRACIÓN', 'TEAM LEADER', 'ASESOR', 'ATENCION A CLIENTES', 'SERVICIO AL CLIENTE']} permission="extra-charges.view">
                <CargoExtraList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cargos-extras/crear" 
            element={
              <ProtectedRoute roles={['SISTEMAS', 'ADMINISTRACIÓN', 'SERVICIO AL CLIENTE']} permission="extra-charges.create">
                <CargoExtraCreate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cargos-extras/nuevo" 
            element={
              <ProtectedRoute roles={['SISTEMAS', 'ADMINISTRACIÓN', 'SERVICIO AL CLIENTE']} permission="extra-charges.create">
                <CargoExtraCreate />
              </ProtectedRoute>
            } 
          />
          
          {/* Otras rutas */}
          <Route path="/comunicados" element={<div style={{ padding: 24 }}>Comunicados</div>} />
          <Route path="/perfil" element={<Profile />} />
          <Route 
            path="/configuracion" 
            element={
              <ProtectedRoute roles={['SISTEMAS']} permission="settings.view">
                <div style={{ padding: 24 }}>Configuración</div>
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas de encuestas */}
          <Route 
            path="/encuestas/pendientes" 
            element={
              <ProtectedRoute roles={['SISTEMAS', 'SERVICIO AL CLIENTE']}>
                <EncuestasPendientes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/encuestas/realizadas" 
            element={
              <ProtectedRoute roles={['SISTEMAS', 'SERVICIO AL CLIENTE']}>
                <EncuestasRealizadas />
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta de asesores */}
          <Route 
            path="/asesores" 
            element={
              <ProtectedRoute roles={['SERVICIO AL CLIENTE']}>
                <AsesoresList />
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas de operaciones */}
          <Route 
            path="/operaciones/actualizar-costo-kilo-tc" 
            element={
              <ProtectedRoute roles={['SERVICIO AL CLIENTE']}>
                <ActualizarCostoKiloTC />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/operaciones/actualizar-tc-aumento-maritimo" 
            element={
              <ProtectedRoute roles={['SERVICIO AL CLIENTE']}>
                <ActualizarTCAumentoMaritimo />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/operaciones/actualizar-tc-costo" 
            element={
              <ProtectedRoute roles={['SERVICIO AL CLIENTE']}>
                <ActualizarTCCosto />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/operaciones/cambio-inst" 
            element={
              <ProtectedRoute roles={['SERVICIO AL CLIENTE']}>
                <div style={{ padding: 24 }}>Cambio Inst.</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/operaciones/descuentos" 
            element={
              <ProtectedRoute roles={['SERVICIO AL CLIENTE']}>
                <Descuentos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/operaciones/editar-guia-dhl" 
            element={
              <ProtectedRoute roles={['SERVICIO AL CLIENTE']}>
                <EditarGuiaDHL />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/operaciones/nbox" 
            element={
              <ProtectedRoute roles={['SERVICIO AL CLIENTE']}>
                <NBox />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/operaciones/nbox-maritimo" 
            element={
              <ProtectedRoute roles={['SERVICIO AL CLIENTE']}>
                <div style={{ padding: 24 }}>N. B.O.X. Marítimo</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/operaciones/operacion-maritima" 
            element={
              <ProtectedRoute roles={['SERVICIO AL CLIENTE']}>
                <OperacionMaritima />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/operaciones/reasignar-guia" 
            element={
              <ProtectedRoute roles={['SERVICIO AL CLIENTE']}>
                <div style={{ padding: 24 }}>Reasignar guía</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/operaciones/reasignar-cliente" 
            element={
              <ProtectedRoute roles={['SERVICIO AL CLIENTE']}>
                <div style={{ padding: 24 }}>Reasignar cliente</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/operaciones/solo-adm-ctz-pasadas" 
            element={
              <ProtectedRoute roles={['SERVICIO AL CLIENTE']}>
                <div style={{ padding: 24 }}>SÓLO ADM CTZ PASADAS</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/operaciones/usa-remp" 
            element={
              <ProtectedRoute roles={['SERVICIO AL CLIENTE']}>
                <UsaRemp />
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas de paqueterías */}
          <Route 
            path="/paqueterias/lista" 
            element={
              <ProtectedRoute roles={['SISTEMAS']} permission="packages.view">
                <div style={{ padding: 24 }}>Lista de Paqueterías</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/paqueterias/nueva" 
            element={
              <ProtectedRoute roles={['SISTEMAS']} permission="packages.create">
                <div style={{ padding: 24 }}>Nueva Paquetería</div>
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas de tickets */}
          <Route 
            path="/tickets/lista" 
            element={
              <ProtectedRoute roles={['SISTEMAS', 'ADMINISTRACIÓN', 'TEAM LEADER', 'ASESOR']} permission="tickets.view">
                <div style={{ padding: 24 }}>Lista de Tickets</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tickets/nuevo" 
            element={
              <ProtectedRoute roles={['SISTEMAS', 'ADMINISTRACIÓN', 'TEAM LEADER', 'ASESOR', 'ATENCION A CLIENTES']} permission="tickets.create">
                <div style={{ padding: 24 }}>Nuevo Ticket</div>
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas de noticias */}
          <Route 
            path="/noticias/lista" 
            element={
              <ProtectedRoute roles={['SISTEMAS', 'ADMINISTRACIÓN']} permission="news.view">
                <div style={{ padding: 24 }}>Lista de Noticias</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/noticias/nueva" 
            element={
              <ProtectedRoute roles={['SISTEMAS', 'ADMINISTRACIÓN']} permission="news.create">
                <div style={{ padding: 24 }}>Nueva Noticia</div>
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas de proveedores */}
          <Route 
            path="/proveedores/lista" 
            element={
              <ProtectedRoute roles={['SISTEMAS', 'ADMINISTRACIÓN']} permission="providers.view">
                <div style={{ padding: 24 }}>Lista de Proveedores</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/proveedores/nuevo" 
            element={
              <ProtectedRoute roles={['SISTEMAS', 'ADMINISTRACIÓN']} permission="providers.create">
                <div style={{ padding: 24 }}>Nuevo Proveedor</div>
              </ProtectedRoute>
            } 
          />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
