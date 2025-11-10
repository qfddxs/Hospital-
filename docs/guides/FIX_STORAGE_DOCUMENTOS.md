# 🔧 Solución: Error "Bucket not found" en Documentos

## 🚨 Problema

Al intentar descargar un documento, aparece el error:
```json
{"statusCode": "404", "error": "Bucket not found", "message": "Bucket not found"}
```

## ✅ Solución Rápida

### Opción 1: Crear Bucket desde Dashboard (RECOMENDADO)

1. **Ve a tu proyecto en Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/[tu-proyecto-id]

2. **Navega a Storage**
   - Click en "Storage" en el menú lateral izquierdo

3. **Crear nuevo bucket**
   - Click en "Create a new bucket" o "New bucket"
   - **Name:** `documentos`
   - **Public bucket:** ✅ **MARCAR ESTA OPCIÓN** (muy importante)
   - Click "Create bucket"

4. **Verificar que se creó**
   - Deberías ver el bucket "documentos" en la lista
   - Debe tener un ícono de 🌐 indicando que es público

### Opción 2: Ejecutar SQL

Si prefieres hacerlo por SQL:

```sql
-- 1. Crear el bucket (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Aplicar políticas
-- Ejecutar el archivo: supabase-fix-storage-documentos.sql
```

## 🔍 Verificación

### Paso 1: Verificar que el bucket existe

```sql
SELECT id, name, public, created_at
FROM storage.buckets
WHERE name = 'documentos';
```

**Resultado esperado:**
```
id          | name       | public | created_at
------------|------------|--------|------------------
documentos  | documentos | true   | 2024-11-10 ...
```

Si `public` es `false`, ejecuta:
```sql
UPDATE storage.buckets
SET public = true
WHERE name = 'documentos';
```

### Paso 2: Verificar políticas

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%documentos%';
```

**Resultado esperado:**
```
policyname                                  | cmd
--------------------------------------------|--------
Permitir subir documentos autenticados      | INSERT
Permitir leer documentos públicos           | SELECT
Permitir actualizar documentos autenticados | UPDATE
Permitir eliminar documentos autenticados   | DELETE
```

### Paso 3: Probar acceso

Intenta acceder a esta URL en tu navegador:
```
https://[tu-proyecto].supabase.co/storage/v1/object/public/documentos/
```

**Resultado esperado:**
- Debería mostrar una lista vacía `[]` o los archivos existentes
- **NO** debería mostrar error 404

## 🔄 Migrar Archivos Existentes (si es necesario)

Si ya subiste archivos al bucket incorrecto:

### Opción A: Re-subir desde la aplicación
1. Descarga los documentos desde la BD (si tienes las URLs)
2. Elimina los registros de la BD
3. Vuelve a subir usando la aplicación

### Opción B: Mover archivos manualmente
1. Ve a Storage en Dashboard
2. Abre el bucket antiguo
3. Descarga cada archivo
4. Sube al nuevo bucket "documentos"
5. Actualiza las URLs en la BD

```sql
-- Actualizar URLs en la base de datos (ajusta según tu caso)
UPDATE documentos
SET archivo_url = REPLACE(
    archivo_url,
    '/storage/v1/object/public/[bucket-antiguo]/',
    '/storage/v1/object/public/documentos/'
)
WHERE archivo_url IS NOT NULL;
```

## 🎯 Configuración Correcta Final

### Estructura de URL correcta:
```
https://[proyecto].supabase.co/storage/v1/object/public/documentos/documentos/[archivo].pdf
                                                        ↑           ↑
                                                    bucket      carpeta
```

### En el código (ya está implementado):

```javascript
// Al subir archivo
const filePath = `documentos/${fileName}`;  // carpeta/archivo
const { error } = await supabase.storage
  .from('documentos')  // bucket
  .upload(filePath, archivo);

// Al obtener URL pública
const { data: { publicUrl } } = supabase.storage
  .from('documentos')  // bucket
  .getPublicUrl(filePath);
```

## 🐛 Troubleshooting Adicional

### Error persiste después de crear bucket

1. **Limpiar caché del navegador**
   ```
   Ctrl + Shift + Delete (Windows/Linux)
   Cmd + Shift + Delete (Mac)
   ```

2. **Verificar autenticación**
   ```javascript
   // En la consola del navegador
   const { data: { user } } = await supabase.auth.getUser();
   console.log('Usuario:', user);
   ```

3. **Verificar permisos de usuario**
   ```sql
   -- Ver rol del usuario actual
   SELECT current_user, current_setting('request.jwt.claims', true);
   ```

4. **Reintentar subir un documento**
   - Elimina el documento problemático
   - Sube uno nuevo
   - Verifica que la URL sea correcta

### URLs antiguas no funcionan

Si tienes documentos con URLs antiguas:

```sql
-- Ver documentos con URLs
SELECT id, titulo, archivo_url
FROM documentos
WHERE archivo_url IS NOT NULL
ORDER BY created_at DESC;

-- Si las URLs están mal, eliminar y re-subir
-- O actualizar manualmente si conoces el patrón correcto
```

## ✅ Checklist de Verificación

- [ ] Bucket "documentos" existe en Storage
- [ ] Bucket "documentos" está marcado como público
- [ ] Políticas SQL están aplicadas
- [ ] URL de prueba funciona en navegador
- [ ] Puedes subir un documento de prueba
- [ ] Puedes descargar el documento de prueba
- [ ] No hay errores en la consola del navegador

## 📞 Si el problema persiste

1. **Captura de pantalla del error completo**
   - Abre DevTools (F12)
   - Ve a la pestaña Network
   - Intenta descargar el documento
   - Captura la petición fallida

2. **Verifica en Supabase Dashboard**
   - Storage > documentos
   - ¿Ves los archivos?
   - ¿Puedes descargarlos desde ahí?

3. **Revisa los logs**
   - Dashboard > Logs
   - Busca errores relacionados con Storage

## 🎉 Solución Aplicada

Una vez que el bucket esté configurado correctamente:

1. ✅ Los documentos nuevos se subirán correctamente
2. ✅ Las descargas funcionarán sin errores
3. ✅ Las URLs públicas serán accesibles
4. ✅ El historial registrará las descargas

---

**Tiempo estimado de solución:** 5 minutos  
**Dificultad:** Baja  
**Requiere reinicio:** No
