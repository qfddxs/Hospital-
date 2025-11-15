# 📊 Mapeo de Columnas - Estudiantes → Alumnos

## Cuando se aprueba una solicitud

Los datos de `estudiantes_rotacion` se mapean a `alumnos` así:

### Mapeo de Columnas

| estudiantes_rotacion | → | alumnos |
|---------------------|---|---------|
| `rut` | → | `rut` |
| `nombre` | → | `nombres` |
| `primer_apellido + segundo_apellido` | → | `apellidos` |
| `correo_electronico` | → | `email` |
| `telefono` | → | `telefono` |
| `carrera` | → | `carrera` |
| `nivel_que_cursa` | → | `nivel` |
| `solicitud.fecha_inicio` | → | `fecha_ingreso` |
| `solicitud.fecha_inicio` | → | `fecha_inicio_rotacion` |
| `solicitud.fecha_termino` | → | `fecha_termino_rotacion` |
| - | → | `estado` = 'en_rotacion' |
| - | → | `activo` = true |
| `solicitud.id` | → | `solicitud_rotacion_id` |
| `solicitud.centro_formador_id` | → | `centro_formador_id` |

---

## Ejemplo de Transformación

### Estudiante en solicitud:
```json
{
  "rut": "12345678-9",
  "nombre": "Juan",
  "primer_apellido": "Pérez",
  "segundo_apellido": "González",
  "correo_electronico": "juan@ejemplo.cl",
  "telefono": "+56912345678",
  "carrera": "Enfermería",
  "nivel_que_cursa": "3er Año"
}
```

### Se convierte en alumno:
```json
{
  "rut": "12345678-9",
  "nombres": "Juan",
  "apellidos": "Pérez González",
  "email": "juan@ejemplo.cl",
  "telefono": "+56912345678",
  "carrera": "Enfermería",
  "nivel": "3er Año",
  "fecha_ingreso": "2025-11-14",
  "fecha_inicio_rotacion": "2025-11-14",
  "fecha_termino_rotacion": "2026-02-28",
  "estado": "en_rotacion",
  "activo": true,
  "solicitud_rotacion_id": "uuid-de-la-solicitud",
  "centro_formador_id": "uuid-del-centro"
}
```

---

## ✅ Cambios Aplicados

He actualizado el código para que use las columnas correctas de tu tabla `alumnos`:

```javascript
const alumnosData = estudiantes.map(est => ({
  solicitud_rotacion_id: id,
  centro_formador_id: solicitud.centro_formador_id,
  rut: est.rut,
  nombres: est.nombre,                                              // ✅
  apellidos: `${est.primer_apellido} ${est.segundo_apellido}`,     // ✅
  email: est.correo_electronico,                                    // ✅
  telefono: est.telefono,
  carrera: est.carrera,
  nivel: est.nivel_que_cursa,                                       // ✅
  fecha_ingreso: solicitud.fecha_inicio,                            // ✅
  fecha_inicio_rotacion: solicitud.fecha_inicio,
  fecha_termino_rotacion: solicitud.fecha_termino,
  estado: 'en_rotacion',
  activo: true
}))
```

---

## 🎯 Prueba Ahora

1. **Recarga el portal** (Ctrl + Shift + R)
2. **Ve a la solicitud** de Enfermería
3. **Haz clic en "Aprobar Solicitud"**
4. **Deberías ver**: "✅ Solicitud aprobada exitosamente"

---

## 🔍 Verificar en Supabase

Después de aprobar, ejecuta:

```sql
SELECT 
  rut,
  nombres,
  apellidos,
  email,
  carrera,
  nivel,
  estado,
  fecha_inicio_rotacion,
  fecha_termino_rotacion
FROM alumnos
WHERE solicitud_rotacion_id IS NOT NULL
ORDER BY created_at DESC;
```

Deberías ver los 3 estudiantes aprobados.

---

## 📝 Notas

- Los apellidos se concatenan automáticamente: `primer_apellido + segundo_apellido`
- Si `segundo_apellido` está vacío, solo se usa `primer_apellido`
- `fecha_ingreso` y `fecha_inicio_rotacion` tienen el mismo valor (fecha de inicio de la solicitud)
- `estado` se establece en 'en_rotacion' automáticamente
- `activo` se establece en `true` automáticamente

---

**¡Recarga el portal y prueba aprobar la solicitud!** 🚀
