# ✅ Paso 2: Vista "Documentos Pendientes" - Hospital

## 🎯 Implementado

Se creó la página para que el **Hospital pueda revisar, aprobar o rechazar** los documentos que suben los centros formadores.

---

## 📁 Archivos Creados/Modificados

1. **`src/pages/DocumentosPendientes.jsx`** ✅
   - Página completa de revisión de documentos

2. **`src/routes/router.jsx`** ✅
   - Agregada ruta `/dashboard/documentos-pendientes`

---

## 🎨 Funcionalidades Implementadas

### 1. Vista de Documentos
- Lista de todos los documentos subidos por centros formadores
- Información completa: estudiante, centro, fecha, archivo
- Estados visuales con colores

### 2. Filtros
- **Por estado**: Pendientes, Aprobados, Rechazados, Todos
- **Por búsqueda**: Buscar por nombre de estudiante, centro o documento
- Actualización en tiempo real

### 3. Estadísticas
- Total de documentos pendientes
- Documentos aprobados hoy
- Documentos rechazados
- Total general

### 4. Acciones de Revisión
- **Ver documento**: Abre el PDF/imagen en nueva pestaña
- **Aprobar**: Marca documento como aprobado
- **Rechazar**: Marca como rechazado con comentarios obligatorios

### 5. Modal de Revisión
- Confirmación antes de aprobar/rechazar
- Campo de comentarios (obligatorio para rechazo)
- Registro automático en historial
- Actualización de checklist del estudiante

---

## 🔄 Flujo de Uso

```
1. Hospital accede a "Documentos Pendientes"
   ↓
2. Ve lista de documentos subidos por centros
   ↓
3. Hace clic en "Ver" para revisar el documento
   ↓
4. Decide si aprobar o rechazar
   ↓
5. Hace clic en "Aprobar" o "Rechazar"
   ↓
6. Se abre modal de confirmación
   ↓
7. Si rechaza, escribe motivo (obligatorio)
   ↓
8. Confirma la acción
   ↓
9. Documento se actualiza en BD
   ↓
10. Checklist del estudiante se actualiza automáticamente
   ↓
11. Centro Formador ve el cambio en tiempo real
```

---

## 📊 Interfaz Visual

```
┌─────────────────────────────────────────────────────────┐
│ 📄 Documentos Pendientes                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│ │Pendientes│ │Aprobados │ │Rechazados│ │  Total   │   │
│ │    8     │ │    15    │ │    2     │ │    25    │   │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                          │
│ [Buscar...] [Filtro: Pendientes ▼]                     │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 📄 Constancia de Vacunación                        │ │
│ │    Juan Pérez Gómez (12.345.678-9)                │ │
│ │    🏫 UOH  📄 vacuna.pdf  📅 15/01/2025            │ │
│ │    [⏳ Pendiente]  [Ver] [Aprobar] [Rechazar]      │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ 📄 Certificado de Salud                            │ │
│ │    María González (98.765.432-1)                  │ │
│ │    🏫 INACAP  📄 salud.pdf  📅 14/01/2025          │ │
│ │    [⏳ Pendiente]  [Ver] [Aprobar] [Rechazar]      │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Detalles Técnicos

### Consulta de Documentos Pendientes
```javascript
// Obtiene documentos sin aprobar
const { data } = await supabase
  .from('documentos')
  .select(`
    *,
    alumno:alumnos(id, nombre, primer_apellido, segundo_apellido, rut),
    centro_formador:centros_formadores(id, nombre)
  `)
  .not('alumno_id', 'is', null)
  .is('aprobado', null)
  .order('created_at', { ascending: false });
```

### Aprobar Documento
```javascript
const { data: { user } } = await supabase.auth.getUser();

await supabase
  .from('documentos')
  .update({
    aprobado: true,
    aprobado_por: user?.id,
    fecha_aprobacion: new Date().toISOString(),
    comentarios_aprobacion: comentarios || null
  })
  .eq('id', documentoId);
```

### Rechazar Documento
```javascript
await supabase
  .from('documentos')
  .update({
    aprobado: false,
    aprobado_por: user?.id,
    fecha_aprobacion: new Date().toISOString(),
    comentarios_aprobacion: comentarios // Obligatorio
  })
  .eq('id', documentoId);
```

### Registro en Historial
```javascript
await supabase
  .from('documentos_historial')
  .insert([{
    documento_id: documentoId,
    accion: 'aprobado', // o 'rechazado'
    detalles: comentarios,
    usuario_email: user?.email
  }]);
```

### Actualización Automática de Checklist
El trigger `trigger_actualizar_checklist` actualiza automáticamente el estado en `documentos_checklist`:
- `aprobado = true` → estado = 'aprobado'
- `aprobado = false` → estado = 'rechazado'

---

## 🧪 Cómo Probar

### 1. Acceder a la página
```
URL: http://localhost:5173/dashboard/documentos-pendientes
```

### 2. Ver documentos pendientes
- Deben aparecer documentos subidos por centros formadores
- Con estado "Pendiente" (azul)

### 3. Revisar documento
- Hacer clic en "Ver" para abrir el PDF/imagen
- Verificar que el documento sea correcto

### 4. Aprobar documento
- Hacer clic en "Aprobar"
- Agregar comentarios (opcional)
- Confirmar
- Verificar que cambie a estado "Aprobado" (verde)

### 5. Rechazar documento
- Hacer clic en "Rechazar"
- Escribir motivo del rechazo (obligatorio)
- Confirmar
- Verificar que cambie a estado "Rechazado" (rojo)

### 6. Verificar en BD
```sql
-- Ver documentos aprobados/rechazados
SELECT 
  d.titulo,
  d.aprobado,
  d.fecha_aprobacion,
  d.comentarios_aprobacion,
  a.nombre || ' ' || a.primer_apellido as alumno,
  cf.nombre as centro
FROM documentos d
JOIN alumnos a ON d.alumno_id = a.id
JOIN centros_formadores cf ON d.centro_formador_id = cf.id
WHERE d.aprobado IS NOT NULL
ORDER BY d.fecha_aprobacion DESC;

-- Ver checklist actualizado
SELECT 
  dc.estado,
  dr.nombre as documento,
  a.nombre || ' ' || a.primer_apellido as alumno
FROM documentos_checklist dc
JOIN documentos_requeridos dr ON dc.documento_requerido_id = dr.id
JOIN alumnos a ON dc.alumno_id = a.id
WHERE dc.estado IN ('aprobado', 'rechazado');
```

### 7. Verificar en Centro Formador
- Ir al portal de Centro Formador
- Acceder a "Documentos de Estudiantes"
- Verificar que el estado se haya actualizado
- Si rechazado, ver comentarios del hospital

---

## 🔔 Notificaciones (Próximo paso)

Actualmente el sistema actualiza en tiempo real, pero se puede agregar:
- Email al centro formador cuando se aprueba/rechaza
- Notificación en el dashboard del centro
- Alerta en el sistema

---

## 📊 Estados de Documentos

```
┌─────────────┬──────────────────────────────────────┐
│   Estado    │           Significado                │
├─────────────┼──────────────────────────────────────┤
│ Pendiente   │ Subido, esperando revisión hospital  │
│ Aprobado    │ Hospital lo revisó y aprobó ✅       │
│ Rechazado   │ Hospital lo rechazó, debe corregir ❌│
└─────────────┴──────────────────────────────────────┘
```

---

## 🔄 Integración con Paso 1

```
Centro Formador (Paso 1)          Hospital (Paso 2)
        │                                │
        │ 1. Sube documento              │
        ├───────────────────────────────>│
        │                                │ 2. Revisa documento
        │                                │ 3. Aprueba/Rechaza
        │<───────────────────────────────┤
        │ 4. Ve actualización            │
        │                                │
```

---

## ✅ Validaciones Implementadas

1. **Comentarios obligatorios al rechazar**
   - No permite rechazar sin explicar el motivo

2. **Registro en historial**
   - Toda acción queda registrada con usuario y fecha

3. **Actualización automática de checklist**
   - El trigger actualiza el estado automáticamente

4. **Filtros y búsqueda**
   - Facilita encontrar documentos específicos

---

## 📝 Próximos Pasos

### Paso 3: Vista "Expediente Digital" (Hospital)
Para ver el expediente completo de cada estudiante con:
- Todos sus documentos
- Historial de cambios
- Alertas de vencimiento
- Progreso de completitud

---

## ✅ Estado Actual

- [x] Página creada
- [x] Ruta agregada al router
- [x] Lista de documentos
- [x] Filtros por estado
- [x] Búsqueda
- [x] Aprobar documentos
- [x] Rechazar con comentarios
- [x] Registro en historial
- [x] Actualización automática de checklist
- [ ] Notificaciones por email (opcional)
- [ ] Expediente digital completo (Paso 3)

---

**Fecha**: 16 de noviembre de 2025
**Estado**: ✅ Paso 2 Completado
**Siguiente**: Paso 3 - Vista Expediente Digital (Hospital)
