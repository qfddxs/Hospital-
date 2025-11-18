-- ============================================
-- Script: Limpiar Datos de Prueba
-- Descripción: Elimina solicitudes y resetea cupos para testing
-- Fecha: 2025-11-18
-- ⚠️ CUIDADO: Este script elimina datos permanentemente
-- ============================================

-- ============================================
-- OPCIÓN 1: Eliminar UNA solicitud específica
-- ============================================
-- Reemplaza 'uuid-de-la-solicitud' con el ID real
-- DELETE FROM solicitudes_cupos 
-- WHERE id = 'c191f192-8e36-4531-b093-a16653f9317c';

-- ============================================
-- OPCIÓN 2: Eliminar TODAS las solicitudes
-- ============================================
-- ⚠️ CUIDADO: Esto elimina TODAS las solicitudes
-- Descomenta la siguiente línea para ejecutar:

-- DELETE FROM solicitudes_cupos;

-- ============================================
-- OPCIÓN 3: Eliminar solicitudes por estado
-- ============================================

-- Eliminar solo solicitudes pendientes
-- DELETE FROM solicitudes_cupos WHERE estado = 'pendiente';

-- Eliminar solo solicitudes aprobadas
-- DELETE FROM solicitudes_cupos WHERE estado = 'aprobada';

-- Eliminar solo solicitudes rechazadas
-- DELETE FROM solicitudes_cupos WHERE estado = 'rechazada';

-- Eliminar solo solicitudes finalizadas
-- DELETE FROM solicitudes_cupos WHERE estado = 'finalizada';

-- ============================================
-- OPCIÓN 4: Resetear cupos de todos los centros
-- ============================================
-- Restaura capacidad_disponible = capacidad_total

-- UPDATE centros_formadores
-- SET capacidad_disponible = capacidad_total;

-- ============================================
-- OPCIÓN 5: Limpiar historial de movimientos
-- ============================================
-- ⚠️ CUIDADO: Esto elimina el historial de auditoría

-- DELETE FROM historial_movimientos_cupos;

-- ============================================
-- OPCIÓN 6: Limpiar historial de reinicios
-- ============================================
-- ⚠️ CUIDADO: Esto elimina el historial de reinicios

-- DELETE FROM historial_reinicio_cupos;

-- ============================================
-- OPCIÓN 7: RESET COMPLETO (Todo limpio)
-- ============================================
-- ⚠️ CUIDADO: Esto elimina TODO y resetea el sistema
-- Descomenta las siguientes líneas para ejecutar:

-- Paso 1: Eliminar todas las solicitudes
-- DELETE FROM solicitudes_cupos;

-- Paso 2: Resetear cupos de todos los centros
-- UPDATE centros_formadores
-- SET capacidad_disponible = capacidad_total;

-- Paso 3: Limpiar historial de movimientos
-- DELETE FROM historial_movimientos_cupos;

-- Paso 4: Limpiar historial de reinicios
-- DELETE FROM historial_reinicio_cupos;

-- ============================================
-- VERIFICACIÓN: Ver estado después de limpiar
-- ============================================

-- Ver solicitudes restantes
SELECT 
  COUNT(*) as total_solicitudes,
  COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
  COUNT(CASE WHEN estado = 'aprobada' THEN 1 END) as aprobadas,
  COUNT(CASE WHEN estado = 'rechazada' THEN 1 END) as rechazadas,
  COUNT(CASE WHEN estado = 'finalizada' THEN 1 END) as finalizadas
FROM solicitudes_cupos;

-- Ver estado de cupos
SELECT 
  nombre,
  capacidad_total,
  capacidad_disponible,
  (capacidad_total - capacidad_disponible) as en_uso
FROM centros_formadores
WHERE activo = true
ORDER BY nombre;

-- Ver historial de movimientos
SELECT COUNT(*) as total_movimientos
FROM historial_movimientos_cupos;

-- Ver historial de reinicios
SELECT COUNT(*) as total_reinicios
FROM historial_reinicio_cupos;

-- ============================================
-- SCRIPT RECOMENDADO PARA TESTING
-- ============================================
-- Copia y pega esto para limpiar todo y empezar de cero:

/*
-- 1. Eliminar todas las solicitudes
DELETE FROM solicitudes_cupos;

-- 2. Resetear cupos
UPDATE centros_formadores
SET capacidad_disponible = capacidad_total;

-- 3. Limpiar historiales
DELETE FROM historial_movimientos_cupos;
DELETE FROM historial_reinicio_cupos;

-- 4. Verificar que todo está limpio
SELECT 'Solicitudes' as tabla, COUNT(*) as registros FROM solicitudes_cupos
UNION ALL
SELECT 'Movimientos', COUNT(*) FROM historial_movimientos_cupos
UNION ALL
SELECT 'Reinicios', COUNT(*) FROM historial_reinicio_cupos;

-- 5. Verificar cupos restaurados
SELECT 
  COUNT(*) as centros_con_cupos_completos
FROM centros_formadores
WHERE capacidad_disponible = capacidad_total;
*/

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Después de limpiar, puedes:
-- 1. Crear nuevas solicitudes desde el Portal de Centros Formadores
-- 2. Aprobarlas desde el Hospital
-- 3. Ver que los cupos se descuentan automáticamente
-- 4. Probar el botón "Reiniciar Cupos"
-- 5. Ver que todo funciona correctamente
-- ============================================
