-- ============================================
-- DIAGNÓSTICO DEL PORTAL DE ROTACIONES
-- ============================================
-- Ejecuta este SQL para ver qué falta configurar

-- 1. Verificar que existen las tablas
SELECT 
  'solicitudes_rotacion' as tabla,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'solicitudes_rotacion')
    THEN '✅ Existe' ELSE '❌ No existe' END as estado
UNION ALL
SELECT 
  'estudiantes_rotacion' as tabla,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estudiantes_rotacion')
    THEN '✅ Existe' ELSE '❌ No existe' END as estado
UNION ALL
SELECT 
  'centros_formadores' as tabla,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'centros_formadores')
    THEN '✅ Existe' ELSE '❌ No existe' END as estado
UNION ALL
SELECT 
  'alumnos' as tabla,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alumnos')
    THEN '✅ Existe' ELSE '❌ No existe' END as estado
UNION ALL
SELECT 
  'usuarios_portal_rotaciones' as tabla,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios_portal_rotaciones')
    THEN '✅ Existe' ELSE '❌ No existe' END as estado;

-- 2. Verificar RLS (Row Level Security)
SELECT 
  tablename as tabla,
  CASE WHEN rowsecurity THEN '✅ Habilitado' ELSE '⚠️ Deshabilitado' END as rls_estado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('solicitudes_rotacion', 'estudiantes_rotacion', 'centros_formadores', 'alumnos', 'usuarios_portal_rotaciones')
ORDER BY tablename;

-- 3. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN cmd = 'r' THEN 'SELECT'
    WHEN cmd = 'a' THEN 'INSERT'
    WHEN cmd = 'w' THEN 'UPDATE'
    WHEN cmd = 'd' THEN 'DELETE'
    WHEN cmd = '*' THEN 'ALL'
  END as comando
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('solicitudes_rotacion', 'estudiantes_rotacion', 'usuarios_portal_rotaciones')
ORDER BY tablename, policyname;

-- 4. Contar registros
SELECT 'solicitudes_rotacion' as tabla, COUNT(*) as registros FROM solicitudes_rotacion
UNION ALL
SELECT 'estudiantes_rotacion' as tabla, COUNT(*) as registros FROM estudiantes_rotacion
UNION ALL
SELECT 'centros_formadores' as tabla, COUNT(*) as registros FROM centros_formadores
UNION ALL
SELECT 'alumnos' as tabla, COUNT(*) as registros FROM alumnos
UNION ALL
SELECT 'usuarios_portal_rotaciones' as tabla, COUNT(*) as registros FROM usuarios_portal_rotaciones;

-- 5. Verificar columnas de solicitudes_rotacion
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'solicitudes_rotacion'
ORDER BY ordinal_position;

-- 6. Ver usuarios del portal
SELECT id, nombre, apellido, email, cargo, activo
FROM usuarios_portal_rotaciones;

-- 7. Ver solicitudes (primeras 5)
SELECT 
  id,
  especialidad,
  fecha_inicio,
  fecha_termino,
  COALESCE(estado, 'sin_estado') as estado,
  created_at
FROM solicitudes_rotacion
ORDER BY created_at DESC
LIMIT 5;
