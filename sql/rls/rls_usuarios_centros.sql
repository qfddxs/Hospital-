-- =====================================================
-- RLS para tabla usuarios_centros
-- =====================================================
-- Esta política permite que solo los usuarios de centros
-- formadores puedan acceder a sus propios datos
-- =====================================================

-- 1. Habilitar RLS en la tabla
ALTER TABLE usuarios_centros ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "usuarios_centros_select_policy" ON usuarios_centros;
DROP POLICY IF EXISTS "usuarios_centros_insert_policy" ON usuarios_centros;
DROP POLICY IF EXISTS "usuarios_centros_update_policy" ON usuarios_centros;
DROP POLICY IF EXISTS "usuarios_centros_delete_policy" ON usuarios_centros;

-- 3. Política de SELECT: Los usuarios solo pueden ver sus propios datos
CREATE POLICY "usuarios_centros_select_policy"
ON usuarios_centros
FOR SELECT
USING (
  auth.uid() = user_id
);

-- 4. Política de INSERT: Los usuarios pueden crear su propio registro
CREATE POLICY "usuarios_centros_insert_policy"
ON usuarios_centros
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- 5. Política de UPDATE: Los usuarios solo pueden actualizar sus propios datos
CREATE POLICY "usuarios_centros_update_policy"
ON usuarios_centros
FOR UPDATE
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

-- 6. Política de DELETE: Los usuarios solo pueden eliminar sus propios datos
CREATE POLICY "usuarios_centros_delete_policy"
ON usuarios_centros
FOR DELETE
USING (
  auth.uid() = user_id
);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Para verificar que las políticas están activas:
-- SELECT * FROM pg_policies WHERE tablename = 'usuarios_centros';
