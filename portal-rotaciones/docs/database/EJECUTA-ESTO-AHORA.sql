-- ============================================
-- EJECUTA ESTO AHORA EN SUPABASE
-- ============================================
-- Esto deshabilitará RLS temporalmente para que puedas ver las solicitudes

-- 1. Deshabilitar RLS en las tablas
ALTER TABLE solicitudes_rotacion DISABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes_rotacion DISABLE ROW LEVEL SECURITY;
ALTER TABLE centros_formadores DISABLE ROW LEVEL SECURITY;
ALTER TABLE alumnos DISABLE ROW LEVEL SECURITY;

-- 2. Verificar que se deshabilitó
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '🔒 RLS Habilitado (PROBLEMA)' ELSE '✅ RLS Deshabilitado (OK)' END as estado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('solicitudes_rotacion', 'estudiantes_rotacion', 'centros_formadores', 'alumnos')
ORDER BY tablename;

-- 3. Ver tus solicitudes
SELECT 
  id,
  especialidad,
  fecha_inicio,
  fecha_termino,
  estado,
  created_at
FROM solicitudes_rotacion
ORDER BY created_at DESC;

-- Después de ejecutar esto, recarga el portal en el navegador (Ctrl + Shift + R)
