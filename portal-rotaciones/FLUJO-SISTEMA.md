# 🔄 Flujo del Sistema de Rotaciones

## Diagrama del Flujo

```
┌─────────────────────┐
│ CENTRO FORMADOR     │
│ (Puerto 5174)       │
└──────────┬──────────┘
           │
           │ 1. Crea solicitud
           │    + Sube Excel con estudiantes
           ▼
┌─────────────────────────────────────┐
│ BASE DE DATOS SUPABASE              │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ solicitudes_rotacion        │   │
│ │ - estado: "pendiente"       │   │
│ │ - especialidad              │   │
│ │ - fechas                    │   │
│ │ - archivo_excel_url         │   │
│ └─────────────────────────────┘   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ estudiantes_rotacion        │   │
│ │ - rut, nombre, apellido     │   │
│ │ - email, teléfono           │   │
│ │ - nivel_formacion           │   │
│ └─────────────────────────────┘   │
└──────────┬──────────────────────────┘
           │
           │ 2. Lee solicitudes pendientes
           ▼
┌─────────────────────┐
│ PORTAL ROTACIONES   │
│ (Puerto 5175)       │
│                     │
│ Administrador:      │
│ ✓ Ve solicitudes    │
│ ✓ Edita estudiantes │
│ ✓ Elimina estudiantes│
│ ✓ Aprueba/Rechaza   │
└──────────┬──────────┘
           │
           │ 3a. APRUEBA
           │     - Cambia estado a "aprobada"
           │     - Crea registros en alumnos_hospital
           │
           │ 3b. RECHAZA
           │     - Cambia estado a "rechazada"
           │     - Guarda motivo
           ▼
┌─────────────────────────────────────┐
│ BASE DE DATOS SUPABASE              │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ alumnos_hospital            │   │
│ │ - solicitud_rotacion_id     │   │
│ │ - centro_formador_id        │   │
│ │ - rut, nombre, apellido     │   │
│ │ - especialidad              │   │
│ │ - estado: "en_rotacion"     │   │
│ │ - fecha_inicio_rotacion     │   │
│ │ - fecha_termino_rotacion    │   │
│ └─────────────────────────────┘   │
└──────────┬──────────────────────────┘
           │
           │ 4. Lee alumnos aprobados
           ▼
┌─────────────────────┐
│ HOSPITAL            │
│ (Puerto 5173)       │
│                     │
│ Gestión de Alumnos: │
│ ✓ Ve alumnos        │
│ ✓ Ve centro origen  │
│ ✓ Gestiona rotación │
│ ✓ Cambia estados    │
└─────────────────────┘
```

## Estados de las Solicitudes

### 🟡 Pendiente
- Recién creada por el centro formador
- Esperando revisión del administrador
- Se pueden editar/eliminar estudiantes
- Se puede aprobar o rechazar

### 🟢 Aprobada
- Revisada y aceptada por el administrador
- Estudiantes creados en `alumnos_hospital`
- Ya no se puede editar
- Visible en el hospital

### 🔴 Rechazada
- Revisada y rechazada por el administrador
- Incluye motivo del rechazo
- No se crean alumnos en el hospital
- Ya no se puede editar

## Estados de los Alumnos en el Hospital

### 🔵 en_rotacion
- Estado inicial al aprobar la solicitud
- Alumno está realizando su rotación
- Fechas de inicio y término definidas

### 🟢 activo
- Rotación finalizada exitosamente
- Alumno puede seguir vinculado al hospital
- Para futuras rotaciones o seguimiento

### ⚫ finalizado
- Rotación completada
- Alumno ya no está en el hospital
- Registro histórico

### ⚪ inactivo
- Alumno dado de baja
- No completó la rotación
- Registro histórico

## Tablas Principales

### solicitudes_rotacion
```sql
- id (UUID)
- centro_formador_id (FK)
- especialidad
- fecha_inicio
- fecha_termino
- comentarios
- archivo_excel_url
- estado (pendiente/aprobada/rechazada)
- fecha_respuesta
- respondido_por (FK a usuarios_portal_rotaciones)
- motivo_rechazo
```

### estudiantes_rotacion
```sql
- id (UUID)
- solicitud_rotacion_id (FK)
- rut
- nombre
- apellido
- email
- telefono
- nivel_formacion
```

### alumnos_hospital
```sql
- id (UUID)
- solicitud_rotacion_id (FK)
- centro_formador_id (FK)
- rut (UNIQUE)
- nombre
- apellido
- email
- telefono
- especialidad
- nivel_formacion
- fecha_inicio_rotacion
- fecha_termino_rotacion
- estado (en_rotacion/activo/finalizado/inactivo)
- observaciones
```

## Permisos y Seguridad

### Centro Formador
- ✅ Crear solicitudes
- ✅ Ver sus propias solicitudes
- ❌ No puede editar después de enviar
- ❌ No puede ver solicitudes de otros centros

### Portal Rotaciones (Administrador)
- ✅ Ver todas las solicitudes
- ✅ Editar estudiantes (solo en pendientes)
- ✅ Eliminar estudiantes (solo en pendientes)
- ✅ Aprobar/Rechazar solicitudes
- ✅ Crear alumnos en el hospital

### Hospital
- ✅ Ver alumnos aprobados
- ✅ Ver de qué centro vienen
- ✅ Gestionar estados de alumnos
- ✅ Agregar observaciones
- ❌ No puede ver solicitudes pendientes/rechazadas

## Sesiones Independientes

Cada portal tiene su propia sesión de autenticación:

- **Hospital**: `hospital-auth` (o default)
- **Centros Formadores**: `portal-auth`
- **Portal Rotaciones**: `rotaciones-auth`

Esto permite que un usuario pueda estar logueado en los 3 portales simultáneamente sin conflictos.
