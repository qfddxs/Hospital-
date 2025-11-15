# 🗑️ Eliminar Estudiantes al Rechazar Solicitud

## Cambio Implementado

Ahora cuando se **rechaza** una solicitud en el Portal de Rotaciones, se **eliminan automáticamente** todos los estudiantes de esa solicitud para no saturar la base de datos.

---

## 🔄 Flujo Actualizado

### Antes:

```
1. Centro Formador → Sube Excel con 100 estudiantes
2. Portal Rotaciones → Rechaza solicitud
3. Base de Datos → 100 estudiantes siguen en la BD ❌
4. Resultado: BD saturada con datos rechazados
```

### Ahora:

```
1. Centro Formador → Sube Excel con 100 estudiantes
2. Portal Rotaciones → Rechaza solicitud
3. Base de Datos → 100 estudiantes se ELIMINAN ✅
4. Resultado: BD limpia, solo datos aprobados
```

---

## 📋 Proceso de Rechazo

### Paso 1: Confirmación

Cuando haces clic en "Rechazar Solicitud":

```
┌─────────────────────────────────────────┐
│ ⚠️ Confirmación                         │
├─────────────────────────────────────────┤
│ ¿Rechazar esta solicitud?               │
│ Se eliminarán 100 estudiantes           │
│ de la base de datos.                    │
│                                         │
│ [Cancelar]  [Confirmar]                 │
└─────────────────────────────────────────┘
```

### Paso 2: Eliminación

Si confirmas:

1. **Se eliminan los estudiantes**
   ```sql
   DELETE FROM estudiantes_rotacion
   WHERE solicitud_rotacion_id = 'solicitud-123'
   ```

2. **Se actualiza la solicitud**
   ```sql
   UPDATE solicitudes_rotacion
   SET estado = 'rechazada',
       motivo_rechazo = 'Motivo...'
   WHERE id = 'solicitud-123'
   ```

3. **Mensaje de confirmación**
   ```
   ✅ Solicitud rechazada.
   Se eliminaron 100 estudiantes.
   ```

---

## ⚠️ Importante

### Eliminación en Cascada:

Si tienes relaciones con `ON DELETE CASCADE`, también se eliminarán:

- ✅ Rotaciones asociadas (si existen)
- ✅ Asistencias (si existen)
- ✅ Evaluaciones (si existen)
- ✅ Cualquier dato relacionado

### No se puede deshacer:

- ❌ Una vez eliminados, los estudiantes NO se pueden recuperar
- ❌ No hay "papelera de reciclaje"
- ❌ Debes estar seguro antes de rechazar

---

## 🎯 Ventajas

1. **BD limpia**: Solo datos aprobados
2. **Sin saturación**: No acumulas estudiantes rechazados
3. **Mejor rendimiento**: Menos registros = consultas más rápidas
4. **Ahorro de espacio**: Especialmente con solicitudes grandes (100+ estudiantes)

---

## 📊 Comparación

### Solicitud con 100 estudiantes:

| Acción | Antes | Ahora |
|--------|-------|-------|
| Aprobar | 100 estudiantes en BD | 100 estudiantes en BD |
| Rechazar | 100 estudiantes en BD ❌ | 0 estudiantes en BD ✅ |

### 10 solicitudes rechazadas de 100 estudiantes:

| Acción | Antes | Ahora |
|--------|-------|-------|
| Total en BD | 1,000 estudiantes rechazados ❌ | 0 estudiantes rechazados ✅ |
| Espacio | Saturado | Limpio |

---

## 🔍 Verificar

### Antes de Rechazar:

```sql
-- Ver cuántos estudiantes tiene la solicitud
SELECT COUNT(*) as total_estudiantes
FROM estudiantes_rotacion
WHERE solicitud_rotacion_id = 'solicitud-123';
```

### Después de Rechazar:

```sql
-- Verificar que se eliminaron
SELECT COUNT(*) as total_estudiantes
FROM estudiantes_rotacion
WHERE solicitud_rotacion_id = 'solicitud-123';
-- Resultado: 0
```

---

## 🔄 Casos de Uso

### Caso 1: Solicitud con Errores

```
Centro Formador: Sube Excel con 50 estudiantes
Portal Rotaciones: Detecta errores en los datos
Acción: Rechaza solicitud
Resultado: 50 estudiantes eliminados ✅
Centro Formador: Corrige y vuelve a enviar
```

### Caso 2: Solicitud Duplicada

```
Centro Formador: Envía solicitud por error (100 estudiantes)
Portal Rotaciones: Detecta que es duplicada
Acción: Rechaza solicitud
Resultado: 100 estudiantes eliminados ✅
BD: Limpia, sin duplicados
```

### Caso 3: Capacidad Insuficiente

```
Centro Formador: Solicita 200 estudiantes
Portal Rotaciones: Hospital no tiene capacidad
Acción: Rechaza solicitud
Resultado: 200 estudiantes eliminados ✅
BD: No saturada con solicitudes imposibles
```

---

## 📝 Código Implementado

```javascript
const handleRechazar = async () => {
  // Confirmación
  if (!confirm(`¿Rechazar? Se eliminarán ${estudiantes.length} estudiantes`)) {
    return;
  }

  // 1. Eliminar estudiantes
  await supabase
    .from('estudiantes_rotacion')
    .delete()
    .eq('solicitud_rotacion_id', id);

  // 2. Actualizar solicitud
  await supabase
    .from('solicitudes_rotacion')
    .update({ estado: 'rechazada', motivo_rechazo })
    .eq('id', id);

  alert(`Solicitud rechazada. Se eliminaron ${estudiantes.length} estudiantes.`);
};
```

---

## ⚠️ Consideraciones

### Si necesitas historial:

Si en el futuro necesitas mantener historial de solicitudes rechazadas, podrías:

1. **Crear tabla de historial**:
   ```sql
   CREATE TABLE estudiantes_rotacion_historial (
     -- Mismas columnas + fecha_eliminacion
   );
   ```

2. **Mover en lugar de eliminar**:
   ```javascript
   // Copiar a historial
   await supabase.from('estudiantes_rotacion_historial').insert(estudiantes);
   // Luego eliminar
   await supabase.from('estudiantes_rotacion').delete()...
   ```

3. **Soft delete** (marcar como eliminado):
   ```sql
   ALTER TABLE estudiantes_rotacion ADD COLUMN eliminado BOOLEAN DEFAULT false;
   ```

Pero por ahora, la eliminación directa es más simple y eficiente.

---

## ✅ Resumen

**Cambio**: Al rechazar una solicitud, se eliminan automáticamente todos sus estudiantes.

**Ventajas**:
- ✅ BD limpia
- ✅ Sin saturación
- ✅ Mejor rendimiento
- ✅ Solo datos aprobados

**Precaución**:
- ⚠️ Pide confirmación antes de eliminar
- ⚠️ No se puede deshacer
- ⚠️ Asegúrate de rechazar solo lo necesario

---

**¡Recarga el Portal de Rotaciones y prueba rechazar una solicitud!** 🗑️
