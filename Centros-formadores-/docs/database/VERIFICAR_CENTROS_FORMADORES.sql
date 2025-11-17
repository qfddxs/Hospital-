-- ============================================
-- VERIFICAR Y CONFIGURAR CENTROS FORMADORES
-- ============================================

-- 1. Ver centros formadores existentes
SELECT 
  id,
  nombre,
  codigo,
  activo,
  created_at
FROM centros_formadores
ORDER BY id;

-- 2. Si no existen, crear centros formadores
INSERT INTO centros_formadores (id, nombre, codigo, activo)
VALUES 
  (1, 'Universidad de O''Higgins (UOH)', 'UOH', true),
  (2, 'INACAP', 'INACAP', true)
ON CONFLICT (id) DO UPDATE
SET 
  nombre = EXCLUDED.nombre,
  codigo = EXCLUDED.codigo,
  activo = EXCLUDED.activo;

-- 3. Ver alumnos y sus centros formadores
SELECT 
  a.id,
  a.nombre,
  a.primer_apellido,
  a.segundo_apellido,
  a.centro_formador_id,
  cf.nombre as centro_formador,
  a.estado
FROM alumnos a
LEFT JOIN centros_formadores cf ON a.centro_formador_id = cf.id
WHERE a.estado = 'en_rotacion'
ORDER BY a.centro_formador_id, a.primer_apellido;

-- 4. Contar estudiantes por centro formador
SELECT 
  cf.id,
  cf.nombre as centro_formador,
  COUNT(a.id) as total_estudiantes,
  COUNT(CASE WHEN a.estado = 'en_rotacion' THEN 1 END) as en_rotacion
FROM centros_formadores cf
LEFT JOIN alumnos a ON cf.id = a.centro_formador_id
GROUP BY cf.id, cf.nombre
ORDER BY cf.id;

-- 5. Ver estudiantes sin centro formador asignado
SELECT 
  id,
  nombre,
  primer_apellido,
  segundo_apellido,
  centro_formador_id,
  estado
FROM alumnos
WHERE centro_formador_id IS NULL
  AND estado = 'en_rotacion';

-- 6. OPCIONAL: Asignar centro formador a estudiantes sin asignar
-- Descomentar y ajustar según sea necesario:

/*
-- Asignar estudiantes a UOH (ejemplo)
UPDATE alumnos
SET centro_formador_id = 1
WHERE id IN (
  -- Reemplazar con IDs de estudiantes de UOH
  'uuid-estudiante-1',
  'uuid-estudiante-2'
);

-- Asignar estudiantes a INACAP (ejemplo)
UPDATE alumnos
SET centro_formador_id = 2
WHERE id IN (
  -- Reemplazar con IDs de estudiantes de INACAP
  'uuid-estudiante-3',
  'uuid-estudiante-4'
);
*/

-- 7. Verificar que todos los estudiantes tengan centro formador
SELECT 
  COUNT(*) as total_estudiantes,
  COUNT(centro_formador_id) as con_centro_asignado,
  COUNT(*) - COUNT(centro_formador_id) as sin_centro_asignado
FROM alumnos
WHERE estado = 'en_rotacion';

-- 8. Ver usuarios de Supabase Auth (para verificar credenciales)
-- Nota: Esta tabla solo es accesible desde el dashboard de Supabase
-- SELECT email FROM auth.users;

-- 9. Crear usuarios en Supabase Auth si no existen
-- Esto debe hacerse desde el Dashboard de Supabase:
-- Authentication → Users → Add User
-- 
-- Usuario UOH:
--   Email: uoh@centroformador.cl
--   Password: uoh2024
--
-- Usuario INACAP:
--   Email: inacap@centroformador.cl
--   Password: inacap2024

-- 10. Verificación final - Resumen
SELECT 
  'Centros Formadores' as tabla,
  COUNT(*) as registros
FROM centros_formadores
UNION ALL
SELECT 
  'Alumnos en Rotación' as tabla,
  COUNT(*) as registros
FROM alumnos
WHERE estado = 'en_rotacion'
UNION ALL
SELECT 
  'Alumnos con Centro Asignado' as tabla,
  COUNT(*) as registros
FROM alumnos
WHERE estado = 'en_rotacion'
  AND centro_formador_id IS NOT NULL;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
/*
Centros Formadores:
- ID 1: Universidad de O'Higgins (UOH)
- ID 2: INACAP

Alumnos:
- Cada alumno debe tener centro_formador_id = 1 o 2
- No debe haber alumnos con centro_formador_id NULL

Usuarios Auth:
- uoh@centroformador.cl (password: uoh2024)
- inacap@centroformador.cl (password: inacap2024)
*/
