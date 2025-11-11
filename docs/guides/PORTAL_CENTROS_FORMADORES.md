# Portal de Centros Formadores

## 📋 Resumen

Se ha implementado un portal independiente para que los centros formadores (universidades) puedan:
- Registrarse y crear cuentas
- Iniciar sesión
- Solicitar cupos clínicos
- Ver el estado de sus solicitudes

## 🌐 Rutas del Portal

### Públicas
- `/portal-formadora/login` - Inicio de sesión
- `/portal-formadora/registro` - Registro de nuevo centro

### Protegidas (requieren autenticación)
- `/portal-formadora/dashboard` - Panel principal del centro
- `/portal-formadora/solicitar` - Crear nueva solicitud (pendiente)
- `/portal-formadora/solicitudes` - Ver todas las solicitudes (pendiente)

## 📁 Archivos Creados

### Páginas del Portal
1. **`src/pages/portal/PortalLogin.jsx`**
   - Formulario de inicio de sesión
   - Validación de usuario como centro formador
   - Redirección al dashboard

2. **`src/pages/portal/PortalRegistro.jsx`**
   - Formulario de registro
   - Selección de centro formador
   - Creación de usuario en Supabase Auth
   - Vinculación con tabla usuarios_centros

3. **`src/pages/portal/PortalDashboard.jsx`**
   - Panel principal del centro
   - Estadísticas de solicitudes
   - Acciones rápidas
   - Últimas solicitudes

### Rutas
4. **`src/routes/router.jsx`** (actualizado)
   - Rutas del portal agregadas
   - Protección con AuthProtectedRoute

## 🗄️ Base de Datos

### Tabla: usuarios_centros
Ya existe en el schema. Vincula usuarios de Supabase Auth con centros formadores.

```sql
CREATE TABLE usuarios_centros (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    centro_formador_id UUID REFERENCES centros_formadores(id),
    rol VARCHAR(50) DEFAULT 'centro_formador',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Tabla: solicitudes_cupos
Ya existe en el schema. Almacena las solicitudes de cupos.

```sql
CREATE TABLE solicitudes_cupos (
    id UUID PRIMARY KEY,
    centro_formador_id UUID REFERENCES centros_formadores(id),
    especialidad VARCHAR(255),
    numero_cupos INTEGER,
    fecha_solicitud DATE,
    fecha_inicio DATE,
    fecha_termino DATE,
    solicitante VARCHAR(255),
    comentarios TEXT,
    estado VARCHAR(50) DEFAULT 'pendiente',
    motivo_rechazo TEXT,
    aprobado_por VARCHAR(255),
    fecha_aprobacion TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🔐 Flujo de Autenticación

### Registro
1. Usuario selecciona su centro formador
2. Completa datos personales y credenciales
3. Sistema crea usuario en Supabase Auth
4. Sistema vincula usuario con centro en `usuarios_centros`
5. Redirección a login con mensaje de éxito

### Login
1. Usuario ingresa email y contraseña
2. Sistema valida credenciales con Supabase Auth
3. Sistema verifica que usuario esté en `usuarios_centros`
4. Si es válido, redirección a dashboard
5. Si no, cierra sesión y muestra error

## 🎨 Diseño

### Colores
- **Principal**: Teal/Cyan (gradientes)
- **Secundario**: Purple/Pink
- **Estados**:
  - Pendiente: Amarillo
  - Aprobada: Verde
  - Rechazada: Rojo

### Componentes
- Formularios con iconos de Heroicons
- Cards con gradientes
- Estadísticas visuales
- Badges de estado

## 🚀 Próximos Pasos

### Páginas Pendientes
1. **PortalSolicitar.jsx** - Formulario para crear solicitudes
2. **PortalSolicitudes.jsx** - Lista de todas las solicitudes

### Funcionalidades
- [ ] Crear nueva solicitud de cupos
- [ ] Ver detalles de solicitud
- [ ] Filtrar solicitudes por estado
- [ ] Notificaciones cuando cambia estado
- [ ] Editar perfil del centro
- [ ] Historial de solicitudes

### Integración con Dashboard Hospital
- [ ] En "Solicitud de Cupos" del hospital, mostrar todas las solicitudes
- [ ] Permitir aprobar/rechazar desde el hospital
- [ ] Notificar al centro cuando se aprueba/rechaza

## 📝 Uso

### Para Centros Formadores

1. **Registro**
   ```
   1. Ir a /portal-formadora/registro
   2. Seleccionar tu universidad
   3. Completar datos del responsable
   4. Crear contraseña
   5. Confirmar registro
   ```

2. **Solicitar Cupos**
   ```
   1. Iniciar sesión
   2. Click en "Solicitar Cupos"
   3. Completar formulario
   4. Enviar solicitud
   5. Esperar aprobación del hospital
   ```

3. **Ver Solicitudes**
   ```
   1. Desde el dashboard
   2. Ver estadísticas
   3. Click en "Ver Todas"
   4. Filtrar por estado
   ```

### Para Hospital

1. **Ver Solicitudes**
   ```
   1. Ir a Dashboard > Solicitud de Cupos
   2. Ver todas las solicitudes de centros
   3. Filtrar por estado/centro
   ```

2. **Aprobar/Rechazar**
   ```
   1. Click en solicitud
   2. Ver detalles
   3. Aprobar o rechazar
   4. Agregar comentarios si es necesario
   ```

## 🔧 Configuración

### Variables de Entorno
Ya configuradas en `.env`:
```env
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_ANON_KEY=tu_key
```

### Políticas RLS
Las políticas ya están configuradas en `supabase/politicas-seguridad.sql`

## 🐛 Solución de Problemas

### Error: "No tienes permisos"
- Verificar que el usuario esté en `usuarios_centros`
- Verificar que el centro esté activo

### No aparecen solicitudes
- Verificar que `centro_formador_id` coincida
- Verificar políticas RLS en Supabase

### Error al registrar
- Verificar que el email no esté en uso
- Verificar que el centro formador exista
- Verificar permisos de inserción en `usuarios_centros`

---

**Versión:** 1.0  
**Fecha:** Noviembre 2025
