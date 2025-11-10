-- ============================================
-- AGREGAR TABLA DE SOLICITUDES DE CUPOS
-- ============================================

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS solicitudes_cupos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    centro_formador_id UUID REFERENCES centros_formadores(id) ON DELETE CASCADE,
    especialidad VARCHAR(255) NOT NULL,
    numero_cupos INTEGER NOT NULL DEFAULT 1,
    fecha_solicitud DATE DEFAULT CURRENT_DATE,
    fecha_inicio DATE,
    fecha_termino DATE,
    solicitante VARCHAR(255),
    comentarios TEXT,
    estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, aprobada, rechazada
    motivo_rechazo TEXT,
    aprobado_por VARCHAR(255),
    fecha_aprobacion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_numero_cupos CHECK (numero_cupos > 0),
    CONSTRAINT check_estado CHECK (estado IN ('pendiente', 'aprobada', 'rechazada'))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_solicitudes_centro ON solicitudes_cupos(centro_formador_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_cupos(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_fecha ON solicitudes_cupos(fecha_solicitud);

-- Trigger para updated_at
CREATE TRIGGER update_solicitudes_cupos_updated_at 
BEFORE UPDATE ON solicitudes_cupos 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad
DROP POLICY IF EXISTS "Permitir todo para autenticados" ON solicitudes_cupos;

CREATE POLICY "Permitir todo para autenticados" ON solicitudes_cupos
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Habilitar RLS
ALTER TABLE solicitudes_cupos ENABLE ROW LEVEL SECURITY;
