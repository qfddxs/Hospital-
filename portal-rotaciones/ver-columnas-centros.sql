-- Ver qué columnas tiene la tabla centros_formadores
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'centros_formadores'
ORDER BY ordinal_position;

-- Ver un registro de ejemplo
SELECT * FROM centros_formadores LIMIT 1;
