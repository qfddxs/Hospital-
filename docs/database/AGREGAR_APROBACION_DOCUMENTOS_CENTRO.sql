-- ============================================
-- AGREGAR CAMPOS DE APROBACIÓN A DOCUMENTOS_CENTRO
-- ============================================
-- Permite que el hospital apruebe/rechace documentos de centros formadores

-- 1. Agregar campos de aprobación
ALTER TABLE documentos_centro 
ADD COLUMN IF NOT EXISTS aprobado BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS aprobado_por UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS fecha_aprobacion TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS comentarios_aprobacion TEXT;

-- 2. Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_documentos_centro_aprobado ON documentos_centro(aprobado);
CREATE INDEX IF NOT EXISTS idx_documentos_centro_centro_id ON documentos_centro(centro_formador_id);

-- 3. Comentarios para documentación
COMMENT ON COLUMN documentos_centro.aprobado IS 'Estado de aprobación (NULL=pendiente, true=aprobado, false=rechazado)';
COMMENT ON COLUMN documentos_centro.aprobado_por IS 'Usuario del hospital que aprobó/rechazó';
COMMENT ON COLUMN documentos_centro.fecha_aprobacion IS 'Fecha de aprobación/rechazo';
COMMENT ON COLUMN documentos_centro.comentarios_aprobacion IS 'Comentarios del hospital al aprobar/rechazar';

-- 4. Vista para consultas del hospital
CREATE OR REPLACE VIEW vista_documentos_centros_pendientes AS
SELECT 
  dc.*,
  cf.nombre as centro_nombre,
  cf.codigo as centro_codigo,
  cf.email as centro_email
FROM documentos_centro dc
JOIN centros_formadores cf ON dc.centro_formador_id = cf.id
WHERE dc.aprobado IS NULL
ORDER BY dc.fecha_subida DESC;

-- 5. Vista de estadísticas por centro
CREATE OR REPLACE VIEW vista_estadisticas_documentos_centros AS
SELECT 
  cf.id as centro_formador_id,
  cf.nombre as centro_nombre,
  cf.codigo as centro_codigo,
  COUNT(*) as total_documentos,
  COUNT(CASE WHEN dc.aprobado IS NULL THEN 1 END) as pendientes,
  COUNT(CASE WHEN dc.aprobado = true THEN 1 END) as aprobados,
  COUNT(CASE WHEN dc.aprobado = false THEN 1 END) as rechazados,
  ROUND(
    COUNT(CASE WHEN dc.aprobado = true THEN 1 END)::NUMERIC / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as porcentaje_aprobacion
FROM centros_formadores cf
LEFT JOIN documentos_centro dc ON cf.id = dc.centro_formador_id
WHERE cf.activo = true
GROUP BY cf.id, cf.nombre, cf.codigo;

-- ============================================
-- CONSULTAS ÚTILES
-- ============================================

-- Ver documentos pendientes de aprobación
SELECT * FROM vista_documentos_centros_pendientes;

-- Ver estadísticas por centro
SELECT * FROM vista_estadisticas_documentos_centros;

-- Ver todos los documentos de un centro específico
SELECT 
  dc.*,
  CASE 
    WHEN dc.aprobado IS NULL THEN 'Pendiente'
    WHEN dc.aprobado = true THEN 'Aprobado'
    WHEN dc.aprobado = false THEN 'Rechazado'
  END as estado_aprobacion
FROM documentos_centro dc
WHERE dc.centro_formador_id = 'uuid-del-centro'
ORDER BY dc.fecha_subida DESC;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
/*
Después de ejecutar este script:

1. Tabla documentos_centro tiene campos de aprobación
2. Índices para mejorar rendimiento
3. Vistas para consultas rápidas
4. Hospital puede aprobar/rechazar documentos de centros
5. Centros pueden ver el estado de sus documentos

Flujo:
Centro sube documento → aprobado: NULL (Pendiente)
Hospital revisa → aprueba/rechaza
Centro ve el estado actualizado
*/
