# Portal de Centros Formadores

Portal web para que universidades e instituciones educativas gestionen sus solicitudes de rotación clínica.

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
1. `docs/database/supabase-migrations.sql` - Estructura de base de datos
2. `docs/database/setup-usuario-prueba-completo.sql` - Usuario de prueba

Ver guía completa en [docs/setup/SETUP-SUPABASE.md](docs/setup/SETUP-SUPABASE.md)

### 4. Iniciar servidor
```bash
npm run dev
```

Portal disponible en: **http://localhost:5174**

## 📁 Estructura del Proyecto

```
Centros-formadores-/
├── src/
│   ├── components/         # Componentes reutilizables
│   ├── pages/             # Páginas principales
│   │   ├── Dashboard.jsx  # Panel principal
│   │   ├── Solicitar.jsx  # Nueva solicitud
│   │   └── Solicitudes.jsx # Historial
│   ├── utils/             # Utilidades (dateUtils, etc.)
│   └── supabaseClient.js  # Cliente de Supabase
├── docs/
│   ├── setup/             # Guías de instalación
│   ├── database/          # Scripts SQL
│   ├── guides/            # Guías de uso
│   └── troubleshooting/   # Solución de problemas
└── public/                # Archivos públicos
```

## 🔑 Funcionalidades Principales

### Dashboard
- Resumen de solicitudes (pendientes, aprobadas, rechazadas)
- Cupos disponibles por especialidad
- Actividad reciente
- Estadísticas

### Solicitar Rotación
- Formulario de solicitud de cupos
- Subida de nómina de estudiantes (Excel)
- Validación automática de datos
- Seguimiento de solicitud

### Gestión de Solicitudes
- Historial completo de solicitudes
- Filtros por estado y especialidad
- Detalle de cada solicitud
- Descarga de documentos

### Gestión Documental
- Subida de documentos
- Categorización
- Búsqueda avanzada

## 🛠️ Tecnologías

- **Frontend**: React 19 + Vite
- **Estilos**: Tailwind CSS 4
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Routing**: React Router v6
- **Iconos**: Heroicons

## 📝 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo (puerto 5174)
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linter ESLint
```

## 🗄️ Base de Datos

### Tablas Principales
- `centros_formadores` - Información del centro
- `solicitudes_cupos` - Solicitudes de rotación
- `estudiantes_rotacion` - Estudiantes en solicitudes
- `cupos_disponibles` - Cupos por especialidad
- `documentos` - Sistema documental

Ver schema completo en `docs/database/supabase-migrations.sql`

## 🔒 Seguridad

- Row Level Security (RLS) en todas las tablas
- Autenticación JWT con Supabase
- Acceso restringido por centro formador
- Políticas de acceso granulares

## 📚 Documentación

- [Instalación Completa](docs/setup/)
- [Guías de Uso](docs/guides/)
- [Scripts de Base de Datos](docs/database/)
- [Solución de Problemas](docs/troubleshooting/)

## 🎯 Ecosistema

Este portal forma parte de un sistema de 3 aplicaciones:

- **Hospital** (puerto 5173) - Sistema principal del hospital
- **Centros Formadores** (puerto 5174) - Este portal
- **Portal Rotaciones** (puerto 5175) - Gestión de solicitudes

## 🚧 Estado del Proyecto

### Completado ✅
- Interfaz completa implementada
- Sistema de autenticación
- Solicitud de cupos
- Gestión de estudiantes
- Sistema documental
- Dashboard con estadísticas
- Modo oscuro

### En Desarrollo 🔄
- Notificaciones en tiempo real
- Reportes avanzados

## 📄 Licencia

Proyecto privado - Hospital Regional Dr. Franco Ravera Zunino

---

**Versión:** 1.0  
**Última actualización:** Noviembre 2025
