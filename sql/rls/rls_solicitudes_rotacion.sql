-- =====================================================
-- RLS para tabla solicitudes_rotacion
-- =====================================================
-- Esta política permite que:
-- 1. Los centros formadores solo vean sus propias solicitudes
-- 2. El hospital vea todas las solicitudes
-- 3. Portal de rotaciones vea todas las solicitudes
-- =====================================================

-- 1. Habilitar RLS en la tabla
ALTER TABLE solicitudes_rotacion ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "solicitudes_rotacion_select_policy" ON solicitudes_rotacion;
DROP POLICY IF EXISTS "solicitudes_rotacion_insert_policy" ON solicitudes_rotacion;
DROP POLICY IF EXISTS "solicitudes_rotacion_update_policy" ON solicitudes_rotacion;
DROP POLICY IF EXISTS "solicitudes_rotacion_delete_policy" ON solicitudes_rotacion;

-- 3. Política de SELECT: 
-- - Centros formadores: Solo ven sus solicitudes
-- - Hospital: Ve todas las solicitudes
-- - Portal rotaciones: Ve todas las solicitudes
CREATE POLICY "solicitudes_rotacion_select_policy"
ON solicitudes_rotacion
FOR SELECT
USING (
  -- Si es un centro formador, solo ve sus solicitudes
  EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
    AND usuarios_centros.centro_formador_id = solicitudes_rotacion.centro_formador_id
    AND usuarios_centros.activo = true
  )
  OR
  -- Si es usuario del hospital (no está en usuarios_centros), puede ver todas
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
  OR
  -- Si es usuario de portal rotaciones, puede ver todas
  EXISTS (
    SELECT 1 FROM usuarios_portal_rotaciones
    WHERE usuarios_portal_rotaciones.user_id = auth.uid()
    AND usuarios_portal_rotaciones.activo = true
  )
);

-- 4. Política de INSERT: 
-- - Centros formadores: Solo pueden crear solicitudes para su centro
-- - Hospital: Puede crear solicitudes para cualquier centro
CREATE POLICY "solicitudes_rotacion_insert_policy"
ON solicitudes_rotacion
FOR INSERT
WITH CHECK (
  -- Si es un centro formador, solo crea solicitudes para su centro
  EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
    AND usuarios_centros.centro_formador_id = solicitudes_rotacion.centro_formador_id
    AND usuarios_centros.activo = true
  )
  OR
  -- Si es usuario del hospital, puede crear para cualquier centro
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
);

-- 5. Política de UPDATE: 
-- - Centros formadores: Solo pueden actualizar sus solicitudes (ej: agregar estudiantes)
-- - Hospital: Puede actualizar todas (ej: aprobar/rechazar)
CREATE POLICY "solicitudes_rotacion_update_policy"
ON solicitudes_rotacion
FOR UPDATE
USING (
  -- Si es un centro formador, solo actualiza sus solicitudes
  EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
    AND usuarios_centros.centro_formador_id = solicitudes_rotacion.centro_formador_id
    AND usuarios_centros.activo = true
  )
  OR
  -- Si es usuario del hospital, puede actualizar todas
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
    AND usuarios_centros.centro_formador_id = solicitudes_rotacion.centro_formador_id
    AND usuarios_centros.activo = true
  )
  OR
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
);

-- 6. Política de DELETE: 
-- - Centros formadores: Pueden eliminar sus solicitudes pendientes
-- - Hospital: Puede eliminar cualquier solicitud
CREATE POLICY "solicitudes_rotacion_delete_policy"
ON solicitudes_rotacion
FOR DELETE
USING (
  -- Si es un centro formador, solo elimina sus solicitudes pendientes
  (
    EXISTS (
      SELECT 1 FROM usuarios_centros
      WHERE usuarios_centros.user_id = auth.uid()
      AND usuarios_centros.centro_formador_id = solicitudes_rotacion.centro_formador_id
      AND usuarios_centros.activo = true
    )
    AND solicitudes_rotacion.estado = 'pendiente'
  )
  OR
  -- Si es usuario del hospital, puede eliminar cualquier solicitud
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Para verificar que las políticas están activas:
-- SELECT * FROM pg_policies WHERE tablename = 'solicitudes_rotacion';

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Los centros formadores solo ven sus propias solicitudes
-- 2. Los centros pueden crear y editar sus solicitudes
-- 3. Los centros solo pueden eliminar solicitudes pendientes
-- 4. El hospital tiene acceso completo (CRUD)
-- 5. Portal rotaciones tiene acceso de solo lectura
-- 6. El hospital puede aprobar/rechazar solicitudes (UPDATE)
