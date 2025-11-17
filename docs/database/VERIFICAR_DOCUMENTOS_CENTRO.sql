-- ============================================
-- SCRIPT DE VERIFICACIÓN: DOCUMENTOS_CENTRO
-- ============================================
-- Ejecutar este script para diagnosticar el problema

-- 1. Verificar si la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'documentos_centro'
) as tabla_existe;

-- 2. Verificar estructura de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'documentos_centro'
ORDER BY ordinal_position;

-- 3. Verificar si existen documentos
SELECT 
  COUNT(*) as total_documentos,
  COUNT(CASE WHEN aprobado IS NULL THEN 1 END) as pendientes,
  COUNT(CASE WHEN aprobado = true THEN 1 END) as aprobados,
  COUNT(CASE WHEN aprobado = false THEN 1 END) as rechazados
FROM documentos_centro;

-- 4. Ver todos los documentos con información del centro
SELECT 
  dc.id,
  dc.nombre_archivo,
  dc.tipo_documento,
  dc.fecha_subida,
  dc.aprobado,
  cf.nombre as centro_nombre,
  cf.codigo as centro_codigo
FROM documentos_centro dc
LEFT JOIN centros_formadores cf ON dc.centro_formador_id = cf.id
ORDER BY dc.fecha_subida DESC
LIMIT 20;

-- 5. Verificar si los campos de aprobación existen
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'documentos_centro'
  AND column_name IN ('aprobado', 'aprobado_por', 'fecha_aprobacion', 'comentarios_aprobacion');

-- 6. Verificar centros formadores activos
SELECT 
  id,
  nombre,
  codigo,
  activo
FROM centros_formadores
WHERE activo = true
ORDER BY nombre;

-- 7. Ver documentos por centro
SELECT 
  cf.nombre as centro,
  COUNT(dc.id) as total_docs,
  COUNT(CASE WHEN dc.aprobado IS NULL THEN 1 END) as pendientes
FROM centros_formadores cf
LEFT JOIN documentos_centro dc ON cf.id = dc.centro_formador_id
WHERE cf.activo = true
GROUP BY cf.id, cf.nombre
ORDER BY total_docs DESC;

-- ============================================
-- DIAGNÓSTICO
-- ============================================
/*
RESULTADOS ESPERADOS:

1. tabla_existe = true
2. Debe mostrar columnas: aprobado, aprobado_por, fecha_aprobacion, comentarios_aprobacion
3. Debe mostrar documentos con sus estados
4. Debe mostrar centros formadores activos

SI NO APARECEN LOS CAMPOS DE APROBACIÓN:
→ Ejecutar: docs/database/AGREGAR_APROBACION_DOCUMENTOS_CENTRO.sql

SI NO HAY DOCUMENTOS:
→ Los centros formadores deben subir documentos primero

SI LOS DOCUMENTOS NO APARECEN EN EL HOSPITAL:
→ Verificar que la consulta en GestionDocumental.jsx esté correcta
→ Verificar permisos RLS en Supabase
*/
