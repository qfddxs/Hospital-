# Scripts SQL para Supabase

Este directorio contiene todos los scripts SQL necesarios para configurar la base de datos en Supabase.

## 🚀 Inicio Rápido

Para un proyecto nuevo de Supabase, ejecuta en orden:

```sql
1. 00-schema-completo.sql      -- Crea todas las tablas y triggers
2. 01-rls-policies.sql         -- Configura políticas de seguridad RLS
3. datos-ejemplo-demo.sql      -- (Opcional) Datos de ejemplo para demo
```

## 📁 Archivos Principales

### ⭐ Archivos Esenciales

- **`00-schema-completo.sql`** - Schema completo del sistema
  - Todas las tablas (centros_formadores, solicitudes_cupos, alumnos, etc.)
  - Índices y constraints
  - Triggers para updated_at
  - Comentarios de documentación

- **`01-rls-policies.sql`** - Políticas de seguridad Row Level Security
  - Políticas para centros formadores
  - Políticas para personal del hospital
  - Separación de permisos por rol

- **`datos-ejemplo-demo.sql`** - Datos de ejemplo para demostración
  - 5 centros formadores (pregrado y postgrado)
  - 7 solicitudes de cupos (pendientes, aprobadas, rechazadas)
  - Datos realistas para presentaciones

### 🛠️ Archivos Útiles

- **`limpiar-centros-formadores.sql`** - Limpia datos de prueba
- **`crear-tabla-solicitudes-cupos.sql`** - Referencia de tabla solicitudes
- **`crear-tabla-usuarios-centros.sql`** - Referencia de tabla usuarios_centros
- **`ARCHIVOS_A_ELIMINAR.md`** - Lista de archivos obsoletos

## 📊 Estructura de la Base de Datos

```
centros_formadores          -- Universidades e instituciones
    ↓
usuarios_centros           -- Vincula Auth con centros
    ↓
solicitudes_cupos          -- Solicitudes de cupos clínicos
    ↓
alumnos                    -- Estudiantes en rotación
    ↓
rotaciones                 -- Rotaciones clínicas
    ↓
asistencias                -- Control de asistencia
```

## 🔐 Seguridad (RLS)

El sistema implementa Row Level Security para:

- **Centros Formadores:** Solo ven y editan su propia información
- **Hospital:** Ve y gestiona todo el sistema
- **Solicitudes:** Centros ven las suyas, hospital ve todas

## 🎯 Casos de Uso

### Configuración Inicial
```sql
-- 1. Crear schema
\i 00-schema-completo.sql

-- 2. Configurar seguridad
\i 01-rls-policies.sql

-- 3. Insertar datos de ejemplo (opcional)
\i datos-ejemplo-demo.sql
```

### Limpiar Datos de Prueba
```sql
\i limpiar-centros-formadores.sql
```

## 📝 Notas Importantes

- Ejecutar los scripts en el orden indicado
- Verificar que no haya errores antes de continuar
- Los datos de ejemplo son opcionales (solo para demo)
- Las políticas RLS son críticas para la seguridad

## 🗑️ Archivos Obsoletos

Ver `ARCHIVOS_A_ELIMINAR.md` para lista de archivos que pueden eliminarse (ya consolidados).

## 📚 Documentación Adicional

- Ver `docs/SEPARACION_PROYECTOS.md` para arquitectura del sistema
- Ver `docs/guides/` para guías de implementación
