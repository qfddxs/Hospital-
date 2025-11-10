-- ============================================
-- FIX: Configuración de Storage para Documentos
-- ============================================

-- PASO 1: Verificar si el bucket existe
-- Si no existe, créalo manualmente en el Dashboard de Supabase:
-- Storage > Create a new bucket > Name: "documentos"

-- PASO 2: Eliminar políticas existentes que puedan causar conflictos
DROP POLICY IF EXISTS "Permitir subir documentos autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leer documentos públicos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminar documentos autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualizar documentos autenticados" ON storage.objects;

-- PASO 3: Crear políticas correctas para el bucket "documentos"

-- Política para INSERTAR archivos (usuarios autenticados)
CREATE POLICY "Permitir subir documentos autenticados"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos');

-- Política para LEER archivos (acceso público)
CREATE POLICY "Permitir leer documentos públicos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'documentos');

-- Política para ACTUALIZAR archivos (usuarios autenticados)
CREATE POLICY "Permitir actualizar documentos autenticados"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'documentos')
WITH CHECK (bucket_id = 'documentos');

-- Política para ELIMINAR archivos (usuarios autenticados)
CREATE POLICY "Permitir eliminar documentos autenticados"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'documentos');

-- PASO 4: Verificar que las políticas se crearon correctamente
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%documentos%';

-- PASO 5: Verificar que el bucket existe
SELECT 
    id,
    name,
    public
FROM storage.buckets
WHERE name = 'documentos';

-- NOTA IMPORTANTE:
-- Si el bucket no aparece en la consulta anterior, debes crearlo manualmente:
-- 1. Ve a Supabase Dashboard
-- 2. Storage > Create a new bucket
-- 3. Name: documentos
-- 4. Public bucket: YES (marca esta opción para acceso público)
-- 5. Click "Create bucket"

-- PASO 6: Si el bucket ya existe pero no es público, actualízalo:
UPDATE storage.buckets
SET public = true
WHERE name = 'documentos';

-- PASO 7: Verificar configuración final
SELECT 
    'Bucket configurado correctamente' as status,
    name,
    public,
    created_at
FROM storage.buckets
WHERE name = 'documentos';
