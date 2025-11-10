-- ============================================
-- AGREGAR CAMPOS DE CAPACIDAD A CENTROS FORMADORES
-- ============================================

-- Agregar campos de capacidad
ALTER TABLE centros_formadores
ADD COLUMN IF NOT EXISTS capacidad_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS capacidad_disponible INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS especialidades TEXT[] DEFAULT '{}';

-- Agregar constraint para validar que disponible no sea mayor que total
ALTER TABLE centros_formadores
ADD CONSTRAINT check_capacidad_disponible 
CHECK (capacidad_disponible <= capacidad_total);

-- Comentarios para documentar
COMMENT ON COLUMN centros_formadores.capacidad_total IS 'Capacidad total de cupos que puede ofrecer el centro formador';
COMMENT ON COLUMN centros_formadores.capacidad_disponible IS 'Cupos actualmente disponibles';
COMMENT ON COLUMN centros_formadores.especialidades IS 'Array de especialidades que ofrece el centro';
