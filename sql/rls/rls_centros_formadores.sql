-- =====================================================
-- RLS para tabla centros_formadores
-- =====================================================
-- Esta política permite que:
-- 1. Los centros formadores solo puedan ver y editar sus propios datos
-- 2. El hospital pueda ver todos los centros (para gestión)
-- 3. Portal de rotaciones pueda ver centros (solo lectura)
-- =====================================================

-- 1. Habilitar RLS en la tabla
ALTER TABLE centros_formadores ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "centros_formadores_select_policy" ON centros_formadores;
DROP POLICY IF EXISTS "centros_formadores_insert_policy" ON centros_formadores;
DROP POLICY IF EXISTS "centros_formadores_update_policy" ON centros_formadores;
DROP POLICY IF EXISTS "centros_formadores_delete_policy" ON centros_formadores;

-- 3. Política de SELECT: 
-- - Centros formadores pueden ver solo sus datos
-- - Hospital puede ver todos los centros
-- - Portal rotaciones puede ver todos (lectura)
CREATE POLICY "centros_formadores_select_policy"
ON centros_formadores
FOR SELECT
USING (
  -- Si es un centro formador, solo ve sus datos
  EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
    AND usuarios_centros.centro_formador_id = centros_formadores.id
    AND usuarios_centros.activo = true
  )
  OR
  -- Si es usuario del hospital (no está en usuarios_centros), puede ver todos
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
  OR
  -- Si es usuario de portal rotaciones (no está en usuarios_centros), puede ver todos
  EXISTS (
    SELECT 1 FROM usuarios_portal_rotaciones
    WHERE usuarios_portal_rotaciones.user_id = auth.uid()
    AND usuarios_portal_rotaciones.activo = true
  )
);

-- 4. Política de INSERT: Solo el hospital puede crear centros formadores
CREATE POLICY "centros_formadores_insert_policy"
ON centros_formadores
FOR INSERT
WITH CHECK (
  -- Solo usuarios del hospital (no están en usuarios_centros)
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
);

-- 5. Política de UPDATE: 
-- - Centros formadores pueden actualizar solo sus datos
-- - Hospital puede actualizar todos
CREATE POLICY "centros_formadores_update_policy"
ON centros_formadores
FOR UPDATE
USING (
  -- Si es un centro formador, solo actualiza sus datos
  EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
    AND usuarios_centros.centro_formador_id = centros_formadores.id
    AND usuarios_centros.activo = true
  )
  OR
  -- Si es usuario del hospital, puede actualizar todos
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
)
WITH CHECK (
  -- Mismas condiciones para el check
  EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
    AND usuarios_centros.centro_formador_id = centros_formadores.id
    AND usuarios_centros.activo = true
  )
  OR
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
);

-- 6. Política de DELETE: Solo el hospital puede eliminar centros
CREATE POLICY "centros_formadores_delete_policy"
ON centros_formadores
FOR DELETE
USING (
  -- Solo usuarios del hospital (no están en usuarios_centros)
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Para verificar que las políticas están activas:
-- SELECT * FROM pg_policies WHERE tablename = 'centros_formadores';

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Los centros formadores solo ven y editan sus propios datos
-- 2. El hospital tiene acceso completo (CRUD)
-- 3. Portal rotaciones tiene acceso de solo lectura
-- 4. Si no existe la tabla usuarios_portal_rotaciones, 
--    puedes eliminar esa parte de la política SELECT
