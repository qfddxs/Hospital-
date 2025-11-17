-- =====================================================
-- RLS para tabla estudiantes_rotacion
-- =====================================================
-- Esta política permite que:
-- 1. Los centros formadores solo vean sus propios estudiantes
-- 2. El hospital vea todos los estudiantes
-- 3. Portal de rotaciones vea todos los estudiantes
-- =====================================================

-- 1. Habilitar RLS en la tabla
ALTER TABLE estudiantes_rotacion ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "estudiantes_rotacion_select_policy" ON estudiantes_rotacion;
DROP POLICY IF EXISTS "estudiantes_rotacion_insert_policy" ON estudiantes_rotacion;
DROP POLICY IF EXISTS "estudiantes_rotacion_update_policy" ON estudiantes_rotacion;
DROP POLICY IF EXISTS "estudiantes_rotacion_delete_policy" ON estudiantes_rotacion;

-- 3. Política de SELECT: 
-- - Centros formadores: Solo ven sus estudiantes (a través de solicitud_id)
-- - Hospital: Ve todos los estudiantes
-- - Portal rotaciones: Ve todos los estudiantes
CREATE POLICY "estudiantes_rotacion_select_policy"
ON estudiantes_rotacion
FOR SELECT
USING (
  -- Si es un centro formador, solo ve sus estudiantes
  EXISTS (
    SELECT 1 FROM usuarios_centros uc
    INNER JOIN solicitudes_rotacion sr ON sr.centro_formador_id = uc.centro_formador_id
    WHERE uc.user_id = auth.uid()
    AND uc.activo = true
    AND sr.id = estudiantes_rotacion.solicitud_id
  )
  OR
  -- Si es usuario del hospital (no está en usuarios_centros), puede ver todos
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
  OR
  -- Si es usuario de portal rotaciones, puede ver todos
  EXISTS (
    SELECT 1 FROM usuarios_portal_rotaciones
    WHERE usuarios_portal_rotaciones.user_id = auth.uid()
    AND usuarios_portal_rotaciones.activo = true
  )
);

-- 4. Política de INSERT: 
-- - Centros formadores: Solo pueden agregar estudiantes a sus solicitudes
-- - Hospital: Puede agregar estudiantes a cualquier solicitud
CREATE POLICY "estudiantes_rotacion_insert_policy"
ON estudiantes_rotacion
FOR INSERT
WITH CHECK (
  -- Si es un centro formador, solo agrega estudiantes a sus solicitudes
  EXISTS (
    SELECT 1 FROM usuarios_centros uc
    INNER JOIN solicitudes_rotacion sr ON sr.centro_formador_id = uc.centro_formador_id
    WHERE uc.user_id = auth.uid()
    AND uc.activo = true
    AND sr.id = estudiantes_rotacion.solicitud_id
  )
  OR
  -- Si es usuario del hospital, puede agregar a cualquier solicitud
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
);

-- 5. Política de UPDATE: 
-- - Centros formadores: Solo pueden actualizar sus estudiantes
-- - Hospital: Puede actualizar todos los estudiantes
CREATE POLICY "estudiantes_rotacion_update_policy"
ON estudiantes_rotacion
FOR UPDATE
USING (
  -- Si es un centro formador, solo actualiza sus estudiantes
  EXISTS (
    SELECT 1 FROM usuarios_centros uc
    INNER JOIN solicitudes_rotacion sr ON sr.centro_formador_id = uc.centro_formador_id
    WHERE uc.user_id = auth.uid()
    AND uc.activo = true
    AND sr.id = estudiantes_rotacion.solicitud_id
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
    SELECT 1 FROM usuarios_centros uc
    INNER JOIN solicitudes_rotacion sr ON sr.centro_formador_id = uc.centro_formador_id
    WHERE uc.user_id = auth.uid()
    AND uc.activo = true
    AND sr.id = estudiantes_rotacion.solicitud_id
  )
  OR
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
);

-- 6. Política de DELETE: 
-- - Centros formadores: Pueden eliminar sus estudiantes de solicitudes pendientes
-- - Hospital: Puede eliminar cualquier estudiante
CREATE POLICY "estudiantes_rotacion_delete_policy"
ON estudiantes_rotacion
FOR DELETE
USING (
  -- Si es un centro formador, solo elimina sus estudiantes de solicitudes pendientes
  (
    EXISTS (
      SELECT 1 FROM usuarios_centros uc
      INNER JOIN solicitudes_rotacion sr ON sr.centro_formador_id = uc.centro_formador_id
      WHERE uc.user_id = auth.uid()
      AND uc.activo = true
      AND sr.id = estudiantes_rotacion.solicitud_id
      AND sr.estado = 'pendiente'
    )
  )
  OR
  -- Si es usuario del hospital, puede eliminar cualquier estudiante
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Para verificar que las políticas están activas:
-- SELECT * FROM pg_policies WHERE tablename = 'estudiantes_rotacion';

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Los centros formadores solo ven estudiantes de sus solicitudes
-- 2. Los centros pueden agregar/editar estudiantes a sus solicitudes
-- 3. Los centros solo pueden eliminar estudiantes de solicitudes pendientes
-- 4. El hospital tiene acceso completo (CRUD)
-- 5. Portal rotaciones tiene acceso de solo lectura
-- 6. La relación se hace a través de solicitud_id
