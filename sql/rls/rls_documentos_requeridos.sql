-- =====================================================
-- RLS para tabla documentos_requeridos
-- =====================================================
-- Esta política permite que:
-- 1. Todos puedan leer los documentos requeridos (lectura pública)
-- 2. Solo el hospital pueda crear/editar/eliminar documentos requeridos
-- =====================================================

-- 1. Habilitar RLS en la tabla
ALTER TABLE documentos_requeridos ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "documentos_requeridos_select_policy" ON documentos_requeridos;
DROP POLICY IF EXISTS "documentos_requeridos_insert_policy" ON documentos_requeridos;
DROP POLICY IF EXISTS "documentos_requeridos_update_policy" ON documentos_requeridos;
DROP POLICY IF EXISTS "documentos_requeridos_delete_policy" ON documentos_requeridos;

-- 3. Política de SELECT: Todos pueden leer (lectura pública)
CREATE POLICY "documentos_requeridos_select_policy"
ON documentos_requeridos
FOR SELECT
USING (true);  -- Lectura pública para todos los usuarios autenticados

-- 4. Política de INSERT: Solo el hospital puede crear
CREATE POLICY "documentos_requeridos_insert_policy"
ON documentos_requeridos
FOR INSERT
WITH CHECK (
  -- Solo usuarios del hospital (no están en usuarios_centros)
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
);

-- 5. Política de UPDATE: Solo el hospital puede actualizar
CREATE POLICY "documentos_requeridos_update_policy"
ON documentos_requeridos
FOR UPDATE
USING (
  -- Solo usuarios del hospital
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
)
WITH CHECK (
  -- Solo usuarios del hospital
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
);

-- 6. Política de DELETE: Solo el hospital puede eliminar
CREATE POLICY "documentos_requeridos_delete_policy"
ON documentos_requeridos
FOR DELETE
USING (
  -- Solo usuarios del hospital
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Para verificar que las políticas están activas:
-- SELECT * FROM pg_policies WHERE tablename = 'documentos_requeridos';

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Lectura pública: Todos los usuarios autenticados pueden ver los documentos requeridos
-- 2. Solo el hospital puede crear/editar/eliminar documentos requeridos
-- 3. Los centros formadores pueden ver qué documentos necesitan subir
-- 4. Portal rotaciones también puede ver los documentos requeridos
