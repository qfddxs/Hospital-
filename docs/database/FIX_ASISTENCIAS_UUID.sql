-- ============================================
-- FIX: Configurar UUID automático en tabla asistencias
-- ============================================
-- Este script asegura que la columna id genere UUID automáticamente

-- 1. Habilitar extensión UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Verificar estructura actual de la tabla asistencias
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'asistencias'
ORDER BY ordinal_position;

-- 3. Si la tabla no existe, crearla con la estructura correcta
CREATE TABLE IF NOT EXISTS asistencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rotacion_id BIGINT REFERENCES rotaciones(id) ON DELETE CASCADE,
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  tipo VARCHAR(20) DEFAULT 'alumno',
  estado VARCHAR(20) DEFAULT 'presente' CHECK (estado IN ('presente', 'ausente', 'tarde', 'justificado')),
  presente BOOLEAN DEFAULT true,
  observaciones TEXT,
  registrado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(rotacion_id, fecha, tipo)
);

-- 4. Si la tabla ya existe pero el id no es UUID, necesitas migrar los datos
-- ADVERTENCIA: Esto eliminará los datos existentes. Hacer backup primero.
-- Descomentar solo si es necesario:
/*
DROP TABLE IF EXISTS asistencias CASCADE;

CREATE TABLE asistencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rotacion_id BIGINT REFERENCES rotaciones(id) ON DELETE CASCADE,
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  tipo VARCHAR(20) DEFAULT 'alumno',
  estado VARCHAR(20) DEFAULT 'presente' CHECK (estado IN ('presente', 'ausente', 'tarde', 'justificado')),
  presente BOOLEAN DEFAULT true,
  observaciones TEXT,
  registrado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(rotacion_id, fecha, tipo)
);
*/

-- 5. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_asistencias_rotacion 
ON asistencias(rotacion_id);

CREATE INDEX IF NOT EXISTS idx_asistencias_alumno 
ON asistencias(alumno_id);

CREATE INDEX IF NOT EXISTS idx_asistencias_fecha 
ON asistencias(fecha);

CREATE INDEX IF NOT EXISTS idx_asistencias_estado 
ON asistencias(estado);

CREATE INDEX IF NOT EXISTS idx_asistencias_alumno_fecha 
ON asistencias(alumno_id, fecha);

-- 6. Habilitar Row Level Security (RLS)
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de seguridad básicas
-- Permitir lectura a usuarios autenticados
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver asistencias" ON asistencias;
CREATE POLICY "Usuarios autenticados pueden ver asistencias"
ON asistencias FOR SELECT
TO authenticated
USING (true);

-- Permitir inserción a usuarios autenticados
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear asistencias" ON asistencias;
CREATE POLICY "Usuarios autenticados pueden crear asistencias"
ON asistencias FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir actualización a usuarios autenticados
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar asistencias" ON asistencias;
CREATE POLICY "Usuarios autenticados pueden actualizar asistencias"
ON asistencias FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 8. Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_asistencias_updated_at ON asistencias;
CREATE TRIGGER update_asistencias_updated_at
    BEFORE UPDATE ON asistencias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Comentarios para documentación
COMMENT ON TABLE asistencias IS 'Registro de asistencia diaria de alumnos en rotación';
COMMENT ON COLUMN asistencias.id IS 'Identificador único UUID generado automáticamente';
COMMENT ON COLUMN asistencias.estado IS 'Estado de asistencia: presente, ausente, tarde, justificado';
COMMENT ON COLUMN asistencias.observaciones IS 'Observaciones opcionales (obligatorias solo para estado justificado)';
COMMENT ON COLUMN asistencias.tipo IS 'Tipo de registro: alumno, tutor, etc.';

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
-- Verificar estructura
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'asistencias'
ORDER BY ordinal_position;

-- Verificar constraints
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'asistencias';

-- Verificar índices
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'asistencias';

-- Verificar políticas RLS
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'asistencias';
