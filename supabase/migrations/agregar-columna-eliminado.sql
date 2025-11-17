-- Agregar columna para soft delete en retribuciones
ALTER TABLE retribuciones 
ADD COLUMN IF NOT EXISTS eliminado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fecha_eliminacion TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS eliminado_por UUID REFERENCES auth.users(id);

-- Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_retribuciones_eliminado ON retribuciones(eliminado);

-- Comentario
COMMENT ON COLUMN retribuciones.eliminado IS 'Indica si la retribución fue eliminada (soft delete)';
COMMENT ON COLUMN retribuciones.fecha_eliminacion IS 'Fecha y hora en que se eliminó la retribución';
COMMENT ON COLUMN retribuciones.eliminado_por IS 'Usuario que eliminó la retribución';
