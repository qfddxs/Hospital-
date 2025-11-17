-- =====================================================
-- SCRIPT MAESTRO - EJECUTAR TODAS LAS POLÍTICAS RLS
-- =====================================================
-- Este script ejecuta todas las políticas RLS en el orden correcto
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- IMPORTANTE: Ejecuta cada archivo en este orden:

-- 1. Usuarios de Centros Formadores (base)
\i rls_usuarios_centros.sql

-- 2. Centros Formadores
\i rls_centros_formadores.sql

-- 3. Solicitudes de Rotación
\i rls_solicitudes_rotacion.sql

-- 4. Estudiantes de Rotación (opcional - tabla temporal)
\i rls_estudiantes_rotacion.sql

-- 5. Documentos Requeridos
\i rls_documentos_requeridos.sql

-- 6. Vistas
\i rls_vistas.sql

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Verificar que todas las políticas están activas:

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- NOTA: Si prefieres copiar y pegar manualmente,
-- abre cada archivo en el orden indicado arriba
-- y ejecuta su contenido en Supabase SQL Editor
-- =====================================================
