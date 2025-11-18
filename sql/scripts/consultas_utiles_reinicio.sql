-- ============================================
-- Consultas Útiles: Sistema de Reinicio de Cupos
-- Descripción: Consultas comunes para monitorear el sistema
-- Fecha: 2025-11-18
-- ============================================

-- ============================================
-- HISTORIAL DE REINICIOS
-- ============================================

-- Ver últimos 10 reinicios
SELECT 
  fecha_reinicio,
  centros_afectados,
  cupos_liberados,
  solicitudes_afectadas,
  nivel_formacion,
  observaciones
FROM historial_reinicio_cupos
ORDER BY fecha_reinicio DESC
LIMIT 10;

-- Ver último reinicio con detalles
SELECT 
  id,
  fecha_reinicio,
  usuario_id,
  centros_afectados,
  cupos_liberados,
  solicitudes_afectadas,
  nivel_formacion,
  observaciones,
  created_at
FROM historial_reinicio_cupos
ORDER BY fecha_reinicio DESC
LIMIT 1;

-- Reinicios por nivel de formación
SELECT 
  nivel_formacion,
  COUNT(*) as total_reinicios,
  SUM(cupos_liberados) as total_cupos_liberados,
  SUM(solicitudes_afectadas) as total_solicitudes_finalizadas,
  AVG(centros_afectados) as promedio_centros
FROM historial_reinicio_cupos
GROUP BY nivel_formacion
ORDER BY total_reinicios DESC;

-- Reinicios por mes
SELECT 
  DATE_TRUNC('month', fecha_reinicio) as mes,
  COUNT(*) as total_reinicios,
  SUM(cupos_liberados) as cupos_liberados,
  SUM(solicitudes_afectadas) as solicitudes_finalizadas
FROM historial_reinicio_cupos
GROUP BY mes
ORDER BY mes DESC;

-- Reinicios por usuario (requiere join con auth.users)
SELECT 
  hr.usuario_id,
  COUNT(*) as total_reinicios,
  SUM(hr.cupos_liberados) as total_cupos_liberados,
  MIN(hr.fecha_reinicio) as primer_reinicio,
  MAX(hr.fecha_reinicio) as ultimo_reinicio
FROM historial_reinicio_cupos hr
GROUP BY hr.usuario_id
ORDER BY total_reinicios DESC;

-- ============================================
-- ESTADO ACTUAL DE CUPOS
-- ============================================

-- Resumen general de cupos
SELECT 
  COUNT(*) as total_centros,
  SUM(capacidad_total) as cupos_totales,
  SUM(capacidad_disponible) as cupos_disponibles,
  SUM(capacidad_total - capacidad_disponible) as cupos_en_uso,
  ROUND(AVG(capacidad_disponible::DECIMAL / NULLIF(capacidad_total, 0) * 100), 2) as porcentaje_disponible
FROM centros_formadores
WHERE activo = true;

-- Cupos por nivel de formación
SELECT 
  nivel_formacion,
  COUNT(*) as total_centros,
  SUM(capacidad_total) as cupos_totales,
  SUM(capacidad_disponible) as cupos_disponibles,
  SUM(capacidad_total - capacidad_disponible) as cupos_en_uso,
  ROUND(SUM(capacidad_disponible)::DECIMAL / NULLIF(SUM(capacidad_total), 0) * 100, 2) as porcentaje_disponible
FROM centros_formadores
WHERE activo = true
GROUP BY nivel_formacion
ORDER BY nivel_formacion;

-- Centros sin cupos disponibles
SELECT 
  nombre,
  codigo,
  capacidad_total,
  capacidad_disponible,
  nivel_formacion
FROM centros_formadores
WHERE activo = true 
  AND capacidad_disponible = 0
ORDER BY capacidad_total DESC;

-- Centros con más cupos disponibles
SELECT 
  nombre,
  codigo,
  capacidad_total,
  capacidad_disponible,
  nivel_formacion,
  ROUND(capacidad_disponible::DECIMAL / NULLIF(capacidad_total, 0) * 100, 2) as porcentaje_disponible
FROM centros_formadores
WHERE activo = true 
  AND capacidad_disponible > 0
ORDER BY capacidad_disponible DESC
LIMIT 10;

-- Centros con cupos críticos (menos del 20% disponible)
SELECT 
  nombre,
  codigo,
  capacidad_total,
  capacidad_disponible,
  nivel_formacion,
  ROUND(capacidad_disponible::DECIMAL / NULLIF(capacidad_total, 0) * 100, 2) as porcentaje_disponible
FROM centros_formadores
WHERE activo = true 
  AND capacidad_total > 0
  AND (capacidad_disponible::DECIMAL / capacidad_total) < 0.2
ORDER BY porcentaje_disponible ASC;

-- ============================================
-- SOLICITUDES ACTIVAS
-- ============================================

-- Contar solicitudes por estado
SELECT 
  estado,
  COUNT(*) as total,
  SUM(numero_cupos) as cupos_solicitados
FROM solicitudes_rotacion
GROUP BY estado
ORDER BY total DESC;

-- Solicitudes aprobadas que serían afectadas por reinicio
SELECT 
  sr.id,
  sr.fecha_solicitud,
  sr.numero_cupos,
  sr.nivel_formacion,
  cf.nombre as centro_formador
FROM solicitudes_rotacion sr
JOIN centros_formadores cf ON sr.centro_formador_id = cf.id
WHERE sr.estado IN ('aprobada', 'en_proceso')
ORDER BY sr.fecha_solicitud DESC;

-- Solicitudes aprobadas por nivel de formación
SELECT 
  nivel_formacion,
  COUNT(*) as total_solicitudes,
  SUM(numero_cupos) as total_cupos
FROM solicitudes_rotacion
WHERE estado IN ('aprobada', 'en_proceso')
GROUP BY nivel_formacion;

-- ============================================
-- ESTADÍSTICAS PRE-REINICIO
-- ============================================

-- Obtener estadísticas para todos los niveles
SELECT obtener_estadisticas_pre_reinicio();

-- Obtener estadísticas solo para pregrado
SELECT obtener_estadisticas_pre_reinicio('pregrado');

-- Obtener estadísticas solo para postgrado
SELECT obtener_estadisticas_pre_reinicio('postgrado');

-- ============================================
-- ANÁLISIS DE IMPACTO
-- ============================================

-- Impacto potencial de reinicio por nivel
SELECT 
  cf.nivel_formacion,
  COUNT(DISTINCT cf.id) as centros_afectados,
  SUM(cf.capacidad_total - cf.capacidad_disponible) as cupos_a_liberar,
  COUNT(DISTINCT sr.id) as solicitudes_a_finalizar
FROM centros_formadores cf
LEFT JOIN solicitudes_rotacion sr ON 
  sr.centro_formador_id = cf.id 
  AND sr.estado IN ('aprobada', 'en_proceso')
WHERE cf.activo = true
GROUP BY cf.nivel_formacion;

-- Centros que más se beneficiarían de un reinicio
SELECT 
  nombre,
  codigo,
  capacidad_total,
  capacidad_disponible,
  (capacidad_total - capacidad_disponible) as cupos_a_recuperar,
  nivel_formacion
FROM centros_formadores
WHERE activo = true 
  AND capacidad_disponible < capacidad_total
ORDER BY cupos_a_recuperar DESC
LIMIT 10;

-- ============================================
-- AUDITORÍA Y MONITOREO
-- ============================================

-- Tiempo promedio entre reinicios
SELECT 
  AVG(diferencia_dias) as promedio_dias_entre_reinicios
FROM (
  SELECT 
    fecha_reinicio,
    LAG(fecha_reinicio) OVER (ORDER BY fecha_reinicio) as reinicio_anterior,
    EXTRACT(DAY FROM fecha_reinicio - LAG(fecha_reinicio) OVER (ORDER BY fecha_reinicio)) as diferencia_dias
  FROM historial_reinicio_cupos
) subquery
WHERE diferencia_dias IS NOT NULL;

-- Reinicios en los últimos 30 días
SELECT 
  fecha_reinicio,
  centros_afectados,
  cupos_liberados,
  solicitudes_afectadas,
  nivel_formacion
FROM historial_reinicio_cupos
WHERE fecha_reinicio >= NOW() - INTERVAL '30 days'
ORDER BY fecha_reinicio DESC;

-- Comparar estado antes y después del último reinicio
WITH ultimo_reinicio AS (
  SELECT * FROM historial_reinicio_cupos
  ORDER BY fecha_reinicio DESC
  LIMIT 1
),
estado_actual AS (
  SELECT 
    SUM(capacidad_disponible) as cupos_disponibles_ahora,
    SUM(capacidad_total - capacidad_disponible) as cupos_en_uso_ahora
  FROM centros_formadores
  WHERE activo = true
)
SELECT 
  ur.fecha_reinicio,
  ur.cupos_liberados as cupos_liberados_en_reinicio,
  ea.cupos_en_uso_ahora as cupos_usados_desde_reinicio,
  ROUND((ea.cupos_en_uso_ahora::DECIMAL / NULLIF(ur.cupos_liberados, 0)) * 100, 2) as porcentaje_reusado
FROM ultimo_reinicio ur, estado_actual ea;

-- ============================================
-- MANTENIMIENTO
-- ============================================

-- Verificar integridad de datos
SELECT 
  'Centros con capacidad_disponible > capacidad_total' as problema,
  COUNT(*) as cantidad
FROM centros_formadores
WHERE capacidad_disponible > capacidad_total
UNION ALL
SELECT 
  'Centros con capacidad negativa' as problema,
  COUNT(*) as cantidad
FROM centros_formadores
WHERE capacidad_disponible < 0 OR capacidad_total < 0
UNION ALL
SELECT 
  'Centros sin capacidad definida' as problema,
  COUNT(*) as cantidad
FROM centros_formadores
WHERE capacidad_total IS NULL OR capacidad_disponible IS NULL;

-- Limpiar historial antiguo (más de 2 años)
-- CUIDADO: Esta consulta elimina datos permanentemente
-- DELETE FROM historial_reinicio_cupos
-- WHERE fecha_reinicio < NOW() - INTERVAL '2 years';

-- ============================================
-- REPORTES
-- ============================================

-- Reporte mensual de reinicios
SELECT 
  TO_CHAR(fecha_reinicio, 'YYYY-MM') as mes,
  COUNT(*) as total_reinicios,
  SUM(centros_afectados) as total_centros,
  SUM(cupos_liberados) as total_cupos_liberados,
  SUM(solicitudes_afectadas) as total_solicitudes_finalizadas,
  ROUND(AVG(cupos_liberados), 2) as promedio_cupos_por_reinicio
FROM historial_reinicio_cupos
GROUP BY mes
ORDER BY mes DESC;

-- Reporte de eficiencia de cupos
SELECT 
  cf.nombre,
  cf.capacidad_total,
  cf.capacidad_disponible,
  COUNT(sr.id) as solicitudes_activas,
  ROUND((cf.capacidad_total - cf.capacidad_disponible)::DECIMAL / NULLIF(cf.capacidad_total, 0) * 100, 2) as tasa_ocupacion
FROM centros_formadores cf
LEFT JOIN solicitudes_rotacion sr ON 
  sr.centro_formador_id = cf.id 
  AND sr.estado IN ('aprobada', 'en_proceso')
WHERE cf.activo = true
GROUP BY cf.id, cf.nombre, cf.capacidad_total, cf.capacidad_disponible
ORDER BY tasa_ocupacion DESC;
