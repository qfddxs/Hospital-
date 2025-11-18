-- ============================================
-- Script: Arreglar Permisos de Eliminación
-- Descripción: Permite eliminar solicitudes_cupos sin problemas
-- Fecha: 2025-11-18
-- ============================================

-- ============================================
-- PASO 1: Ver políticas actuales de solicitudes_cupos
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'solicitudes_cupos'
ORDER BY policyname;

-- ============================================
-- PASO 2: Habilitar RLS si no está habilitado
-- ============================================
ALTER TABLE solicitudes_cupos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 3: Eliminar políticas restrictivas antiguas
-- ============================================
DROP POLICY IF EXISTS "Usuarios pueden eliminar solicitudes" ON solicitudes_cupos;
DROP POLICY IF EXISTS "Solo admin puede eliminar" ON solicitudes_cupos;
DROP POLICY IF EXISTS "Centros pueden eliminar sus solicitudes" ON solicitudes_cupos;

-- ============================================
-- PASO 4: Crear política permisiva para DELETE
-- ============================================

-- Eliminar política de DELETE si existe
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar solicitudes" ON solicitudes_cupos;

-- Política: Usuarios autenticados pueden eliminar solicitudes
CREATE POLICY "Usuarios autenticados pueden eliminar solicitudes"
  ON solicitudes_cupos
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- PASO 5: Verificar otras políticas necesarias
-- ============================================

-- Política: Usuarios pueden ver solicitudes
DROP POLICY IF EXISTS "Usuarios pueden ver solicitudes" ON solicitudes_cupos;
CREATE POLICY "Usuarios pueden ver solicitudes"
  ON solicitudes_cupos
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Usuarios pueden insertar solicitudes
DROP POLICY IF EXISTS "Usuarios pueden crear solicitudes" ON solicitudes_cupos;
CREATE POLICY "Usuarios pueden crear solicitudes"
  ON solicitudes_cupos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Usuarios pueden actualizar solicitudes
DROP POLICY IF EXISTS "Usuarios pueden actualizar solicitudes" ON solicitudes_cupos;
CREATE POLICY "Usuarios pueden actualizar solicitudes"
  ON solicitudes_cupos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PASO 6: Verificar políticas finales
-- ============================================
SELECT 
  policyname,
  cmd as operacion,
  permissive as tipo
FROM pg_policies
WHERE tablename = 'solicitudes_cupos'
ORDER BY cmd, policyname;

-- Resultado esperado: 4 políticas (SELECT, INSERT, UPDATE, DELETE)

-- ============================================
-- PASO 7: Probar eliminación
-- ============================================
-- Ahora deberías poder eliminar solicitudes desde Supabase Dashboard
-- o desde tu aplicación sin problemas

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Si necesitas políticas más restrictivas en el futuro, puedes:
-- 1. Filtrar por centro_formador_id
-- 2. Filtrar por usuario_id
-- 3. Permitir solo ciertos roles
--
-- Ejemplo de política restrictiva:
-- CREATE POLICY "Centros solo ven sus solicitudes"
--   ON solicitudes_cupos
--   FOR SELECT
--   TO authenticated
--   USING (
--     centro_formador_id IN (
--       SELECT centro_formador_id 
--       FROM usuarios_centros 
--       WHERE user_id = auth.uid()
--     )
--   );
-- ============================================
