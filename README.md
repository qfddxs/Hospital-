# Sistema de Gestión Hospitalaria

Sistema web para la gestión de campos clínicos del Hospital Regional Dr. Franco Ravera Zunino.

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### 3. Configurar base de datos
Ejecuta los scripts SQL en Supabase:
1. `docs/database/schema-completo.sql` - Estructura de base de datos
2. `docs/database/politicas-seguridad.sql` - Políticas RLS

### 4. Iniciar servidor
```bash
npm run dev
```

Portal disponible en: **http://localhost:5173**

## 📁 Estructura del Proyecto (Monorepo)

```
Hospital-/
├── src/                        # 🏥 Hospital (puerto 5173)
│   ├── components/            # Componentes reutilizables
│   ├── pages/                 # Páginas principales
│   ├── utils/                 # Utilidades (dateUtils, etc.)
│   └── supabaseClient.js      # Cliente de Supabase
├── Centros-formadores-/        # 🎓 Centros Formadores (puerto 5174)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── portal-rotaciones/          # 📋 Portal Rotaciones (puerto 5175)
│   ├── src/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
│   ├── docs/                  # Documentación específica
│   ├── package.json
│   └── vite.config.js
├── docs/                       # 📚 Documentación general
│   ├── setup/
│   ├── database/
│   ├── guides/
│   └── troubleshooting/
├── supabase/                   # ⚙️ Configuración Supabase
└── public/                     # 📦 Archivos públicos
```

## 🔑 Funcionalidades Principales

### Dashboard
- Resumen general con métricas clave
- Alertas y notificaciones
- Actividad reciente

### Capacidad Formadora
- CRUD completo de centros formadores
- Importación masiva desde CSV/Excel
- Gestión de capacidades y especialidades

### Gestión de Alumnos
- Control de estudiantes en rotación
- Seguimiento de asistencia
- Historial académico

### Solicitudes de Cupos
- Administración de solicitudes
- Aprobación/Rechazo
- Seguimiento de estados

### Sistema Documental
- Subida y descarga de documentos
- Versionado automático
- Permisos granulares
- Búsqueda avanzada

### Portal de Centros
- Acceso para centros formadores
- Solicitud de cupos
- Seguimiento de solicitudes

## 🛠️ Tecnologías

- **Frontend**: React 19 + Vite
- **Estilos**: Tailwind CSS 4
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Routing**: React Router v6
- **Iconos**: Heroicons

## 📝 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo (puerto 5173)
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linter ESLint
```

## 🗄️ Base de Datos

### Tablas Principales
- `centros_formadores` - Universidades e instituciones
- `servicios_clinicos` - Servicios del hospital
- `tutores` - Tutores clínicos
- `alumnos` - Estudiantes en rotación
- `rotaciones` - Asignaciones de rotación
- `asistencias` - Registro de asistencia
- `solicitudes_cupos` - Solicitudes de cupos
- `documentos` - Sistema documental
- `usuarios` - Usuarios del sistema

Ver schema completo en `docs/database/schema-completo.sql`

## 🔒 Seguridad

- Row Level Security (RLS) en todas las tablas
- Autenticación JWT con Supabase
- Políticas de acceso por rol
- Permisos granulares en documentos

## 📚 Documentación

- [Instalación Completa](docs/setup/)
- [Guías de Uso](docs/guides/)
- [Scripts de Base de Datos](docs/database/)
- [Solución de Problemas](docs/troubleshooting/)

## 🎯 Ecosistema de 3 Portales (Monorepo)

Este repositorio contiene 3 aplicaciones independientes que comparten la misma base de datos:

### 🏥 Hospital (puerto 5173)
Sistema principal para el hospital
```bash
npm install
npm run dev
```

### 🎓 Centros Formadores (puerto 5174)
Portal para universidades e instituciones
```bash
cd Centros-formadores-
npm install
npm run dev
```

### 📋 Portal Rotaciones (puerto 5175)
Gestión de solicitudes de rotación
```bash
cd portal-rotaciones
npm install
npm run dev
```

### 🚀 Iniciar todos los portales
```bash
# Terminal 1 - Hospital
npm run dev

# Terminal 2 - Centros Formadores
cd Centros-formadores- && npm run dev

# Terminal 3 - Portal Rotaciones
cd portal-rotaciones && npm run dev
```

## 🚧 Estado del Proyecto

### Completado ✅
- Interfaz completa implementada
- Integración con Supabase
- Sistema de autenticación
- Gestión documental
- Portal de centros formadores
- Importación masiva de datos
- Políticas de seguridad (RLS)

### En Desarrollo 🔄
- Módulo de retribuciones
- Reportes avanzados
- Notificaciones en tiempo real

## 📄 Licencia

Proyecto privado - Hospital Regional Dr. Franco Ravera Zunino

---

**Versión:** 2.0  
**Última actualización:** Noviembre 2025
