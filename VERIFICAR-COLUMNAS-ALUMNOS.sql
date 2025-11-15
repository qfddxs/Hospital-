-- Ver qué columnas tiene la tabla alumnos actualmente
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'alumnos'
ORDER BY ordinal_position;

-- Ver un registro de ejemplo
SELECT * FROM alumnos LIMIT 1;
