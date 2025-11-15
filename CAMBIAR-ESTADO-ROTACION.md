# 🔄 Cambiar Estado de Rotación

## Cambios Realizados

He eliminado la columna "Estado" (activo/inactivo) y actualizado "Estado Rotación" para que sea editable con un selector desplegable.

---

## 📊 Estados de Rotación

### Estados Disponibles:

1. **Activa** (Verde)
   - La rotación está en curso
   - El estudiante está actualmente en el servicio clínico

2. **En Rotación** (Azul)
   - Estado general de rotación
   - Similar a "Activa" pero más genérico

3. **Finalizada** (Gris)
   - La rotación se completó exitosamente
   - El estudiante terminó su práctica

4. **Cancelada** (Rojo)
   - La rotación fue cancelada
   - El estudiante no completó la práctica

---

## 🎯 Cómo Cambiar el Estado

### En la Tabla:

1. **Ve a "Gestión de Alumnos"**
2. **Busca la columna "Estado Rotación"**
3. **Haz clic en el selector** (dropdown)
4. **Selecciona el nuevo estado**
5. **El cambio se guarda automáticamente**

### Ejemplo Visual:

```
┌─────────────┬──────────────┬────────────────┐
│ Nombre      │ Servicio     │ Estado Rotación│
├─────────────┼──────────────┼────────────────┤
│ Juan Pérez  │ Urgencias    │ [Activa ▼]     │ ← Haz clic aquí
│             │              │  - Activa      │
│             │              │  - En Rotación │
│             │              │  - Finalizada  │
│             │              │  - Cancelada   │
└─────────────┴──────────────┴────────────────┘
```

---

## 🔄 Flujo de Estados Típico

### Flujo Normal:

```
1. Activa
   ↓ (durante la rotación)
2. En Rotación
   ↓ (al completar)
3. Finalizada
```

### Flujo con Cancelación:

```
1. Activa
   ↓ (si hay problemas)
2. Cancelada
```

---

## 💾 Qué se Actualiza

Cuando cambias el estado:

1. **En la tabla `rotaciones`**:
   - Se actualiza el campo `estado`
   - Se guarda en la base de datos

2. **En la vista**:
   - El color del badge cambia
   - El texto se actualiza
   - El cambio es inmediato

---

## 🎨 Colores por Estado

| Estado | Color | Cuándo Usar |
|--------|-------|-------------|
| Activa | 🟢 Verde | Rotación en curso |
| En Rotación | 🔵 Azul | Estado general |
| Finalizada | ⚪ Gris | Rotación completada |
| Cancelada | 🔴 Rojo | Rotación cancelada |

---

## 📋 Casos de Uso

### Caso 1: Finalizar una Rotación
```
Estudiante: Juan Pérez
Estado actual: Activa
Acción: Cambiar a "Finalizada"
Cuándo: Al completar las fechas de rotación
```

### Caso 2: Cancelar una Rotación
```
Estudiante: María González
Estado actual: Activa
Acción: Cambiar a "Cancelada"
Cuándo: Si el estudiante abandona o hay problemas
```

### Caso 3: Reactivar una Rotación
```
Estudiante: Pedro Silva
Estado actual: Finalizada
Acción: Cambiar a "Activa"
Cuándo: Si necesita extender la rotación
```

---

## 🔍 Verificar Cambios

Después de cambiar el estado:

```sql
-- Ver estados de rotaciones
SELECT 
  e.nombre,
  e.primer_apellido,
  s.nombre as servicio,
  r.estado,
  r.fecha_inicio,
  r.fecha_termino
FROM rotaciones r
JOIN estudiantes_rotacion e ON r.estudiante_rotacion_id = e.id
LEFT JOIN servicios_clinicos s ON r.servicio_clinico_id = s.id
ORDER BY r.updated_at DESC;
```

---

## 📊 Estadísticas por Estado

En el dashboard verás contadores:
- **En Rotación**: Estudiantes con estado "activa" o "en_rotacion"
- **Finalizadas**: Estudiantes con estado "finalizada"
- **Canceladas**: Estudiantes con estado "cancelada"

---

## ⚠️ Notas Importantes

1. **El cambio es inmediato**: No hay botón "Guardar"
2. **Se actualiza la BD**: El cambio persiste en Supabase
3. **Sin confirmación**: No pide confirmación (puedes agregar si quieres)
4. **Reversible**: Puedes cambiar el estado cuantas veces quieras

---

## 🎯 Mejoras Futuras

Podrías agregar:

1. **Confirmación**: Pedir confirmación antes de cambiar
2. **Historial**: Guardar historial de cambios de estado
3. **Notificaciones**: Notificar al centro formador cuando se finaliza
4. **Validaciones**: No permitir ciertos cambios (ej: de Finalizada a Activa)
5. **Comentarios**: Pedir comentario al cancelar
6. **Fechas automáticas**: Actualizar fecha_termino al finalizar

---

## 🔧 Código Implementado

```javascript
const handleCambiarEstadoRotacion = async (alumno, nuevoEstado) => {
  // Actualizar en la base de datos
  if (alumno.rotacion_id) {
    await supabase
      .from('rotaciones')
      .update({ estado: nuevoEstado })
      .eq('id', alumno.rotacion_id);
  }
  
  // Actualizar en la vista
  setAlumnos(prev => prev.map(a => 
    a.id === alumno.id ? { ...a, estado: nuevoEstado } : a
  ));
};
```

---

**¡Recarga el Hospital y prueba cambiar el estado de una rotación!** 🏥
