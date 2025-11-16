-- ============================================
-- MIGRAR DATOS DE COLUMNAS ANTIGUAS
-- ============================================

-- 1. Ver si existen las columnas antiguas
SELECT 
    column_name
FROM information_schema.columns
WHERE table_name = 'alumnos'
  AND column_name IN ('nombre_docente_cargo', 'telefono_docente_cargo');

-- 2. Si las columnas antiguas NO existen (ya fueron renombradas),
--    los datos ya están en contacto_nombre y contacto_telefono
--    Solo necesitamos llenar los NULL con datos del centro formador

-- 3. Actualizar alumnos que tienen contacto_nombre NULL
--    con el contacto del centro formador
UPDATE alumnos
SET 
    contacto_nombre = cf.contacto_nombre,
    contacto_telefono = cf.contacto_telefono
FROM centros_formadores cf
WHERE alumnos.centro_formador_id = cf.id
  AND alumnos.contacto_nombre IS NULL;

-- 4. Verificar resultado
SELECT 
    a.id,
    a.nombre,
    a.primer_apellido,
    a.contacto_nombre,
    a.contacto_telefono,
    cf.nombre as centro_formador,
    cf.contacto_nombre as contacto_cf
FROM alumnos a
LEFT JOIN centros_formadores cf ON a.centro_formador_id = cf.id
LIMIT 10;

-- 5. Ver cuántos alumnos tienen contacto asignado
SELECT 
    COUNT(*) as total_alumnos,
    COUNT(contacto_nombre) as con_contacto,
    COUNT(*) - COUNT(contacto_nombre) as sin_contacto
FROM alumnos;
