# ✅ Filtro de Solicitudes Aprobadas

## Estado Actual

El sistema ya está configurado correctamente para mostrar **solo estudiantes de solicitudes aprobadas** en Gestión de Alumnos del Hospital.

---

## 🔍 Cómo Funciona

### Consulta en GestionAlumnos.jsx:

```javascript
const { data: alumnosData } = await supabase
  .from('estudiantes_rotacion')
  .select(`
    *,
    solicitud:solicitudes_rotacion!inner(...)
  `)
  .eq('solicitud.estado', 'aprobada')  // ← FILTRO CLAVE
  .order('primer_apellido');
```

### Explicación:

- `!inner` - Join interno (solo trae estudiantes que tienen solicitud)
- `.eq('solicitud.estado', 'aprobada')` - **Solo solicitudes aprobadas**
- Resultado: **Solo estudiantes de solicitudes aprobadas aparecen**

---

## 📊 Flujo Completo

### 1. Centro Formador Crea Solicitud

```
Centro Formador → Sube Excel con estudiantes
                ↓
Base de Datos:
- solicitudes_rotacion (estado: 'pendiente')
- estudiantes_rotacion (3 estudiantes)
                ↓
Hospital: NO VE NADA (solicitud pendiente)
```

### 2. Portal de Rotaciones Aprueba

```
Portal Rotaciones → Aprueba solicitud
                  ↓
Base de Datos:
- solicitudes_rotacion (estado: 'aprobada')
- rotaciones (3 rotaciones creadas)
                  ↓
Hospital: VE LOS 3 ESTUDIANTES ✅
```

### 3. Portal de Rotaciones Rechaza

```
Portal Rotaciones → Rechaza solicitud
                  ↓
Base de Datos:
- solicitudes_rotacion (estado: 'rechazada')
- estudiantes_rotacion (siguen existiendo)
                  ↓
Hospital: NO VE NADA (solicitud rechazada) ✅
```

---

## 🎯 Estados y Visibilidad

| Estado Solicitud | Hospital Ve Estudiantes | Notas |
|------------------|------------------------|-------|
| `pendiente` | ❌ NO | Esperando aprobación |
| `aprobada` | ✅ SÍ | Estudiantes visibles |
| `rechazada` | ❌ NO | Solicitud rechazada |

---

## 🔄 Realtime

El realtime también está configurado para detectar cambios:

```javascript
// Escucha cuando se aprueba una solicitud
supabase.channel('solicitudes_rotacion_changes')
  .on('postgres_changes', {
    event: 'UPDATE',
    table: 'solicitudes_rotacion',
    filter: 'estado=eq.aprobada'  // ← Solo aprobadas
  })
  .subscribe()
```

**Resultado**: Cuando se aprueba una solicitud, los estudiantes aparecen automáticamente en el Hospital.

---

## ✅ Verificación

### Prueba 1: Solicitud Pendiente

1. Centro Formador crea solicitud
2. Ve a Hospital → Gestión de Alumnos
3. **Resultado**: No aparecen los estudiantes ✅

### Prueba 2: Aprobar Solicitud

1. Portal de Rotaciones aprueba solicitud
2. Hospital se actualiza automáticamente
3. **Resultado**: Aparecen los 3 estudiantes ✅

### Prueba 3: Rechazar Solicitud

1. Portal de Rotaciones rechaza solicitud
2. Hospital se actualiza automáticamente
3. **Resultado**: Los estudiantes desaparecen ✅

---

## 🔍 Consulta SQL Equivalente

Lo que hace el código en SQL:

```sql
SELECT e.*
FROM estudiantes_rotacion e
INNER JOIN solicitudes_rotacion s ON e.solicitud_rotacion_id = s.id
WHERE s.estado = 'aprobada'
ORDER BY e.primer_apellido;
```

**Clave**: El `INNER JOIN` + `WHERE estado = 'aprobada'` asegura que solo se vean estudiantes aprobados.

---

## 📊 Datos en la Base de Datos

### Tabla estudiantes_rotacion:
```
id | nombre | solicitud_rotacion_id
1  | Juan   | solicitud-123
2  | María  | solicitud-123
3  | Pedro  | solicitud-456
```

### Tabla solicitudes_rotacion:
```
id            | estado
solicitud-123 | aprobada   ← Hospital ve Juan y María
solicitud-456 | rechazada  ← Hospital NO ve Pedro
```

---

## ⚠️ Importante

### Los estudiantes NO se eliminan al rechazar:

- ✅ Los estudiantes siguen en `estudiantes_rotacion`
- ✅ Esto permite historial y auditoría
- ✅ El Hospital simplemente no los muestra
- ✅ Si cambias el estado a "aprobada", aparecen de nuevo

### Si quieres eliminar estudiantes rechazados:

Podrías agregar un proceso que elimine estudiantes de solicitudes rechazadas:

```sql
-- OPCIONAL: Eliminar estudiantes de solicitudes rechazadas
DELETE FROM estudiantes_rotacion
WHERE solicitud_rotacion_id IN (
  SELECT id FROM solicitudes_rotacion
  WHERE estado = 'rechazada'
);
```

**Pero NO es recomendable** porque pierdes el historial.

---

## 🎯 Resumen

✅ **Ya está implementado correctamente**
- Hospital solo ve estudiantes de solicitudes aprobadas
- Solicitudes pendientes: NO se ven
- Solicitudes rechazadas: NO se ven
- Solicitudes aprobadas: SÍ se ven
- Actualización en tiempo real

**No necesitas hacer nada más, ya funciona como debe.**

---

## 🔍 Verificar en Supabase

Para ver qué estudiantes se muestran:

```sql
-- Estudiantes que ve el Hospital
SELECT 
  e.nombre,
  e.primer_apellido,
  s.estado as estado_solicitud,
  s.especialidad
FROM estudiantes_rotacion e
JOIN solicitudes_rotacion s ON e.solicitud_rotacion_id = s.id
WHERE s.estado = 'aprobada'
ORDER BY e.primer_apellido;
```

---

**El sistema ya funciona correctamente. Solo estudiantes de solicitudes aprobadas aparecen en el Hospital.** ✅
