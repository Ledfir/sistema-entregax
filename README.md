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
- **Observar Resultados**: visualización de resultados de exámenes por PIN

### 💵 Dólares
- Solicitud de envío con factura
- Catálogo de servicios disponibles
- Mis envíos (activos y archivados)
- **Cuentas de Proveedores** (`/dolares/cuentas-proveedores`): gestión de cuentas de proveedores para módulo dólares (acceso FACTURACIÓN)
- **Catálogo de Claves SAT** (`/dolares/catalogo-claves-sat`): catálogo de claves SAT para facturación (acceso FACTURACIÓN)
- **Tipo de Cambio** (`/dolares/tipo-cambio`): consulta y configuración del tipo de cambio (acceso FACTURACIÓN)

### 💳 Monedero
- **Historial**: registro de movimientos del monedero del usuario
- **Saldo**: consulta de saldo disponible
- **Subir pagos**: carga de comprobantes de pago

### 🏦 RMBs
- Solicitud con factura y sin factura
- Mis envíos y envíos archivados
- Catálogo de servicios

### 💰 USDTs
- Solicitud con factura y sin factura
- Mis envíos y envíos archivados
- Catálogo de servicios

### 📊 Comisiones
- Reporte de comisiones por asesor (acceso ADMIN)

### 🤖 IA EntregaX
- Módulo de inteligencia artificial integrado (acceso SISTEMAS)

### 🎮 Juego
- Juego Snake integrado en la plataforma
- Accesible desde dos rutas: `/juego` (vista principal) y `/snake` (acceso directo al juego)

### ⚙️ Configuración del Sistema
- **Cuentas**: gestión de cuentas bancarias
- **Bancos**: catálogo de bancos
- **Servicios**: configuración de servicios
- **Generales**: configuración general del sistema

### 🚢 Marítimos (Módulo ASESOR/SC)
- Cotizaciones marítimas
- Panel de instrucciones PL

### ⚓ Operación Marítima
- Clientes marítimos y consignatarios
- Cotizaciones de operación marítima
- Navieras y puertos
- PCTL (Pre-Carga de Tráfico Logístico)
- PLs pendientes
- Subir nuevo week
- Validar manifiesto
- Validar DHL y TDI-DHL
- **Control de Gastos** (`/maritima/control-gastos`): control y seguimiento de gastos de operación marítima
- **TDI-DHL Marítimo** (`/maritima/tdi-dhl`): integración TDI-DHL en operación marítima

### 📦 BLS (Marítimo)
- Agregar usuario marítimo
- BLs cargados

### 🏛️ Administración – Bancos
- Listado de archivos de cuentas
- Reporte de estado de cuenta
- Subir estado de cuenta
- Transferir saldo entre cuentas

### 👥 Administración – Clientes
- Panel administrativo de clientes (vista global)

### 📈 Administración – Reportes
- Reporte US
- Reporte de gastos semanales (GastosWeek)

### 🏭 CEDIS Monterrey / CDMX / Guadalajara
- **Salidas Diarias**: gestión de salidas por tipo (Marítimo, USA, DHL, TDI GDL/CDMX/MTY/DHL)
  - Tabla de registros pendientes con clave cliente, cajas, fecha humanizada y responsable
  - Botón `Dar Salida` con confirmación modal
  - Modal de detalles con guías, estado, mapa de Google Maps y soporte multi-registro
- **Solicitud de Documentos**: formulario para solicitar información o documentos a un cliente
  - Select de clientes con búsqueda (muestra `nombre (clavecliente)`)
  - Textarea para especificar la solicitud
  - Envío al endpoint `/cedis/solicitud-documentos`
- **DHL Ingresos Diarios**: registro de ingresos DHL del día
- **Impresión de Instrucciones DHL**: impresión de instrucciones para paquetes DHL
- **Recepción DHL**: módulo de recepción de paquetes DHL
- **Búsqueda de Impuesto**: búsqueda de impuesto por guía
- **Salida DHL**: registro de salida DHL

### 📦 CEDIS TDI
- **Impresión de Instrucciones TDI** (`/cedis/tdi/imp-instrucciones`): impresión de instrucciones para paquetes TDI
- **Recepción TDI** (`/cedis/tdi/recepcion`): recepción de paquetes TDI en CEDIS
- **Reimprimir QR TDI** (`/cedis/tdi/reimprimir-qr`): reimpresión de código QR para paquetes TDI
- **Salida TDI** (`/cedis/tdi/salida`): registro de salida de paquetes TDI
- Acceso para roles: **CEDIS MONTERREY**, **CEDIS CDMX**, **CEDIS GUADALAJARA**

### 📬 TDI-DHL (Gestión de Inventario)
- **Ingresos Diarios TDI** (`/tdi/ingresos-diarios`): registro de ingresos diarios TDI-DHL
- **Ingresar Guías al Inventario** (`/tdi/ingresar-guias-inventario`): alta de guías en inventario TDI
- **Inventario TDI** (`/tdi/inventario`): consulta y gestión del inventario TDI-DHL
- **Ingresar Guías TDI** (`/tdi/ingresar-guias`): ingreso de guías TDI al sistema
- Acceso para roles: **SERVICIO AL CLIENTE**, **SISTEMAS**, **ADMIN**, **CEDIS MONTERREY**

### 🇺🇸 CEDIS USA
- **Ingreso** (`/usa/ingreso`): registro de ingreso de paquetes en CEDIS USA
- **Salida** (`/usa/salida`): registro de salida de paquetes desde CEDIS USA
- **Tarima** (`/usa/tarima`): gestión de tarimas de paquetes
- **Cancelar** (`/usa/cancelar`): cancelación de registros en CEDIS USA
- **Reporte** (`/usa/reporte`): reporte de operaciones CEDIS USA
- **Reimprimir** (`/usa/reimprimir`): reimpresión de etiquetas y documentos
- **Reempaque** (`/usa/reempaque`): registro de reempaque de paquetes USA
- Acceso exclusivo para rol: **CEDIS USA** (+ SISTEMAS, ADMIN)

### 🇺🇸 USA Operativo
- **Ingresos Diarios** (`/usa/ingresos-diarios`): control de ingresos diarios USA
- **Impresión de Instrucciones** (`/usa/imp-instrucciones`): impresión de instrucciones para paquetes USA
- **Recepción** (`/usa/recepcion`): recepción de paquetes USA en CEDIS
- **Salida** (`/usa/salida`): salida de paquetes USA desde CEDIS
- Acceso para roles: **SERVICIO AL CLIENTE**, **SISTEMAS**, **ADMIN**, **CEDIS MONTERREY**

### ⚓ CEDIS CDMX – Marítimo
- **Historial BL Recibidos** (`/cdmx/maritimo/historial-bl`): historial de BLs marítimos recibidos en CDMX
- **Imprimir Instrucciones** (`/cdmx/maritimo/imp-instrucciones`): impresión de instrucciones para paquetes marítimos
- **Ingresar Logs** (`/cdmx/maritimo/ingresar-logs`): ingreso de logs de operaciones marítimas
- **Recibir BL** (`/cdmx/maritimo/recibir-bl`): recepción de Bill of Lading en CDMX
- **Salida Marítimo** (`/cdmx/maritimo/salida`): registro de salida de carga marítima
- Acceso para roles: **CEDIS CDMX**, **CEDIS GUADALAJARA**

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
│   ├── common/       # ProtectedRoute, RoleGuard, ActivarDesactivarPagosModal
│   └── layout/       # AppHeader, MainLayout (menú lateral)
├── config/           # Configuraciones globales
├── hooks/            # Custom hooks
├── pages/            # Páginas de la aplicación
│   ├── admin/        # Módulos administrativos
│   │   ├── bancos/   # Estado de cuenta, listado, subir, transferir
│   │   ├── clientes/ # ClientesAdmin (vista global)
│   │   ├── gastosweek/ # ReporteGastosWeek
│   │   └── reporteus/  # ReporteUS
│   ├── asesores/     # Lista de asesores
│   ├── auth/         # Login, Unauthorized
│   ├── bls/          # AgregarUsuarioMaritimo, BlsCargados
│   ├── cargosextra/  # Lista, historial y pendientes de cargos extra
│   ├── cedis/        # Módulos CEDIS Monterrey/CDMX/GDL
│   │   ├── Salidas.tsx              # Salidas diarias por tipo
│   │   └── SolicitudDocumentos.tsx  # Solicitud de documentos a clientes
│   ├── cedis-maritimo/ # CEDIS CDMX – Módulo Marítimo
│   │   ├── HistorialBlRecibidos.tsx # Historial de BLs marítimos recibidos
│   │   ├── ImprimirInstrucciones.tsx# Impresión de instrucciones marítimas
│   │   ├── IngresarLogs.tsx         # Ingreso de logs de operación marítima
│   │   ├── RecibirBL.tsx            # Recepción de BL en CDMX/GDL
│   │   └── SalidaMaritimo.tsx       # Salida de carga marítima
│   ├── cedis-usa/    # CEDIS USA – Operaciones de paquetes USA
│   │   ├── Ingreso.tsx              # Ingreso de paquetes
│   │   ├── Salida.tsx               # Salida de paquetes
│   │   ├── Tarima.tsx               # Gestión de tarimas
│   │   ├── Cancelar.tsx             # Cancelación de registros
│   │   ├── Reporte.tsx              # Reportes CEDIS USA
│   │   ├── Reimprimir.tsx           # Reimpresión de etiquetas
│   │   └── Reempaque.tsx            # Reempaque de paquetes
│   ├── clientes/     # CRUD clientes + direcciones de facturación + Mis Clientes
│   ├── comisiones/   # ReporteComisiones
│   ├── config/       # Generales, cuentas, bancos, servicios
│   ├── cotizaciones/ # Mis Cotizaciones, Instrucciones, Guías Archivadas, Pendientes, Marítimas, TDI-USA
│   ├── dashboard/    # Dashboard general
│   ├── dhl/          # Módulos DHL – CEDIS Monterrey/CDMX/GDL
│   │   ├── CedisIngresosDiarios.tsx # Ingresos diarios DHL
│   │   ├── ImpresionInstrucciones.tsx # Impresión instrucciones DHL
│   │   ├── Recepcion.tsx            # Recepción de paquetes DHL
│   │   ├── Salida.tsx               # Salida DHL
│   │   └── BusquedaImpuesto.tsx     # Búsqueda de impuesto por guía
│   ├── dolares/      # EnvioConFactura, CatalogoServicios, MisEnvios, EnviosArchivados,
│   │                 # CuentasProveedores, CatalogoClavesSat, TipoCambio
│   ├── encuestas/    # Encuestas pendientes y realizadas
│   ├── examen/       # GenerarPin, ObservarResultados
│   ├── ia/           # IAEntregaX
│   ├── juego/        # Juego.tsx (menú), Snake.tsx (juego)
│   ├── maritimos/    # Cotizaciones marítimas (ASESOR/SC), PanelPLInstrucciones
│   ├── monedero/     # Historial, Saldo, SubirPagos
│   ├── operaciones/  # Módulos de operaciones logísticas
│   ├── polizas/      # PolizasNuevas, PolizasPagadas, GenerarPoliza, MisPolizas
│   ├── profile/      # Perfil de usuario
│   ├── rmbs/         # MisEnvios, EnviosArchivados, Con/SinFactura, CatalogoServicios
│   ├── tdi/          # ImpInstruccionesTdi, RecepcionTdi, ReimprimirQrTdi, SalidaTdi
│   ├── tdi-dhl/      # IngresosDiariosTdi, IngresarGuiasInventario, InventarioTdi, IngresarGuiasTdi
│   ├── tickets/      # TicketCreate, TicketsActivos, TicketsArchivados, ReporteEstadistico
│   ├── usa/          # ImpInstruccionesUsa, IngresosDiarios, RecepcionUsa, SalidaUsa
│   ├── usdts/        # MisEnvios, EnviosArchivados, Con/SinFactura, CatalogoServicios
│   └── usuarios/     # CRUD de usuarios
├── router/           # AppRouter.tsx — todas las rutas protegidas por rol
├── services/         # Servicios API
│   ├── authService.ts
│   ├── bancosService.ts
│   ├── cargoExtraService.ts
│   ├── cedisMaritimoService.ts
│   ├── clienteService.ts
│   ├── comisionesService.ts
│   ├── cotizacionesService.ts
│   ├── cuentasService.ts
│   ├── encuestaService.ts
│   ├── examService.ts
│   ├── operacionesService.ts
│   ├── pagosService.ts
│   ├── polizasService.ts
│   ├── serviciosService.ts
│   ├── ticketsService.ts
│   └── userService.ts
├── store/            # Zustand stores (authStore)
├── types/            # Tipos TypeScript
└── utils/            # Utilidades (dateUtils, index)
```

## 🔐 Roles y Permisos

| Rol | Acceso |
|-----|--------|
| **ADMIN** | Acceso completo al sistema, gestión de usuarios, configuración global |
| **SISTEMAS** | Administración técnica, acceso a módulos de operaciones y cotizaciones |
| **ASESOR** | Gestión de sus clientes, cotizaciones, instrucciones, guías archivadas |
| **SERVICIO AL CLIENTE** | Gestión de pólizas, validación de costos, encuestas, cotizaciones, operaciones |
| **ADMINISTRACIÓN** | Acceso administrativo general, clientes, cargos, tickets |
| **TEAM LEADER** | Gestión de equipo, reportes, vista de clientes |
| **ATENCION A CLIENTES** | Gestión de clientes, creación de tickets, cargos extra |
| **OPERACION MARITIMA** | BLs marítimos, cotizaciones marítimas, clientes/consignatarios, navieras, weeks, validar manifiesto |
| **CEDIS MONTERREY** | Salidas diarias, solicitud de documentos, ingresos DHL, impresión de instrucciones, recepción, búsqueda de impuesto, salida DHL |
| **CEDIS CDMX** | Módulos DHL/TDI CDMX, marítimo CDMX (recibir BL, historial, salida, ingresar logs, imprimir instrucciones) |
| **CEDIS GUADALAJARA** | Módulos DHL/TDI Guadalajara, marítimo GDL (mismos accesos que CEDIS CDMX) |
| **CEDIS USA** | Gestión de paquetes USA: ingreso, salida, tarimas, cancelaciones, reempaque, reimprimir, reporte |
| **FACTURACIÓN** | Acceso a cuentas de proveedores, catálogo de claves SAT y tipo de cambio (módulo Dólares) |

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
| `/polizas/crear` | Generar póliza | SC, ASESOR, SISTEMAS, ADMIN |
| `/polizas/mis-polizas` | Mis pólizas | SC, ASESOR, SISTEMAS, ADMIN |
| `/polizas/nuevas` | Pólizas nuevas | SC |
| `/polizas/pagadas` | Pólizas pagadas | SC, ADMIN |
| `/tickets/crear` | Crear ticket | Múltiples roles |
| `/tickets/mis-tickets` | Mis tickets | Múltiples roles |
| `/tickets/activos` | Tickets activos | SC |
| `/tickets/archivados` | Tickets archivados | Múltiples roles |
| `/tickets/reporte-estadistico` | Reporte de tickets | SC |
| `/monedero/historial` | Historial monedero | ASESOR, SC, SISTEMAS, ADMIN |
| `/monedero/saldo` | Saldo monedero | ASESOR, SC, SISTEMAS, ADMIN |
| `/monedero/subir-pagos` | Subir pagos | ASESOR, SC, SISTEMAS, ADMIN |
| `/dolares/solicitud/con-factura` | Envío dólares con factura | ASESOR, SC, SISTEMAS, ADMIN |
| `/dolares/catalogo-servicios` | Catálogo servicios dólares | ASESOR, SC, SISTEMAS, ADMIN |
| `/dolares/mis-envios` | Mis envíos dólares | ASESOR, SC, SISTEMAS, ADMIN |
| `/dolares/envios-archivados` | Envíos archivados dólares | ASESOR, SC, SISTEMAS, ADMIN |
| `/rmbs/solicitud/con-factura` | RMBs con factura | ASESOR, SC, SISTEMAS, ADMIN |
| `/rmbs/solicitud/sin-factura` | RMBs sin factura | ASESOR, SC, SISTEMAS, ADMIN |
| `/rmbs/mis-envios` | Mis envíos RMBs | ASESOR, SC, SISTEMAS, ADMIN |
| `/rmbs/envios-archivados` | Envíos archivados RMBs | ASESOR, SC, SISTEMAS, ADMIN |
| `/rmbs/catalogo-servicios` | Catálogo servicios RMBs | ASESOR, SC, SISTEMAS, ADMIN |
| `/usdts/solicitud/con-factura` | USDTs con factura | ASESOR, SC, SISTEMAS, ADMIN |
| `/usdts/solicitud/sin-factura` | USDTs sin factura | ASESOR, SC, SISTEMAS, ADMIN |
| `/usdts/mis-envios` | Mis envíos USDTs | ASESOR, SC, SISTEMAS, ADMIN |
| `/usdts/envios-archivados` | Envíos archivados USDTs | ASESOR, SC, SISTEMAS, ADMIN |
| `/usdts/catalogo-servicios` | Catálogo servicios USDTs | ASESOR, SC, SISTEMAS, ADMIN |
| `/maritimos/cotizaciones` | Cotizaciones marítimas | ASESOR, SC, SISTEMAS, ADMIN |
| `/maritimos/panel-pl-instrucciones` | Panel PL instrucciones | ASESOR, SC, SISTEMAS, ADMIN |
| `/maritima/clientes` | Clientes marítimos | OPERACION MARITIMA, SISTEMAS, ADMIN |
| `/maritima/consignatarios` | Consignatarios | OPERACION MARITIMA, SISTEMAS, ADMIN |
| `/maritima/cotizaciones` | Cotizaciones OP marítima | OPERACION MARITIMA, SISTEMAS, ADMIN |
| `/maritima/navieras` | Navieras y puertos | OPERACION MARITIMA, SISTEMAS, ADMIN |
| `/maritima/pctl` | PCTL | OPERACION MARITIMA, SISTEMAS, ADMIN |
| `/maritima/pls-pendientes` | PLs pendientes | OPERACION MARITIMA, SISTEMAS, ADMIN |
| `/maritima/subir-week` | Subir nuevo week | OPERACION MARITIMA, SISTEMAS, ADMIN |
| `/maritima/dhl` | Validar DHL | OPERACION MARITIMA, SISTEMAS, ADMIN |
| `/maritima/validar-manifiesto` | Validar manifiesto | OPERACION MARITIMA, SISTEMAS, ADMIN |
| `/admin/bls/agregar-usuario-maritimo` | Agregar usuario marítimo | OPERACION MARITIMA, SISTEMAS, ADMIN |
| `/admin/bls/cargados` | BLs cargados | OPERACION MARITIMA, SISTEMAS, ADMIN |
| `/admin/bancos/listado-archivos` | Listado archivos cuentas | ADMIN |
| `/admin/bancos/reporte-estado-cuenta` | Reporte estado de cuenta | ADMIN |
| `/admin/bancos/subir-estado-cuenta` | Subir estado de cuenta | ADMIN |
| `/admin/bancos/transferir-saldo` | Transferir saldo | ADMIN |
| `/admin/clientes` | Clientes (panel admin) | ADMIN |
| `/admin/reporte-us` | Reporte US | ADMIN |
| `/admin/comisiones/reporte` | Reporte comisiones | ADMIN |
| `/admin/examen/observar-resultados` | Observar resultados examen | ADMIN |
| `/configuracion/cuentas` | Cuentas | SISTEMAS, ADMIN |
| `/configuracion/bancos` | Bancos | SISTEMAS, ADMIN |
| `/configuracion/servicios` | Servicios | SISTEMAS, ADMIN |
| `/configuracion/generales` | Generales | SISTEMAS |
| `/ia/entregax` | IA EntregaX | SISTEMAS |
| `/cedis/salidas` | Salidas diarias | CEDIS MONTERREY, CEDIS CDMX, CEDIS GUADALAJARA |
| `/cedis/solicitud-documentos` | Solicitud de documentos | CEDIS MONTERREY, CEDIS CDMX, CEDIS GUADALAJARA, CEDIS USA |
| `/cedis/dhl/ingresos-diarios` | Ingresos diarios DHL | CEDIS MONTERREY |
| `/cedis/dhl/imp-instrucciones` | Impresión instrucciones DHL | CEDIS MONTERREY, CEDIS CDMX, CEDIS GUADALAJARA |
| `/cedis/dhl/recepcion` | Recepción DHL | SC, SISTEMAS, ADMIN, CEDIS MONTERREY, CEDIS CDMX, CEDIS GUADALAJARA |
| `/cedis/dhl/busqueda-impuesto` | Búsqueda impuesto | SC, SISTEMAS, ADMIN, CEDIS MONTERREY |
| `/cedis/dhl/salida` | Salida DHL | SC, SISTEMAS, ADMIN, CEDIS MONTERREY, CEDIS CDMX, CEDIS GUADALAJARA |
| `/cedis/tdi/imp-instrucciones` | Impresión instrucciones TDI | CEDIS MONTERREY, CEDIS CDMX, CEDIS GUADALAJARA |
| `/cedis/tdi/recepcion` | Recepción TDI | CEDIS MONTERREY, CEDIS CDMX, CEDIS GUADALAJARA |
| `/cedis/tdi/reimprimir-qr` | Reimprimir QR TDI | CEDIS MONTERREY, CEDIS CDMX, CEDIS GUADALAJARA |
| `/cedis/tdi/salida` | Salida TDI | CEDIS MONTERREY, CEDIS CDMX, CEDIS GUADALAJARA |
| `/tdi/ingresos-diarios` | Ingresos diarios TDI-DHL | SC, SISTEMAS, ADMIN, CEDIS MONTERREY |
| `/tdi/ingresar-guias-inventario` | Ingresar guías al inventario | SC, SISTEMAS, ADMIN, CEDIS MONTERREY |
| `/tdi/inventario` | Inventario TDI | SC, SISTEMAS, ADMIN, CEDIS MONTERREY |
| `/tdi/ingresar-guias` | Ingresar guías TDI | SC, SISTEMAS, ADMIN, CEDIS MONTERREY |
| `/usa/ingreso` | Ingreso CEDIS USA | CEDIS USA, SISTEMAS, ADMIN |
| `/usa/salida` | Salida CEDIS USA | CEDIS USA, SISTEMAS, ADMIN |
| `/usa/tarima` | Tarima CEDIS USA | CEDIS USA, SISTEMAS, ADMIN |
| `/usa/cancelar` | Cancelar CEDIS USA | CEDIS USA, SISTEMAS, ADMIN |
| `/usa/reporte` | Reporte CEDIS USA | CEDIS USA, SISTEMAS, ADMIN |
| `/usa/reimprimir` | Reimprimir CEDIS USA | CEDIS USA, SISTEMAS, ADMIN |
| `/usa/reempaque` | Reempaque CEDIS USA | CEDIS USA, SISTEMAS, ADMIN |
| `/usa/ingresos-diarios` | Ingresos diarios USA | SC, SISTEMAS, ADMIN, CEDIS MONTERREY, CEDIS USA |
| `/usa/imp-instrucciones` | Impresión instrucciones USA | SC, SISTEMAS, ADMIN, CEDIS MONTERREY |
| `/usa/recepcion` | Recepción USA | SC, SISTEMAS, ADMIN, CEDIS MONTERREY |
| `/cdmx/maritimo/historial-bl` | Historial BL recibidos | CEDIS CDMX, CEDIS GUADALAJARA |
| `/cdmx/maritimo/imp-instrucciones` | Imprimir instrucciones marítimo | CEDIS CDMX, CEDIS GUADALAJARA |
| `/cdmx/maritimo/ingresar-logs` | Ingresar logs marítimo | CEDIS CDMX, CEDIS GUADALAJARA |
| `/cdmx/maritimo/recibir-bl` | Recibir BL | CEDIS CDMX, CEDIS GUADALAJARA |
| `/cdmx/maritimo/salida` | Salida marítimo CDMX | CEDIS CDMX, CEDIS GUADALAJARA |
| `/dolares/cuentas-proveedores` | Cuentas de proveedores | FACTURACIÓN, SISTEMAS, ADMIN |
| `/dolares/catalogo-claves-sat` | Catálogo claves SAT | FACTURACIÓN, SISTEMAS, ADMIN |
| `/dolares/tipo-cambio` | Tipo de cambio | FACTURACIÓN, SISTEMAS, ADMIN |
| `/maritima/control-gastos` | Control de gastos marítimo | OPERACION MARITIMA, SISTEMAS, ADMIN |
| `/maritima/tdi-dhl` | TDI-DHL Marítimo | OPERACION MARITIMA, SISTEMAS, ADMIN |
| `/snake` | Juego Snake (acceso directo) | Todos |
| `/paqueterias/lista` | Lista paqueterías | SISTEMAS |
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

**Última actualización**: Mayo 2026  
**Versión**: 2.4.0 
