-- ============================================
-- Sistema de Reinicio de Cupos - FASE 1
-- Descripción: Sistema híbrido con botón manual para reiniciar cupos
-- Fecha: 2025-11-18
-- ============================================

-- ============================================
-- TABLA: historial_reinicio_cupos
-- Descripción: Registra cada reinicio de cupos realizado
-- ============================================
CREATE TABLE IF NOT EXISTS historial_reinicio_cupos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_reinicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usuario_id UUID REFERENCES auth.users(id),
  centros_afectados INTEGER NOT NULL DEFAULT 0,
  cupos_liberados INTEGER NOT NULL DEFAULT 0,
  solicitudes_afectadas INTEGER NOT NULL DEFAULT 0,
  nivel_formacion VARCHAR(20), -- 'pregrado', 'postgrado', 'ambos'
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_historial_reinicio_fecha ON historial_reinicio_cupos(fecha_reinicio DESC);
CREATE INDEX IF NOT EXISTS idx_historial_reinicio_usuario ON historial_reinicio_cupos(usuario_id);

-- ============================================
-- FUNCIÓN: reiniciar_cupos_manual
-- Descripción: Reinicia los cupos de todos los centros formadores
-- Parámetros:
--   - p_nivel_formacion: 'pregrado', 'postgrado', 'ambos', NULL (todos)
--   - p_usuario_id: ID del usuario que ejecuta el reinicio
--   - p_observaciones: Notas adicionales sobre el reinicio
-- ============================================
CREATE OR REPLACE FUNCTION reiniciar_cupos_manual(
  p_nivel_formacion VARCHAR DEFAULT NULL,
  p_usuario_id UUID DEFAULT NULL,
  p_observaciones TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_centros_afectados INTEGER := 0;
  v_cupos_liberados INTEGER := 0;
  v_solicitudes_afectadas INTEGER := 0;
  v_historial_id UUID;
  v_result JSON;
BEGIN
  -- Contar solicitudes que serán afectadas
  SELECT COUNT(*)
  INTO v_solicitudes_afectadas
  FROM solicitudes_cupos
  WHERE estado = 'aprobada';

  -- Calcular cupos que serán liberados
  SELECT COALESCE(SUM(capacidad_total - capacidad_disponible), 0)
  INTO v_cupos_liberados
  FROM centros_formadores
  WHERE (p_nivel_formacion IS NULL 
    OR nivel_formacion = p_nivel_formacion 
    OR nivel_formacion = 'ambos');

  -- Reiniciar capacidad_disponible = capacidad_total
  UPDATE centros_formadores
  SET 
    capacidad_disponible = capacidad_total,
    updated_at = NOW()
  WHERE (p_nivel_formacion IS NULL 
    OR nivel_formacion = p_nivel_formacion 
    OR nivel_formacion = 'ambos');

  GET DIAGNOSTICS v_centros_afectados = ROW_COUNT;

  -- Cambiar estado de solicitudes aprobadas a 'finalizada'
  UPDATE solicitudes_cupos
  SET 
    estado = 'finalizada'
  WHERE estado = 'aprobada';

  -- Registrar en historial
  INSERT INTO historial_reinicio_cupos (
    usuario_id,
    centros_afectados,
    cupos_liberados,
    solicitudes_afectadas,
    nivel_formacion,
    observaciones
  ) VALUES (
    p_usuario_id,
    v_centros_afectados,
    v_cupos_liberados,
    v_solicitudes_afectadas,
    p_nivel_formacion,
    p_observaciones
  )
  RETURNING id INTO v_historial_id;

  -- Construir respuesta JSON
  v_result := json_build_object(
    'success', true,
    'historial_id', v_historial_id,
    'centros_afectados', v_centros_afectados,
    'cupos_liberados', v_cupos_liberados,
    'solicitudes_afectadas', v_solicitudes_afectadas,
    'nivel_formacion', COALESCE(p_nivel_formacion, 'todos'),
    'fecha_reinicio', NOW()
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- ============================================
-- FUNCIÓN: obtener_estadisticas_pre_reinicio
-- Descripción: Obtiene estadísticas antes de reiniciar
-- ============================================
CREATE OR REPLACE FUNCTION obtener_estadisticas_pre_reinicio(
  p_nivel_formacion VARCHAR DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_centros INTEGER;
  v_cupos_totales INTEGER;
  v_cupos_disponibles INTEGER;
  v_cupos_en_uso INTEGER;
  v_solicitudes_activas INTEGER;
  v_result JSON;
BEGIN
  -- Contar centros
  SELECT COUNT(*)
  INTO v_total_centros
  FROM centros_formadores
  WHERE activo = true
    AND (p_nivel_formacion IS NULL 
      OR nivel_formacion = p_nivel_formacion 
      OR nivel_formacion = 'ambos');

  -- Sumar cupos
  SELECT 
    COALESCE(SUM(capacidad_total), 0),
    COALESCE(SUM(capacidad_disponible), 0)
  INTO v_cupos_totales, v_cupos_disponibles
  FROM centros_formadores
  WHERE activo = true
    AND (p_nivel_formacion IS NULL 
      OR nivel_formacion = p_nivel_formacion 
      OR nivel_formacion = 'ambos');

  v_cupos_en_uso := v_cupos_totales - v_cupos_disponibles;

  -- Contar solicitudes activas
  SELECT COUNT(*)
  INTO v_solicitudes_activas
  FROM solicitudes_cupos
  WHERE estado = 'aprobada';

  -- Construir respuesta
  v_result := json_build_object(
    'total_centros', v_total_centros,
    'cupos_totales', v_cupos_totales,
    'cupos_disponibles', v_cupos_disponibles,
    'cupos_en_uso', v_cupos_en_uso,
    'solicitudes_activas', v_solicitudes_activas,
    'nivel_formacion', COALESCE(p_nivel_formacion, 'todos')
  );

  RETURN v_result;
END;
$$;

-- ============================================
-- POLÍTICAS RLS para historial_reinicio_cupos
-- ============================================
ALTER TABLE historial_reinicio_cupos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Usuarios pueden ver historial de reinicio" ON historial_reinicio_cupos;
DROP POLICY IF EXISTS "Solo función puede insertar historial" ON historial_reinicio_cupos;

-- Política: Los usuarios autenticados pueden ver el historial
CREATE POLICY "Usuarios pueden ver historial de reinicio"
  ON historial_reinicio_cupos
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Solo admins pueden insertar (se maneja desde la función)
CREATE POLICY "Solo función puede insertar historial"
  ON historial_reinicio_cupos
  FOR INSERT
  TO authenticated
  WITH CHECK (false); -- Solo la función SECURITY DEFINER puede insertar

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON TABLE historial_reinicio_cupos IS 'Registra cada reinicio de cupos realizado en el sistema';
COMMENT ON FUNCTION reiniciar_cupos_manual IS 'Reinicia los cupos de centros formadores y finaliza solicitudes activas';
COMMENT ON FUNCTION obtener_estadisticas_pre_reinicio IS 'Obtiene estadísticas antes de realizar un reinicio de cupos';

-- ============================================
-- EJEMPLOS DE USO
-- ============================================

-- Ver estadísticas antes de reiniciar (todos los niveles)
-- SELECT obtener_estadisticas_pre_reinicio();

-- Ver estadísticas solo para pregrado
-- SELECT obtener_estadisticas_pre_reinicio('pregrado');

-- Reiniciar cupos de todos los niveles
-- SELECT reiniciar_cupos_manual(NULL, auth.uid(), 'Reinicio de fin de año académico');

-- Reiniciar solo cupos de pregrado
-- SELECT reiniciar_cupos_manual('pregrado', auth.uid(), 'Reinicio semestral pregrado');

-- Ver historial de reinicios
-- SELECT * FROM historial_reinicio_cupos ORDER BY fecha_reinicio DESC LIMIT 10;
