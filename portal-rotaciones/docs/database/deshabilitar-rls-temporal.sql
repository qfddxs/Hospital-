-- ============================================
-- DESHABILITAR RLS TEMPORALMENTE (SOLO PARA PRUEBAS)
-- ============================================
-- ADVERTENCIA: Esto permite acceso público a las tablas
-- Solo usar en desarrollo/pruebas
-- NO usar en producción

-- Deshabilitar RLS en las tablas principales
ALTER TABLE solicitudes_rotacion DISABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes_rotacion DISABLE ROW LEVEL SECURITY;
ALTER TABLE centros_formadores DISABLE ROW LEVEL SECURITY;
ALTER TABLE alumnos DISABLE ROW LEVEL SECURITY;

-- Verificar que se deshabilitó
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '🔒 RLS Habilitado' ELSE '🔓 RLS Deshabilitado' END as estado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('solicitudes_rotacion', 'estudiantes_rotacion', 'centros_formadores', 'alumnos')
ORDER BY tablename;

-- NOTA: Una vez que funcione todo, ejecuta setup-minimo.sql
-- para habilitar RLS correctamente con las políticas adecuadas
