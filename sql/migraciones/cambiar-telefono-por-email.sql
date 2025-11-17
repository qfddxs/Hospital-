-- ============================================
-- CAMBIAR contacto_telefono POR contacto_email
-- ============================================

-- 1. Renombrar la columna
ALTER TABLE alumnos
RENAME COLUMN contacto_telefono TO contacto_email;

-- 2. Actualizar alumnos con el email del centro formador
UPDATE alumnos
SET 
    contacto_nombre = cf.contacto_nombre,
    contacto_email = cf.email
FROM centros_formadores cf
WHERE alumnos.centro_formador_id = cf.id
  AND alumnos.contacto_nombre IS NULL;

-- 3. Verificar resultado
SELECT 
    a.nombre,
    a.primer_apellido,
    a.contacto_nombre,
    a.contacto_email,
    cf.nombre as centro_formador
FROM alumnos a
LEFT JOIN centros_formadores cf ON a.centro_formador_id = cf.id
LIMIT 10;

-- 4. Ver estructura final
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'alumnos'
  AND (column_name LIKE '%contacto%' OR column_name = 'tutor_id')
ORDER BY ordinal_position;

-- ============================================
-- RESULTADO FINAL:
-- ============================================
-- contacto_nombre = Nombre del contacto del Centro Formador
-- contacto_email = Email del Centro Formador
-- tutor_id = FK a tutores (Tutor del Hospital)
