-- ============================================
-- Script: Limpieza de Columnas Duplicadas
-- Descripción: Elimina columnas obsoletas de cupos en centros_formadores
-- Fecha: 2025-11-18
-- ============================================

-- IMPORTANTE: Este script elimina las columnas duplicadas:
-- - cupos_totales (usar capacidad_total)
-- - cupos_disponibles (usar capacidad_disponible)
-- - cupos_en_uso (calcular dinámicamente)

-- ============================================
-- PASO 1: Verificar columnas existentes
-- ============================================
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'centros_formadores' 
  AND column_name IN ('cupos_totales', 'cupos_disponibles', 'cupos_en_uso', 'capacidad_total', 'capacidad_disponible')
ORDER BY column_name;

-- ============================================
-- PASO 2: Migrar datos si existen valores en columnas antiguas
-- ============================================

-- Migrar cupos_totales a capacidad_total (solo si capacidad_total es NULL o 0)
UPDATE centros_formadores 
SET capacidad_total = COALESCE(cupos_totales, 0)
WHERE (capacidad_total IS NULL OR capacidad_total = 0) 
  AND cupos_totales IS NOT NULL 
  AND cupos_totales > 0;

-- Migrar cupos_disponibles a capacidad_disponible (solo si capacidad_disponible es NULL o 0)
UPDATE centros_formadores 
SET capacidad_disponible = COALESCE(cupos_disponibles, 0)
WHERE (capacidad_disponible IS NULL OR capacidad_disponible = 0) 
  AND cupos_disponibles IS NOT NULL 
  AND cupos_disponibles > 0;

-- ============================================
-- PASO 3: Eliminar columnas duplicadas
-- ============================================

-- Eliminar cupos_totales
ALTER TABLE centros_formadores 
DROP COLUMN IF EXISTS cupos_totales;

-- Eliminar cupos_disponibles
ALTER TABLE centros_formadores 
DROP COLUMN IF EXISTS cupos_en_uso;

-- Eliminar cupos_en_uso
ALTER TABLE centros_formadores 
DROP COLUMN IF EXISTS cupos_disponibles;

-- ============================================
-- PASO 4: Verificar que solo queden las columnas correctas
-- ============================================
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'centros_formadores' 
  AND column_name LIKE '%capac%' OR column_name LIKE '%cupo%'
ORDER BY column_name;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Solo deben existir:
-- - capacidad_total (INTEGER)
-- - capacidad_disponible (INTEGER)
--
-- NO deben existir:
-- - cupos_totales
-- - cupos_disponibles
-- - cupos_en_uso
-- ============================================
