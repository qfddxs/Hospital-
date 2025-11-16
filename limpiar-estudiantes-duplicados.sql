-- ============================================
-- LIMPIAR ESTUDIANTES DUPLICADOS
-- Elimina de estudiantes_rotacion los que ya están en alumnos
-- ============================================

-- 1. Ver cuántos estudiantes están duplicados
SELECT 
    sr.estado AS estado_solicitud,
    COUNT(DISTINCT er.id) AS estudiantes_en_rotacion,
    COUNT(DISTINCT a.id) AS estudiantes_en_alumnos
FROM estudiantes_rotacion er
INNER JOIN solicitudes_rotacion sr ON er.solicitud_rotacion_id = sr.id
LEFT JOIN alumnos a ON a.solicitud_rotacion_id = sr.id AND a.rut = er.rut
GROUP BY sr.estado;

-- 2. Ver estudiantes específicos que están duplicados
SELECT 
    sr.id AS solicitud_id,
    sr.estado,
    sr.especialidad,
    er.rut,
    er.nombre,
    er.primer_apellido,
    'EN AMBAS TABLAS' AS ubicacion
FROM estudiantes_rotacion er
INNER JOIN solicitudes_rotacion sr ON er.solicitud_rotacion_id = sr.id
INNER JOIN alumnos a ON a.solicitud_rotacion_id = sr.id AND a.rut = er.rut
WHERE sr.estado = 'aprobada'
ORDER BY sr.id, er.primer_apellido;

-- 3. LIMPIAR: Eliminar de estudiantes_rotacion los que ya están en alumnos
-- (Solo de solicitudes APROBADAS)
DELETE FROM estudiantes_rotacion
WHERE solicitud_rotacion_id IN (
    SELECT DISTINCT sr.id
    FROM solicitudes_rotacion sr
    WHERE sr.estado = 'aprobada'
);

-- 4. Verificar que se limpiaron
SELECT 
    sr.estado,
    COUNT(*) AS cantidad_estudiantes
FROM estudiantes_rotacion er
INNER JOIN solicitudes_rotacion sr ON er.solicitud_rotacion_id = sr.id
GROUP BY sr.estado;

-- Resultado esperado:
-- estado    | cantidad_estudiantes
-- ----------|---------------------
-- pendiente | X (solo pendientes deben quedar)
