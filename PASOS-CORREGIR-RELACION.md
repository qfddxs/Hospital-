# 🔧 Pasos para Corregir la Relación Alumnos-Rotaciones

## Problema
- `rotaciones` tiene `estudiante_rotacion_id` (apunta a tabla temporal)
- Necesitamos que apunte a `alumnos` (tabla permanente)

## ✅ Solución Implementada

### 1. **Ejecutar SQL en Supabase** (PRIMERO)

```sql
-- Agregar columna alumno_id a rotaciones
ALTER TABLE rotaciones
ADD COLUMN IF NOT EXISTS alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_rotaciones_alumno_id ON rotaciones(alumno_id);

-- Migrar datos existentes
UPDATE rotaciones r
SET alumno_id = a.id
FROM alumnos a
INNER JOIN estudiantes_rotacion er ON er.id = r.estudiante_rotacion_id
WHERE a.rut = er.rut
  AND a.solicitud_rotacion_id = er.solicitud_rotacion_id
  AND r.alumno_id IS NULL;
```

### 2. **Limpiar estudiantes duplicados**

```sql
-- Eliminar de estudiantes_rotacion los que ya están en alumnos
DELETE FROM estudiantes_rotacion
WHERE solicitud_rotacion_id IN (
    SELECT id FROM solicitudes_rotacion WHERE estado = 'aprobada'
);
```

### 3. **Código Actualizado** (YA HECHO)

#### Portal Rotaciones (`SolicitudDetalle.jsx`)
- ✅ Ahora crea alumnos PRIMERO
- ✅ Luego crea rotaciones con `alumno_id`
- ✅ Finalmente elimina de `estudiantes_rotacion`

#### Hospital (`ControlAsistencia.jsx`)
- ✅ Query usa `rotaciones!alumno_id` (relación explícita)
- ✅ Procesa `rotaciones` como array

## 🧪 Verificar

```sql
-- Ver rotaciones vinculadas a alumnos
SELECT 
    r.id,
    r.fecha_inicio,
    r.estado,
    a.nombre,
    a.primer_apellido,
    a.rut
FROM rotaciones r
INNER JOIN alumnos a ON r.alumno_id = a.id
LIMIT 10;

-- Verificar que estudiantes_rotacion solo tiene pendientes
SELECT 
    sr.estado,
    COUNT(*) AS cantidad
FROM estudiantes_rotacion er
INNER JOIN solicitudes_rotacion sr ON er.solicitud_rotacion_id = sr.id
GROUP BY sr.estado;
```

## 📊 Resultado Esperado

- ✅ `rotaciones` vinculadas a `alumnos` (no a `estudiantes_rotacion`)
- ✅ `estudiantes_rotacion` solo tiene solicitudes pendientes
- ✅ Control de Asistencia carga correctamente
- ✅ Nuevas aprobaciones funcionan automáticamente
