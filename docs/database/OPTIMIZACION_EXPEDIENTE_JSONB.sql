-- ============================================
-- OPTIMIZACIÓN: Expediente Digital con JSONB
-- ============================================
-- En lugar de 8 registros en documentos_checklist por alumno,
-- usamos un campo JSONB en la tabla alumnos

-- 1. Agregar campo JSONB a tabla alumnos
ALTER TABLE alumnos 
ADD COLUMN IF NOT EXISTS expediente_digital JSONB DEFAULT '{
  "documentos": [],
  "completitud": 0,
  "ultima_actualizacion": null
}'::jsonb;

-- 2. Crear índice GIN para búsquedas rápidas en JSONB
CREATE INDEX IF NOT EXISTS idx_alumnos_expediente_digital 
ON alumnos USING GIN (expediente_digital);

-- 3. Función para inicializar expediente de un alumno
CREATE OR REPLACE FUNCTION inicializar_expediente_alumno(p_alumno_id UUID)
RETURNS void AS $$
DECLARE
  v_documentos_requeridos JSONB;
BEGIN
  -- Obtener documentos requeridos y crear estructura JSON
  SELECT jsonb_agg(
    jsonb_build_object(
      'tipo_documento', tipo_documento,
      'nombre', nombre,
      'descripcion', descripcion,
      'es_obligatorio', es_obligatorio,
      'dias_vigencia', dias_vigencia,
      'orden', orden,
      'estado', 'pendiente',
      'documento_id', null,
      'archivo_url', null,
      'archivo_nombre', null,
      'fecha_subida', null,
      'fecha_expiracion', null,
      'fecha_revision', null,
      'aprobado', null,
      'comentarios', null
    ) ORDER BY orden
  ) INTO v_documentos_requeridos
  FROM documentos_requeridos
  WHERE activo = true;

  -- Actualizar expediente del alumno
  UPDATE alumnos
  SET expediente_digital = jsonb_build_object(
    'documentos', v_documentos_requeridos,
    'completitud', 0,
    'ultima_actualizacion', NOW()
  )
  WHERE id = p_alumno_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Función para actualizar documento en expediente
CREATE OR REPLACE FUNCTION actualizar_documento_expediente(
  p_alumno_id UUID,
  p_tipo_documento VARCHAR,
  p_documento_id UUID,
  p_archivo_url TEXT,
  p_archivo_nombre VARCHAR,
  p_fecha_expiracion DATE,
  p_aprobado BOOLEAN,
  p_comentarios TEXT
)
RETURNS void AS $$
DECLARE
  v_expediente JSONB;
  v_documentos JSONB;
  v_doc JSONB;
  v_index INTEGER;
  v_completitud INTEGER;
BEGIN
  -- Obtener expediente actual
  SELECT expediente_digital INTO v_expediente
  FROM alumnos
  WHERE id = p_alumno_id;

  -- Si no existe expediente, inicializarlo
  IF v_expediente IS NULL OR v_expediente = '{}'::jsonb THEN
    PERFORM inicializar_expediente_alumno(p_alumno_id);
    SELECT expediente_digital INTO v_expediente
    FROM alumnos
    WHERE id = p_alumno_id;
  END IF;

  -- Obtener array de documentos
  v_documentos := v_expediente->'documentos';

  -- Buscar y actualizar el documento específico
  FOR v_index IN 0..(jsonb_array_length(v_documentos) - 1) LOOP
    v_doc := v_documentos->v_index;
    
    IF v_doc->>'tipo_documento' = p_tipo_documento THEN
      -- Actualizar documento
      v_documentos := jsonb_set(
        v_documentos,
        array[v_index::text],
        jsonb_build_object(
          'tipo_documento', v_doc->>'tipo_documento',
          'nombre', v_doc->>'nombre',
          'descripcion', v_doc->>'descripcion',
          'es_obligatorio', (v_doc->>'es_obligatorio')::boolean,
          'dias_vigencia', (v_doc->>'dias_vigencia')::integer,
          'orden', (v_doc->>'orden')::integer,
          'estado', CASE 
            WHEN p_aprobado = true THEN 'aprobado'
            WHEN p_aprobado = false THEN 'rechazado'
            WHEN p_aprobado IS NULL AND p_documento_id IS NOT NULL THEN 'subido'
            ELSE 'pendiente'
          END,
          'documento_id', p_documento_id,
          'archivo_url', p_archivo_url,
          'archivo_nombre', p_archivo_nombre,
          'fecha_subida', CASE WHEN p_documento_id IS NOT NULL THEN NOW() ELSE NULL END,
          'fecha_expiracion', p_fecha_expiracion,
          'fecha_revision', CASE WHEN p_aprobado IS NOT NULL THEN NOW() ELSE NULL END,
          'aprobado', p_aprobado,
          'comentarios', p_comentarios
        )
      );
      EXIT;
    END IF;
  END LOOP;

  -- Calcular completitud (documentos aprobados / total)
  SELECT COUNT(*)::integer INTO v_completitud
  FROM jsonb_array_elements(v_documentos) doc
  WHERE doc->>'estado' = 'aprobado';

  -- Actualizar expediente completo
  UPDATE alumnos
  SET expediente_digital = jsonb_build_object(
    'documentos', v_documentos,
    'completitud', ROUND((v_completitud::numeric / jsonb_array_length(v_documentos)) * 100),
    'ultima_actualizacion', NOW()
  )
  WHERE id = p_alumno_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para actualizar expediente cuando se modifica un documento
CREATE OR REPLACE FUNCTION trigger_actualizar_expediente()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.alumno_id IS NOT NULL AND NEW.tipo_documento IS NOT NULL THEN
    PERFORM actualizar_documento_expediente(
      NEW.alumno_id,
      NEW.tipo_documento,
      NEW.id,
      NEW.archivo_url,
      NEW.archivo_nombre,
      NEW.fecha_expiracion,
      NEW.aprobado,
      NEW.comentarios_aprobacion
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_expediente ON documentos;
CREATE TRIGGER trigger_actualizar_expediente
  AFTER INSERT OR UPDATE ON documentos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_actualizar_expediente();

-- 6. Trigger para inicializar expediente al crear alumno
CREATE OR REPLACE FUNCTION trigger_inicializar_expediente()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM inicializar_expediente_alumno(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_inicializar_expediente ON alumnos;
CREATE TRIGGER trigger_inicializar_expediente
  AFTER INSERT ON alumnos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_inicializar_expediente();

-- 7. Vista para consultar expedientes de forma tabular
CREATE OR REPLACE VIEW vista_expedientes_alumnos AS
SELECT 
  a.id as alumno_id,
  a.nombre,
  a.primer_apellido,
  a.segundo_apellido,
  a.rut,
  cf.nombre as centro_formador,
  (a.expediente_digital->>'completitud')::integer as completitud,
  (a.expediente_digital->>'ultima_actualizacion')::timestamptz as ultima_actualizacion,
  jsonb_array_length(a.expediente_digital->'documentos') as total_documentos,
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(a.expediente_digital->'documentos') doc
    WHERE doc->>'estado' = 'aprobado'
  ) as documentos_aprobados,
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(a.expediente_digital->'documentos') doc
    WHERE doc->>'estado' = 'pendiente'
  ) as documentos_pendientes,
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(a.expediente_digital->'documentos') doc
    WHERE doc->>'estado' = 'subido'
  ) as documentos_subidos,
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(a.expediente_digital->'documentos') doc
    WHERE doc->>'estado' = 'rechazado'
  ) as documentos_rechazados
FROM alumnos a
LEFT JOIN centros_formadores cf ON a.centro_formador_id = cf.id
WHERE a.estado = 'en_rotacion';

-- 8. Función para obtener expediente completo de un alumno
CREATE OR REPLACE FUNCTION obtener_expediente_alumno(p_alumno_id UUID)
RETURNS TABLE (
  tipo_documento VARCHAR,
  nombre VARCHAR,
  descripcion TEXT,
  es_obligatorio BOOLEAN,
  estado VARCHAR,
  documento_id UUID,
  archivo_url TEXT,
  archivo_nombre VARCHAR,
  fecha_subida TIMESTAMPTZ,
  fecha_expiracion DATE,
  aprobado BOOLEAN,
  comentarios TEXT,
  orden INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (doc->>'tipo_documento')::VARCHAR,
    (doc->>'nombre')::VARCHAR,
    (doc->>'descripcion')::TEXT,
    (doc->>'es_obligatorio')::BOOLEAN,
    (doc->>'estado')::VARCHAR,
    (doc->>'documento_id')::UUID,
    (doc->>'archivo_url')::TEXT,
    (doc->>'archivo_nombre')::VARCHAR,
    (doc->>'fecha_subida')::TIMESTAMPTZ,
    (doc->>'fecha_expiracion')::DATE,
    (doc->>'aprobado')::BOOLEAN,
    (doc->>'comentarios')::TEXT,
    (doc->>'orden')::INTEGER
  FROM alumnos a,
       jsonb_array_elements(a.expediente_digital->'documentos') doc
  WHERE a.id = p_alumno_id
  ORDER BY (doc->>'orden')::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- 9. Inicializar expedientes para alumnos existentes
DO $$
DECLARE
  v_alumno RECORD;
BEGIN
  FOR v_alumno IN 
    SELECT id FROM alumnos 
    WHERE estado = 'en_rotacion' 
    AND (expediente_digital IS NULL OR expediente_digital = '{}'::jsonb)
  LOOP
    PERFORM inicializar_expediente_alumno(v_alumno.id);
  END LOOP;
END $$;

-- 10. Migrar datos de documentos_checklist a expediente_digital (si existe)
DO $$
DECLARE
  v_alumno RECORD;
  v_checklist RECORD;
BEGIN
  FOR v_alumno IN SELECT DISTINCT alumno_id FROM documentos_checklist LOOP
    FOR v_checklist IN 
      SELECT 
        dc.*,
        dr.tipo_documento,
        d.id as documento_id,
        d.archivo_url,
        d.archivo_nombre,
        d.fecha_expiracion,
        d.aprobado,
        d.comentarios_aprobacion
      FROM documentos_checklist dc
      JOIN documentos_requeridos dr ON dc.documento_requerido_id = dr.id
      LEFT JOIN documentos d ON dc.documento_id = d.id
      WHERE dc.alumno_id = v_alumno.alumno_id
    LOOP
      PERFORM actualizar_documento_expediente(
        v_alumno.alumno_id,
        v_checklist.tipo_documento,
        v_checklist.documento_id,
        v_checklist.archivo_url,
        v_checklist.archivo_nombre,
        v_checklist.fecha_expiracion,
        v_checklist.aprobado,
        v_checklist.comentarios_aprobacion
      );
    END LOOP;
  END LOOP;
END $$;

-- 11. Comentarios
COMMENT ON COLUMN alumnos.expediente_digital IS 'Expediente digital completo del alumno en formato JSONB';
COMMENT ON FUNCTION inicializar_expediente_alumno IS 'Inicializa el expediente digital de un alumno con todos los documentos requeridos';
COMMENT ON FUNCTION actualizar_documento_expediente IS 'Actualiza un documento específico en el expediente del alumno';
COMMENT ON VIEW vista_expedientes_alumnos IS 'Vista resumen de expedientes de todos los alumnos';

-- ============================================
-- CONSULTAS DE EJEMPLO
-- ============================================

-- Ver expediente de un alumno
SELECT * FROM obtener_expediente_alumno('uuid-del-alumno');

-- Ver resumen de todos los expedientes
SELECT * FROM vista_expedientes_alumnos;

-- Buscar alumnos con documentos pendientes
SELECT 
  nombre,
  primer_apellido,
  completitud,
  documentos_pendientes
FROM vista_expedientes_alumnos
WHERE documentos_pendientes > 0
ORDER BY completitud ASC;

-- Ver documentos específicos de un alumno (query directo en JSONB)
SELECT 
  a.nombre,
  a.primer_apellido,
  doc->>'nombre' as documento,
  doc->>'estado' as estado,
  doc->>'archivo_nombre' as archivo
FROM alumnos a,
     jsonb_array_elements(a.expediente_digital->'documentos') doc
WHERE a.id = 'uuid-del-alumno';

-- Buscar alumnos con documento específico aprobado
SELECT 
  a.nombre,
  a.primer_apellido,
  doc->>'nombre' as documento,
  doc->>'fecha_subida' as fecha
FROM alumnos a,
     jsonb_array_elements(a.expediente_digital->'documentos') doc
WHERE doc->>'tipo_documento' = 'vacunacion'
  AND doc->>'estado' = 'aprobado';

-- ============================================
-- VENTAJAS DE ESTA SOLUCIÓN
-- ============================================
/*
1. RENDIMIENTO:
   - 1 registro por alumno en lugar de 8
   - Consultas más rápidas con índice GIN
   - Menos joins necesarios

2. ESCALABILIDAD:
   - Fácil agregar nuevos documentos requeridos
   - No crea registros adicionales en BD
   - Estructura flexible

3. MANTENIMIENTO:
   - Todo el expediente en un solo lugar
   - Fácil de respaldar y migrar
   - Queries más simples

4. FUNCIONALIDAD:
   - Búsquedas rápidas en JSONB
   - Cálculo automático de completitud
   - Historial integrado

5. COMPATIBILIDAD:
   - Mantiene tabla documentos_checklist si es necesaria
   - Puede coexistir con sistema actual
   - Migración automática de datos existentes
*/

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Contar alumnos con expediente inicializado
SELECT COUNT(*) as alumnos_con_expediente
FROM alumnos
WHERE expediente_digital IS NOT NULL 
  AND expediente_digital != '{}'::jsonb;

-- Ver estadísticas generales
SELECT 
  COUNT(*) as total_alumnos,
  AVG((expediente_digital->>'completitud')::integer) as completitud_promedio,
  SUM((
    SELECT COUNT(*)
    FROM jsonb_array_elements(expediente_digital->'documentos') doc
    WHERE doc->>'estado' = 'pendiente'
  )) as total_documentos_pendientes
FROM alumnos
WHERE estado = 'en_rotacion';
