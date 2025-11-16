-- ============================================
-- RENOMBRAR COLUMNAS Y SIMPLIFICAR ESTRUCTURA
-- ============================================

-- 1. Ver columnas actuales
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'alumnos'
  AND column_name LIKE '%docente%' OR column_name LIKE '%contacto%'
ORDER BY ordinal_position;

-- 2. Renombrar columnas para que sean más claras
ALTER TABLE alumnos
RENAME COLUMN nombre_docente_cargo TO contacto_nombre;

ALTER TABLE alumnos
RENAME COLUMN telefono_docente_cargo TO contacto_telefono;

-- 3. Agregar relación con tabla tutores (para tutor del hospital)
ALTER TABLE alumnos
ADD COLUMN IF NOT EXISTS tutor_id UUID REFERENCES tutores(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_alumnos_tutor_id ON alumnos(tutor_id);

-- 4. Verificar estructura actualizada
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'alumnos'
  AND (column_name LIKE '%contacto%' OR column_name = 'tutor_id')
ORDER BY ordinal_position;

-- 5. Ver datos de ejemplo
SELECT 
    id,
    nombre,
    primer_apellido,
    contacto_nombre,
    contacto_telefono,
    tutor_id
FROM alumnos
LIMIT 5;

-- ============================================
-- RESULTADO:
-- ============================================
-- contacto_nombre = Contacto del Centro Formador
-- contacto_email = Email del Centro Formador
-- tutor_id = FK a tabla tutores (Tutor del Hospital)
--
-- La tabla tutores se mantiene para gestionar tutores del hospital
