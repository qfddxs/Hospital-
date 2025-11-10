# Documentación del Sistema de Gestión de Campos Clínicos

## 📁 Estructura de Documentación

### Base de Datos (en `/supabase`)
Todos los archivos SQL se encuentran ahora en la carpeta raíz `/supabase`.

#### Archivos Principales:
- **`schema-completo.sql`** - Schema consolidado y actualizado con todas las tablas, índices, funciones y triggers
- **`politicas-seguridad.sql`** - Políticas de Row Level Security (RLS) para Supabase
- **`datos-ejemplo.sql`** - Datos de ejemplo para pruebas y desarrollo

#### Archivos de Migración (Históricos):
- `supabase-schema.sql` - Schema base original
- `supabase-add-capacidad.sql` - Agregar campos de capacidad a centros formadores
- `supabase-add-solicitudes.sql` - Tabla de solicitudes de cupos
- `supabase-gestion-documental.sql` - Sistema de gestión documental
- `supabase-portal-centros.sql` - Portal para centros formadores
- `supabase-fix-*.sql` - Correcciones y ajustes varios

### `/guides` - Guías y Documentación
Documentación técnica, guías de uso y resolución de problemas.

#### Archivos:
- Guías de gestión documental
- Instrucciones de configuración
- Checklists de implementación
- Documentación de correcciones

---

## 🚀 Inicio Rápido

### 1. Configuración Inicial de la Base de Datos

Para una instalación nueva, ejecuta los archivos en este orden:

```bash
# 1. Schema completo (incluye todas las tablas, funciones y triggers)
psql -f supabase/schema-completo.sql

# 2. Políticas de seguridad
psql -f supabase/politicas-seguridad.sql

# 3. (Opcional) Datos de ejemplo
psql -f supabase/datos-ejemplo.sql
```

### 2. Configuración de Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Ve a SQL Editor
3. Ejecuta el contenido de `schema-completo.sql`
4. Ejecuta el contenido de `politicas-seguridad.sql`
5. (Opcional) Ejecuta `datos-ejemplo.sql` para datos de prueba

### 3. Configuración de Storage (para documentos)

En Supabase Dashboard:
1. Ve a Storage
2. Crea un bucket llamado `documentos`
3. Configura las políticas de acceso según tus necesidades

---

## 📊 Estructura de la Base de Datos

### Tablas Principales

#### Gestión de Centros y Personal
- **centros_formadores** - Universidades e instituciones
- **servicios_clinicos** - Servicios del hospital
- **tutores** - Tutores clínicos
- **alumnos** - Estudiantes en rotación

#### Gestión de Rotaciones
- **rotaciones** - Asignaciones de alumnos
- **asistencias** - Registro de asistencia
- **retribuciones** - Cálculos económicos

#### Solicitudes
- **solicitudes_cupos** - Solicitudes de cupos de centros formadores

#### Gestión Documental
- **documentos** - Documentos del sistema
- **documentos_categorias** - Categorías de documentos
- **documentos_historial** - Historial de acciones
- **documentos_permisos** - Permisos de acceso

#### Usuarios y Autenticación
- **usuarios** - Usuarios del sistema
- **usuarios_centros** - Vinculación con centros formadores

---

## 🔐 Seguridad

El sistema implementa Row Level Security (RLS) en todas las tablas:

- **Lectura pública**: La mayoría de las tablas permiten lectura a usuarios autenticados
- **Escritura controlada**: Solo usuarios autenticados pueden modificar datos
- **Políticas específicas**: 
  - Centros formadores solo ven sus propias solicitudes
  - Admins tienen acceso completo
  - Documentos con permisos granulares

---

## 🛠️ Funciones Útiles

### Calcular Retribuciones
```sql
SELECT * FROM calcular_retribuciones(3, 2025); -- Mes 3, Año 2025
```

### Obtener Estadísticas de Documentos
```sql
SELECT * FROM obtener_estadisticas_documentos();
```

### Actualizar Estado de Documentos Vencidos
```sql
SELECT actualizar_estado_documentos();
```

### Obtener Centro Formador del Usuario Actual
```sql
SELECT get_user_centro_formador();
```

---

## 📝 Notas Importantes

### Constraints y Validaciones
- `capacidad_disponible` no puede ser mayor que `capacidad_total`
- `capacidad_actual` no puede exceder `capacidad_maxima`
- Las fechas de rotación deben ser válidas (término >= inicio)
- Estados tienen valores predefinidos (usar CHECK constraints)

### Triggers Automáticos
- **updated_at**: Se actualiza automáticamente en todas las tablas
- **Capacidad de servicios**: Se actualiza al cambiar estado de rotaciones
- **Historial de documentos**: Se registra automáticamente cada acción

### Índices
El schema incluye índices optimizados para:
- Búsquedas por RUT
- Filtros por estado
- Búsquedas por fechas
- Relaciones entre tablas
- Búsquedas full-text en arrays (GIN)

---

## 🔄 Migraciones

Si ya tienes una base de datos existente y necesitas actualizarla:

1. Revisa los archivos de migración en `/database`
2. Ejecuta solo los cambios necesarios
3. Verifica que no haya conflictos con datos existentes
4. Haz backup antes de cualquier migración importante

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisa las guías en `/guides`
2. Consulta los archivos `FIX_*.md` para problemas comunes
3. Verifica los logs de Supabase para errores de base de datos

---

## 📅 Versiones

- **v2.0** (2025-11-10) - Schema consolidado y completo
- **v1.x** - Versiones anteriores (archivos históricos)
