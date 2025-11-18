-- ============================================
-- Script de Verificación: Sistema de Reinicio de Cupos
-- Descripción: Verifica que todo esté configurado correctamente
-- Fecha: 2025-11-18
-- ============================================

-- ============================================
-- 1. Verificar que la tabla existe
-- ============================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_name = 'historial_reinicio_cupos';

-- Resultado esperado: 1 fila con table_name = 'historial_reinicio_cupos'

-- ============================================
-- 2. Verificar columnas de la tabla
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'historial_reinicio_cupos'
ORDER BY ordinal_position;

-- Resultado esperado: 9 columnas (id, fecha_reinicio, usuario_id, etc.)

-- ============================================
-- 3. Verificar que las funciones existen
-- ============================================
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_name IN ('reiniciar_cupos_manual', 'obtener_estadisticas_pre_reinicio')
ORDER BY routine_name;

-- Resultado esperado: 2 funciones

-- ============================================
-- 4. Verificar políticas RLS
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'historial_reinicio_cupos'
ORDER BY policyname;

-- Resultado esperado: 2 políticas (SELECT y INSERT)

-- ============================================
-- 5. Verificar columnas correctas en centros_formadores
-- ============================================
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'centros_formadores'
  AND (column_name LIKE '%capac%' OR column_name LIKE '%cupo%')
ORDER BY column_name;

-- Resultado esperado: Solo capacidad_total y capacidad_disponible
-- NO deben existir: cupos_totales, cupos_disponibles, cupos_en_uso

-- ============================================
-- 6. Probar función de estadísticas (sin modificar datos)
-- ============================================
SELECT obtener_estadisticas_pre_reinicio();

-- Resultado esperado: JSON con estadísticas actuales

-- ============================================
-- 7. Verificar índices
-- ============================================
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'historial_reinicio_cupos'
ORDER BY indexname;

-- Resultado esperado: 3 índices (primary key + 2 índices adicionales)

-- ============================================
-- 8. Contar registros en historial (si existen)
-- ============================================
SELECT 
  COUNT(*) as total_reinicios,
  MIN(fecha_reinicio) as primer_reinicio,
  MAX(fecha_reinicio) as ultimo_reinicio
FROM historial_reinicio_cupos;

-- ============================================
-- 9. Verificar integridad de datos en centros_formadores
-- ============================================
SELECT 
  COUNT(*) as total_centros,
  COUNT(CASE WHEN capacidad_total IS NULL THEN 1 END) as sin_capacidad_total,
  COUNT(CASE WHEN capacidad_disponible IS NULL THEN 1 END) as sin_capacidad_disponible,
  COUNT(CASE WHEN capacidad_disponible > capacidad_total THEN 1 END) as disponible_mayor_total,
  COUNT(CASE WHEN capacidad_disponible < 0 THEN 1 END) as disponible_negativo
FROM centros_formadores;

-- Resultado esperado: 
-- - sin_capacidad_total = 0
-- - sin_capacidad_disponible = 0
-- - disponible_mayor_total = 0
-- - disponible_negativo = 0

-- ============================================
-- 10. Resumen de estado del sistema
-- ============================================
SELECT 
  'Sistema de Reinicio de Cupos' as componente,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'historial_reinicio_cupos')
    THEN '✅ Instalado'
    ELSE '❌ No instalado'
  END as estado,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'reiniciar_cupos_manual')
    THEN '✅ Funcional'
    ELSE '❌ Falta función'
  END as funcionalidad;

-- ============================================
-- RESULTADO ESPERADO COMPLETO
-- ============================================
-- Si todo está correcto, deberías ver:
-- ✅ Tabla historial_reinicio_cupos existe
-- ✅ 9 columnas en la tabla
-- ✅ 2 funciones creadas
-- ✅ 2 políticas RLS activas
-- ✅ Solo columnas capacidad_* en centros_formadores
-- ✅ Función de estadísticas retorna JSON válido
-- ✅ 3 índices en la tabla
-- ✅ Sin problemas de integridad de datos
-- ✅ Sistema instalado y funcional
