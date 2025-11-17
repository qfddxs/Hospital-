-- ============================================
-- ELIMINAR TABLA TUTORES Y REFERENCIAS
-- ============================================

-- 1. Ver qué columnas referencian a tutores
SELECT 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'tutores';

-- 2. Eliminar columna tutor_id de rotaciones (si existe)
ALTER TABLE rotaciones
DROP COLUMN IF EXISTS tutor_id CASCADE;

-- 3. Eliminar columna tutor_id de alumnos (si existe)
ALTER TABLE alumnos
DROP COLUMN IF EXISTS tutor_id CASCADE;

-- 4. Eliminar la tabla tutores
DROP TABLE IF EXISTS tutores CASCADE;

-- 5. Verificar que se eliminó
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'tutores';

-- Resultado esperado: 0 filas (tabla eliminada)

-- ============================================
-- CONFIRMACIÓN
-- ============================================
-- ✅ Tabla tutores eliminada
-- ✅ Referencias eliminadas
-- ✅ Sistema usa contacto_nombre y contacto_email de alumnos
