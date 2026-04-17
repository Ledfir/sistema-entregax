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
- Múltiples direcciones de facturación por cliente (CRUD completo)
- Vista "Mis Clientes" filtrada por asesor
- Historial de operaciones
- Gestión de suites

### 📊 Operaciones
- Actualización de costos por kilo (TDI)
- Gestión de tarifas marítimas (aumento marítimo)
- Actualización de tipos de cambio y costos
- Cambio de instrucciones de envío
- Manejo de descuentos
- Operaciones NBox y NBox Marítimo
- Operación Marítima (contenedores LOG)
- Sistema de reempaque USA
- Reasignación de guías y clientes
- Cotizaciones pasadas (solo administrador)

### 📦 Cotizaciones
- **Mis Cotizaciones**: listado general con costo, envío y total por cotización
- **Instrucciones Pendientes**: flujo de 3 vistas
  - Lista de secciones (USA, TDI, DHL, TDI Express)
  - Pendientes por sección con búsqueda y selección múltiple
  - Asignar instrucciones con dirección, paquetería y (para DHL) producto
  - Archivar guías individuales
- **Guías Archivadas**: tabla de guías archivadas con acción de desarchivar
- **Pendientes de Cotizar**: flujo de 2 vistas
  - Lista de pendientes por asesor
  - Detalle por suite con selección múltiple y generación de cotización (`POST quotes/generate-quote`)
- **Cotizaciones Marítimas**: gestión de cotizaciones marítimas con logs y pagos
- **TDI-USA**: módulo administrativo para cotizaciones TDI-USA
  - Búsqueda por cliente o asesor
  - Tabla de resultados con estado, montos y fechas
  - Visualización de pagos vinculados
  - Descarga de PDF de cotización
  - Búsqueda en tiempo real en tabla

### 👤 Gestión de Usuarios
- Sistema de roles y permisos
- Roles: Administrador, Asesor, Operaciones, Servicio al Cliente, Sistemas
- Protección de rutas según rol
- Perfiles personalizables

### 📝 Encuestas
- Encuestas pendientes
- Historial de encuestas realizadas
- Seguimiento de satisfacción del cliente

### 💵 Cargos Extra
- Creación y gestión de cargos adicionales
- Historial de cargos
- Pendientes de aprobación

### 🎫 Tickets
- Tickets activos y archivados
- Reporte estadístico
- Creación de nuevos tickets

### 📰 Noticias y Comunicados
- Gestión de noticias internas
- Comunicados generales

### 🏢 Proveedores y Paqueterías
- CRUD de proveedores
- Gestión de paqueterías

### 📝 Exámenes
- **Generar PIN**: módulo administrativo para crear PINs de acceso a exámenes
  - Registro de nombre y teléfono del candidato
  - Generación automática de PIN
  - Envío de notificación con PIN y liga de acceso
  - Respaldo manual del PIN generado

## 🛠️ Stack Tecnológico

### Frontend
- **React 19.2.4** — Librería UI
- **TypeScript** — Tipado estático
- **Vite** — Build tool y dev server
- **React Router DOM** — Navegación SPA
- **Ant Design v5** — Componentes UI
- **Axios** — Cliente HTTP con interceptores de token
- **SweetAlert2** — Alertas y confirmaciones
- **Zustand** — Gestión de estado global (authStore)
- **dayjs** — Manipulación y humanización de fechas en español
- **PWA (Vite PWA Plugin)** — Service Worker y soporte offline

### Backend
- **CodeIgniter 4** — Framework PHP
- **MySQL** — Base de datos

### Herramientas
- **ESLint** — Linter
- **TypeScript strict** — Comprobación de tipos en compilación

## 📁 Estructura del Proyecto

```
src/
├── api/              # Configuración de Axios (base URL + interceptor Bearer)
├── assets/           # Recursos estáticos
├── components/       # Componentes reutilizables
│   ├── common/       # ProtectedRoute, RoleGuard
│   └── layout/       # AppHeader, MainLayout (menú lateral)
├── config/           # Configuraciones globales
├── hooks/            # Custom hooks
├── pages/            # Páginas de la aplicación
│   ├── asesores/     # Lista de asesores
│   ├── auth/         # Login, Unauthorized
│   ├── cargosextra/  # Lista, historial y pendientes de cargos extra
│   ├── clientes/     # CRUD clientes + direcciones de facturación + Mis Clientes
│   ├── cotizaciones/ # Cotizaciones (Mis Cotizaciones, Instrucciones, Guías Archivadas, Pendientes, Marítimas, TDI-USA)
│   ├── dashboard/    # Dashboard general y Home Servicio al Cliente
│   ├── encuestas/    # Encuestas pendientes y realizadas
│   ├── examen/       # Generar PIN para exámenes
│   ├── juego/        # Juego Snake
│   ├── operaciones/  # Módulos de operaciones logísticas
│   ├── polizas/      # Pólizas nuevas y pagadas
│   ├── profile/      # Perfil de usuario
│   ├── tickets/      # Tickets activos, archivados y reporte estadístico
│   └── usuarios/     # CRUD de usuarios
├── router/           # AppRouter.tsx — todas las rutas protegidas por rol
├── services/         # Servicios API
│   ├── authService.ts
│   ├── cargoExtraService.ts
│   ├── clienteService.ts
│   ├── cotizacionesService.ts  # Cotizaciones (marítimas, TDI-USA)
│   ├── encuestaService.ts
│   ├── examService.ts          # Exámenes (generación de PIN)
│   ├── operacionesService.ts   # Operaciones logísticas
│   └── userService.ts
├── store/            # Zustand stores (authStore)
├── types/            # Tipos TypeScript
└── utils/            # Utilidades
```

## 🔐 Roles y Permisos

| Rol | Acceso |
|-----|--------|
| **ADMIN** | Acceso completo al sistema, gestión de usuarios, configuración global |
| **SISTEMAS** | Administración técnica, acceso a módulos de operaciones y cotizaciones |
| **ASESOR** | Gestión de sus clientes, cotizaciones, instrucciones, guías archivadas |
| **OPERACIONES** | Procesamiento de envíos, actualización de costos, operaciones logísticas |
| **SERVICIO AL CLIENTE** | Gestión de pólizas, validación de costos, encuestas, cotizaciones |

## 🗺️ Rutas de la Aplicación

| Ruta | Módulo | Roles |
|------|--------|-------|
| `/dashboard` | Dashboard principal | Todos |
| `/usuarios/lista` | Lista de usuarios | ADMIN, SISTEMAS |
| `/usuarios/nuevo` | Crear usuario | ADMIN, SISTEMAS |
| `/usuarios/editar/:token` | Editar usuario | ADMIN, SISTEMAS |
| `/clientes/lista` | Lista de clientes | ADMIN, SISTEMAS, OPERACIONES, SC |
| `/clientes/mis-clientes` | Mis clientes | ASESOR |
| `/clientes/nuevo` | Crear cliente | ASESOR, ADMIN, SISTEMAS |
| `/clientes/editar/:id` | Editar cliente | ASESOR, ADMIN, SISTEMAS |
| `/clientes/:id/direcciones/nueva` | Nueva dirección | ASESOR, ADMIN, SISTEMAS |
| `/clientes/:clientId/direccion/editar/:id` | Editar dirección | ASESOR, ADMIN, SISTEMAS |
| `/cargos-extras/lista` | Lista cargos extra | ADMIN, SISTEMAS |
| `/cargos-extras/historial` | Historial cargos extra | ASESOR, ADMIN, SISTEMAS |
| `/cargos-extras/pendientes` | Pendientes cargos extra | ASESOR, ADMIN, SISTEMAS |
| `/cargos-extras/crear` | Crear cargo extra | ASESOR, ADMIN, SISTEMAS |
| `/encuestas/pendientes` | Encuestas pendientes | ASESOR, SC |
| `/encuestas/realizadas` | Encuestas realizadas | ASESOR, SC |
| `/asesores` | Lista de asesores | ADMIN, SISTEMAS |
| `/operaciones/actualizar-costo-kilo-tc` | Costo kilo TDI | OPERACIONES, ADMIN, SISTEMAS |
| `/operaciones/actualizar-tc-aumento-maritimo` | Aumento marítimo | OPERACIONES, ADMIN, SISTEMAS |
| `/operaciones/actualizar-tc-costo` | TC Costo | OPERACIONES, ADMIN, SISTEMAS |
| `/operaciones/cambio-inst` | Cambio instrucciones | OPERACIONES, ADMIN, SISTEMAS |
| `/operaciones/descuentos` | Descuentos | OPERACIONES, ADMIN, SISTEMAS |
| `/operaciones/editar-guia-dhl` | Editar guía DHL | OPERACIONES, ADMIN, SISTEMAS |
| `/operaciones/nbox` | NBox | OPERACIONES, ADMIN, SISTEMAS |
| `/operaciones/nbox-maritimo` | NBox Marítimo | OPERACIONES, ADMIN, SISTEMAS |
| `/operaciones/operacion-maritima` | Operación Marítima | OPERACIONES, ADMIN, SISTEMAS |
| `/operaciones/reasignar-guia` | Reasignar guía | OPERACIONES, ADMIN, SISTEMAS |
| `/operaciones/reasignar-cliente` | Reasignar cliente | OPERACIONES, ADMIN, SISTEMAS |
| `/operaciones/solo-adm-ctz-pasadas` | Cotizaciones pasadas | ADMIN |
| `/operaciones/usa-remp` | Reempaque USA | OPERACIONES, ADMIN, SISTEMAS |
| `/cotizaciones/lista` | Mis cotizaciones | ASESOR, SC, SISTEMAS, ADMIN |
| `/cotizaciones/instrucciones` | Instrucciones pendientes | ASESOR, SC, SISTEMAS, ADMIN |
| `/cotizaciones/guias-archivadas` | Guías archivadas | ASESOR, SC, SISTEMAS, ADMIN |
| `/cotizaciones/pendientes` | Pendientes de cotizar | ASESOR, SC, SISTEMAS, ADMIN |
| `/admin/cotizaciones/maritimas` | Cotizaciones marítimas | ADMIN, SISTEMAS |
| `/admin/cotizaciones/tdi-usa` | Cotizaciones TDI-USA | ADMIN, SISTEMAS |
| `/admin/examen/generar-pin` | Generar PIN examen | ADMIN |
| `/polizas/nuevas` | Pólizas nuevas | SC |
| `/polizas/pagadas` | Pólizas pagadas | SC |
| `/tickets/activos` | Tickets activos | ADMIN, SISTEMAS |
| `/tickets/archivados` | Tickets archivados | ADMIN, SISTEMAS |
| `/tickets/reporte-estadistico` | Reporte de tickets | ADMIN, SISTEMAS |
| `/paqueterias/lista` | Lista paqueterías | ADMIN, SISTEMAS |
| `/noticias/lista` | Lista noticias | ADMIN, SISTEMAS |
| `/proveedores/lista` | Lista proveedores | ADMIN, SISTEMAS |
| `/perfil` | Perfil de usuario | Todos |

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
- **Tema Corporativo**: Color principal naranja `#F26522`, secundario azul `#1d3557`
- **Fechas Humanizadas**: Formato `DD MMM YYYY` con tooltip de fecha y hora completa (dayjs + locale es)
- **Moneda Formateada**: Separadores de miles automáticos (`$1,234.56`)
- **Búsqueda en Tiempo Real**: Filtrado instantáneo en todas las tablas
- **Tablas con scroll horizontal**: `scroll={{ x: 'max-content' }}` en todas las tablas anchas
- **Confirmaciones**: SweetAlert2 para acciones críticas (desarchivar, generar cotización, etc.)
- **Feedback Visual**: Spinners de carga por sección, mensajes de éxito/error desde el API
- **Vistas Inline**: Componentes multi-vista sin cambio de ruta (lista → detalle → acción)
- **Visualización de PDFs**: Modal con iframe nativo del navegador para visualización y descarga
- **Modales de Información**: Ant Design Modal.success/error con contenido personalizado HTML

## 🔧 Configuración de Desarrollo

### Axios
La configuración de Axios incluye:
- Base URL del backend (variable de entorno `VITE_API_URL`)
- Interceptor de request: agrega `Authorization: Bearer <token>` automáticamente desde el authStore
- Gestión automática de errores 401/403

### Rutas Protegidas
Las rutas utilizan `ProtectedRoute` con prop `roles` para:
- Verificar autenticación (token en authStore)
- Validar permisos por rol
- Redirigir a `/unauthorized` si el rol no coincide

### Patrones de Componentes

**Vista multi-step inline** (ej. Instrucciones, PendientesCotizar):
```
view: 'lista' | 'detalle' | 'asignar'
```
La vista cambia sin cambiar de ruta, manteniendo estado entre pasos.

**Mapeo de datos del API**:
Todos los componentes usan funciones `mapRows()` que normalizan los campos del JSON del backend, aplicando fallbacks para nombres de campo alternativos (ej. `r.guiaunica ?? r.guia_unica`).

## 📊 Módulos de Cotizaciones (detalle)

### Mis Cotizaciones (`/cotizaciones/lista`)
Tabla con: Cliente (suite), IDCO, Creada, Costo, Envío, Total, Detalles.
Endpoint: `GET /quotes/my-quotes/{iduser}`

### Instrucciones Pendientes (`/cotizaciones/instrucciones`)
Flujo de 3 vistas:
1. **Lista**: secciones USA, TDI, DHL, TDI Express con conteo de pendientes
2. **Pendientes**: guías de la sección con búsqueda, selección múltiple, archivar individual
3. **Asignar**: selección de dirección de facturación, paquetería, y producto (solo DHL) → `POST /quotes/update-instruction`

Endpoints: `GET /quotes/pending-instructions/{iduser}`, `GET /quotes/pending-list/{idc}/{idtp}`, `GET /quotes/ready-for-instructions/{idc}/{idtp}`, `GET /quotes/billing-address/{idc}`, `GET /quotes/packings`, `GET /quotes/list-products`, `POST /quotes/archived-waybill`

### Guías Archivadas (`/cotizaciones/guias-archivadas`)
Tabla con 13 columnas. Acción de Desarchivar con confirmación SweetAlert2.
Endpoints: `GET /quotes/archived/{iduser}`, `POST /quotes/desarchived-waybill`

### Pendientes de Cotizar (`/cotizaciones/pendientes`)
Flujo de 2 vistas:
1. **Lista**: agrupación por suite con total, tipo y botón "Ver"
2. **Detalle**: guías de la suite con checkboxes y botón "Generar cotización"

Payload de generación: `{ ids[], idtp, iduser, idc }` → `POST /quotes/generate-quote`

Endpoints: `GET /quotes/pending-quotes/{iduser}`, `GET /quotes/list-pending-quotes/{suite}/{idtp}`

### Cotizaciones Marítimas (`/admin/cotizaciones/maritimas`)
Módulo administrativo para gestión de cotizaciones marítimas. Tabla con columnas: CTZ, Week, Suite, Asesor, CBM, TC, Costo, Costo Paquetería, Estado, Fecha Aprobación, Fecha Subida, Acciones.

**Acciones disponibles**:
- Ver Logs: Modal con tabla de logs asociados a la cotización
- Ver Pagos: Modal con tabla de pagos vinculados (comprobante, cantidad, fecha)
- Descargar PDF: Generación y visualización de PDF en modal con iframe

Endpoints: `GET /quotes/list-quote-maritime`, `POST /quotes/get-data-quote-maritime`, `POST /quotes/get-payments-quote-maritime`, `POST /quotes/download-quote-maritime-pdf`

### TDI-USA (`/admin/cotizaciones/tdi-usa`)
Módulo administrativo para consulta de cotizaciones TDI-USA. Interfaz de doble búsqueda:
- **Por Cliente**: Select de clientes con formato `(clavecliente) nombre`
- **Por Asesor**: Select de asesores

**Tabla de resultados**: CTZ, Estado (Nuevo/Pagado con tags de color), Cliente, Asesor, Cantidad (formato monetario), Fecha de creación (humanizada).

**Acciones disponibles**:
- Ver Pagos: Modal con tabla de pagos vinculados (comprobante descargable, cantidad, fecha)
- Descargar PDF: Visualización de PDF en modal con iframe y opción de descarga

**Características**:
- Búsqueda en tiempo real en tabla
- Paginación controlada (10/20/50/100 registros)
- Estados mapeados: 1=Nuevo (azul), 2=Pagado (verde)

Endpoints: `POST /quotes/get-list-quotes-tdi-usa`, `GET /quotes/quote-pdf/{ctz}`, `POST /quotes/get-quote-payments`

## 📝 Módulos de Examen (detalle)

### Generar PIN (`/admin/examen/generar-pin`)
Módulo administrativo para generar PINs de acceso a exámenes. Formulario con validación completa.

**Campos**:
- Nombre de la persona (requerido, mínimo 3 caracteres)
- Número de teléfono (requerido, 10 dígitos numéricos)

**Proceso**:
1. Validación de formulario
2. Envío a `GET /exam/save-pin` con parámetros `{nombre, telefono}`
3. Modal de éxito con información completa:
   - Confirmación de envío al teléfono
   - PIN generado para respaldo manual
   - Liga de acceso: https://sistemaentregax.com/quiz
   - Instrucciones para envío manual en caso de falla

**Características**:
- Botón naranja corporativo (#ff6600)
- Loading state durante procesamiento
- Limpieza automática del formulario tras éxito
- Manejo de errores con mensajes del servidor

Endpoint: `GET /exam/save-pin`

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

**Última actualización**: Abril 2026  
**Versión**: 2.2.0 
