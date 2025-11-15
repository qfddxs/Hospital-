# 🚀 Instalación Rápida - Portal de Rotaciones

## Tu situación actual

✅ Ya tienes las tablas principales creadas:
- `alumnos`
- `estudiantes_rotacion`
- `solicitudes_rotacion`
- `centros_formadores`
- `rotaciones`

Solo necesitas agregar lo mínimo para que funcione el Portal de Rotaciones.

---

## Paso 1: Ejecutar SQL Mínimo

1. Abre Supabase → **SQL Editor**
2. Crea una nueva query
3. Copia y pega TODO el contenido de `setup-minimo.sql`
4. Haz clic en **Run**

Este script:
- ✅ Crea la tabla `usuarios_portal_rotaciones`
- ✅ Agrega columnas faltantes a tus tablas existentes (si no existen)
- ✅ Crea índices para mejor rendimiento
- ✅ Configura RLS y políticas de seguridad
- ✅ No borra ni modifica tus datos existentes

---

## Paso 2: Crear Usuario Administrador

### 2.1 Crear en Authentication

1. Ve a **Authentication** → **Users**
2. Clic en **Add user** → **Create new user**
3. Completa:
   ```
   Email: admin@hospital.cl
   Password: [tu contraseña segura]
   ✅ Auto Confirm User
   ```
4. Clic en **Create user**
5. **COPIA EL UUID** del usuario (columna ID)

### 2.2 Registrar en la tabla

1. Ve a **SQL Editor**
2. Ejecuta (reemplaza `TU_UUID_AQUI`):

```sql
INSERT INTO usuarios_portal_rotaciones (user_id, nombre, apellido, email, cargo, activo)
VALUES (
  'TU_UUID_AQUI',
  'Admin',
  'Rotaciones',
  'admin@hospital.cl',
  'Administrador de Rotaciones',
  true
);
```

3. Verifica que se creó:

```sql
SELECT * FROM usuarios_portal_rotaciones;
```

---

## Paso 3: Verificar Estructura de Tablas

Ejecuta este SQL para ver qué columnas tienes:

```sql
-- Ver columnas de solicitudes_rotacion
SELECT column_name FROM information_schema.columns
WHERE table_name = 'solicitudes_rotacion'
ORDER BY ordinal_position;

-- Ver columnas de alumnos
SELECT column_name FROM information_schema.columns
WHERE table_name = 'alumnos'
ORDER BY ordinal_position;
```

**Columnas necesarias en `solicitudes_rotacion`:**
- ✅ `id`
- ✅ `centro_formador_id`
- ✅ `especialidad`
- ✅ `fecha_inicio`
- ✅ `fecha_termino`
- ✅ `comentarios`
- ✅ `archivo_excel_url`
- ✅ `archivo_excel_nombre`
- ✅ `estado` ← El script la agrega si no existe
- ✅ `fecha_solicitud`
- ✅ `fecha_respuesta` ← El script la agrega si no existe
- ✅ `respondido_por` ← El script la agrega si no existe
- ✅ `motivo_rechazo` ← El script la agrega si no existe

**Columnas necesarias en `alumnos`:**
- ✅ `id`
- ✅ `rut`
- ✅ `nombre`
- ✅ `apellido`
- ✅ `email`
- ✅ `telefono`
- ✅ `especialidad`
- ✅ `nivel_formacion`
- ✅ `solicitud_rotacion_id` ← El script la agrega si no existe
- ✅ `centro_formador_id` ← El script la agrega si no existe
- ✅ `fecha_inicio_rotacion` ← El script la agrega si no existe
- ✅ `fecha_termino_rotacion` ← El script la agrega si no existe
- ✅ `estado` ← El script la agrega si no existe

---

## Paso 4: Iniciar el Portal

```bash
cd portal-rotaciones
npm install
npm run dev
```

Abre: http://localhost:5175

---

## Paso 5: Probar

1. **Login**
   - Email: `admin@hospital.cl`
   - Password: [la que configuraste]

2. **Ver solicitudes**
   - Deberías ver las solicitudes existentes en tu base de datos
   - Si no hay ninguna, crea una desde Centros Formadores

3. **Aprobar una solicitud**
   - Haz clic en una solicitud pendiente
   - Revisa los estudiantes
   - Haz clic en "Aprobar Solicitud"
   - Los estudiantes se crearán en la tabla `alumnos`

4. **Verificar en Supabase**
   ```sql
   SELECT * FROM alumnos 
   WHERE solicitud_rotacion_id IS NOT NULL
   ORDER BY created_at DESC;
   ```

---

## 🔍 Verificación Rápida

Ejecuta este SQL para verificar que todo está listo:

```sql
-- 1. Verificar que existe la tabla de usuarios del portal
SELECT COUNT(*) as usuarios_portal FROM usuarios_portal_rotaciones;

-- 2. Verificar que existen solicitudes
SELECT COUNT(*) as total_solicitudes FROM solicitudes_rotacion;

-- 3. Verificar que la columna estado existe
SELECT estado, COUNT(*) as cantidad
FROM solicitudes_rotacion
GROUP BY estado;

-- 4. Verificar que la tabla alumnos tiene las columnas necesarias
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='alumnos' AND column_name='solicitud_rotacion_id'
  ) THEN '✅' ELSE '❌' END as solicitud_rotacion_id,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='alumnos' AND column_name='centro_formador_id'
  ) THEN '✅' ELSE '❌' END as centro_formador_id,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='alumnos' AND column_name='estado'
  ) THEN '✅' ELSE '❌' END as estado;
```

Si todos los resultados son ✅, estás listo para usar el portal.

---

## ⚠️ Notas Importantes

1. **No se borran datos**: El script `setup-minimo.sql` solo AGREGA columnas, nunca borra datos existentes.

2. **Compatibilidad**: El portal funciona con tus tablas existentes, solo agrega las columnas necesarias.

3. **Sesión independiente**: El portal usa `rotaciones-auth` como clave de sesión, no interfiere con Hospital ni Centros Formadores.

4. **Tabla alumnos**: Cuando apruebes una solicitud, los estudiantes se crearán en tu tabla `alumnos` existente con las nuevas columnas.

---

## 🐛 Solución de Problemas

### Error: "relation usuarios_portal_rotaciones does not exist"
→ Ejecuta `setup-minimo.sql`

### Error: "column estado does not exist"
→ Ejecuta `setup-minimo.sql` (agrega las columnas faltantes)

### No aparecen solicitudes
→ Verifica que existan en la tabla:
```sql
SELECT * FROM solicitudes_rotacion LIMIT 5;
```

### Error al aprobar solicitud
→ Verifica que la tabla `alumnos` tenga las columnas necesarias:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'alumnos';
```

---

## ✅ Listo!

Una vez completados estos pasos, tu Portal de Rotaciones estará funcionando y podrás:
- Ver solicitudes de rotación
- Editar estudiantes
- Aprobar/Rechazar solicitudes
- Los estudiantes aprobados aparecerán en tu tabla `alumnos`

**Siguiente paso**: Integrar la vista de alumnos en el Hospital para que puedan gestionar los estudiantes aprobados.
