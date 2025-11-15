# 📊 Diferencias con tu Base de Datos

## Lo que cambió

El proyecto original estaba diseñado para crear nuevas tablas desde cero, pero tu base de datos ya tiene la mayoría de las tablas necesarias. Aquí están las adaptaciones:

---

## ✅ Tablas que YA TIENES (no se crean)

### 1. `alumnos`
**Uso**: Almacena los estudiantes aprobados

**Tu tabla existente** se usa en lugar de crear `alumnos_hospital`

**Columnas que el script AGREGA** (si no existen):
- `solicitud_rotacion_id` - Para vincular con la solicitud
- `centro_formador_id` - Para saber de qué centro viene
- `fecha_inicio_rotacion` - Fecha de inicio de la rotación
- `fecha_termino_rotacion` - Fecha de término de la rotación
- `estado` - Estado del alumno (en_rotacion, activo, finalizado, inactivo)

**Tus columnas existentes** se mantienen intactas.

---

### 2. `solicitudes_rotacion`
**Uso**: Almacena las solicitudes de rotación

**Tu tabla existente** se usa tal cual

**Columnas que el script AGREGA** (si no existen):
- `estado` - Estado de la solicitud (pendiente, aprobada, rechazada)
- `fecha_respuesta` - Cuándo se respondió
- `respondido_por` - Quién respondió (FK a usuarios_portal_rotaciones)
- `motivo_rechazo` - Motivo si se rechaza

**Tus columnas existentes** se mantienen intactas.

---

### 3. `estudiantes_rotacion`
**Uso**: Estudiantes en las solicitudes (antes de aprobar)

**Tu tabla existente** se usa tal cual, sin modificaciones.

---

### 4. `centros_formadores`
**Uso**: Información de los centros formadores

**Tu tabla existente** se usa tal cual, sin modificaciones.

---

### 5. `rotaciones`
**Uso**: No se usa actualmente en el Portal de Rotaciones

**Nota**: Esta tabla existe en tu BD pero el portal no la usa por ahora. Podría usarse en futuras mejoras para gestionar rotaciones de forma más detallada.

---

## 🆕 Tabla que SE CREA

### `usuarios_portal_rotaciones`
**Uso**: Usuarios administradores del Portal de Rotaciones

**Esta tabla NO existía** en tu base de datos, por eso se crea.

**Columnas**:
- `id` - UUID único
- `user_id` - Referencia a auth.users
- `nombre` - Nombre del administrador
- `apellido` - Apellido del administrador
- `email` - Email (único)
- `cargo` - Cargo del administrador
- `activo` - Si está activo o no
- `created_at` - Fecha de creación
- `updated_at` - Fecha de actualización

---

## 🔄 Flujo Adaptado

### Antes (diseño original):
```
solicitudes_rotacion → estudiantes_rotacion → [APROBAR] → alumnos_hospital
```

### Ahora (con tu BD):
```
solicitudes_rotacion → estudiantes_rotacion → [APROBAR] → alumnos
```

**Cambio**: Usamos tu tabla `alumnos` existente en lugar de crear `alumnos_hospital`.

---

## 📝 Cambios en el Código

### SolicitudDetalle.jsx
```javascript
// ANTES:
const { error: alumnosError } = await supabase
  .from('alumnos_hospital')
  .insert(alumnosData)

// AHORA:
const { error: alumnosError } = await supabase
  .from('alumnos')
  .insert(alumnosData)
```

Este es el **único cambio** en el código. Todo lo demás funciona igual.

---

## 🎯 Ventajas de Usar tus Tablas

1. **No duplicas datos**: Los alumnos aprobados van directo a tu tabla `alumnos` existente
2. **Integración más fácil**: El Hospital ya conoce la tabla `alumnos`
3. **Menos migraciones**: No necesitas mover datos entre tablas
4. **Consistencia**: Todos los alumnos (rotación o no) están en la misma tabla

---

## ⚠️ Importante

### El script `setup-minimo.sql` es SEGURO porque:

1. ✅ Usa `CREATE TABLE IF NOT EXISTS` - No borra tablas existentes
2. ✅ Usa `ALTER TABLE ADD COLUMN IF NOT EXISTS` - No borra columnas existentes
3. ✅ Usa `DROP POLICY IF EXISTS` antes de crear - Evita duplicados
4. ✅ No usa `DROP TABLE` - Nunca borra tablas
5. ✅ No usa `DELETE` - Nunca borra datos

### Lo que hace el script:

- ✅ Crea `usuarios_portal_rotaciones` (nueva tabla)
- ✅ Agrega columnas faltantes a tablas existentes
- ✅ Crea índices para mejor rendimiento
- ✅ Configura RLS y políticas de seguridad
- ❌ NO borra ningún dato existente
- ❌ NO modifica datos existentes

---

## 🔍 Verificar Compatibilidad

Ejecuta este SQL para ver si tus tablas son compatibles:

```sql
-- Verificar columnas de solicitudes_rotacion
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'solicitudes_rotacion'
ORDER BY ordinal_position;

-- Verificar columnas de alumnos
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'alumnos'
ORDER BY ordinal_position;

-- Verificar columnas de estudiantes_rotacion
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'estudiantes_rotacion'
ORDER BY ordinal_position;
```

**Columnas mínimas necesarias**:

`solicitudes_rotacion`:
- id, centro_formador_id, especialidad, fecha_inicio, fecha_termino

`estudiantes_rotacion`:
- id, solicitud_rotacion_id, rut, nombre, apellido

`alumnos`:
- id, rut, nombre, apellido

Las demás columnas se agregan automáticamente si no existen.

---

## 📊 Comparación de Tablas

| Tabla | Original | Tu BD | Acción |
|-------|----------|-------|--------|
| `alumnos_hospital` | Se crea | No existe | ❌ No se crea |
| `alumnos` | No existe | ✅ Existe | ✅ Se usa |
| `solicitudes_rotacion` | Se crea | ✅ Existe | ✅ Se usa + columnas |
| `estudiantes_rotacion` | Se crea | ✅ Existe | ✅ Se usa |
| `centros_formadores` | Se crea | ✅ Existe | ✅ Se usa |
| `usuarios_portal_rotaciones` | Se crea | No existe | ✅ Se crea |

---

## 🎉 Resultado Final

Después de ejecutar `setup-minimo.sql`:

1. ✅ Tu tabla `alumnos` tendrá columnas adicionales para rotaciones
2. ✅ Tu tabla `solicitudes_rotacion` tendrá columnas para gestión
3. ✅ Nueva tabla `usuarios_portal_rotaciones` para administradores
4. ✅ Todos tus datos existentes se mantienen intactos
5. ✅ El Portal de Rotaciones funciona con tus tablas

**No pierdes nada, solo ganas funcionalidad.**
