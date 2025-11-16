-- ============================================
-- VERIFICAR Y CORREGIR PERMISOS RLS
-- Para estudiantes_rotacion
-- ============================================

-- 1. Ver políticas actuales
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
WHERE tablename = 'estudiantes_rotacion';

-- 2. Verificar si RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'estudiantes_rotacion';

-- 3. SOLUCIÓN: Asegurar que el portal puede DELETE
-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Portal puede eliminar estudiantes" ON estudiantes_rotacion;
DROP POLICY IF EXISTS "Portal puede gestionar estudiantes" ON estudiantes_rotacion;

-- Crear política completa para el portal
CREATE POLICY "Portal puede gestionar estudiantes"
ON estudiantes_rotacion
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Verificar que se aplicó
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'estudiantes_rotacion';
