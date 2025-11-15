# Portal de Rotaciones

Sistema de gestión de solicitudes de rotación para el Hospital Regional.

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
Ejecuta los scripts SQL en orden:
1. `docs/database/setup-minimo.sql` - Crea tablas y políticas RLS
2. `docs/database/crear-usuario-rotacion.sql` - Crea tu primer usuario

Ver guía completa en [docs/setup/INSTALACION.md](docs/setup/INSTALACION.md)

### 4. Iniciar servidor
```bash
npm run dev
```

Portal disponible en: **http://localhost:5175**

## 📁 Estructura del Proyecto

```
portal-rotaciones/
├── src/
│   ├── pages/              # Páginas (Login, Dashboard, SolicitudDetalle)
│   ├── context/            # Contextos (Session, Theme)
│   ├── routes/             # Configuración de rutas
│   └── assets/             # Recursos estáticos
├── docs/
│   ├── setup/              # Guías de instalación
│   ├── database/           # Scripts SQL
│   ├── guides/             # Guías de uso
│   └── troubleshooting/    # Solución de problemas
└── public/                 # Archivos públicos
```

## 🔑 Funcionalidades Principales

### Dashboard
- Ver todas las solicitudes de rotación
- Filtrar por estado (pendiente, aprobada, rechazada)
- Buscar por especialidad o centro formador
- Estadísticas en tiempo real

### Gestión de Solicitudes
- Ver detalle completo de cada solicitud
- Editar estudiantes (solo en pendientes)
- Eliminar estudiantes (solo en pendientes)
- Aprobar solicitud → Crea alumnos automáticamente
- Rechazar solicitud → Guarda motivo de rechazo

## 🔄 Flujo de Trabajo

1. **Centro Formador** crea solicitud con Excel de estudiantes
2. **Portal Rotaciones** recibe solicitud (estado: pendiente)
3. **Administrador** revisa y puede editar estudiantes
4. **Administrador** aprueba o rechaza:
   - ✅ **Aprobada**: Estudiantes → tabla `alumnos` (estado: "en_rotacion")
   - ❌ **Rechazada**: Se guarda motivo
5. **Hospital** ve alumnos aprobados en "Gestión de Alumnos"

## 🛠️ Tecnologías

- **Frontend**: React 18 + Vite
- **Estilos**: Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Routing**: React Router v6
- **Iconos**: Heroicons

## 📝 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo (puerto 5175)
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linter ESLint
```

## 🔒 Seguridad

- Row Level Security (RLS) en todas las tablas
- Autenticación JWT con Supabase
- Validación de usuarios en `usuarios_portal_rotaciones`
- Sesión independiente (clave: `rotaciones-auth`)
- Políticas de acceso granulares

## 📚 Documentación

- [Instalación Completa](docs/setup/INSTALACION.md)
- [Crear Usuarios](docs/setup/USUARIO.md)
- [Flujo del Sistema](docs/guides/FLUJO-SISTEMA.md)
- [Control de Acceso](docs/guides/CONTROL-ACCESO.md)
- [Scripts de Base de Datos](docs/database/)

## 🎨 Características

- ✅ Modo oscuro/claro
- ✅ Diseño responsive
- ✅ Edición inline de estudiantes
- ✅ Validaciones en tiempo real
- ✅ Actualizaciones en tiempo real (Supabase Realtime)
- ✅ Feedback visual de acciones
- ✅ Búsqueda y filtros avanzados

## 🐛 Solución de Problemas

Si encuentras problemas, consulta:
- [Troubleshooting](docs/troubleshooting/)
- [Errores Comunes](docs/troubleshooting/ERRORES-CORREGIDOS.md)

## 📄 Licencia

Este proyecto es privado y confidencial.
