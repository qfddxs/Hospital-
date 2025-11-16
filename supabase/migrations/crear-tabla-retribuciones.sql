-- Crear tabla de retribuciones
CREATE TABLE IF NOT EXISTS retribuciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  centro_formador_id UUID REFERENCES centros_formadores(id) ON DELETE CASCADE,
  periodo VARCHAR(10) NOT NULL, -- Formato: "2024-1" o "2024-2"
  fecha_calculo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_pago TIMESTAMP WITH TIME ZONE,
  cantidad_rotaciones INTEGER DEFAULT 0,
  monto_total DECIMAL(12, 2) DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, pagada, rechazada
  detalles JSONB, -- Almacena el detalle de cada rotación
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar campo retribucion_id a la tabla rotaciones
ALTER TABLE rotaciones 
ADD COLUMN IF NOT EXISTS retribucion_id UUID REFERENCES retribuciones(id) ON DELETE SET NULL;

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_retribuciones_centro ON retribuciones(centro_formador_id);
CREATE INDEX IF NOT EXISTS idx_retribuciones_periodo ON retribuciones(periodo);
CREATE INDEX IF NOT EXISTS idx_retribuciones_estado ON retribuciones(estado);
CREATE INDEX IF NOT EXISTS idx_rotaciones_retribucion ON rotaciones(retribucion_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_retribuciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_retribuciones_updated_at
  BEFORE UPDATE ON retribuciones
  FOR EACH ROW
  EXECUTE FUNCTION update_retribuciones_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE retribuciones IS 'Tabla para gestionar las retribuciones a centros formadores por uso de campos clínicos';
COMMENT ON COLUMN retribuciones.periodo IS 'Período de la retribución en formato YYYY-S (ej: 2024-1 para primer semestre)';
COMMENT ON COLUMN retribuciones.detalles IS 'JSON con el detalle de cada rotación incluida en el cálculo';
COMMENT ON COLUMN retribuciones.estado IS 'Estado del pago: pendiente, pagada, rechazada';

-- Políticas RLS (Row Level Security)
ALTER TABLE retribuciones ENABLE ROW LEVEL SECURITY;

-- Política para lectura (todos los usuarios autenticados pueden leer)
CREATE POLICY "Usuarios autenticados pueden ver retribuciones"
  ON retribuciones FOR SELECT
  TO authenticated
  USING (true);

-- Política para inserción (solo usuarios autenticados)
CREATE POLICY "Usuarios autenticados pueden crear retribuciones"
  ON retribuciones FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para actualización (solo usuarios autenticados)
CREATE POLICY "Usuarios autenticados pueden actualizar retribuciones"
  ON retribuciones FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para eliminación (solo usuarios autenticados)
CREATE POLICY "Usuarios autenticados pueden eliminar retribuciones"
  ON retribuciones FOR DELETE
  TO authenticated
  USING (true);
