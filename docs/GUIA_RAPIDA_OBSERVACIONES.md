# Guía Rápida: Observaciones en Control de Asistencia

## 🎯 Regla Principal
**Las observaciones son OPCIONALES para todos los estados, EXCEPTO para "Justificado" donde son OBLIGATORIAS**

---

## 📋 Estados de Asistencia

| Estado | Observación | Comportamiento |
|--------|-------------|----------------|
| ✅ **Presente** | Opcional | Clic directo, observación opcional en campo de texto |
| 🕐 **Tarde** | Opcional | Clic directo, observación opcional en campo de texto |
| ❌ **Ausente** | Opcional | Clic directo, observación opcional en campo de texto |
| ⚠️ **Justificado** | **OBLIGATORIA** | Abre modal, requiere justificación antes de guardar |

---

## 🔄 Flujos de Trabajo

### Flujo Normal (Presente, Tarde, Ausente)
```
1. Clic en botón de estado → Estado se marca inmediatamente
2. (Opcional) Escribir observación en campo de texto
3. Clic en "Guardar Asistencia" → Se guarda en base de datos
```

### Flujo Justificado
```
1. Clic en botón "Justificado" → Se abre modal
2. Escribir justificación (OBLIGATORIO) → Botón habilitado
3. Clic en "Guardar Justificación" → Modal se cierra, estado marcado
4. Clic en "Guardar Asistencia" → Se guarda en base de datos
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Alumno Presente sin Observación
```
1. Seleccionar alumno "Juan Pérez"
2. Clic en botón "Presente" ✅
3. Dejar campo de observación vacío
4. Clic en "Guardar Asistencia"
✓ Se guarda correctamente sin observación
```

### Ejemplo 2: Alumno Tarde con Observación
```
1. Seleccionar alumno "María González"
2. Clic en botón "Tarde" 🕐
3. Escribir en observación: "Llegó 20 minutos tarde por transporte"
4. Clic en "Guardar Asistencia"
✓ Se guarda con la observación
```

### Ejemplo 3: Alumno Ausente sin Observación
```
1. Seleccionar alumno "Pedro López"
2. Clic en botón "Ausente" ❌
3. Dejar campo de observación vacío
4. Clic en "Guardar Asistencia"
✓ Se guarda correctamente sin observación
```

### Ejemplo 4: Alumno Justificado (Obligatorio)
```
1. Seleccionar alumno "Ana Martínez"
2. Clic en botón "Justificado" ⚠️
3. Se abre modal "Justificación de Ausencia"
4. Escribir: "Certificado médico por gripe"
5. Clic en "Guardar Justificación"
6. Clic en "Guardar Asistencia"
✓ Se guarda con la justificación obligatoria
```

---

## ⚠️ Validaciones

### ✅ Permitido
- Guardar "Presente" sin observación
- Guardar "Tarde" sin observación
- Guardar "Ausente" sin observación
- Guardar "Justificado" CON observación

### ❌ No Permitido
- Guardar "Justificado" sin observación
- El botón "Guardar Justificación" estará deshabilitado hasta que se escriba algo

---

## 🔧 Solución de Problemas

### Error: "null value in column 'id'"
**Causa**: La tabla no está configurada para generar UUID automáticamente

**Solución**:
1. Ejecutar el script `docs/database/FIX_ASISTENCIAS_UUID.sql` en Supabase
2. Verificar que la columna `id` tenga `DEFAULT uuid_generate_v4()`

### Modal de Justificación no se cierra
**Causa**: No se escribió ninguna justificación

**Solución**:
1. Escribir una justificación en el campo de texto
2. El botón se habilitará automáticamente
3. Hacer clic en "Guardar Justificación"

---

## 📊 Interfaz Visual

### Botones de Estado
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  ✅ Presente │  🕐 Tarde   │  ❌ Ausente │ ⚠️ Justif.  │
│   (Verde)   │  (Naranja)  │   (Rojo)    │ (Amarillo)  │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Campo de Observación
```
┌────────────────────────────────────────────────────────┐
│ Agregar observación...                                 │
│ (Campo de texto opcional para Presente/Tarde/Ausente)  │
└────────────────────────────────────────────────────────┘
```

### Modal de Justificación (solo para Justificado)
```
┌──────────────────────────────────────────────────────┐
│  ⚠️  Justificación de Ausencia                       │
├──────────────────────────────────────────────────────┤
│  Debe proporcionar una justificación para registrar  │
│  la ausencia como justificada.                       │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │ Ej: Certificado médico presentado...          │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  [Cancelar]  [Guardar Justificación]                 │
└──────────────────────────────────────────────────────┘
```

---

## 📝 Notas Importantes

1. **Tiempo Real**: Los cambios se sincronizan automáticamente entre Hospital y Centros Formadores
2. **Persistencia**: Los datos solo se guardan al hacer clic en "Guardar Asistencia"
3. **Edición**: Se puede cambiar el estado antes de guardar
4. **Historial**: Todas las observaciones quedan registradas en el sistema
5. **Auditoría**: Las justificaciones son especialmente importantes para auditorías

---

## 🚀 Inicio Rápido

1. Seleccionar fecha en el calendario
2. Marcar asistencia de cada alumno (clic en botón de estado)
3. Agregar observaciones solo si es necesario (excepto Justificado)
4. Clic en "Guardar Asistencia"
5. ¡Listo! Los datos se sincronizan automáticamente
