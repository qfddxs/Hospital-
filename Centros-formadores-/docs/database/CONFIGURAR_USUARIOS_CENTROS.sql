-- ============================================
-- CONFIGURAR USUARIOS_CENTROS
-- ============================================
-- Este script configura la relación entre usuarios de Supabase Auth
-- y los centros formadores para filtrar estudiantes correctamente

-- 1. Ver estructura de la tabla usuarios_centros
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'usuarios_centros'
ORDER BY ordinal_position;

-- 2. Ver centros formadores disponibles
SELECT 
  id,
  nombre,
  codigo,
  activo
FROM centros_formadores
ORDER BY id;

-- 3. Ver usuarios existentes en Supabase Auth
-- Nota: Esta consulta solo funciona si tienes permisos
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 4. Ver relaciones actuales en usuarios_centros
SELECT 
  uc.id,
  uc.user_id,
  au.email,
  uc.centro_formador_id,
  cf.nombre as centro_formador,
  uc.rol,
  uc.activo,
  uc.created_at
FROM usuarios_centros uc
LEFT JOIN auth.users au ON uc.user_id = au.id
LEFT JOIN centros_formadores cf ON uc.centro_formador_id = cf.id
ORDER BY uc.created_at DESC;

-- 5. EJEMPLO: Insertar relación usuario-centro
-- Reemplazar 'uuid-del-usuario' con el ID real del usuario de auth.users

/*
-- Para UOH
INSERT INTO usuarios_centros (user_id, centro_formador_id, rol, activo)
VALUES (
  'uuid-del-usuario-uoh',  -- Reemplazar con ID real
  1,                        -- ID de UOH en centros_formadores
  'centro_formador',        -- Rol
  true                      -- Activo
);

-- Para INACAP
INSERT INTO usuarios_centros (user_id, centro_formador_id, rol, activo)
VALUES (
  'uuid-del-usuario-inacap',  -- Reemplazar con ID real
  2,                           -- ID de INACAP en centros_formadores
  'centro_formador',           -- Rol
  true                         -- Activo
);
*/

-- 6. Verificar que cada usuario tenga solo un centro formador activo
SELECT 
  user_id,
  COUNT(*) as centros_asignados
FROM usuarios_centros
WHERE activo = true
GROUP BY user_id
HAVING COUNT(*) > 1;
-- No debería retornar ningún resultado

-- 7. Ver estudiantes por centro formador
SELECT 
  cf.id,
  cf.nombre as centro_formador,
  COUNT(a.id) as total_estudiantes,
  COUNT(CASE WHEN a.estado = 'en_rotacion' THEN 1 END) as en_rotacion
FROM centros_formadores cf
LEFT JOIN alumnos a ON cf.id = a.centro_formador_id
GROUP BY cf.id, cf.nombre
ORDER BY cf.id;

-- 8. Verificar que todos los estudiantes tengan centro_formador_id
SELECT 
  COUNT(*) as total_estudiantes,
  COUNT(centro_formador_id) as con_centro_asignado,
  COUNT(*) - COUNT(centro_formador_id) as sin_centro_asignado
FROM alumnos
WHERE estado = 'en_rotacion';

-- 9. Ver estudiantes sin centro formador asignado
SELECT 
  id,
  nombre,
  primer_apellido,
  segundo_apellido,
  rut,
  estado
FROM alumnos
WHERE centro_formador_id IS NULL
  AND estado = 'en_rotacion';

-- 10. OPCIONAL: Asignar centro formador a estudiantes
-- Descomentar y ajustar según sea necesario

/*
-- Asignar estudiantes a UOH
UPDATE alumnos
SET centro_formador_id = 1
WHERE id IN (
  'uuid-estudiante-1',
  'uuid-estudiante-2'
);

-- Asignar estudiantes a INACAP
UPDATE alumnos
SET centro_formador_id = 2
WHERE id IN (
  'uuid-estudiante-3',
  'uuid-estudiante-4'
);
*/

-- ============================================
-- GUÍA PASO A PASO
-- ============================================

/*
PASO 1: Crear usuarios en Supabase Auth
----------------------------------------
1. Ir a Supabase Dashboard → Authentication → Users
2. Hacer clic en "Add User"
3. Crear usuario para cada centro formador:
   - Email: uoh@centroformador.cl
   - Password: (elegir una segura)
   - Auto Confirm User: ✓
4. Copiar el UUID del usuario creado

PASO 2: Vincular usuario con centro formador
---------------------------------------------
1. Ejecutar query de inserción (ver ejemplo arriba)
2. Reemplazar 'uuid-del-usuario' con el UUID real
3. Especificar centro_formador_id correcto (1=UOH, 2=INACAP)

PASO 3: Asignar estudiantes a centros
--------------------------------------
1. Identificar qué estudiantes pertenecen a cada centro
2. Ejecutar UPDATE para asignar centro_formador_id
3. Verificar que no queden estudiantes sin centro

PASO 4: Probar el sistema
--------------------------
1. Hacer login con usuario de UOH
2. Ir a Seguimiento de Estudiantes
3. Verificar que solo aparezcan estudiantes de UOH
4. Repetir con usuario de INACAP
*/

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Resumen completo del sistema
SELECT 
  'Centros Formadores' as categoria,
  COUNT(*) as cantidad
FROM centros_formadores
WHERE activo = true

UNION ALL

SELECT 
  'Usuarios Vinculados' as categoria,
  COUNT(DISTINCT user_id) as cantidad
FROM usuarios_centros
WHERE activo = true

UNION ALL

SELECT 
  'Estudiantes en Rotación' as categoria,
  COUNT(*) as cantidad
FROM alumnos
WHERE estado = 'en_rotacion'

UNION ALL

SELECT 
  'Estudiantes con Centro Asignado' as categoria,
  COUNT(*) as cantidad
FROM alumnos
WHERE estado = 'en_rotacion'
  AND centro_formador_id IS NOT NULL;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
/*
categoria                          | cantidad
-----------------------------------|----------
Centros Formadores                 | 2
Usuarios Vinculados                | 2
Estudiantes en Rotación            | 8
Estudiantes con Centro Asignado    | 8

Todos los estudiantes deben tener centro_formador_id asignado.
Cada usuario debe estar vinculado a exactamente un centro formador.
*/
