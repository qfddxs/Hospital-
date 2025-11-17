# Instrucciones para Configurar Supabase

## 🎯 Objetivo
Configurar la tabla `asistencias` para que genere UUID automáticamente y solucionar el error "null value in column 'id'".

---

## 📋 Pasos a Seguir

### 1. Acceder a Supabase
1. Ir a [https://supabase.com](https://supabase.com)
2. Iniciar sesión en tu proyecto
3. En el menú lateral, hacer clic en **SQL Editor**

### 2. Ejecutar Script de Configuración
1. Abrir el archivo `docs/database/FIX_ASISTENCIAS_UUID.sql`
2. Copiar todo el contenido del archivo
3. Pegarlo en el SQL Editor de Supabase
4. Hacer clic en **Run** (o presionar Ctrl+Enter)

### 3. Verificar Resultados
El script ejecutará automáticamente las verificaciones. Deberías ver:

#### ✅ Estructura de la Tabla
```
column_name     | data_type | column_default
----------------|-----------|------------------
id              | uuid      | uuid_generate_v4()
rotacion_id     | bigint    | 
alumno_id       | uuid      | 
fecha           | date      | 
tipo            | varchar   | 'alumno'
estado          | varchar   | 'presente'
presente        | boolean   | true
observaciones   | text      | 
registrado_por  | uuid      | 
created_at      | timestamp | now()
updated_at      | timestamp | now()
```

#### ✅ Constraints
```
asistencias_pkey                    | PRIMARY KEY (id)
asistencias_rotacion_id_fkey        | FOREIGN KEY (rotacion_id)
asistencias_alumno_id_fkey          | FOREIGN KEY (alumno_id)
asistencias_estado_check            | CHECK (estado IN (...))
asistencias_rotacion_id_fecha_tipo  | UNIQUE (rotacion_id, fecha, tipo)
```

#### ✅ Índices
```
idx_asistencias_rotacion
idx_asistencias_alumno
idx_asistencias_fecha
idx_asistencias_estado
idx_asistencias_alumno_fecha
```

---

## ⚠️ Casos Especiales

### Si la tabla ya existe con datos
El script NO eliminará datos existentes. Si necesitas recrear la tabla:

1. **Hacer backup primero**:
```sql
-- Exportar datos existentes
SELECT * FROM asistencias;
-- Copiar y guardar los resultados
```

2. **Descomentar la sección de DROP en el script**:
```sql
-- Buscar esta sección en el script:
/*
DROP TABLE IF EXISTS asistencias CASCADE;
CREATE TABLE asistencias (
  ...
);
*/

-- Quitar los comentarios /* y */
```

3. **Ejecutar el script completo**

4. **Restaurar datos si es necesario**

### Si el error persiste
1. Verificar que la extensión UUID esté habilitada:
```sql
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';
```

2. Si no aparece, ejecutar:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

3. Verificar el default de la columna id:
```sql
SELECT column_default 
FROM information_schema.columns 
WHERE table_name = 'asistencias' AND column_name = 'id';
```

Debería mostrar: `uuid_generate_v4()`

---

## 🧪 Probar la Configuración

### Prueba 1: Insertar sin especificar ID
```sql
INSERT INTO asistencias (rotacion_id, alumno_id, fecha, estado)
VALUES (1, 'uuid-del-alumno', '2024-01-15', 'presente');

-- Verificar que se generó el UUID automáticamente
SELECT id, rotacion_id, fecha, estado FROM asistencias ORDER BY created_at DESC LIMIT 1;
```

### Prueba 2: Upsert (como lo hace la aplicación)
```sql
INSERT INTO asistencias (rotacion_id, alumno_id, fecha, tipo, estado)
VALUES (1, 'uuid-del-alumno', '2024-01-15', 'alumno', 'presente')
ON CONFLICT (rotacion_id, fecha, tipo) 
DO UPDATE SET estado = EXCLUDED.estado;
```

---

## 🔍 Diagnóstico de Problemas

### Error: "extension uuid-ossp does not exist"
**Solución**: Ejecutar en SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Error: "relation asistencias does not exist"
**Solución**: La tabla no existe. Ejecutar la sección CREATE TABLE del script.

### Error: "column id does not exist"
**Solución**: La tabla existe pero sin la columna id. Ejecutar:
```sql
ALTER TABLE asistencias ADD COLUMN id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
```

### Error: "duplicate key value violates unique constraint"
**Solución**: Ya existe un registro con la misma combinación de rotacion_id, fecha y tipo. Esto es correcto, el upsert debería actualizarlo.

---

## 📊 Monitoreo

### Ver últimas asistencias registradas
```sql
SELECT 
  a.id,
  a.fecha,
  a.estado,
  a.observaciones,
  al.nombre || ' ' || al.primer_apellido as alumno,
  a.created_at
FROM asistencias a
LEFT JOIN alumnos al ON a.alumno_id = al.id
ORDER BY a.created_at DESC
LIMIT 10;
```

### Estadísticas por estado
```sql
SELECT 
  estado,
  COUNT(*) as cantidad,
  COUNT(observaciones) as con_observaciones
FROM asistencias
WHERE fecha = CURRENT_DATE
GROUP BY estado;
```

### Verificar observaciones obligatorias en justificados
```sql
SELECT 
  a.id,
  a.fecha,
  al.nombre || ' ' || al.primer_apellido as alumno,
  a.observaciones
FROM asistencias a
LEFT JOIN alumnos al ON a.alumno_id = al.id
WHERE a.estado = 'justificado'
  AND (a.observaciones IS NULL OR a.observaciones = '');
-- No debería retornar ningún resultado
```

---

## ✅ Checklist Final

Antes de cerrar Supabase, verificar:

- [ ] Extensión uuid-ossp habilitada
- [ ] Tabla asistencias existe
- [ ] Columna id es UUID con default uuid_generate_v4()
- [ ] Columna estado tiene check constraint con 4 estados
- [ ] Índices creados correctamente
- [ ] RLS (Row Level Security) habilitado
- [ ] Políticas de seguridad configuradas
- [ ] Trigger de updated_at funcionando
- [ ] Prueba de insert exitosa

---

## 🚀 Siguiente Paso

Una vez completada la configuración en Supabase:

1. Ir a la aplicación web (Hospital)
2. Navegar a **Control de Asistencia**
3. Seleccionar una fecha
4. Probar registrar asistencia con diferentes estados
5. Verificar que "Justificado" requiera observación obligatoria
6. Verificar que otros estados permitan observación opcional
7. Guardar y verificar que no haya errores

---

## 📞 Soporte

Si encuentras algún problema:

1. Revisar la consola del navegador (F12) para ver errores
2. Revisar los logs de Supabase en la sección **Logs**
3. Verificar que las variables de entorno estén correctas en `.env`
4. Consultar la documentación en `docs/OBSERVACIONES_OPCIONALES.md`
