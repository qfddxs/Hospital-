-- ============================================
-- VERIFICAR ESTRUCTURA DE TABLAS EXISTENTES
-- ============================================
-- Ejecuta estos queries para ver la estructura de tus tablas

-- 1. Ver estructura de la tabla alumnos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'alumnos'
ORDER BY ordinal_position;

-- 2. Ver estructura de solicitudes_rotacion
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'solicitudes_rotacion'
ORDER BY ordinal_position;

-- 3. Ver estructura de estudiantes_rotacion
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'estudiantes_rotacion'
ORDER BY ordinal_position;

-- 4. Ver estructura de rotaciones
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'rotaciones'
ORDER BY ordinal_position;

-- 5. Ver estructura de centros_formadores
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'centros_formadores'
ORDER BY ordinal_position;
