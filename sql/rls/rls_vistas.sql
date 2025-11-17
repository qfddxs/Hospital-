-- =====================================================
-- RLS para VISTAS
-- =====================================================
-- Las vistas en PostgreSQL heredan los permisos de las tablas base
-- Pero podemos agregar políticas adicionales para mayor control
-- =====================================================

-- =====================================================
-- 1. vista_documentos_centros_pendientes
-- =====================================================
ALTER TABLE vista_documentos_centros_pendientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vista_documentos_centros_pendientes_select" ON vista_documentos_centros_pendientes;

CREATE POLICY "vista_documentos_centros_pendientes_select"
ON vista_documentos_centros_pendientes
FOR SELECT
USING (
  -- Centros formadores: Solo ven sus documentos pendientes
  EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
    AND usuarios_centros.centro_formador_id = vista_documentos_centros_pendientes.centro_formador_id
    AND usuarios_centros.activo = true
  )
  OR
  -- Hospital: Ve todos los documentos pendientes
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
);

-- =====================================================
-- 2. vista_documentos_completa
-- =====================================================
ALTER TABLE vista_documentos_completa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vista_documentos_completa_select" ON vista_documentos_completa;

CREATE POLICY "vista_documentos_completa_select"
ON vista_documentos_completa
FOR SELECT
USING (
  -- Centros formadores: Solo ven sus documentos
  EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
    AND usuarios_centros.centro_formador_id = vista_documentos_completa.centro_formador_id
    AND usuarios_centros.activo = true
  )
  OR
  -- Hospital: Ve todos los documentos
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
);

-- =====================================================
-- 3. vista_estadisticas_documentos_centros
-- =====================================================
ALTER TABLE vista_estadisticas_documentos_centros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vista_estadisticas_documentos_centros_select" ON vista_estadisticas_documentos_centros;

CREATE POLICY "vista_estadisticas_documentos_centros_select"
ON vista_estadisticas_documentos_centros
FOR SELECT
USING (
  -- Centros formadores: Solo ven sus estadísticas
  EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
    AND usuarios_centros.centro_formador_id = vista_estadisticas_documentos_centros.centro_formador_id
    AND usuarios_centros.activo = true
  )
  OR
  -- Hospital: Ve todas las estadísticas
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
);

-- =====================================================
-- 4. vista_expedientes_alumnos
-- =====================================================
ALTER TABLE vista_expedientes_alumnos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vista_expedientes_alumnos_select" ON vista_expedientes_alumnos;

CREATE POLICY "vista_expedientes_alumnos_select"
ON vista_expedientes_alumnos
FOR SELECT
USING (
  -- Centros formadores: Solo ven expedientes de sus alumnos
  -- (Asumiendo que la vista tiene centro_formador_id o similar)
  EXISTS (
    SELECT 1 FROM usuarios_centros uc
    INNER JOIN alumnos a ON a.centro_formador_id = uc.centro_formador_id
    WHERE uc.user_id = auth.uid()
    AND uc.activo = true
    AND a.id = vista_expedientes_alumnos.alumno_id
  )
  OR
  -- Hospital: Ve todos los expedientes
  NOT EXISTS (
    SELECT 1 FROM usuarios_centros
    WHERE usuarios_centros.user_id = auth.uid()
  )
);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Para verificar que las políticas están activas:
-- SELECT tablename, policyname FROM pg_policies WHERE tablename LIKE 'vista_%';

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Las vistas heredan permisos de las tablas base
-- 2. Estas políticas agregan una capa adicional de seguridad
-- 3. Los centros formadores solo ven sus propios datos en las vistas
-- 4. El hospital ve todos los datos en todas las vistas
-- 5. Si alguna vista no tiene centro_formador_id, ajusta la política según corresponda
