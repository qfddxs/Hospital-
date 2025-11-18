-- ============================================
-- Sistema de Descuento Automático de Cupos
-- Descripción: Triggers que descuentan/devuelven cupos automáticamente
-- Fecha: 2025-11-18
-- ============================================

-- ============================================
-- PASO 1: Crear tabla de historial de movimientos de cupos
-- ============================================
CREATE TABLE IF NOT EXISTS historial_movimientos_cupos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centro_formador_id UUID NOT NULL REFERENCES centros_formadores(id) ON DELETE CASCADE,
  solicitud_cupos_id UUID REFERENCES solicitudes_cupos(id) ON DELETE SET NULL,
  tipo_movimiento VARCHAR(20) NOT NULL, -- 'descuento', 'devolucion', 'reinicio', 'ajuste_manual'
  cupos_afectados INTEGER NOT NULL,
  capacidad_antes INTEGER NOT NULL,
  capacidad_despues INTEGER NOT NULL,
  estado_solicitud VARCHAR(20), -- 'pendiente', 'aprobada', 'rechazada'
  motivo TEXT,
  usuario_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_historial_movimientos_centro ON historial_movimientos_cupos(centro_formador_id);
CREATE INDEX IF NOT EXISTS idx_historial_movimientos_solicitud ON historial_movimientos_cupos(solicitud_cupos_id);
CREATE INDEX IF NOT EXISTS idx_historial_movimientos_fecha ON historial_movimientos_cupos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_historial_movimientos_tipo ON historial_movimientos_cupos(tipo_movimiento);

-- ============================================
-- PASO 2: Función para registrar movimientos
-- ============================================
CREATE OR REPLACE FUNCTION registrar_movimiento_cupos(
  p_centro_id UUID,
  p_solicitud_id UUID,
  p_tipo VARCHAR,
  p_cupos INTEGER,
  p_capacidad_antes INTEGER,
  p_capacidad_despues INTEGER,
  p_estado VARCHAR DEFAULT NULL,
  p_motivo TEXT DEFAULT NULL,
  p_usuario_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO historial_movimientos_cupos (
    centro_formador_id,
    solicitud_cupos_id,
    tipo_movimiento,
    cupos_afectados,
    capacidad_antes,
    capacidad_despues,
    estado_solicitud,
    motivo,
    usuario_id
  ) VALUES (
    p_centro_id,
    p_solicitud_id,
    p_tipo,
    p_cupos,
    p_capacidad_antes,
    p_capacidad_despues,
    p_estado,
    p_motivo,
    p_usuario_id
  );
END;
$$;

-- ============================================
-- PASO 3: Función principal del trigger
-- ============================================
CREATE OR REPLACE FUNCTION sincronizar_cupos_solicitud()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_capacidad_actual INTEGER;
  v_capacidad_nueva INTEGER;
  v_centro_id UUID;
BEGIN
  -- Determinar el centro_formador_id según la operación
  IF (TG_OP = 'DELETE') THEN
    v_centro_id := OLD.centro_formador_id;
  ELSE
    v_centro_id := NEW.centro_formador_id;
  END IF;

  -- Obtener capacidad actual del centro
  SELECT capacidad_disponible INTO v_capacidad_actual
  FROM centros_formadores
  WHERE id = v_centro_id;

  -- ============================================
  -- CASO 1: NUEVA SOLICITUD APROBADA (INSERT)
  -- ============================================
  IF (TG_OP = 'INSERT' AND NEW.estado = 'aprobada') THEN
    -- Verificar que hay cupos suficientes
    IF v_capacidad_actual < NEW.numero_cupos THEN
      RAISE EXCEPTION 'No hay suficientes cupos disponibles. Disponibles: %, Solicitados: %', 
        v_capacidad_actual, NEW.numero_cupos;
    END IF;

    -- Descontar cupos
    v_capacidad_nueva := v_capacidad_actual - NEW.numero_cupos;
    
    UPDATE centros_formadores
    SET capacidad_disponible = v_capacidad_nueva,
        updated_at = NOW()
    WHERE id = v_centro_id;

    -- Registrar en historial
    PERFORM registrar_movimiento_cupos(
      v_centro_id,
      NEW.id,
      'descuento',
      NEW.numero_cupos,
      v_capacidad_actual,
      v_capacidad_nueva,
      'aprobada',
      'Solicitud aprobada - Cupos asignados',
      NULL
    );

    RETURN NEW;
  END IF;

  -- ============================================
  -- CASO 2: CAMBIO DE ESTADO (UPDATE)
  -- ============================================
  IF (TG_OP = 'UPDATE') THEN
    
    -- SUBCASO 2A: De PENDIENTE/RECHAZADA a APROBADA
    IF (OLD.estado IN ('pendiente', 'rechazada') AND NEW.estado = 'aprobada') THEN
      -- Verificar cupos disponibles
      IF v_capacidad_actual < NEW.numero_cupos THEN
        RAISE EXCEPTION 'No hay suficientes cupos disponibles. Disponibles: %, Solicitados: %', 
          v_capacidad_actual, NEW.numero_cupos;
      END IF;

      -- Descontar cupos
      v_capacidad_nueva := v_capacidad_actual - NEW.numero_cupos;
      
      UPDATE centros_formadores
      SET capacidad_disponible = v_capacidad_nueva,
          updated_at = NOW()
      WHERE id = v_centro_id;

      -- Registrar en historial
      PERFORM registrar_movimiento_cupos(
        v_centro_id,
        NEW.id,
        'descuento',
        NEW.numero_cupos,
        v_capacidad_actual,
        v_capacidad_nueva,
        'aprobada',
        'Solicitud aprobada - Estado cambiado de ' || OLD.estado || ' a aprobada',
        NULL
      );
    END IF;

    -- SUBCASO 2B: De APROBADA a RECHAZADA
    IF (OLD.estado = 'aprobada' AND NEW.estado = 'rechazada') THEN
      -- Devolver cupos
      v_capacidad_nueva := v_capacidad_actual + OLD.numero_cupos;
      
      UPDATE centros_formadores
      SET capacidad_disponible = v_capacidad_nueva,
          updated_at = NOW()
      WHERE id = v_centro_id;

      -- Registrar en historial
      PERFORM registrar_movimiento_cupos(
        v_centro_id,
        NEW.id,
        'devolucion',
        OLD.numero_cupos,
        v_capacidad_actual,
        v_capacidad_nueva,
        'rechazada',
        'Solicitud rechazada - Cupos devueltos. Motivo: ' || COALESCE(NEW.motivo_rechazo, 'No especificado'),
        NULL
      );
    END IF;

    -- SUBCASO 2C: De APROBADA a PENDIENTE (revertir aprobación)
    IF (OLD.estado = 'aprobada' AND NEW.estado = 'pendiente') THEN
      -- Devolver cupos
      v_capacidad_nueva := v_capacidad_actual + OLD.numero_cupos;
      
      UPDATE centros_formadores
      SET capacidad_disponible = v_capacidad_nueva,
          updated_at = NOW()
      WHERE id = v_centro_id;

      -- Registrar en historial
      PERFORM registrar_movimiento_cupos(
        v_centro_id,
        NEW.id,
        'devolucion',
        OLD.numero_cupos,
        v_capacidad_actual,
        v_capacidad_nueva,
        'pendiente',
        'Aprobación revertida - Cupos devueltos',
        NULL
      );
    END IF;

    -- SUBCASO 2D: Cambio en número de cupos mientras está APROBADA
    IF (OLD.estado = 'aprobada' AND NEW.estado = 'aprobada' AND OLD.numero_cupos != NEW.numero_cupos) THEN
      -- Calcular diferencia
      DECLARE
        v_diferencia INTEGER := NEW.numero_cupos - OLD.numero_cupos;
      BEGIN
        IF v_diferencia > 0 THEN
          -- Solicitan más cupos
          IF v_capacidad_actual < v_diferencia THEN
            RAISE EXCEPTION 'No hay suficientes cupos para el aumento. Disponibles: %, Adicionales solicitados: %', 
              v_capacidad_actual, v_diferencia;
          END IF;
          
          v_capacidad_nueva := v_capacidad_actual - v_diferencia;
          
          UPDATE centros_formadores
          SET capacidad_disponible = v_capacidad_nueva,
              updated_at = NOW()
          WHERE id = v_centro_id;

          PERFORM registrar_movimiento_cupos(
            v_centro_id,
            NEW.id,
            'descuento',
            v_diferencia,
            v_capacidad_actual,
            v_capacidad_nueva,
            'aprobada',
            'Aumento de cupos en solicitud aprobada',
            NULL
          );
        ELSE
          -- Devuelven cupos
          v_capacidad_nueva := v_capacidad_actual + ABS(v_diferencia);
          
          UPDATE centros_formadores
          SET capacidad_disponible = v_capacidad_nueva,
              updated_at = NOW()
          WHERE id = v_centro_id;

          PERFORM registrar_movimiento_cupos(
            v_centro_id,
            NEW.id,
            'devolucion',
            ABS(v_diferencia),
            v_capacidad_actual,
            v_capacidad_nueva,
            'aprobada',
            'Reducción de cupos en solicitud aprobada',
            NULL
          );
        END IF;
      END;
    END IF;

    RETURN NEW;
  END IF;

  -- ============================================
  -- CASO 3: ELIMINACIÓN DE SOLICITUD (DELETE)
  -- ============================================
  IF (TG_OP = 'DELETE' AND OLD.estado = 'aprobada') THEN
    -- Devolver cupos si la solicitud estaba aprobada
    v_capacidad_nueva := v_capacidad_actual + OLD.numero_cupos;
    
    UPDATE centros_formadores
    SET capacidad_disponible = v_capacidad_nueva,
        updated_at = NOW()
    WHERE id = v_centro_id;

    -- Registrar en historial (sin ID de solicitud porque se está eliminando)
    PERFORM registrar_movimiento_cupos(
      v_centro_id,
      NULL,  -- NULL porque la solicitud se está eliminando
      'devolucion',
      OLD.numero_cupos,
      v_capacidad_actual,
      v_capacidad_nueva,
      'aprobada',
      'Solicitud eliminada - Cupos devueltos (ID: ' || OLD.id || ')',
      NULL
    );

    RETURN OLD;
  END IF;

  -- Para otros casos, no hacer nada
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- ============================================
-- PASO 4: Crear el trigger
-- ============================================
DROP TRIGGER IF EXISTS trigger_sincronizar_cupos ON solicitudes_cupos;

CREATE TRIGGER trigger_sincronizar_cupos
  AFTER INSERT OR UPDATE OR DELETE ON solicitudes_cupos
  FOR EACH ROW
  EXECUTE FUNCTION sincronizar_cupos_solicitud();

-- ============================================
-- PASO 5: Función para validar cupos antes de aprobar
-- ============================================
CREATE OR REPLACE FUNCTION validar_cupos_disponibles(
  p_centro_id UUID,
  p_cupos_solicitados INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_capacidad_total INTEGER;
  v_capacidad_disponible INTEGER;
  v_nombre_centro TEXT;
  v_result JSON;
BEGIN
  -- Obtener información del centro
  SELECT 
    capacidad_total,
    capacidad_disponible,
    nombre
  INTO v_capacidad_total, v_capacidad_disponible, v_nombre_centro
  FROM centros_formadores
  WHERE id = p_centro_id;

  -- Construir respuesta
  v_result := json_build_object(
    'valido', v_capacidad_disponible >= p_cupos_solicitados,
    'centro_nombre', v_nombre_centro,
    'capacidad_total', v_capacidad_total,
    'capacidad_disponible', v_capacidad_disponible,
    'cupos_solicitados', p_cupos_solicitados,
    'cupos_faltantes', CASE 
      WHEN v_capacidad_disponible < p_cupos_solicitados 
      THEN p_cupos_solicitados - v_capacidad_disponible 
      ELSE 0 
    END
  );

  RETURN v_result;
END;
$$;

-- ============================================
-- PASO 6: Políticas RLS para historial
-- ============================================
ALTER TABLE historial_movimientos_cupos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Usuarios pueden ver historial de movimientos" ON historial_movimientos_cupos;
DROP POLICY IF EXISTS "Solo triggers pueden insertar movimientos" ON historial_movimientos_cupos;

-- Política: Usuarios autenticados pueden ver el historial
CREATE POLICY "Usuarios pueden ver historial de movimientos"
  ON historial_movimientos_cupos
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Solo triggers pueden insertar
CREATE POLICY "Solo triggers pueden insertar movimientos"
  ON historial_movimientos_cupos
  FOR INSERT
  TO authenticated
  WITH CHECK (false); -- Solo funciones SECURITY DEFINER pueden insertar

-- ============================================
-- PASO 7: Comentarios
-- ============================================
COMMENT ON TABLE historial_movimientos_cupos IS 'Registra todos los movimientos de cupos (descuentos, devoluciones, reinicios)';
COMMENT ON FUNCTION sincronizar_cupos_solicitud IS 'Trigger que sincroniza automáticamente los cupos al cambiar estado de solicitudes';
COMMENT ON FUNCTION validar_cupos_disponibles IS 'Valida si hay cupos suficientes antes de aprobar una solicitud';
COMMENT ON FUNCTION registrar_movimiento_cupos IS 'Registra un movimiento de cupos en el historial';

-- ============================================
-- EJEMPLOS DE USO
-- ============================================

-- Validar cupos antes de aprobar
-- SELECT validar_cupos_disponibles('uuid-del-centro', 10);

-- Ver historial de movimientos de un centro
-- SELECT * FROM historial_movimientos_cupos 
-- WHERE centro_formador_id = 'uuid-del-centro' 
-- ORDER BY created_at DESC;

-- Ver resumen de movimientos por centro
-- SELECT 
--   cf.nombre,
--   COUNT(*) as total_movimientos,
--   SUM(CASE WHEN tipo_movimiento = 'descuento' THEN cupos_afectados ELSE 0 END) as total_descontados,
--   SUM(CASE WHEN tipo_movimiento = 'devolucion' THEN cupos_afectados ELSE 0 END) as total_devueltos
-- FROM historial_movimientos_cupos hmc
-- JOIN centros_formadores cf ON hmc.centro_formador_id = cf.id
-- GROUP BY cf.nombre
-- ORDER BY total_movimientos DESC;
