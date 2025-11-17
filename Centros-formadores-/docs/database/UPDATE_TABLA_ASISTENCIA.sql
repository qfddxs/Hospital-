-- ============================================
-- ACTUALIZACIÓN TABLA ASISTENCIA
-- ============================================
-- Este script actualiza la tabla asistencia para soportar
-- los nuevos estados: tarde y justificado

-- 1. Verificar estructura actual
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'asistencia'
ORDER BY ordinal_position;

-- 2. Si la columna 'estado' no existe o necesita actualización:
-- Agregar columna estado si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'asistencia' AND column_name = 'estado'
    ) THEN
        ALTER TABLE asistencia 
        ADD COLUMN estado VARCHAR(20) DEFAULT 'presente';
    END IF;
END $$;

-- 3. Actualizar constraint para incluir nuevos estados
ALTER TABLE asistencia 
DROP CONSTRAINT IF EXISTS asistencia_estado_check;

ALTER TABLE asistencia
ADD CONSTRAINT asistencia_estado_check 
CHECK (estado IN ('presente', 'ausente', 'tarde', 'justificado'));

-- 4. Agregar índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_asistencia_estado 
ON asistencia(estado);

CREATE INDEX IF NOT EXISTS idx_asistencia_fecha 
ON asistencia(fecha);

CREATE INDEX IF NOT EXISTS idx_asistencia_alumno_fecha 
ON asistencia(alumno_id, fecha);

-- 5. Comentarios para documentación
COMMENT ON COLUMN asistencia.estado IS 'Estado de asistencia: presente, ausente, tarde, justificado';

-- ============================================
-- ESTRUCTURA ESPERADA DE LA TABLA
-- ============================================
/*
CREATE TABLE IF NOT EXISTS asistencia (
  id BIGSERIAL PRIMARY KEY,
  alumno_id BIGINT REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'presente' CHECK (estado IN ('presente', 'ausente', 'tarde', 'justificado')),
  observaciones TEXT,
  registrado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(alumno_id, fecha)
);
*/

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
-- Ejecutar para verificar que todo está correcto
SELECT 
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'asistencia'
ORDER BY ordinal_position;

-- Ver constraints
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'asistencia';
