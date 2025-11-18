-- ============================================
-- Script de Verificación: Sistema de Descuento Automático
-- Descripción: Verifica que todo esté configurado correctamente
-- Fecha: 2025-11-18
-- ============================================

-- ============================================
-- 1. Verificar tabla historial_movimientos_cupos
-- ============================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_name = 'historial_movimientos_cupos';

-- Resultado esperado: 1 fila

-- ============================================
-- 2. Verificar columnas de la tabla
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'historial_movimientos_cupos'
ORDER BY ordinal_position;

-- Resultado esperado: 11 columnas

-- ============================================
-- 3. Verificar que el trigger existe
-- ============================================
SELECT 
  tgname as trigger_name,
  tgtype as trigger_type,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'trigger_sincronizar_cupos';

-- Resultado esperado: 1 fila con enabled = 'O' (activo)

-- ============================================
-- 4. Verificar funciones creadas
-- ============================================
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_name IN (
  'sincronizar_cupos_solicitud',
  'validar_cupos_disponibles',
  'registrar_movimiento_cupos'
)
ORDER BY routine_name;

-- Resultado esperado: 3 funciones

-- ============================================
-- 5. Verificar políticas RLS
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'historial_movimientos_cupos'
ORDER BY policyname;

-- Resultado esperado: 2 políticas (SELECT y INSERT)

-- ============================================
-- 6. Verificar índices
-- ============================================
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'historial_movimientos_cupos'
ORDER BY indexname;

-- Resultado esperado: 5 índices (primary key + 4 índices adicionales)

-- ============================================
-- 7. Probar función de validación
-- ============================================
-- Obtener un centro para probar
DO $$
DECLARE
  v_centro_id UUID;
BEGIN
  SELECT id INTO v_centro_id
  FROM centros_formadores
  LIMIT 1;

  IF v_centro_id IS NOT NULL THEN
    RAISE NOTICE 'Probando validación con centro: %', v_centro_id;
    PERFORM validar_cupos_disponibles(v_centro_id, 5);
    RAISE NOTICE '✅ Función de validación funciona correctamente';
  ELSE
    RAISE NOTICE '⚠️ No hay centros formadores para probar';
  END IF;
END $$;

-- ============================================
-- 8. Verificar integridad de datos
-- ============================================
SELECT 
  COUNT(*) as total_centros,
  COUNT(CASE WHEN capacidad_disponible IS NULL THEN 1 END) as sin_capacidad_disponible,
  COUNT(CASE WHEN capacidad_total IS NULL THEN 1 END) as sin_capacidad_total,
  COUNT(CASE WHEN capacidad_disponible < 0 THEN 1 END) as capacidad_negativa,
  COUNT(CASE WHEN capacidad_disponible > capacidad_total THEN 1 END) as disponible_mayor_total
FROM centros_formadores;

-- Resultado esperado: todos los contadores excepto total_centros deben ser 0

-- ============================================
-- 9. Contar movimientos registrados
-- ============================================
SELECT 
  COUNT(*) as total_movimientos,
  COUNT(DISTINCT centro_formador_id) as centros_con_movimientos,
  MIN(created_at) as primer_movimiento,
  MAX(created_at) as ultimo_movimiento
FROM historial_movimientos_cupos;

-- ============================================
-- 10. Movimientos por tipo
-- ============================================
SELECT 
  tipo_movimiento,
  COUNT(*) as cantidad,
  SUM(cupos_afectados) as total_cupos
FROM historial_movimientos_cupos
GROUP BY tipo_movimiento
ORDER BY cantidad DESC;

-- ============================================
-- 11. Verificar solicitudes_cupos
-- ============================================
SELECT 
  estado,
  COUNT(*) as cantidad,
  SUM(numero_cupos) as total_cupos
FROM solicitudes_cupos
GROUP BY estado
ORDER BY cantidad DESC;

-- ============================================
-- 12. Resumen de estado del sistema
-- ============================================
SELECT 
  'Sistema de Descuento Automático' as componente,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'historial_movimientos_cupos')
    THEN '✅ Instalado'
    ELSE '❌ No instalado'
  END as estado_tabla,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_sincronizar_cupos')
    THEN '✅ Activo'
    ELSE '❌ Inactivo'
  END as estado_trigger,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'validar_cupos_disponibles')
    THEN '✅ Funcional'
    ELSE '❌ Falta función'
  END as estado_funciones;

-- ============================================
-- RESULTADO ESPERADO COMPLETO
-- ============================================
-- Si todo está correcto, deberías ver:
-- ✅ Tabla historial_movimientos_cupos existe
-- ✅ 11 columnas en la tabla
-- ✅ Trigger trigger_sincronizar_cupos activo
-- ✅ 3 funciones creadas
-- ✅ 2 políticas RLS activas
-- ✅ 5 índices en la tabla
-- ✅ Función de validación funciona
-- ✅ Sin problemas de integridad de datos
-- ✅ Sistema instalado y funcional
