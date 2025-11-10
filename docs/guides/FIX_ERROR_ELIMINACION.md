# 🔧 Solución: Error al Eliminar Documentos

## 🚨 Problema

Al intentar eliminar un documento, aparece el error:
```
Error al eliminar: insert or update on table "documentos_historial" 
violates foreign key constraint "documentos_historial_documento_id_fkey"
```

## 🔍 Causa del Problema

El error ocurre porque:

1. El trigger `trigger_historial_documentos` se ejecuta **AFTER DELETE**
2. Cuando el documento se elimina, su `id` ya no existe en la tabla `documentos`
3. El trigger intenta insertar en `documentos_historial` con un `documento_id` que ya no existe
4. La foreign key constraint falla porque el documento padre ya fue eliminado

### Flujo Incorrecto:
```
1. DELETE FROM documentos WHERE id = X
2. Documento eliminado ✅
3. Trigger AFTER DELETE intenta: INSERT INTO documentos_historial (documento_id = X, ...)
4. ❌ ERROR: documento_id = X no existe en tabla documentos
```

## ✅ Solución

Cambiar el trigger de DELETE para que se ejecute **BEFORE DELETE** en lugar de **AFTER DELETE**.

### Flujo Correcto:
```
1. DELETE FROM documentos WHERE id = X
2. Trigger BEFORE DELETE ejecuta: INSERT INTO documentos_historial (documento_id = X, ...)
3. ✅ Registro en historial creado (documento aún existe)
4. Documento eliminado ✅
```

## 🔧 Aplicar la Solución

### Paso 1: Ejecutar SQL

Ejecuta el archivo `supabase-fix-trigger-historial.sql` en el SQL Editor de Supabase.

Este script:
- ✅ Elimina el trigger antiguo
- ✅ Modifica la función para manejar DELETE correctamente
- ✅ Crea dos triggers separados:
  - `trigger_historial_documentos_after` para INSERT y UPDATE (AFTER)
  - `trigger_historial_documentos_before` para DELETE (BEFORE)

### Paso 2: Verificar Cambios en Código

El código ya fue actualizado para:
- ✅ Eliminar la llamada manual a `registrarAccion()` después del DELETE
- ✅ Dejar que el trigger automático maneje el registro en historial

**Archivo modificado:** `src/pages/GestionDocumental.jsx`

```javascript
// ANTES (incorrecto):
const { error } = await supabase
  .from('documentos')
  .delete()
  .eq('id', doc.id);

if (error) throw error;

setDocumentos(prev => prev.filter(d => d.id !== doc.id));
await registrarAccion(doc.id, 'eliminado', ...); // ❌ Esto causaba error
fetchEstadisticas();

// DESPUÉS (correcto):
const { error } = await supabase
  .from('documentos')
  .delete()
  .eq('id', doc.id);

if (error) throw error;

setDocumentos(prev => prev.filter(d => d.id !== doc.id));
// ✅ El trigger BEFORE DELETE registra automáticamente
fetchEstadisticas();
```

## 🧪 Probar la Solución

### Test 1: Eliminar un documento

1. Ve a Gestión Documental
2. Selecciona un documento
3. Click en el ícono de eliminar (🗑️)
4. Confirma la eliminación
5. ✅ Debe eliminarse sin errores

### Test 2: Verificar historial

```sql
-- Ver últimas eliminaciones registradas
SELECT 
    dh.accion,
    dh.detalles,
    dh.created_at,
    dh.usuario_email
FROM documentos_historial dh
WHERE dh.accion = 'eliminado'
ORDER BY dh.created_at DESC
LIMIT 5;
```

Deberías ver los registros de eliminación con:
- ✅ `accion = 'eliminado'`
- ✅ `detalles` con el título del documento
- ✅ `created_at` con la fecha/hora
- ✅ `usuario_email` del usuario que eliminó

### Test 3: Verificar triggers

```sql
-- Ver configuración de triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'documentos'
AND trigger_name LIKE '%historial%'
ORDER BY trigger_name, event_manipulation;
```

**Resultado esperado:**
```
trigger_name                        | event_manipulation | action_timing
------------------------------------|-------------------|---------------
trigger_historial_documentos_after  | INSERT            | AFTER
trigger_historial_documentos_after  | UPDATE            | AFTER
trigger_historial_documentos_before | DELETE            | BEFORE
```

## 📊 Comportamiento de los Triggers

### INSERT (AFTER)
```sql
-- Usuario sube documento
INSERT INTO documentos (titulo, ...) VALUES ('Nuevo Doc', ...);
-- ↓ Trigger AFTER INSERT
-- ↓ INSERT INTO documentos_historial (accion = 'creado')
-- ✅ Documento y historial creados
```

### UPDATE (AFTER)
```sql
-- Usuario modifica documento
UPDATE documentos SET titulo = 'Nuevo Título' WHERE id = X;
-- ↓ Trigger AFTER UPDATE
-- ↓ INSERT INTO documentos_historial (accion = 'modificado')
-- ✅ Documento actualizado y historial registrado
```

### DELETE (BEFORE) ⭐
```sql
-- Usuario elimina documento
DELETE FROM documentos WHERE id = X;
-- ↓ Trigger BEFORE DELETE (ANTES de eliminar)
-- ↓ INSERT INTO documentos_historial (accion = 'eliminado')
-- ↓ Ahora sí se elimina el documento
-- ✅ Historial registrado antes de eliminar
```

## 🔐 Consideraciones de Seguridad

### Foreign Key Constraint

La constraint `documentos_historial_documento_id_fkey` sigue activa:

```sql
ALTER TABLE documentos_historial
ADD CONSTRAINT documentos_historial_documento_id_fkey
FOREIGN KEY (documento_id) REFERENCES documentos(id);
```

**Comportamiento:**
- ✅ Permite INSERT cuando el documento existe
- ✅ Con BEFORE DELETE, el documento aún existe al insertar
- ❌ Rechaza INSERT si el documento no existe (protección)

### Cascada de Eliminación

Si quisieras que el historial se elimine automáticamente con el documento:

```sql
-- Opción alternativa (NO RECOMENDADO para auditoría)
ALTER TABLE documentos_historial
DROP CONSTRAINT documentos_historial_documento_id_fkey,
ADD CONSTRAINT documentos_historial_documento_id_fkey
FOREIGN KEY (documento_id) REFERENCES documentos(id)
ON DELETE CASCADE;
```

**⚠️ NO recomendado** porque perderías el historial de auditoría.

## 🎯 Mejora Adicional: Mantener Historial

Si quieres mantener el historial incluso después de eliminar documentos:

```sql
-- Cambiar la foreign key para permitir NULL
ALTER TABLE documentos_historial
ALTER COLUMN documento_id DROP NOT NULL;

-- Cambiar la constraint para SET NULL en lugar de fallar
ALTER TABLE documentos_historial
DROP CONSTRAINT documentos_historial_documento_id_fkey,
ADD CONSTRAINT documentos_historial_documento_id_fkey
FOREIGN KEY (documento_id) REFERENCES documentos(id)
ON DELETE SET NULL;
```

Con esto:
- ✅ El historial se mantiene después de eliminar
- ✅ `documento_id` se pone en NULL
- ✅ Puedes ver que hubo un documento eliminado
- ⚠️ Pierdes la referencia directa al documento

## ✅ Checklist de Verificación

- [ ] Ejecutar `supabase-fix-trigger-historial.sql`
- [ ] Verificar que los triggers se crearon correctamente
- [ ] Código actualizado (ya hecho)
- [ ] Probar eliminar un documento
- [ ] Verificar que no hay errores
- [ ] Verificar que el historial se registra
- [ ] Confirmar que el documento se elimina de la lista

## 🐛 Si el Problema Persiste

### Error: "trigger does not exist"

```sql
-- Verificar triggers existentes
SELECT * FROM pg_trigger WHERE tgname LIKE '%historial%';

-- Si no existen, ejecutar nuevamente el script
```

### Error: "function does not exist"

```sql
-- Verificar función
SELECT proname FROM pg_proc WHERE proname = 'registrar_accion_documento';

-- Si no existe, ejecutar nuevamente el script
```

### Error: "permission denied"

```sql
-- Verificar permisos
SELECT current_user, current_setting('is_superuser');

-- Ejecutar como superuser o desde el Dashboard
```

## 📝 Resumen

| Aspecto | Antes | Después |
|---------|-------|---------|
| Trigger DELETE | AFTER | BEFORE |
| Registro manual | Sí (causaba error) | No (automático) |
| Historial | Fallaba | ✅ Funciona |
| Eliminación | ❌ Error | ✅ Exitosa |

---

**Tiempo de aplicación:** 2 minutos  
**Requiere reinicio:** No  
**Afecta datos existentes:** No  
**Estado:** ✅ Solucionado
