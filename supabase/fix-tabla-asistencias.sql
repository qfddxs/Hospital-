-- ============================================
-- FIX: Actualizar tabla de asistencias
-- ============================================

-- Eliminar tabla anterior si existe
DROP TABLE IF EXISTS asistencias CASCADE;

-- Crear tabla de asistencias con la estructura correcta
CREATE TABLE asistencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rotacion_id UUID NOT NULL REFERENCES rotaciones(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  tipo VARCHAR(20) NOT NULL DEFAULT 'alumno',
  presente BOOLEAN NOT NULL DEFAULT true,
  horas_trabajadas NUMERIC,
  observaciones TEXT,
  registrado_por VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rotacion_id, fecha, tipo)
);

-- Índices
CREATE INDEX idx_asistencias_rotacion ON asistencias(rotacion_id);
CREATE INDEX idx_asistencias_fecha ON asistencias(fecha);
CREATE INDEX idx_asistencias_tipo ON asistencias(tipo);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_asistencias_updated_at BEFORE UPDATE ON asistencias
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentario
COMMENT ON TABLE asistencias IS 'Control de asistencia de estudiantes en rotación';

-- Refrescar schema cache
NOTIFY pgrst, 'reload schema';
