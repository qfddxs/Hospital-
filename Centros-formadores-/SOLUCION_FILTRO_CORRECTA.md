# ✅ Solución Correcta: Filtro por Institución usando `usuarios_centros`

## 🎯 Problema Original
Los centros formadores veían **todos los estudiantes** de todas las instituciones, cuando deberían ver solo los suyos.

## ✅ Solución Implementada

### Arquitectura del Sistema

```
┌─────────────────────┐
│   auth.users        │  ← Usuarios de Supabase Auth
│  (email/password)   │
└──────────┬──────────┘
           │
           │ user_id
           ↓
┌─────────────────────┐
│ usuarios_centros    │  ← Tabla de vinculación
│ - user_id           │
│ - centro_formador_id│  ← ID del centro (UOH=1, INACAP=2)
│ - rol               │
│ - activo            │
└──────────┬──────────┘
           │
           │ centro_formador_id
           ↓
┌─────────────────────┐
│ alumnos             │  ← Estudiantes
│ - centro_formador_id│  ← Filtro aplicado aquí
│ - estado            │
└─────────────────────┘
```

### Flujo de Autenticación y Filtrado

```
1. Usuario ingresa email/password
   ↓
2. Supabase Auth valida credenciales
   ↓
3. Sistema consulta usuarios_centros
   ↓
4. Obtiene centro_formador_id del usuario
   ↓
5. Filtra estudiantes por centro_formador_id
   ↓
6. Usuario solo ve estudiantes de su institución
```

---

## 📝 Cambios en el Código

### 1. Login.jsx - Validación de Usuario
```javascript
// Al hacer login, verificar que esté en usuarios_centros
const { data: centroData, error: centroError } = await supabase
  .from('usuarios_centros')
  .select('centro_formador_id, activo')
  .eq('user_id', data.user.id)
  .eq('activo', true)
  .single()

if (centroError || !centroData) {
  // Usuario no autorizado
  await supabase.auth.signOut()
  throw new Error('Usuario no autorizado')
}
```

### 2. SeguimientoEstudiantes.jsx - Filtrado de Estudiantes
```javascript
// Obtener centro del usuario
const { data: centroData } = await supabase
  .from('usuarios_centros')
  .select('*, centro_formador:centros_formadores(*)')
  .eq('user_id', user.id)
  .eq('activo', true)
  .single();

// Filtrar estudiantes por centro
const { data: estudiantesData } = await supabase
  .from('alumnos')
  .select('...')
  .eq('centro_formador_id', centroData.centro_formador_id)  // ← FILTRO
  .eq('estado', 'en_rotacion')
```

---

## 🗄️ Configuración de Base de Datos

### Estructura de `usuarios_centros`
```sql
CREATE TABLE usuarios_centros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  centro_formador_id UUID REFERENCES centros_formadores(id) NOT NULL,
  rol VARCHAR(50) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, centro_formador_id)
);
```

### Datos Requeridos

#### 1. Centros Formadores
```sql
SELECT id, nombre FROM centros_formadores;

-- Resultado:
-- 1 | Universidad de O'Higgins (UOH)
-- 2 | INACAP
```

#### 2. Usuarios en Auth
```sql
-- Crear en Supabase Dashboard → Authentication → Users
-- Usuario UOH: uoh@centroformador.cl
-- Usuario INACAP: inacap@centroformador.cl
```

#### 3. Vinculación en usuarios_centros
```sql
INSERT INTO usuarios_centros (user_id, centro_formador_id, rol, activo)
VALUES 
  ('uuid-usuario-uoh', 1, 'centro_formador', true),
  ('uuid-usuario-inacap', 2, 'centro_formador', true);
```

#### 4. Estudiantes con Centro Asignado
```sql
-- Todos los estudiantes deben tener centro_formador_id
UPDATE alumnos 
SET centro_formador_id = 1  -- UOH
WHERE id IN ('uuid-est-1', 'uuid-est-2');

UPDATE alumnos 
SET centro_formador_id = 2  -- INACAP
WHERE id IN ('uuid-est-3', 'uuid-est-4');
```

---

## 🧪 Cómo Probar

### Prueba 1: Usuario UOH
```
1. Login con: uoh@centroformador.cl
2. Ir a: Seguimiento de Estudiantes
3. Verificar en consola: "📚 Estudiantes filtrados para Universidad de O'Higgins (UOH): X"
4. Confirmar: Solo aparecen estudiantes con centro_formador_id = 1
```

### Prueba 2: Usuario INACAP
```
1. Login con: inacap@centroformador.cl
2. Ir a: Seguimiento de Estudiantes
3. Verificar en consola: "📚 Estudiantes filtrados para INACAP: X"
4. Confirmar: Solo aparecen estudiantes con centro_formador_id = 2
```

### Prueba 3: Usuario No Autorizado
```
1. Crear usuario en Auth sin entrada en usuarios_centros
2. Intentar login
3. Resultado esperado: "Usuario no autorizado para acceder al portal"
```

---

## 📊 Queries de Verificación

### Ver Configuración Completa
```sql
SELECT 
  au.email,
  cf.nombre as centro_formador,
  uc.rol,
  uc.activo,
  COUNT(a.id) as estudiantes_asignados
FROM usuarios_centros uc
JOIN auth.users au ON uc.user_id = au.id
JOIN centros_formadores cf ON uc.centro_formador_id = cf.id
LEFT JOIN alumnos a ON a.centro_formador_id = cf.id 
  AND a.estado = 'en_rotacion'
WHERE uc.activo = true
GROUP BY au.email, cf.nombre, uc.rol, uc.activo;
```

### Verificar Estudiantes sin Centro
```sql
SELECT 
  id,
  nombre,
  primer_apellido,
  rut
FROM alumnos
WHERE estado = 'en_rotacion'
  AND centro_formador_id IS NULL;
-- Debe retornar 0 filas
```

### Verificar Usuarios sin Centro
```sql
SELECT 
  au.id,
  au.email
FROM auth.users au
LEFT JOIN usuarios_centros uc ON au.id = uc.user_id
WHERE uc.id IS NULL;
-- Usuarios que no están vinculados a ningún centro
```

---

## ⚠️ Puntos Importantes

### 1. Un Usuario = Un Centro
Cada usuario debe estar vinculado a **exactamente un centro formador activo**.

```sql
-- Verificar que no haya usuarios con múltiples centros activos
SELECT user_id, COUNT(*) 
FROM usuarios_centros 
WHERE activo = true 
GROUP BY user_id 
HAVING COUNT(*) > 1;
-- Debe retornar 0 filas
```

### 2. Todos los Estudiantes con Centro
Todos los estudiantes en rotación deben tener `centro_formador_id`.

```sql
-- Verificar
SELECT COUNT(*) 
FROM alumnos 
WHERE estado = 'en_rotacion' 
  AND centro_formador_id IS NULL;
-- Debe retornar 0
```

### 3. Validación en Login
El login valida que el usuario esté en `usuarios_centros` con `activo = true`.

---

## 🔄 Agregar Nueva Institución

### Ejemplo: Agregar Universidad de Chile

#### 1. Crear Centro Formador
```sql
INSERT INTO centros_formadores (id, nombre, codigo, activo)
VALUES (3, 'Universidad de Chile', 'UCHILE', true);
```

#### 2. Crear Usuario en Auth
```
Dashboard → Authentication → Users → Add User
Email: uchile@centroformador.cl
Password: (elegir una segura)
```

#### 3. Vincular en usuarios_centros
```sql
INSERT INTO usuarios_centros (user_id, centro_formador_id, rol, activo)
VALUES ('uuid-usuario-uchile', 3, 'centro_formador', true);
```

#### 4. Asignar Estudiantes
```sql
UPDATE alumnos 
SET centro_formador_id = 3 
WHERE id IN ('uuid-est-5', 'uuid-est-6');
```

---

## 📁 Archivos Modificados

1. **Centros-formadores-/src/pages/Login.jsx**
   - Validación de usuario en `usuarios_centros`
   - Verificación de `activo = true`

2. **Centros-formadores-/src/pages/SeguimientoEstudiantes.jsx**
   - Obtención de `centro_formador_id` desde `usuarios_centros`
   - Filtrado de estudiantes por centro

3. **Centros-formadores-/docs/database/CONFIGURAR_USUARIOS_CENTROS.sql**
   - Script completo de configuración

---

## ✅ Checklist de Implementación

- [ ] Tabla `usuarios_centros` existe y tiene datos
- [ ] Cada usuario tiene entrada en `usuarios_centros`
- [ ] Cada estudiante tiene `centro_formador_id` asignado
- [ ] Login valida usuario en `usuarios_centros`
- [ ] SeguimientoEstudiantes filtra por `centro_formador_id`
- [ ] Probado con usuario UOH (solo ve estudiantes UOH)
- [ ] Probado con usuario INACAP (solo ve estudiantes INACAP)
- [ ] Consola muestra log de filtrado correcto

---

## 🐛 Solución de Problemas

### "Usuario no autorizado"
**Causa**: Usuario no está en `usuarios_centros` o `activo = false`
**Solución**: Insertar registro en `usuarios_centros` con `activo = true`

### "No aparecen estudiantes"
**Causa**: Estudiantes no tienen `centro_formador_id` asignado
**Solución**: Ejecutar UPDATE para asignar centro a estudiantes

### "Veo estudiantes de otra institución"
**Causa**: Estudiantes tienen `centro_formador_id` incorrecto
**Solución**: Verificar y corregir `centro_formador_id` en tabla `alumnos`

---

**Estado**: ✅ Implementado correctamente usando `usuarios_centros`
**Fecha**: 16 de noviembre de 2025
**Próximo paso**: Ejecutar script SQL `CONFIGURAR_USUARIOS_CENTROS.sql`
