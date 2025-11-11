-- Crear tabla solicitudes_cupos para gestionar solicitudes de cupos clínicos
-- Los centros formadores solicitan cupos al hospital

CREATE TABLE IF NOT EXISTS solicitudes_cupos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centro_formador_id UUID NOT NULL REFERENCES centros_formadores(id) ON DELETE CASCADE,
  especialidad VARCHAR(100) NOT NULL,
  numero_cupos INTEGER NOT NULL CHECK (numero_cupos > 0),
  fecha_inicio DATE NOT NULL,
  fecha_termino DATE NOT NULL,
  fecha_solicitud DATE NOT NULL DEFAULT CURRENT_DATE,
  solicitante VARCHAR(200),
  comentarios TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  motivo_rechazo TEXT,
  revisado_por UUID REFERENCES auth.users(id),
  fecha_revision TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validación: fecha_termino debe ser posterior a fecha_inicio
  CONSTRAINT fecha_valida CHECK (fecha_termino > fecha_inicio)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_solicitudes_centro_id ON solicitudes_cupos(centro_formador_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_cupos(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_especialidad ON solicitudes_cupos(especialidad);
CREATE INDEX IF NOT EXISTS idx_solicitudes_fecha_inicio ON solicitudes_cupos(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_solicitudes_created_at ON solicitudes_cupos(created_at);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_solicitudes_cupos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_solicitudes_cupos_updated_at
  BEFORE UPDATE ON solicitudes_cupos
  FOR EACH ROW
  EXECUTE FUNCTION update_solicitudes_cupos_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE solicitudes_cupos ENABLE ROW LEVEL SECURITY;

-- Política: Los centros formadores pueden ver sus propias solicitudes
CREATE POLICY "Centros pueden ver sus propias solicitudes"
  ON solicitudes_cupos
  FOR SELECT
  USING (
    centro_formador_id IN (
      SELECT centro_formador_id 
      FROM usuarios_centros 
      WHERE user_id = auth.uid() AND activo = true
    )
  );

-- Política: Los centros formadores pueden crear solicitudes
CREATE POLICY "Centros pueden crear solicitudes"
  ON solicitudes_cupos
  FOR INSERT
  WITH CHECK (
    centro_formador_id IN (
      SELECT centro_formador_id 
      FROM usuarios_centros 
      WHERE user_id = auth.uid() AND activo = true
    )
  );

-- Política: Los centros formadores pueden actualizar sus solicitudes pendientes
CREATE POLICY "Centros pueden actualizar sus solicitudes pendientes"
  ON solicitudes_cupos
  FOR UPDATE
  USING (
    estado = 'pendiente' AND
    centro_formador_id IN (
      SELECT centro_formador_id 
      FROM usuarios_centros 
      WHERE user_id = auth.uid() AND activo = true
    )
  );

-- Política: El hospital puede ver TODAS las solicitudes
CREATE POLICY "Hospital puede ver todas las solicitudes"
  ON solicitudes_cupos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'rol' = 'hospital'
    )
  );

-- Política: El hospital puede actualizar cualquier solicitud (aprobar/rechazar)
CREATE POLICY "Hospital puede actualizar solicitudes"
  ON solicitudes_cupos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'rol' = 'hospital'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE solicitudes_cupos IS 'Solicitudes de cupos clínicos de centros formadores al hospital';
COMMENT ON COLUMN solicitudes_cupos.centro_formador_id IS 'Centro formador que solicita';
COMMENT ON COLUMN solicitudes_cupos.especialidad IS 'Especialidad/carrera solicitada';
COMMENT ON COLUMN solicitudes_cupos.numero_cupos IS 'Cantidad de cupos solicitados';
COMMENT ON COLUMN solicitudes_cupos.fecha_inicio IS 'Fecha de inicio de la rotación';
COMMENT ON COLUMN solicitudes_cupos.fecha_termino IS 'Fecha de término de la rotación';
COMMENT ON COLUMN solicitudes_cupos.estado IS 'Estado: pendiente, aprobada, rechazada';
COMMENT ON COLUMN solicitudes_cupos.motivo_rechazo IS 'Motivo si fue rechazada';
COMMENT ON COLUMN solicitudes_cupos.revisado_por IS 'Usuario del hospital que revisó';
