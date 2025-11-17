-- ============================================
-- SISTEMA DOCUMENTAL UNIFICADO
-- ============================================
-- Sistema centralizado para gestión de documentos del hospital,
-- centros formadores y estudiantes

-- 1. Tabla principal de documentos (ya existe, vamos a extenderla)
-- Agregar campos para vincular con estudiantes y centros formadores

ALTER TABLE documentos 
ADD COLUMN IF NOT EXISTS alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS centro_formador_id UUID REFERENCES centros_formadores(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS tipo_documento VARCHAR(50),
ADD COLUMN IF NOT EXISTS es_requerido BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fecha_expiracion DATE,
ADD COLUMN IF NOT EXISTS aprobado BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS aprobado_por UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS fecha_aprobacion TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS comentarios_aprobacion TEXT;

-- 2. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_documentos_alumno ON documentos(alumno_id);
CREATE INDEX IF NOT EXISTS idx_documentos_centro ON documentos(centro_formador_id);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_documentos_aprobado ON documentos(aprobado);

-- 3. Tabla de tipos de documentos requeridos por rotación
CREATE TABLE IF NOT EXISTS documentos_requeridos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo_documento VARCHAR(50) NOT NULL,
  es_obligatorio BOOLEAN DEFAULT true,
  dias_vigencia INTEGER, -- Días de vigencia del documento
  aplica_a VARCHAR(50), -- 'todos', 'pregrado', 'postgrado', etc.
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Insertar documentos requeridos típicos
INSERT INTO documentos_requeridos (nombre, descripcion, tipo_documento, es_obligatorio, dias_vigencia, aplica_a, orden)
VALUES 
  ('Constancia de Vacunación', 'Certificado de vacunas al día (Hepatitis B, Influenza, COVID-19)', 'vacunacion', true, 365, 'todos', 1),
  ('Certificado de Salud Compatible', 'Certificado médico que acredita salud compatible con actividades clínicas', 'salud', true, 180, 'todos', 2),
  ('Seguro de Accidentes', 'Póliza de seguro contra accidentes vigente', 'seguro', true, 365, 'todos', 3),
  ('Certificado de Antecedentes', 'Certificado de antecedentes para fines especiales', 'antecedentes', true, 90, 'todos', 4),
  ('Ficha de Identificación', 'Fotocopia de cédula de identidad', 'identificacion', true, NULL, 'todos', 5),
  ('Certificado de Alumno Regular', 'Certificado que acredita condición de alumno regular', 'academico', true, 180, 'todos', 6),
  ('Programa de Rotación', 'Programa académico de la rotación', 'academico', true, NULL, 'todos', 7),
  ('Consentimiento Informado', 'Consentimiento informado firmado', 'legal', true, NULL, 'todos', 8)
ON CONFLICT DO NOTHING;

-- 5. Tabla de checklist de documentos por alumno
CREATE TABLE IF NOT EXISTS documentos_checklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  documento_requerido_id UUID NOT NULL REFERENCES documentos_requeridos(id) ON DELETE CASCADE,
  documento_id UUID REFERENCES documentos(id) ON DELETE SET NULL,
  estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'subido', 'aprobado', 'rechazado', 'vencido'
  fecha_subida TIMESTAMPTZ,
  fecha_revision TIMESTAMPTZ,
  revisado_por UUID REFERENCES auth.users(id),
  comentarios TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alumno_id, documento_requerido_id)
);

CREATE INDEX IF NOT EXISTS idx_checklist_alumno ON documentos_checklist(alumno_id);
CREATE INDEX IF NOT EXISTS idx_checklist_estado ON documentos_checklist(estado);

-- 6. Tabla de categorías de documentos (extender la existente)
INSERT INTO documentos_categorias (nombre, descripcion, color, icono, activo)
VALUES 
  ('Documentos de Estudiantes', 'Documentos personales y académicos de estudiantes', '#3B82F6', 'user', true),
  ('Vacunación', 'Constancias y certificados de vacunación', '#10B981', 'shield', true),
  ('Salud', 'Certificados médicos y de salud', '#EF4444', 'heart', true),
  ('Seguros', 'Pólizas y certificados de seguros', '#F59E0B', 'shield-check', true),
  ('Académicos', 'Documentos académicos y certificados', '#8B5CF6', 'academic-cap', true),
  ('Legales', 'Documentos legales y consentimientos', '#6B7280', 'document-text', true)
ON CONFLICT (nombre) DO NOTHING;

-- 7. Vista para ver estado de documentos por alumno
CREATE OR REPLACE VIEW vista_documentos_alumno AS
SELECT 
  a.id as alumno_id,
  a.nombre,
  a.primer_apellido,
  a.segundo_apellido,
  a.rut,
  cf.nombre as centro_formador,
  dr.id as documento_requerido_id,
  dr.nombre as documento_nombre,
  dr.tipo_documento,
  dr.es_obligatorio,
  COALESCE(dc.estado, 'pendiente') as estado,
  d.id as documento_id,
  d.archivo_url,
  d.archivo_nombre,
  d.fecha_expiracion,
  dc.fecha_subida,
  dc.fecha_revision,
  dc.comentarios,
  CASE 
    WHEN d.fecha_expiracion IS NOT NULL AND d.fecha_expiracion < CURRENT_DATE THEN true
    ELSE false
  END as esta_vencido,
  CASE 
    WHEN d.fecha_expiracion IS NOT NULL AND d.fecha_expiracion BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days' THEN true
    ELSE false
  END as por_vencer
FROM alumnos a
CROSS JOIN documentos_requeridos dr
LEFT JOIN centros_formadores cf ON a.centro_formador_id = cf.id
LEFT JOIN documentos_checklist dc ON a.id = dc.alumno_id AND dr.id = dc.documento_requerido_id
LEFT JOIN documentos d ON dc.documento_id = d.id
WHERE a.estado = 'en_rotacion' AND dr.activo = true
ORDER BY a.primer_apellido, dr.orden;

-- 8. Vista de estadísticas de documentos por centro formador
CREATE OR REPLACE VIEW vista_estadisticas_documentos_centro AS
SELECT 
  cf.id as centro_formador_id,
  cf.nombre as centro_formador,
  COUNT(DISTINCT a.id) as total_estudiantes,
  COUNT(DISTINCT dr.id) as documentos_requeridos,
  COUNT(DISTINCT CASE WHEN dc.estado = 'aprobado' THEN dc.id END) as documentos_aprobados,
  COUNT(DISTINCT CASE WHEN dc.estado = 'pendiente' THEN dc.id END) as documentos_pendientes,
  COUNT(DISTINCT CASE WHEN dc.estado = 'rechazado' THEN dc.id END) as documentos_rechazados,
  ROUND(
    COUNT(DISTINCT CASE WHEN dc.estado = 'aprobado' THEN dc.id END)::NUMERIC / 
    NULLIF(COUNT(DISTINCT a.id) * COUNT(DISTINCT dr.id), 0) * 100, 
    2
  ) as porcentaje_completitud
FROM centros_formadores cf
LEFT JOIN alumnos a ON cf.id = a.centro_formador_id AND a.estado = 'en_rotacion'
CROSS JOIN documentos_requeridos dr
LEFT JOIN documentos_checklist dc ON a.id = dc.alumno_id AND dr.id = dc.documento_requerido_id
WHERE dr.activo = true
GROUP BY cf.id, cf.nombre;

-- 9. Función para crear checklist automático al crear alumno
CREATE OR REPLACE FUNCTION crear_checklist_documentos()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar checklist de documentos requeridos para el nuevo alumno
  INSERT INTO documentos_checklist (alumno_id, documento_requerido_id, estado)
  SELECT NEW.id, dr.id, 'pendiente'
  FROM documentos_requeridos dr
  WHERE dr.activo = true
  ON CONFLICT (alumno_id, documento_requerido_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger para crear checklist automáticamente
DROP TRIGGER IF EXISTS trigger_crear_checklist ON alumnos;
CREATE TRIGGER trigger_crear_checklist
  AFTER INSERT ON alumnos
  FOR EACH ROW
  EXECUTE FUNCTION crear_checklist_documentos();

-- 11. Función para actualizar estado de checklist cuando se sube documento
CREATE OR REPLACE FUNCTION actualizar_checklist_documento()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el documento está vinculado a un alumno y tiene tipo_documento
  IF NEW.alumno_id IS NOT NULL AND NEW.tipo_documento IS NOT NULL THEN
    -- Actualizar o crear entrada en checklist
    INSERT INTO documentos_checklist (
      alumno_id, 
      documento_requerido_id, 
      documento_id, 
      estado, 
      fecha_subida
    )
    SELECT 
      NEW.alumno_id,
      dr.id,
      NEW.id,
      'subido',
      NOW()
    FROM documentos_requeridos dr
    WHERE dr.tipo_documento = NEW.tipo_documento
    ON CONFLICT (alumno_id, documento_requerido_id) 
    DO UPDATE SET 
      documento_id = NEW.id,
      estado = 'subido',
      fecha_subida = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Trigger para actualizar checklist al subir documento
DROP TRIGGER IF EXISTS trigger_actualizar_checklist ON documentos;
CREATE TRIGGER trigger_actualizar_checklist
  AFTER INSERT OR UPDATE ON documentos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_checklist_documento();

-- 13. Función para verificar documentos vencidos
CREATE OR REPLACE FUNCTION verificar_documentos_vencidos()
RETURNS void AS $$
BEGIN
  -- Actualizar estado de documentos vencidos
  UPDATE documentos_checklist dc
  SET estado = 'vencido'
  FROM documentos d
  WHERE dc.documento_id = d.id
    AND d.fecha_expiracion < CURRENT_DATE
    AND dc.estado NOT IN ('vencido', 'rechazado');
END;
$$ LANGUAGE plpgsql;

-- 14. Comentarios para documentación
COMMENT ON COLUMN documentos.alumno_id IS 'ID del alumno al que pertenece el documento (NULL si es institucional)';
COMMENT ON COLUMN documentos.centro_formador_id IS 'ID del centro formador que subió el documento (NULL si es del hospital)';
COMMENT ON COLUMN documentos.tipo_documento IS 'Tipo de documento según documentos_requeridos';
COMMENT ON COLUMN documentos.es_requerido IS 'Si el documento es requerido para rotación';
COMMENT ON COLUMN documentos.aprobado IS 'Estado de aprobación (NULL=pendiente, true=aprobado, false=rechazado)';

COMMENT ON TABLE documentos_requeridos IS 'Catálogo de documentos requeridos para rotaciones';
COMMENT ON TABLE documentos_checklist IS 'Checklist de documentos por alumno';

-- ============================================
-- VERIFICACIÓN Y CONSULTAS ÚTILES
-- ============================================

-- Ver documentos requeridos
SELECT * FROM documentos_requeridos WHERE activo = true ORDER BY orden;

-- Ver estado de documentos de un alumno específico
SELECT * FROM vista_documentos_alumno WHERE alumno_id = 'uuid-del-alumno';

-- Ver estadísticas por centro formador
SELECT * FROM vista_estadisticas_documentos_centro;

-- Ver documentos pendientes de aprobación
SELECT 
  d.id,
  d.titulo,
  a.nombre || ' ' || a.primer_apellido as alumno,
  cf.nombre as centro_formador,
  d.tipo_documento,
  d.created_at
FROM documentos d
LEFT JOIN alumnos a ON d.alumno_id = a.id
LEFT JOIN centros_formadores cf ON d.centro_formador_id = cf.id
WHERE d.aprobado IS NULL
  AND d.alumno_id IS NOT NULL
ORDER BY d.created_at DESC;

-- Ver documentos vencidos o por vencer
SELECT 
  a.nombre || ' ' || a.primer_apellido as alumno,
  d.titulo,
  d.tipo_documento,
  d.fecha_expiracion,
  CASE 
    WHEN d.fecha_expiracion < CURRENT_DATE THEN 'Vencido'
    WHEN d.fecha_expiracion BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days' THEN 'Por vencer'
    ELSE 'Vigente'
  END as estado_vigencia
FROM documentos d
JOIN alumnos a ON d.alumno_id = a.id
WHERE d.fecha_expiracion IS NOT NULL
  AND d.fecha_expiracion <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY d.fecha_expiracion;

-- Ejecutar verificación de documentos vencidos
SELECT verificar_documentos_vencidos();

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
/*
Después de ejecutar este script:

1. Tabla documentos extendida con campos para alumnos y centros
2. Tabla documentos_requeridos con catálogo de documentos necesarios
3. Tabla documentos_checklist para tracking por alumno
4. Vistas para consultas rápidas
5. Triggers automáticos para mantener checklist actualizado
6. Funciones para verificar vencimientos

El sistema ahora puede:
- Gestionar documentos institucionales (hospital)
- Gestionar documentos de centros formadores
- Gestionar documentos por estudiante
- Tracking automático de documentos requeridos
- Alertas de vencimiento
- Flujo de aprobación
*/
