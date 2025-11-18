# Scripts SQL - Sistema de Gestión de Rotaciones

Este directorio contiene scripts SQL para configurar y mantener el sistema.

## 📁 Estructura de Archivos

### Sistema de Reinicio de Cupos
- `sistema_reinicio_cupos_fase1.sql` - Implementación completa del sistema de reinicio
- `verificar_sistema_reinicio.sql` - Verificación de instalación correcta
- `limpiar_columnas_duplicadas.sql` - Limpieza de columnas obsoletas

## 🚀 Orden de Ejecución

### 1. Limpieza de Columnas Duplicadas (PRIMERO)
```sql
-- Ejecutar en Supabase SQL Editor
\i sql/scripts/limpiar_columnas_duplicadas.sql
```

**¿Por qué primero?**
- Elimina columnas obsoletas (`cupos_totales`, `cupos_disponibles`, `cupos_en_uso`)
- Migra datos a las columnas correctas (`capacidad_total`, `capacidad_disponible`)
- Previene conflictos con el sistema de reinicio

### 2. Sistema de Reinicio de Cupos
```sql
-- Ejecutar en Supabase SQL Editor
\i sql/scripts/sistema_reinicio_cupos_fase1.sql
```

**¿Qué hace?**
- Crea tabla `historial_reinicio_cupos`
- Crea función `reiniciar_cupos_manual()`
- Crea función `obtener_estadisticas_pre_reinicio()`
- Configura políticas RLS
- Crea índices para rendimiento

### 3. Verificación (OPCIONAL)
```sql
-- Ejecutar en Supabase SQL Editor
\i sql/scripts/verificar_sistema_reinicio.sql
```

**¿Qué verifica?**
- Existencia de tablas y funciones
- Políticas RLS configuradas
- Columnas correctas en centros_formadores
- Integridad de datos
- Estado general del sistema

## 📝 Ejecución Manual en Supabase

### Opción 1: Copiar y Pegar
1. Abrir Supabase Dashboard
2. Ir a **SQL Editor**
3. Crear nueva query
4. Copiar contenido del archivo SQL
5. Ejecutar

### Opción 2: Usar CLI de Supabase
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Ejecutar script
supabase db push --file sql/scripts/limpiar_columnas_duplicadas.sql
supabase db push --file sql/scripts/sistema_reinicio_cupos_fase1.sql
```

## ✅ Verificación Post-Instalación

### Verificar tabla creada
```sql
SELECT * FROM historial_reinicio_cupos LIMIT 1;
```

### Probar función de estadísticas
```sql
SELECT obtener_estadisticas_pre_reinicio();
```

Debería retornar algo como:
```json
{
  "total_centros": 15,
  "cupos_totales": 450,
  "cupos_disponibles": 120,
  "cupos_en_uso": 330,
  "solicitudes_activas": 42,
  "nivel_formacion": "todos"
}
```

### Verificar columnas correctas
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'centros_formadores' 
  AND column_name LIKE '%capac%';
```

Debería mostrar solo:
- `capacidad_total`
- `capacidad_disponible`

## 🐛 Troubleshooting

### Error: "relation already exists"
**Solución**: La tabla ya existe, puedes omitir este error o eliminar la tabla primero:
```sql
DROP TABLE IF EXISTS historial_reinicio_cupos CASCADE;
```

### Error: "function already exists"
**Solución**: Reemplazar la función:
```sql
DROP FUNCTION IF EXISTS reiniciar_cupos_manual CASCADE;
DROP FUNCTION IF EXISTS obtener_estadisticas_pre_reinicio CASCADE;
```

### Error: "column does not exist"
**Solución**: Ejecutar primero el script de limpieza de columnas:
```sql
\i sql/scripts/limpiar_columnas_duplicadas.sql
```

### Error: "permission denied"
**Solución**: Asegurarse de tener permisos de administrador en Supabase

## 📊 Consultas Útiles

### Ver último reinicio
```sql
SELECT * 
FROM historial_reinicio_cupos 
ORDER BY fecha_reinicio DESC 
LIMIT 1;
```

### Estadísticas de reinicios
```sql
SELECT 
  COUNT(*) as total_reinicios,
  SUM(cupos_liberados) as total_cupos_liberados,
  SUM(solicitudes_afectadas) as total_solicitudes_finalizadas
FROM historial_reinicio_cupos;
```

### Centros con cupos disponibles
```sql
SELECT 
  nombre,
  capacidad_total,
  capacidad_disponible,
  (capacidad_total - capacidad_disponible) as en_uso
FROM centros_formadores
WHERE capacidad_disponible > 0
ORDER BY capacidad_disponible DESC;
```

## 🔄 Rollback (Deshacer Cambios)

Si necesitas revertir los cambios:

```sql
-- Eliminar tabla de historial
DROP TABLE IF EXISTS historial_reinicio_cupos CASCADE;

-- Eliminar funciones
DROP FUNCTION IF EXISTS reiniciar_cupos_manual CASCADE;
DROP FUNCTION IF EXISTS obtener_estadisticas_pre_reinicio CASCADE;

-- Restaurar columnas antiguas (si es necesario)
ALTER TABLE centros_formadores 
ADD COLUMN IF NOT EXISTS cupos_totales INTEGER,
ADD COLUMN IF NOT EXISTS cupos_disponibles INTEGER,
ADD COLUMN IF NOT EXISTS cupos_en_uso INTEGER;
```

## 📚 Documentación Relacionada

- [Sistema de Reinicio de Cupos - Fase 1](../../docs/guides/SISTEMA-REINICIO-CUPOS-FASE1.md)
- [Sistema de Cupos Disponibles](../../docs/guides/SISTEMA-CUPOS-DISPONIBLES.md)
- [Actualización Completa de Cupos](../../docs/guides/ACTUALIZACION-COMPLETA-CUPOS-TIEMPO-REAL.md)

## 🆘 Soporte

Si encuentras problemas:
1. Revisar logs de Supabase
2. Ejecutar script de verificación
3. Consultar documentación
4. Revisar políticas RLS
5. Verificar permisos de usuario
