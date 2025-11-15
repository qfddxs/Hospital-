# 🔧 Guía: Modificar Tabla Alumnos

## Objetivo

Adaptar la tabla `alumnos` para que tenga las mismas columnas que `estudiantes_rotacion`, permitiendo copiar todos los datos cuando se aprueba una solicitud.

---

## 📋 Paso 1: Ejecutar SQL

1. Abre Supabase → **SQL Editor**
2. Crea una nueva query
3. Copia TODO el contenido de `modificar-tabla-alumnos.sql`
4. Haz clic en **Run**
5. Espera el mensaje: "✅ Tabla alumnos actualizada exitosamente!"

---

## ✅ Qué hace el SQL

### Agrega estas columnas a `alumnos`:

**Datos personales:**
- `nombre` (singular)
- `primer_apellido`
- `segundo_apellido`
- `correo_electronico`
- `numero`
- `lugar_residencia`

**Datos académicos:**
- `nivel_que_cursa`
- `tipo_practica`
- `campo_clinico_solicitado`
- `numero_semanas_practica`

**Horarios:**
- `horario_desde`
- `horario_hasta`
- `cuarto_turno`

**Contactos:**
- `nombre_contacto_emergencia`
- `telefono_contacto_emergencia`
- `nombre_docente_cargo`
- `telefono_docente_cargo`

**Otros:**
- `numero_registro_estudiante`
- `inmunizacion_al_dia`
- `numero_visitas`
- `fecha_supervision`
- `observaciones`

### Migra datos existentes:

Si ya tienes alumnos en la tabla, el SQL automáticamente:
- Copia `nombres` → `nombre`
- Divide `apellidos` → `primer_apellido` y `segundo_apellido`
- Copia `email` → `correo_electronico`
- Copia `nivel` → `nivel_que_cursa`

---

## 🔄 Mapeo Completo

Cuando se aprueba una solicitud, TODOS los datos del estudiante se copian:

| estudiantes_rotacion | → | alumnos |
|---------------------|---|---------|
| `rut` | → | `rut` |
| `numero` | → | `numero` |
| `primer_apellido` | → | `primer_apellido` |
| `segundo_apellido` | → | `segundo_apellido` |
| `nombre` | → | `nombre` |
| `telefono` | → | `telefono` |
| `correo_electronico` | → | `correo_electronico` |
| `nombre_contacto_emergencia` | → | `nombre_contacto_emergencia` |
| `telefono_contacto_emergencia` | → | `telefono_contacto_emergencia` |
| `lugar_residencia` | → | `lugar_residencia` |
| `carrera` | → | `carrera` |
| `nivel_que_cursa` | → | `nivel_que_cursa` |
| `tipo_practica` | → | `tipo_practica` |
| `campo_clinico_solicitado` | → | `campo_clinico_solicitado` |
| `fecha_inicio` | → | `fecha_inicio` |
| `fecha_termino` | → | `fecha_termino` |
| `numero_semanas_practica` | → | `numero_semanas_practica` |
| `horario_desde` | → | `horario_desde` |
| `horario_hasta` | → | `horario_hasta` |
| `cuarto_turno` | → | `cuarto_turno` |
| `nombre_docente_cargo` | → | `nombre_docente_cargo` |
| `telefono_docente_cargo` | → | `telefono_docente_cargo` |
| `numero_registro_estudiante` | → | `numero_registro_estudiante` |
| `inmunizacion_al_dia` | → | `inmunizacion_al_dia` |
| `numero_visitas` | → | `numero_visitas` |
| `fecha_supervision` | → | `fecha_supervision` |
| `observaciones` | → | `observaciones` |
| `solicitud.fecha_inicio` | → | `fecha_inicio_rotacion` |
| `solicitud.fecha_termino` | → | `fecha_termino_rotacion` |
| - | → | `estado` = 'en_rotacion' |
| - | → | `activo` = true |
| `solicitud.id` | → | `solicitud_rotacion_id` |
| `solicitud.centro_formador_id` | → | `centro_formador_id` |

---

## 🎯 Ventajas

1. **Datos completos**: Se copian TODOS los datos del estudiante
2. **Sin pérdida de información**: Nada se pierde en la transferencia
3. **Trazabilidad**: Siempre sabes de qué solicitud viene cada alumno
4. **Flexibilidad**: El hospital tiene acceso a toda la información

---

## 🔍 Verificar

Después de ejecutar el SQL, verifica:

```sql
-- Ver columnas agregadas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'alumnos'
  AND column_name IN (
    'primer_apellido',
    'segundo_apellido',
    'correo_electronico',
    'nivel_que_cursa'
  );
```

Deberías ver las 4 columnas.

---

## ✅ Siguiente Paso

Una vez ejecutado el SQL:

1. **Recarga el portal** (Ctrl + Shift + R)
2. **Ve a la solicitud** de Enfermería
3. **Haz clic en "Aprobar Solicitud"**
4. **Los 3 estudiantes se crearán** en `alumnos` con TODOS sus datos

---

## 🔍 Verificar Resultado

Después de aprobar:

```sql
SELECT 
  rut,
  nombre,
  primer_apellido,
  segundo_apellido,
  correo_electronico,
  carrera,
  nivel_que_cursa,
  tipo_practica,
  estado,
  fecha_inicio_rotacion,
  fecha_termino_rotacion
FROM alumnos
WHERE solicitud_rotacion_id IS NOT NULL
ORDER BY created_at DESC;
```

Deberías ver los 3 estudiantes con todos sus datos.

---

## ⚠️ Importante

- El SQL es **seguro**: Solo AGREGA columnas, nunca borra datos
- Si ya tienes alumnos, sus datos se mantienen intactos
- Las columnas antiguas (`nombres`, `apellidos`, `email`, `nivel`) se mantienen por compatibilidad
- Los datos se migran automáticamente a las nuevas columnas

---

**¡Ejecuta `modificar-tabla-alumnos.sql` en Supabase ahora!** 🚀
