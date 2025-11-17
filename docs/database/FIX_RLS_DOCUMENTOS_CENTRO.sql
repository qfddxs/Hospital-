-- ============================================
-- FIX: POLÍTICAS RLS PARA DOCUMENTOS_CENTRO
-- ============================================
-- Asegurar que el hospital pueda ver todos los documentos de centros

-- 1. Verificar políticas actuales
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'documentos_centro';

-- 2. Habilitar RLS si no está habilitado
ALTER TABLE documentos_centro ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas existentes (si causan problemas)
DROP POLICY IF EXISTS "Centros pueden ver sus documentos" ON documentos_centro;
DROP POLICY IF EXISTS "Centros pueden insertar sus documentos" ON documentos_centro;
DROP POLICY IF EXISTS "Centros pueden actualizar sus documentos" ON documentos_centro;
DROP POLICY IF EXISTS "Centros pueden eliminar sus documentos" ON documentos_centro;
DROP POLICY IF EXISTS "Hospital puede ver todos los documentos" ON documentos_centro;
DROP POLICY IF EXISTS "Hospital puede actualizar documentos" ON documentos_centro;

-- 4. Crear políticas correctas

-- Política para CENTROS FORMADORES (ver solo sus documentos)
CREATE POLICY "Centros pueden ver sus documentos"
ON documentos_centro
FOR SELECT
TO authenticated
USING (
  centro_formador_id IN (
    SELECT centro_formador_id 
    FROM usuarios_centros 
    WHERE user_id = auth.uid() 
    AND activo = true
  )
);

-- Política para CENTROS FORMADORES (insertar sus documentos)
CREATE POLICY "Centros pueden insertar sus documentos"
ON documentos_centro
FOR INSERT
TO authenticated
WITH CHECK (
  centro_formador_id IN (
    SELECT centro_formador_id 
    FROM usuarios_centros 
    WHERE user_id = auth.uid() 
    AND activo = true
  )
);

-- Política para CENTROS FORMADORES (actualizar sus documentos)
CREATE POLICY "Centros pueden actualizar sus documentos"
ON documentos_centro
FOR UPDATE
TO authenticated
USING (
  centro_formador_id IN (
    SELECT centro_formador_id 
    FROM usuarios_centros 
    WHERE user_id = auth.uid() 
    AND activo = true
  )
);

-- Política para CENTROS FORMADORES (eliminar sus documentos)
CREATE POLICY "Centros pueden eliminar sus documentos"
ON documentos_centro
FOR DELETE
TO authenticated
USING (
  centro_formador_id IN (
    SELECT centro_formador_id 
    FROM usuarios_centros 
    WHERE user_id = auth.uid() 
    AND activo = true
  )
);

-- Política para HOSPITAL (ver TODOS los documentos)
CREATE POLICY "Hospital puede ver todos los documentos"
ON documentos_centro
FOR SELECT
TO authenticated
USING (
  -- Usuario NO es de un centro formador (es del hospital)
  NOT EXISTS (
    SELECT 1 
    FROM usuarios_centros 
    WHERE user_id = auth.uid()
  )
);

-- Política para HOSPITAL (actualizar documentos - para aprobación)
CREATE POLICY "Hospital puede actualizar documentos"
ON documentos_centro
FOR UPDATE
TO authenticated
USING (
  -- Usuario NO es de un centro formador (es del hospital)
  NOT EXISTS (
    SELECT 1 
    FROM usuarios_centros 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  -- Usuario NO es de un centro formador (es del hospital)
  NOT EXISTS (
    SELECT 1 
    FROM usuarios_centros 
    WHERE user_id = auth.uid()
  )
);

-- 5. Verificar que las políticas se crearon correctamente
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN policyname LIKE '%Hospital%' THEN '🏥 Hospital'
    WHEN policyname LIKE '%Centros%' THEN '🏫 Centro'
    ELSE '❓ Otro'
  END as tipo_usuario
FROM pg_policies
WHERE tablename = 'documentos_centro'
ORDER BY policyname;

-- ============================================
-- PRUEBAS
-- ============================================

-- Prueba 1: Como usuario del hospital, ver todos los documentos
-- (Ejecutar después de hacer login como usuario del hospital)
SELECT 
  dc.id,
  dc.nombre_archivo,
  dc.tipo_documento,
  dc.aprobado,
  cf.nombre as centro_nombre
FROM documentos_centro dc
LEFT JOIN centros_formadores cf ON dc.centro_formador_id = cf.id
ORDER BY dc.fecha_subida DESC;

-- Prueba 2: Como usuario de centro, ver solo sus documentos
-- (Ejecutar después de hacer login como usuario de centro)
SELECT 
  dc.id,
  dc.nombre_archivo,
  dc.tipo_documento,
  dc.aprobado
FROM documentos_centro dc
WHERE dc.centro_formador_id IN (
  SELECT centro_formador_id 
  FROM usuarios_centros 
  WHERE user_id = auth.uid()
)
ORDER BY dc.fecha_subida DESC;

-- ============================================
-- ALTERNATIVA: DESHABILITAR RLS TEMPORALMENTE
-- ============================================
-- ⚠️ SOLO PARA DESARROLLO/PRUEBAS
-- NO USAR EN PRODUCCIÓN

-- ALTER TABLE documentos_centro DISABLE ROW LEVEL SECURITY;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
/*
Después de ejecutar este script:

1. ✅ Hospital puede ver TODOS los documentos de centros
2. ✅ Hospital puede actualizar documentos (aprobar/rechazar)
3. ✅ Centros solo ven sus propios documentos
4. ✅ Centros pueden insertar, actualizar y eliminar sus documentos
5. ✅ RLS está habilitado y funcionando correctamente

Si aún no aparecen los documentos:
→ Verificar que el usuario del hospital NO esté en la tabla usuarios_centros
→ Verificar que existan documentos en la tabla documentos_centro
→ Revisar logs de Supabase para ver errores de permisos
*/
