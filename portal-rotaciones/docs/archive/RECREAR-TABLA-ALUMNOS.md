# 🔄 Recrear Tabla Alumnos

## ⚠️ ADVERTENCIA

Este SQL **eliminará la tabla `alumnos` existente** y todos sus datos. Solo ejecuta esto si:
- ✅ Estás en desarrollo/pruebas
- ✅ No tienes datos importantes en la tabla
- ✅ O has hecho un backup de los datos

---

## 📋 Opción 1: Con Backup (Recomendado)

Si tienes datos que quieres conservar:

### Paso 1: Hacer Backup
```sql
-- Crear tabla de respaldo
CREATE TABLE alumnos_backup AS 
SELECT * FROM alumnos;

-- Verificar que se copió
SELECT COUNT(*) FROM alumnos_backup;
```

### Paso 2: Ejecutar el SQL
1. Abre Supabase → SQL Editor
2. Copia el contenido de `recrear-tabla-alumnos.sql`
3. Haz clic en Run

### Paso 3: Restaurar Datos (si es necesario)
```sql
-- Insertar datos antiguos en la nueva tabla
-- Ajusta las columnas según lo que tenías
INSERT INTO alumnos (
  rut,
  nombre,
  primer_apellido,
  carrera,
  estado,
  activo
)
SELECT 
  rut,
  nombres,
  SPLIT_PART(apellidos, ' ', 1),
  carrera,
  estado,
  activo
FROM alumnos_backup;
```

---

## 📋 Opción 2: Sin Backup (Desarrollo)

Si estás en desarrollo y no tienes datos importantes:

1. Abre Supabase → SQL Editor
2. Copia TODO el contenido de `recrear-tabla-alumnos.sql`
3. Haz clic en Run
4. Espera el mensaje: "✅ Tabla alumnos recreada exitosamente!"

---

## ✅ Nueva Estructura de la Tabla

La tabla `alumnos` tendrá exactamente las mismas columnas que `estudiantes_rotacion`, más algunas adicionales:

### Columnas principales:

**IDs y Referencias:**
- `id` (UUID, PK)
- `solicitud_rotacion_id` (UUID, FK)
- `centro_formador_id` (UUID, FK)

**Datos Personales:**
- `rut` (VARCHAR, NOT NULL, UNIQUE)
- `numero` (INT4)
- `nombre` (VARCHAR, NOT NULL)
- `primer_apellido` (VARCHAR, NOT NULL)
- `segundo_apellido` (VARCHAR)

**Contacto:**
- `telefono` (VARCHAR)
- `correo_electronico` (VARCHAR)
- `lugar_residencia` (VARCHAR)
- `nombre_contacto_emergencia` (VARCHAR)
- `telefono_contacto_emergencia` (VARCHAR)

**Académico:**
- `carrera` (VARCHAR)
- `nivel_que_cursa` (VARCHAR)
- `tipo_practica` (VARCHAR)
- `campo_clinico_solicitado` (VARCHAR)

**Fechas:**
- `fecha_inicio` (DATE)
- `fecha_termino` (DATE)
- `fecha_inicio_rotacion` (DATE)
- `fecha_termino_rotacion` (DATE)
- `fecha_supervision` (DATE)

**Horarios:**
- `numero_semanas_practica` (INT4)
- `horario_desde` (TIME)
- `horario_hasta` (TIME)
- `cuarto_turno` (VARCHAR)

**Docente:**
- `nombre_docente_cargo` (VARCHAR)
- `telefono_docente_cargo` (VARCHAR)

**Otros:**
- `numero_registro_estudiante` (VARCHAR)
- `inmunizacion_al_dia` (VARCHAR)
- `numero_visitas` (INT4)
- `observaciones` (TEXT)

**Control:**
- `estado` (VARCHAR, DEFAULT 'en_rotacion')
- `activo` (BOOLEAN, DEFAULT true)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

## 🎯 Ventajas de la Nueva Tabla

1. **Sin duplicados**: Cada columna aparece una sola vez
2. **Estructura limpia**: Nombres consistentes con `estudiantes_rotacion`
3. **Completa**: Tiene todas las columnas necesarias
4. **Optimizada**: Índices en columnas clave
5. **Segura**: RLS habilitado con políticas
6. **Documentada**: Comentarios en columnas importantes

---

## 🔍 Verificar Resultado

Después de ejecutar el SQL:

```sql
-- Ver todas las columnas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'alumnos'
ORDER BY ordinal_position;

-- Contar columnas
SELECT COUNT(*) as total_columnas
FROM information_schema.columns
WHERE table_name = 'alumnos';
```

Deberías ver aproximadamente 35-40 columnas.

---

## ✅ Siguiente Paso

Una vez recreada la tabla:

1. **Recarga el portal** (Ctrl + Shift + R)
2. **Ve a la solicitud** de Enfermería
3. **Haz clic en "Aprobar Solicitud"**
4. **Los 3 estudiantes se crearán** en la nueva tabla `alumnos`

---

## 🔍 Verificar Aprobación

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
  estado,
  fecha_inicio_rotacion,
  fecha_termino_rotacion,
  centro_formador_id,
  solicitud_rotacion_id
FROM alumnos
ORDER BY created_at DESC;
```

Deberías ver los 3 estudiantes con todos sus datos.

---

## 📝 Notas Importantes

- La tabla tiene constraint `UNIQUE` en `rut` para evitar duplicados
- RLS está habilitado para seguridad
- Los triggers actualizan `updated_at` automáticamente
- Los índices mejoran el rendimiento de las consultas
- Las políticas RLS permiten acceso a usuarios autenticados

---

## ⚠️ Si algo sale mal

Si necesitas volver atrás:

```sql
-- Eliminar la nueva tabla
DROP TABLE IF EXISTS alumnos CASCADE;

-- Restaurar desde backup
ALTER TABLE alumnos_backup RENAME TO alumnos;
```

---

**¿Listo para recrear la tabla? Ejecuta `recrear-tabla-alumnos.sql` en Supabase!** 🚀
