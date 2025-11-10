# Supabase - Base de Datos

Esta carpeta contiene todos los archivos SQL para la configuración de la base de datos en Supabase.

## 📋 Archivos Principales

### Para Nueva Instalación

Ejecuta estos archivos en orden:

1. **`schema-completo.sql`** ⭐
   - Schema consolidado con todas las tablas
   - Funciones y triggers
   - Índices optimizados
   - Comentarios y documentación

2. **`politicas-seguridad.sql`** ⭐
   - Políticas de Row Level Security (RLS)
   - Permisos por tabla
   - Políticas específicas para portal de centros

3. **`datos-ejemplo.sql`** (Opcional)
   - Datos de prueba
   - Categorías de documentos
   - Centros formadores de ejemplo
   - Servicios, tutores y alumnos

## 🚀 Instalación Rápida

### Opción 1: Supabase Dashboard
1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Abre el SQL Editor
3. Copia y ejecuta el contenido de cada archivo en orden

### Opción 2: CLI de PostgreSQL
```bash
psql -h db.xxx.supabase.co -U postgres -d postgres -f schema-completo.sql
psql -h db.xxx.supabase.co -U postgres -d postgres -f politicas-seguridad.sql
psql -h db.xxx.supabase.co -U postgres -d postgres -f datos-ejemplo.sql
```

### Opción 3: Supabase CLI
```bash
supabase db push
```

## 📁 Archivos Históricos

Los archivos con prefijo `supabase-` son migraciones históricas:

- `supabase-schema.sql` - Schema base original
- `supabase-add-capacidad.sql` - Agregar campos de capacidad
- `supabase-add-solicitudes.sql` - Tabla de solicitudes
- `supabase-gestion-documental.sql` - Sistema documental
- `supabase-portal-centros.sql` - Portal de centros
- `supabase-fix-*.sql` - Correcciones varias

**Nota:** Para nuevas instalaciones, usa solo los archivos principales. Los históricos se mantienen como referencia.

## 🔄 Actualización de Base de Datos Existente

Si ya tienes una base de datos y necesitas actualizarla:

1. Haz backup de tu base de datos actual
2. Revisa los archivos de migración históricos
3. Aplica solo los cambios necesarios
4. Verifica que no haya conflictos

## 📊 Estructura de Tablas

### Gestión de Centros
- `centros_formadores` - Universidades e instituciones
- `servicios_clinicos` - Servicios del hospital
- `tutores` - Tutores clínicos
- `alumnos` - Estudiantes

### Rotaciones y Asistencia
- `rotaciones` - Asignaciones de alumnos
- `asistencias` - Registro de asistencia
- `retribuciones` - Cálculos económicos

### Solicitudes
- `solicitudes_cupos` - Solicitudes de cupos

### Documentos
- `documentos` - Documentos del sistema
- `documentos_categorias` - Categorías
- `documentos_historial` - Historial de acciones
- `documentos_permisos` - Permisos de acceso

### Usuarios
- `usuarios` - Usuarios del sistema
- `usuarios_centros` - Vinculación con centros

## 🔐 Seguridad

Todas las tablas tienen Row Level Security (RLS) habilitado:

- Lectura pública para usuarios autenticados
- Escritura controlada por políticas
- Centros formadores solo ven sus datos
- Admins tienen acceso completo

## 🛠️ Funciones Útiles

```sql
-- Calcular retribuciones de un mes
SELECT * FROM calcular_retribuciones(3, 2025);

-- Estadísticas de documentos
SELECT * FROM obtener_estadisticas_documentos();

-- Actualizar documentos vencidos
SELECT actualizar_estado_documentos();

-- Obtener centro del usuario actual
SELECT get_user_centro_formador();
```

## 📝 Notas Importantes

- Siempre haz backup antes de ejecutar migraciones
- Verifica las políticas RLS después de cambios
- Los triggers se actualizan automáticamente
- Los índices mejoran el rendimiento de consultas

## 🆘 Problemas Comunes

### Error de permisos
Verifica que las políticas RLS estén correctamente configuradas en `politicas-seguridad.sql`

### Constraint violations
Revisa que los datos cumplan con las restricciones (ej: capacidad_disponible <= capacidad_total)

### Funciones no encontradas
Asegúrate de ejecutar primero `schema-completo.sql` que incluye todas las funciones

## 📞 Soporte

Para más información, consulta:
- [Documentación principal](../docs/README.md)
- [Guías técnicas](../docs/guides/README.md)
- [Documentación de Supabase](https://supabase.com/docs)
