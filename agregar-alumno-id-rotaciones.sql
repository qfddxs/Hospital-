-- ============================================
-- AGREGAR RELACIÓN ENTRE ROTACIONES Y ALUMNOS
-- ============================================

-- 1. Agregar columna alumno_id a rotaciones
ALTER TABLE rotaciones
ADD COLUMN IF NOT EXISTS alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE;

-- 2. Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_rotaciones_alumno_id ON rotaciones(alumno_id);

-- 3. Migrar datos existentes: vincular rotaciones con alumnos
-- (Buscar el alumno que corresponde al estudiante_rotacion_id)
UPDATE rotaciones
SET alumno_id = a.id
FROM alumnos a, estudiantes_rotacion er
WHERE er.id = rotaciones.estudiante_rotacion_id
  AND a.rut = er.rut
  AND a.solicitud_rotacion_id = er.solicitud_rotacion_id
  AND rotaciones.alumno_id IS NULL;

-- 4. Verificar que se vincularon correctamente
SELECT 
    COUNT(*) as total_rotaciones,
    COUNT(alumno_id) as rotaciones_con_alumno,
    COUNT(estudiante_rotacion_id) as rotaciones_con_estudiante
FROM rotaciones;

-- 5. Ver rotaciones vinculadas
SELECT 
    r.id,
    r.fecha_inicio,
    r.fecha_termino,
    r.estado,
    a.nombre,
    a.primer_apellido,
    a.rut,
    'VINCULADO' as estado_vinculo
FROM rotaciones r
INNER JOIN alumnos a ON r.alumno_id = a.id
LIMIT 10;
