# Sistema Integral de Gestión de Campos Clínicos

Sistema web para la gestión de campos clínicos del Hospital Regional Dr. Franco Ravera Zunino.

## 🚀 Características

- **Dashboard**: Resumen general con métricas clave, alertas y actividad reciente
- **Capacidad Formadora**: Gestión de centros formadores con importación masiva desde CSV/Excel
- **Solicitud de Cupos**: Administración de solicitudes de cupos clínicos
- **Gestión de Alumnos**: Control de estudiantes en rotación
- **Control de Asistencia**: Registro y seguimiento de asistencia diaria
- **Retribuciones y Reportes**: Gestión de pagos a centros formadores
- **Gestión Documental**: Sistema completo de archivos y documentos con versionado
- **Portal de Centros**: Acceso para centros formadores con permisos específicos

## 🛠️ Tecnologías

### Frontend
- **React 19** - Framework de UI
- **Vite** - Build tool y dev server
- **React Router DOM** - Navegación SPA
- **Tailwind CSS 4** - Framework de estilos
- **Heroicons** - Iconos
- **JavaScript/ES6+**

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Storage
  - Row Level Security (RLS)

## 📦 Instalación

```bash
# Clonar el repositorio
git clone [url-del-repo]
cd Hospital-

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🗄️ Configuración de Base de Datos

Ver documentación completa en [`docs/README.md`](docs/README.md)

### Inicio Rápido

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta los scripts SQL en orden:
   ```bash
   # Schema completo
   supabase/schema-completo.sql
   
   # Políticas de seguridad
   supabase/politicas-seguridad.sql
   
   # (Opcional) Datos de ejemplo
   supabase/datos-ejemplo.sql
   ```

## 📁 Estructura del Proyecto

```
Hospital-/
├── src/
│   ├── components/
│   │   ├── Layout/         # Header, Sidebar, MainLayout
│   │   └── UI/             # Componentes reutilizables
│   ├── pages/              # Páginas principales
│   │   ├── auth/           # Login, registro
│   │   └── portal/         # Portal de centros formadores
│   ├── data/               # Datos mock (desarrollo)
│   ├── App.jsx             # Configuración de rutas
│   ├── main.jsx            # Punto de entrada
│   ├── supabaseClient.js   # Cliente de Supabase
│   └── index.css           # Estilos globales
├── supabase/               # Scripts SQL de Supabase
│   ├── schema-completo.sql
│   ├── politicas-seguridad.sql
│   └── datos-ejemplo.sql
├── docs/
│   └── guides/             # Guías y documentación
├── public/                 # Assets estáticos
└── dist/                   # Build de producción
```

## 🔑 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## 🎯 Funcionalidades Principales

### Capacidad Formadora
- ✅ CRUD completo de centros formadores
- ✅ Importación masiva desde CSV/Excel
- ✅ Gestión de capacidades y especialidades
- ✅ Detección automática de columnas

### Gestión Documental
- ✅ Subida y descarga de documentos
- ✅ Categorización y etiquetado
- ✅ Versionado de documentos
- ✅ Historial de acciones
- ✅ Permisos granulares
- ✅ Búsqueda avanzada

### Portal de Centros
- ✅ Autenticación con Supabase Auth
- ✅ Vista personalizada por centro
- ✅ Solicitud de cupos
- ✅ Seguimiento de solicitudes

## 📊 Base de Datos

### Tablas Principales
- `centros_formadores` - Universidades e instituciones
- `servicios_clinicos` - Servicios del hospital
- `tutores` - Tutores clínicos
- `alumnos` - Estudiantes en rotación
- `rotaciones` - Asignaciones
- `asistencias` - Registro de asistencia
- `retribuciones` - Cálculos económicos
- `solicitudes_cupos` - Solicitudes de cupos
- `documentos` - Sistema documental
- `usuarios` - Usuarios del sistema

Ver schema completo en [`supabase/schema-completo.sql`](supabase/schema-completo.sql)

## 🔐 Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Políticas específicas por rol de usuario
- Autenticación con Supabase Auth
- Tokens JWT para sesiones
- Permisos granulares en documentos

## 📖 Documentación

- **[Documentación General](docs/README.md)** - Guía completa del sistema
- **[Guías Técnicas](docs/guides/README.md)** - Guías de implementación
- **[Schema de Base de Datos](supabase/schema-completo.sql)** - Estructura completa

## 🚧 Estado del Proyecto

### Completado ✅
- Interfaz completa implementada
- Todas las secciones navegables
- Integración con Supabase
- Sistema de autenticación
- Gestión documental completa
- Portal de centros formadores
- Importación masiva de datos
- Políticas de seguridad (RLS)

### En Desarrollo 🔄
- Módulo de retribuciones
- Reportes avanzados
- Notificaciones en tiempo real
- Dashboard con datos en vivo

### Pendiente ⏳
- Exportación de reportes a PDF/Excel
- Integración con sistemas externos
- App móvil
- Módulo de evaluaciones

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Proyecto privado - Hospital Regional Dr. Franco Ravera Zunino

## 📞 Contacto

Para soporte o consultas, contactar al equipo de desarrollo del hospital.

---

**Versión:** 2.0  
**Última actualización:** Noviembre 2025
