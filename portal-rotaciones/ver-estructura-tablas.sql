-- ============================================
-- VER ESTRUCTURA DE TUS TABLAS
-- ============================================

-- 1. Ver columnas de estudiantes_rotacion
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'estudiantes_rotacion'
ORDER BY ordinal_position;

-- 2. Ver un registro de ejemplo
SELECT * FROM estudiantes_rotacion LIMIT 1;

-- 3. Ver columnas de solicitudes_rotacion
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'solicitudes_rotacion'
ORDER BY ordinal_position;

-- 4. Ver columnas de centros_formadores
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'centros_formadores'
ORDER BY ordinal_position;

-- 5. Ver columnas de alumnos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'alumnos'
ORDER BY ordinal_position;
