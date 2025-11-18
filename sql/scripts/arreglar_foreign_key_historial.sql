-- ============================================
-- Script: Arreglar Foreign Key del Historial
-- Descripción: Permite eliminar solicitudes sin problemas de FK
-- Fecha: 2025-11-18
-- ============================================

-- ============================================
-- PASO 1: Eliminar constraint antigua
-- ============================================
ALTER TABLE historial_movimientos_cupos
DROP CONSTRAINT IF EXISTS historial_movimientos_cupos_solicitud_cupos_id_fkey;

-- ============================================
-- PASO 2: Crear constraint nueva con ON DELETE CASCADE
-- ============================================
ALTER TABLE historial_movimientos_cupos
ADD CONSTRAINT historial_movimientos_cupos_solicitud_cupos_id_fkey
FOREIGN KEY (solicitud_cupos_id)
REFERENCES solicitudes_cupos(id)
ON DELETE CASCADE;  -- Cuando se elimina la solicitud, se elimina el historial también

-- ============================================
-- PASO 3: Verificar constraint
-- ============================================
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'historial_movimientos_cupos'::regclass
  AND conname LIKE '%solicitud%';

-- ============================================
-- PASO 4: Ahora puedes eliminar solicitudes sin problemas
-- ============================================
-- DELETE FROM solicitudes_cupos;

-- ============================================
-- ALTERNATIVA: Si prefieres mantener el historial
-- ============================================
-- Puedes usar ON DELETE SET NULL en lugar de CASCADE:
-- 
-- ALTER TABLE historial_movimientos_cupos
-- DROP CONSTRAINT IF EXISTS historial_movimientos_cupos_solicitud_cupos_id_fkey;
-- 
-- ALTER TABLE historial_movimientos_cupos
-- ADD CONSTRAINT historial_movimientos_cupos_solicitud_cupos_id_fkey
-- FOREIGN KEY (solicitud_cupos_id)
-- REFERENCES solicitudes_cupos(id)
-- ON DELETE SET NULL;
-- 
-- Esto mantiene el historial pero pone NULL en solicitud_cupos_id
-- ============================================
