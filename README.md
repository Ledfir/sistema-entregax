# Sistema EntregaX 📦

Sistema integral de gestión logística y operaciones para empresas de envíos internacionales, desarrollado con tecnologías modernas y arquitectura escalable.

## 📋 Descripción

EntregaX es una plataforma completa que permite gestionar todos los aspectos de una operación logística internacional, desde la cotización inicial hasta la entrega final. El sistema maneja tanto envíos terrestres como marítimos, con módulos especializados para diferentes roles de usuario.

## ✨ Características Principales

### 🚢 Gestión de Envíos
- **Envíos Terrestres**: Gestión de paquetes individuales con dimensiones y peso
- **Envíos Marítimos**: Manejo de contenedores (LOG) con CBM y bultos
- Cotizaciones automáticas según tipo de envío y destino
- Asignación de costos y márgenes de ganancia
- Seguimiento de guías (DHL, UPS, FedEx, etc.)

### 💰 Gestión de Pólizas
- Pólizas nuevas pendientes de procesamiento
- Pólizas pagadas pendientes de aprobación
- Sistema de aprobación/rechazo con motivos
- Visualización de facturas y packing lists (PDF/Excel)
- Búsqueda y filtrado avanzado

### 👥 Gestión de Clientes
- Registro completo de clientes
- Múltiples direcciones por cliente
- Historial de operaciones
- Gestión de suites

### 📊 Operaciones
- Actualización de costos por kilo
- Gestión de tarifas marítimas
- Cambio de instrucciones de envío
- Manejo de descuentos
- Operaciones NBox y NBox Marítimo
- Sistema de reempaque USA

### 👤 Gestión de Usuarios
- Sistema de roles y permisos
- Roles: Administrador, Asesor, Operaciones, Servicio al Cliente
- Protección de rutas según rol
- Perfiles personalizables

### 📝 Encuestas
- Encuestas pendientes
- Historial de encuestas realizadas
- Seguimiento de satisfacción del cliente

### 💵 Cargos Extra
- Creación y gestión de cargos adicionales
- Aplicación a operaciones específicas

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Librería UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router DOM** - Navegación
- **Ant Design** - Componentes UI
- **Axios** - Cliente HTTP
- **SweetAlert2** - Alertas y confirmaciones
- **Zustand** - Gestión de estado (authStore)

### Backend
- **CodeIgniter 4** - Framework PHP
- **MySQL** - Base de datos

### Herramientas
- **ESLint** - Linter
- **PWA** - Service Worker para aplicación progresiva

## 📁 Estructura del Proyecto

```
src/
├── api/              # Configuración de Axios
├── assets/           # Recursos estáticos
├── components/       # Componentes reutilizables
│   ├── common/       # ProtectedRoute, RoleGuard
│   └── layout/       # AppHeader, MainLayout
├── config/           # Configuraciones
├── hooks/            # Custom hooks
├── pages/            # Páginas de la aplicación
│   ├── asesores/     # Gestión de asesores
│   ├── auth/         # Login, Unauthorized
│   ├── cargosextra/  # Cargos extra
│   ├── clientes/     # CRUD de clientes
│   ├── dashboard/    # Dashboards por rol
│   ├── encuestas/    # Sistema de encuestas
│   ├── juego/        # Juegos (Snake)
│   ├── operaciones/  # Operaciones logísticas
│   ├── polizas/      # Gestión de pólizas
│   ├── profile/      # Perfil de usuario
│   └── usuarios/     # CRUD de usuarios
├── router/           # Configuración de rutas
├── services/         # Servicios API
│   ├── authService.ts
│   ├── clienteService.ts
│   ├── operacionesService.ts
│   ├── polizasService.ts
│   └── userService.ts
├── store/            # Zustand stores
├── types/            # Tipos TypeScript
└── utils/            # Utilidades

```

## 🔐 Roles y Permisos

### Administrador
- Acceso completo al sistema
- Gestión de usuarios
- Configuración global

### Asesor
- Gestión de clientes
- Creación de cotizaciones
- Seguimiento de envíos

### Operaciones
- Procesamiento de envíos
- Actualización de costos
- Gestión de operaciones

### Servicio al Cliente
- Gestión de pólizas
- Validación de costos
- Atención al cliente

## 🚀 Instalación

### Prerrequisitos
- Node.js >= 18
- npm o yarn
- PHP >= 8.1
- MySQL >= 5.7
- Laragon o servidor similar

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/sistema-entregax.git
   cd sistema-entregax
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env basado en .env.example
   cp .env.example .env
   ```

4. **Configurar backend**
   - Configurar base de datos en CodeIgniter 4
   - Ejecutar migraciones
   - Configurar CORS

5. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Build para producción**
   ```bash
   npm run build
   ```

## 📝 Scripts Disponibles

```bash
npm run dev          # Inicia servidor de desarrollo
npm run build        # Compila para producción
npm run preview      # Vista previa del build
npm run lint         # Ejecuta ESLint
```

## 🎨 Características de UX

- **Diseño Responsivo**: Adaptable a móviles, tablets y desktop
- **Tema Corporativo**: Gradiente naranja (#ff6600) como color principal
- **Fechas Humanizadas**: Formato en español legible ("25 de febrero de 2025, 1:40 PM")
- **Moneda Formateada**: Separadores de miles automáticos ($1,234.56)
- **Iconos Contextuales**: PDF y Excel con iconos específicos
- **Búsqueda en Tiempo Real**: Filtrado instantáneo en tablas
- **Confirmaciones**: SweetAlert2 para acciones críticas
- **Feedback Visual**: Estados de carga y mensajes informativos

## 🔧 Configuración de Desarrollo

### Axios
La configuración de Axios incluye:
- Base URL del backend
- Interceptores para manejo de tokens
- Gestión automática de errores 401/403

### Rutas Protegidas
Las rutas utilizan `ProtectedRoute` y `RoleGuard` para:
- Verificar autenticación
- Validar permisos por rol
- Redireccionar usuarios no autorizados

## 📊 Módulos Principales

### Cotizaciones
- Soporte para envíos TERRESTRES y MARÍTIMOS
- Cálculo automático de costos
- Asignación de costos por caja/contenedor
- Visualización diferenciada según tipo

### Pólizas
- Listado de pólizas pendientes
- Aprobación/rechazo con motivos
- Visualización de documentos adjuntos
- Filtrado por múltiples campos
- Exportación de datos

### Clientes
- CRUD completo
- Múltiples direcciones
- Historial de operaciones
- Búsqueda avanzada

## 🤝 Contribución

Para contribuir al proyecto:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👨‍💻 Soporte

Para soporte técnico, contactar al equipo de desarrollo.

---

**Última actualización**: Febrero 2026  
**Versión**: 2.0.0 
