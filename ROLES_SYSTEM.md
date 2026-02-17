# Sistema de Roles y Permisos - EntregaX

## 📋 Descripción

Este proyecto implementa un sistema completo de roles y permisos que permite controlar el acceso a rutas y elementos de la UI basado en el tipo de usuario.

## 🎭 Roles Disponibles

El sistema soporta los siguientes roles:

- **SISTEMAS**: Acceso total al sistema
- **ADMINISTRACIÓN**: Acceso administrativo general
- **TEAM LEADER**: Gestión de equipo y reportes
- **ASESOR**: Acceso a funciones básicas de asesoría
- **ATENCION A CLIENTES**: Gestión de clientes y tickets

## 🔐 Permisos por Rol

### SISTEMAS
- ✅ Gestión completa de usuarios (crear, editar, eliminar)
- ✅ Gestión completa de clientes
- ✅ Todos los tickets y reportes
- ✅ Cargos extras
- ✅ Proveedores
- ✅ Noticias
- ✅ Paqueterías
- ✅ Configuración del sistema

### ADMINISTRACIÓN
- ✅ Ver usuarios
- ✅ Gestión de clientes (crear, editar)
- ✅ Todos los tickets y reportes
- ✅ Cargos extras (crear, editar)
- ✅ Proveedores (crear, editar)
- ✅ Noticias (crear, editar)

### TEAM LEADER
- ✅ Ver clientes
- ✅ Tickets del equipo
- ✅ Reportes del equipo
- ✅ Ver cargos extras

### ASESOR
- ✅ Ver clientes
- ✅ Sus propios tickets
- ✅ Ver cargos extras

### ATENCION A CLIENTES
- ✅ Gestión de clientes
- ✅ Crear tickets
- ✅ Ver cargos extras

## 🚀 Uso del Sistema

### 1. Proteger Rutas Completas

Usa el componente `ProtectedRoute` en el router:

```tsx
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

// Proteger por rol
<Route 
  path="/usuarios/lista" 
  element={
    <ProtectedRoute roles={['SISTEMAS']}>
      <UserGrid />
    </ProtectedRoute>
  } 
/>

// Proteger por permiso específico
<Route 
  path="/usuarios/nuevo" 
  element={
    <ProtectedRoute permission="users.create">
      <UserCreate />
    </ProtectedRoute>
  } 
/>

// Proteger por rol Y permiso
<Route 
  path="/clientes/nuevo" 
  element={
    <ProtectedRoute roles={['SISTEMAS', 'ADMINISTRACIÓN']} permission="clients.create">
      <ClientesNew />
    </ProtectedRoute>
  } 
/>
```

### 2. Proteger Elementos de la UI

Usa el componente `RoleGuard` dentro de tus componentes:

```tsx
import { RoleGuard } from '@/components/common/RoleGuard';

// Mostrar botón solo para SISTEMAS
<RoleGuard roles={['SISTEMAS']}>
  <Button onClick={handleCreate}>Crear Usuario</Button>
</RoleGuard>

// Mostrar sección solo si tiene permiso
<RoleGuard permission="users.delete">
  <Button danger onClick={handleDelete}>Eliminar</Button>
</RoleGuard>

// Mostrar contenido alternativo
<RoleGuard 
  roles={['SISTEMAS', 'ADMINISTRACIÓN']} 
  fallback={<p>No tienes permisos para ver esto</p>}
>
  <ConfiguracionAvanzada />
</RoleGuard>

// Múltiples roles
<RoleGuard roles={['SISTEMAS', 'ADMINISTRACIÓN', 'TEAM LEADER']}>
  <ReportesSection />
</RoleGuard>
```

### 3. Usar el Store Directamente

Puedes acceder a las funciones de rol desde cualquier componente:

```tsx
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const { hasRole, hasPermission, getUserRole, user } = useAuthStore();

  // Verificar rol
  if (hasRole(['SISTEMAS', 'ADMINISTRACIÓN'])) {
    // Hacer algo
  }

  // Verificar permiso
  if (hasPermission('users.edit')) {
    // Hacer algo
  }

  // Obtener rol actual
  const currentRole = getUserRole(); // 'SISTEMAS', 'ASESOR', etc.

  // Acceder a info del usuario
  const userName = user?.name;
  const userType = user?.tipo_usuario;

  return (
    <div>
      {hasRole(['SISTEMAS']) && <AdminPanel />}
      {hasPermission('tickets.create') && <CreateTicketButton />}
    </div>
  );
}
```

## 📝 Lista de Permisos Disponibles

### Usuarios
- `users.view` - Ver usuarios
- `users.create` - Crear usuarios
- `users.edit` - Editar usuarios
- `users.delete` - Eliminar usuarios

### Clientes
- `clients.view` - Ver clientes
- `clients.create` - Crear clientes
- `clients.edit` - Editar clientes
- `clients.delete` - Eliminar clientes

### Tickets
- `tickets.view` - Ver tickets
- `tickets.create` - Crear tickets
- `tickets.edit` - Editar tickets
- `tickets.delete` - Eliminar tickets
- `tickets.all` - Ver todos los tickets
- `tickets.team` - Ver tickets del equipo
- `tickets.own` - Ver solo sus propios tickets

### Reportes
- `reports.view` - Ver reportes
- `reports.all` - Ver todos los reportes
- `reports.team` - Ver reportes del equipo

### Cargos Extras
- `extra-charges.view` - Ver cargos extras
- `extra-charges.create` - Crear cargos extras
- `extra-charges.edit` - Editar cargos extras
- `extra-charges.delete` - Eliminar cargos extras

### Proveedores
- `providers.view` - Ver proveedores
- `providers.create` - Crear proveedores
- `providers.edit` - Editar proveedores
- `providers.delete` - Eliminar proveedores

### Noticias
- `news.view` - Ver noticias
- `news.create` - Crear noticias
- `news.edit` - Editar noticias
- `news.delete` - Eliminar noticias

### Paqueterías
- `packages.view` - Ver paqueterías
- `packages.create` - Crear paqueterías
- `packages.edit` - Editar paqueterías
- `packages.delete` - Eliminar paqueterías

### Configuración
- `settings.view` - Ver configuración
- `settings.edit` - Editar configuración

## 🔧 Agregar Nuevos Roles o Permisos

### 1. Agregar un nuevo rol

Edita `src/store/authStore.ts` y añade el rol al objeto `ROLE_PERMISSIONS`:

```typescript
const ROLE_PERMISSIONS: Record<string, string[]> = {
  // ... roles existentes
  'NUEVO_ROL': [
    'clients.view',
    'tickets.create',
    // ... permisos del nuevo rol
  ],
};
```

### 2. Agregar un nuevo permiso

Simplemente añade el string del permiso a los roles que lo necesiten:

```typescript
'SISTEMAS': [
  'users.view',
  'mi-nuevo-permiso', // ← Nuevo permiso
],
```

## 📂 Archivos Modificados

- `src/store/authStore.ts` - Store de autenticación con funciones de roles
- `src/components/common/ProtectedRoute.tsx` - Componente para proteger rutas
- `src/components/common/RoleGuard.tsx` - Componente para proteger elementos UI
- `src/pages/auth/Login.tsx` - Actualizado para guardar tipo_usuario
- `src/pages/auth/Unauthorized.tsx` - Página de acceso denegado
- `src/router/AppRouter.tsx` - Router con rutas protegidas por rol

## 🎯 Ejemplos Completos

### Ejemplo 1: Tabla con acciones según rol

```tsx
import { RoleGuard } from '@/components/common/RoleGuard';
import { Table, Button, Space } from 'antd';

function UserTable() {
  const columns = [
    { title: 'Nombre', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Acciones',
      render: (_, record) => (
        <Space>
          <RoleGuard roles={['SISTEMAS', 'ADMINISTRACIÓN']}>
            <Button onClick={() => handleEdit(record)}>Editar</Button>
          </RoleGuard>
          
          <RoleGuard permission="users.delete">
            <Button danger onClick={() => handleDelete(record)}>
              Eliminar
            </Button>
          </RoleGuard>
        </Space>
      ),
    },
  ];

  return <Table columns={columns} dataSource={users} />;
}
```

### Ejemplo 2: Menú condicional

```tsx
import { useAuthStore } from '@/store/authStore';

function AppMenu() {
  const { hasPermission } = useAuthStore();

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      visible: true,
    },
    {
      key: 'users',
      label: 'Usuarios',
      visible: hasPermission('users.view'),
    },
    {
      key: 'clients',
      label: 'Clientes',
      visible: hasPermission('clients.view'),
    },
    {
      key: 'settings',
      label: 'Configuración',
      visible: hasPermission('settings.view'),
    },
  ].filter(item => item.visible);

  return <Menu items={menuItems} />;
}
```

## 🛡️ Seguridad

**IMPORTANTE**: Este sistema de roles controla la UI del frontend, pero **SIEMPRE** debes implementar validaciones de permisos en el backend. Nunca confíes únicamente en las validaciones del frontend para la seguridad.

## 📚 Referencias

- Store: `src/store/authStore.ts`
- Componentes: `src/components/common/`
- Router: `src/router/AppRouter.tsx`
- Tipos: Interface `User` en authStore

---

**Autor**: Sistema EntregaX  
**Última actualización**: Febrero 2026
