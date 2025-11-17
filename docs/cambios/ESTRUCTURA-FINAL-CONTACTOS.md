# 📋 Estructura Final - Contactos y Tutores

## 🎯 Solución Simplificada

### Tabla `alumnos`
| Columna | Descripción | Origen | Uso |
|---------|-------------|--------|-----|
| `contacto_nombre` | Contacto/Tutor del Centro Formador | `centros_formadores.contacto_nombre` | Se muestra en Control de Asistencia |
| `contacto_email` | Email del Contacto/Tutor | `centros_formadores.email` | Se muestra en Control de Asistencia |

**Nota:** `contacto_nombre` y `contacto_email` representan al tutor/contacto del centro formador que supervisa al alumno.

## ✅ Cambios Realizados

### 1. **SQL - Renombrar columnas**
```sql
-- Renombrar para claridad
ALTER TABLE alumnos
RENAME COLUMN nombre_docente_cargo TO contacto_nombre;

ALTER TABLE alumnos
RENAME COLUMN telefono_docente_cargo TO contacto_email;

-- No se necesitan columnas adicionales
-- contacto_nombre y contacto_email son suficientes
```

### 2. **Código Portal - Actualizado**
```javascript
// Ahora usa contacto_nombre y contacto_email
contacto_nombre: solicitud.centro_formador?.contacto_nombre
contacto_email: solicitud.centro_formador?.email
```

## 🔄 Flujo Completo

### 1. Centro Formador envía solicitud
- Incluye datos de contacto del centro

### 2. Portal Rotaciones aprueba
- ✅ Crea alumno con `contacto_nombre` y `contacto_email` del centro formador
- ✅ `tutor_id` = NULL (sin tutor asignado aún)

### 3. Hospital asigna tutor
- ✅ Selecciona tutor de la tabla `tutores`
- ✅ Actualiza `alumno.tutor_id`

## 📊 Ventajas

✅ **Nombres claros**: `contacto_nombre` es más descriptivo que `nombre_docente_cargo`
✅ **Relación normalizada**: `tutor_id` apunta a tabla `tutores`
✅ **Tabla tutores útil**: Permite gestionar tutores del hospital centralizadamente
✅ **Sin duplicación**: No se crean columnas redundantes

## 🗑️ Columnas Eliminadas (Renombradas)

- ❌ `nombre_docente_cargo` → ✅ `contacto_nombre`
- ❌ `telefono_docente_cargo` → ✅ `contacto_email`

## 🎨 Interfaz Sugerida

### Gestión de Alumnos
```
Alumno: Matías García
├─ Centro Formador: Universidad de Chile
├─ Tutor/Contacto: Juan Pérez (contacto_nombre)
└─ Email: contacto@universidad.cl (contacto_email)
```

## 🚀 Pasos para Aplicar

1. **Ejecutar SQL** (`renombrar-columna-contacto.sql`)
2. **Recarga Portal Rotaciones** (código ya actualizado)
3. **Verificar datos** en Supabase
4. **Actualizar interfaz Hospital** para asignar tutores

## 📝 Compatibilidad

- ✅ Datos existentes se mantienen (solo se renombran columnas)
- ✅ `tutor_id` queda NULL hasta asignación
- ✅ No se pierde información
