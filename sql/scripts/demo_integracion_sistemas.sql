-- ============================================
-- Demo: Integración de Sistemas de Cupos
-- Descripción: Demuestra cómo funcionan juntos los dos sistemas
-- Fecha: 2025-11-18
-- ============================================

-- ============================================
-- ESCENARIO: Ciclo Completo de un Semestre
-- ============================================

-- ============================================
-- PASO 1: Estado Inicial (Después de Reinicio)
-- ============================================
SELECT 
  'PASO 1: Estado Inicial' as paso,
  nombre,
  capacidad_total,
  capacidad_disponible,
  (capacidad_total - capacidad_disponible) as cupos_en_uso
FROM centros_formadores
WHERE activo = true
ORDER BY nombre
LIMIT 5;

-- ============================================
-- PASO 2: Durante el Período (Descuento Automático)
-- ============================================

-- Ver solicitudes aprobadas (cupos ya descontados por trigger)
SELECT 
  'PASO 2: Solicitudes Aprobadas' as paso,
  sc.id,
  cf.nombre as centro,
  sc.especialidad,
  sc.numero_cupos,
  sc.estado,
  cf.capacidad_disponible as cupos_disponibles_ahora
FROM solicitudes_cupos sc
JOIN centros_formadores cf ON sc.centro_formador_id = cf.id
WHERE sc.estado = 'aprobada'
ORDER BY sc.created_at DESC
LIMIT 10;

-- Ver historial de movimientos automáticos
SELECT 
  'PASO 2: Historial de Movimientos' as paso,
  cf.nombre as centro,
  hmc.tipo_movimiento,
  hmc.cupos_afectados,
  hmc.capacidad_antes,
  hmc.capacidad_despues,
  hmc.created_at
FROM historial_movimientos_cupos hmc
JOIN centros_formadores cf ON hmc.centro_formador_id = cf.id
ORDER BY hmc.created_at DESC
LIMIT 10;

-- ============================================
-- PASO 3: Estadísticas Antes de Reiniciar
-- ============================================
SELECT 
  'PASO 3: Estadísticas Pre-Reinicio' as paso,
  obtener_estadisticas_pre_reinicio() as estadisticas;

-- ============================================
-- PASO 4: Ejecutar Reinicio Manual
-- ============================================
-- NOTA: Descomentar para ejecutar el reinicio
-- SELECT 
--   'PASO 4: Ejecutar Reinicio' as paso,
--   reiniciar_cupos_manual(
--     NULL, -- todos los niveles
--     auth.uid(),
--     'Demo de integración de sistemas'
--   ) as resultado;

-- ============================================
-- PASO 5: Estado Después del Reinicio
-- ============================================
-- Ver centros después del reinicio
SELECT 
  'PASO 5: Estado Post-Reinicio' as paso,
  nombre,
  capacidad_total,
  capacidad_disponible,
  (capacidad_total - capacidad_disponible) as cupos_en_uso
FROM centros_formadores
WHERE activo = true
ORDER BY nombre
LIMIT 5;

-- Ver solicitudes finalizadas
SELECT 
  'PASO 5: Solicitudes Finalizadas' as paso,
  COUNT(*) as total_finalizadas
FROM solicitudes_cupos
WHERE estado = 'finalizada';

-- Ver historial de reinicios
SELECT 
  'PASO 5: Historial de Reinicios' as paso,
  fecha_reinicio,
  centros_afectados,
  cupos_liberados,
  solicitudes_afectadas,
  observaciones
FROM historial_reinicio_cupos
ORDER BY fecha_reinicio DESC
LIMIT 5;

-- ============================================
-- ANÁLISIS: Comparación de Historiales
-- ============================================

-- Resumen de movimientos automáticos vs reinicios
SELECT 
  'Movimientos Automáticos' as tipo,
  COUNT(*) as cantidad,
  SUM(cupos_afectados) as total_cupos,
  MIN(created_at) as primer_registro,
  MAX(created_at) as ultimo_registro
FROM historial_movimientos_cupos

UNION ALL

SELECT 
  'Reinicios Manuales' as tipo,
  COUNT(*) as cantidad,
  SUM(cupos_liberados) as total_cupos,
  MIN(fecha_reinicio) as primer_registro,
  MAX(fecha_reinicio) as ultimo_registro
FROM historial_reinicio_cupos;

-- ============================================
-- ANÁLISIS: Timeline Completo
-- ============================================
-- Combinar ambos historiales en una línea de tiempo
SELECT 
  'Movimiento Automático' as tipo,
  cf.nombre as centro,
  hmc.tipo_movimiento as accion,
  hmc.cupos_afectados as cupos,
  hmc.created_at as fecha
FROM historial_movimientos_cupos hmc
JOIN centros_formadores cf ON hmc.centro_formador_id = cf.id

UNION ALL

SELECT 
  'Reinicio Manual' as tipo,
  'TODOS LOS CENTROS' as centro,
  'reinicio' as accion,
  cupos_liberados as cupos,
  fecha_reinicio as fecha
FROM historial_reinicio_cupos

ORDER BY fecha DESC
LIMIT 20;

-- ============================================
-- VERIFICACIÓN: Integridad del Sistema
-- ============================================

-- Verificar que no hay inconsistencias
SELECT 
  'Verificación de Integridad' as verificacion,
  COUNT(*) as centros_con_problemas
FROM centros_formadores
WHERE capacidad_disponible < 0 
   OR capacidad_disponible > capacidad_total
   OR capacidad_total IS NULL
   OR capacidad_disponible IS NULL;

-- Resultado esperado: 0 centros con problemas

-- ============================================
-- RESUMEN: Estado Actual del Sistema
-- ============================================
SELECT 
  'RESUMEN GENERAL' as seccion,
  (SELECT COUNT(*) FROM centros_formadores WHERE activo = true) as total_centros,
  (SELECT SUM(capacidad_total) FROM centros_formadores WHERE activo = true) as cupos_totales,
  (SELECT SUM(capacidad_disponible) FROM centros_formadores WHERE activo = true) as cupos_disponibles,
  (SELECT COUNT(*) FROM solicitudes_cupos WHERE estado = 'aprobada') as solicitudes_aprobadas,
  (SELECT COUNT(*) FROM solicitudes_cupos WHERE estado = 'finalizada') as solicitudes_finalizadas,
  (SELECT COUNT(*) FROM historial_movimientos_cupos) as movimientos_automaticos,
  (SELECT COUNT(*) FROM historial_reinicio_cupos) as reinicios_manuales;

-- ============================================
-- CONCLUSIÓN
-- ============================================
-- Los dos sistemas funcionan perfectamente juntos:
-- 
-- 1. Sistema de Descuento Automático (día a día):
--    - Descuenta cupos al aprobar solicitudes
--    - Devuelve cupos al rechazar/eliminar
--    - Registra en historial_movimientos_cupos
--
-- 2. Sistema de Reinicio Manual (fin de período):
--    - Restaura todos los cupos a capacidad_total
--    - Finaliza solicitudes aprobadas
--    - Registra en historial_reinicio_cupos
--
-- Ambos modifican capacidad_disponible sin conflictos
-- Cada uno tiene su propio historial para auditoría
-- El ciclo se repite: reinicio → descuentos → reinicio
-- ============================================
