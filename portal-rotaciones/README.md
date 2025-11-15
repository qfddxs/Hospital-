# Portal de Rotaciones

Sistema de gestión de solicitudes de rotación para el Hospital Regional.

## 🚀 Configuración Inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Base de Datos en Supabase

Ejecuta el archivo `database-schema.sql` en el SQL Editor de Supabase para crear las tablas necesarias:

- `usuarios_portal_rotaciones` - Usuarios administradores del portal
- `solicitudes_rotacion` - Solicitudes de rotación (ya existe)
- `estudiantes_rotacion` - Estudiantes en solicitudes (ya existe)
- `alumnos_hospital` - Alumnos aprobados que aparecen en el hospital

### 3. Crear Usuario Administrador

Después de ejecutar el SQL, crea un usuario administrador en Supabase:

1. Ve a Authentication > Users en Supabase
2. Crea un nuevo usuario con email y contraseña
3. Copia el UUID del usuario
4. Ejecuta este SQL reemplazando `USER_UUID_AQUI`:

```sql
INSERT INTO usuarios_portal_rotaciones (user_id, nombre, apellido, email, cargo, activo)
VALUES (
  'USER_UUID_AQUI',
  'Admin',
  'Rotaciones',
  'admin@hospital.cl',
  'Administrador de Rotaciones',
  true
);
```

### 4. Iniciar el servidor
```bash
npm run dev
```

El portal estará disponible en: http://localhost:5175

## 📋 Funcionalidades

### Dashboard
- Ver todas las solicitudes de rotación
- Filtrar por estado (pendiente, aprobada, rechazada)
- Buscar por especialidad o centro formador
- Estadísticas en tiempo real

### Detalle de Solicitud
- Ver información completa de la solicitud
- Ver lista de estudiantes
- **Editar estudiantes** (solo en solicitudes pendientes)
- **Eliminar estudiantes** (solo en solicitudes pendientes)
- Descargar Excel original
- **Aprobar solicitud**: Los estudiantes se crean automáticamente en `alumnos_hospital`
- **Rechazar solicitud**: Con motivo de rechazo

## 🔄 Flujo de Trabajo

1. **Centro Formador** crea solicitud con Excel de estudiantes
2. **Portal Rotaciones** recibe la solicitud (estado: pendiente)
3. **Administrador** revisa y puede editar/eliminar estudiantes
4. **Administrador** aprueba o rechaza:
   - ✅ **Aprobada**: Estudiantes se crean en `alumnos` con estado "en_rotacion"
   - ❌ **Rechazada**: Se guarda motivo de rechazo
5. **Hospital** ve los alumnos aprobados en "Gestión de Alumnos"

## 🗄️ Estructura de Datos

### alumnos
Cuando se aprueba una solicitud, cada estudiante se crea con:
- `solicitud_rotacion_id` - Referencia a la solicitud
- `centro_formador_id` - De qué centro viene
- `rut`, `nombre`, `apellido`, `email`, `telefono`
- `especialidad` - De la solicitud
- `nivel_formacion` - Del estudiante
- `fecha_inicio_rotacion` y `fecha_termino_rotacion`
- `estado` - "en_rotacion" (puede cambiar a "activo", "finalizado", "inactivo")

## 🔐 Seguridad

- Sesión independiente con clave `rotaciones-auth`
- Row Level Security (RLS) habilitado
- Solo usuarios autenticados en `usuarios_portal_rotaciones` pueden acceder
- Misma base de datos que Hospital y Centros Formadores

## 🎨 Características

- ✅ Modo oscuro
- ✅ Diseño responsive
- ✅ Edición inline de estudiantes
- ✅ Validaciones en tiempo real
- ✅ Feedback visual de acciones
- ✅ Búsqueda y filtros
