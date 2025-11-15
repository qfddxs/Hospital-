-- ============================================
-- Agregar columna fecha_revision a solicitudes_cupos
-- ============================================

-- Verificar si la columna existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'solicitudes_cupos' 
        AND column_name = 'fecha_revision'
    ) THEN
        -- Agregar la columna si no existe
        ALTER TABLE solicitudes_cupos 
        ADD COLUMN fecha_revision TIMESTAMP WITH TIME ZONE;
        
        RAISE NOTICE 'Columna fecha_revision agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna fecha_revision ya existe';
    END IF;
END $$;

-- Verificar si la columna revisado_por existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'solicitudes_cupos' 
        AND column_name = 'revisado_por'
    ) THEN
        -- Agregar la columna si no existe
        ALTER TABLE solicitudes_cupos 
        ADD COLUMN revisado_por UUID REFERENCES auth.users(id);
        
        RAISE NOTICE 'Columna revisado_por agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna revisado_por ya existe';
    END IF;
END $$;

-- Verificar las columnas de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'solicitudes_cupos'
ORDER BY ordinal_position;
