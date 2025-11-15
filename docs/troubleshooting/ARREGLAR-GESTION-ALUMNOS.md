# 🔧 Arreglar Gestión de Alumnos en el Hospital

## Problema

El archivo `GestionAlumnos.jsx` del Hospital está usando columnas antiguas que ya no existen en la tabla `alumnos`:
- ❌ `apellidos` → Ahora son `primer_apellido` y `segundo_apellido`
- ❌ `nombres` → Ahora es `nombre`
- ❌ `email` → Ahora es `correo_electronico`

## ✅ Cambios Aplicados

He actualizado:
1. `.order('apellidos')` → `.order('primer_apellido')`
2. `row.nombres` y `row.apellidos` → `row.nombre`, `row.primer_apellido`, `row.segundo_apellido`
3. `row.email` → `row.correo_electronico`

## ⚠️ Pero hay más cambios necesarios

El archivo `GestionAlumnos.jsx` tiene muchas más referencias a las columnas antiguas que necesitan actualizarse:

### Formularios que usan columnas antiguas:
- `formData.nombres` → debe ser `formData.nombre`
- `formData.apellidos` → debe ser `formData.primer_apellido` y `formData.segundo_apellido`
- `formData.email` → debe ser `formData.correo_electronico`

### Modales que muestran datos:
- `modalState.data.nombres` → `modalState.data.nombre`
- `modalState.data.apellidos` → `modalState.data.primer_apellido` + `segundo_apellido`
- `modalState.data.email` → `modalState.data.correo_electronico`

## 🎯 Opciones

### Opción 1: Actualizar todo el código (Recomendado)
Actualizar `GestionAlumnos.jsx` para usar las nuevas columnas en todos lados.

### Opción 2: Agregar columnas de compatibilidad
Agregar `nombres`, `apellidos` y `email` como columnas calculadas o vistas en la base de datos.

### Opción 3: Usar la tabla antigua
Si prefieres mantener la estructura antigua, no ejecutes `recrear-tabla-alumnos.sql`.

## 📋 Verificar Estructura Actual

Ejecuta `VERIFICAR-COLUMNAS-ALUMNOS.sql` en Supabase para ver qué columnas tiene tu tabla `alumnos` actualmente.

## ✅ Solución Rápida

Si ejecutaste `recrear-tabla-alumnos.sql`, necesitas actualizar TODO el archivo `GestionAlumnos.jsx`.

¿Quieres que actualice completamente el archivo `GestionAlumnos.jsx` para que funcione con la nueva estructura?

---

**Dime qué prefieres:**
1. ¿Actualizo todo `GestionAlumnos.jsx`?
2. ¿O prefieres mantener la estructura antigua de la tabla?
