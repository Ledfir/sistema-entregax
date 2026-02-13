import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '@/pages/auth/Login';
import { Dashboard } from '@/pages/dashboard/Dashboard';
import { Profile } from '@/pages/profile/Profile';
import { ClientesLista } from '@/pages/clientes/ClientesLista';
import { ClientesNew } from '@/pages/clientes/ClientesNew';
import { ClienteEdit } from '@/pages/clientes/ClienteEdit';
import { ClienteAddAddress } from '@/pages/clientes/ClienteAddAddress';
import { ClienteEditAddress } from '@/pages/clientes/ClienteEditAddress';
import { CargoExtraCreate, CargoExtraList } from '@/pages/cargosextra';
import { UserGrid, UserCreate } from '@/pages/usuarios';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas con layout */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Rutas de usuarios */}
          <Route path="/usuarios/lista" element={<UserGrid />} />
          <Route path="/usuarios/nuevo" element={<UserCreate />} />
          
          {/* Rutas de clientes */}
          <Route path="/clientes/lista" element={<ClientesLista />} />
          <Route path="/clientes/nuevo" element={<ClientesNew />} />
          <Route path="/clientes/editar/:id" element={<ClienteEdit />} />
          <Route path="/clientes/:id/direcciones/nueva" element={<ClienteAddAddress />} />
          <Route path="/clientes/:clientId/direccion/editar/:id" element={<ClienteEditAddress />} />
          
          {/* Rutas de cargos extras */}
          <Route path="/cargos-extras/lista" element={<CargoExtraList />} />
          <Route path="/cargos-extras/crear" element={<CargoExtraCreate />} />
          <Route path="/cargos-extras/nuevo" element={<CargoExtraCreate />} />
          
          {/* Otras rutas */}
          <Route path="/comunicados" element={<div style={{ padding: 24 }}>Comunicados</div>} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/configuracion" element={<div style={{ padding: 24 }}>Configuración</div>} />
          
          {/* Rutas de paqueterías */}
          <Route path="/paqueterias/lista" element={<div style={{ padding: 24 }}>Lista de Paqueterías</div>} />
          <Route path="/paqueterias/nueva" element={<div style={{ padding: 24 }}>Nueva Paquetería</div>} />
          
          {/* Rutas de tickets */}
          <Route path="/tickets/lista" element={<div style={{ padding: 24 }}>Lista de Tickets</div>} />
          <Route path="/tickets/nuevo" element={<div style={{ padding: 24 }}>Nuevo Ticket</div>} />
          
          {/* Rutas de noticias */}
          <Route path="/noticias/lista" element={<div style={{ padding: 24 }}>Lista de Noticias</div>} />
          <Route path="/noticias/nueva" element={<div style={{ padding: 24 }}>Nueva Noticia</div>} />
          
          {/* Rutas de proveedores */}
          <Route path="/proveedores/lista" element={<div style={{ padding: 24 }}>Lista de Proveedores</div>} />
          <Route path="/proveedores/nuevo" element={<div style={{ padding: 24 }}>Nuevo Proveedor</div>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
