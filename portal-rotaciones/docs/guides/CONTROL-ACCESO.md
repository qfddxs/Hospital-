# 🔐 Control de Acceso al Portal de Rotaciones

## Implementación

He implementado un sistema de control de acceso que **solo permite** entrar a usuarios registrados en la tabla `usuarios_portal_rotaciones`.

---

## 🔒 Cómo Funciona

### 1. Usuario Intenta Acceder

```
Usuario → Ingresa email y password → Login
```

### 2. Verificación en Dos Pasos

**Paso 1: Autenticación en Supabase**
```javascript
supabase.auth.signInWithPassword(email, password)
```
- ✅ Verifica que el usuario existe en `auth.users`
- ✅ Verifica que la contraseña es correcta

**Paso 2: Verificación de Permisos**
```javascript
supabase
  .from('usuarios_portal_rotaciones')
  .select('*')
  .eq('user_id', userId)
  .single()
```
- ✅ Verifica que el usuario está en `usuarios_portal_rotaciones`
- ✅ Verifica que está activo

### 3. Resultado

| Condición | Resultado |
|-----------|-----------|
| ❌ Usuario no existe en auth.users | Error: "Invalid login credentials" |
| ❌ Contraseña incorrecta | Error: "Invalid login credentials" |
| ✅ Login correcto pero NO en usuarios_portal_rotaciones | **Acceso Denegado** |
| ✅ Login correcto Y en usuarios_portal_rotaciones | **Acceso Permitido** |

---

## 🚫 Pantalla de Acceso Denegado

Si un usuario se autentica correctamente pero NO está en `usuarios_portal_rotaciones`, verá:

```
┌─────────────────────────────────────┐
│        ⚠️ Acceso Denegado           │
├─────────────────────────────────────┤
│                                     │
│ No tienes permisos para acceder     │
│ al Portal de Rotaciones.            │
│                                     │
│ Solo usuarios autorizados pueden    │
│ acceder a este portal.              │
│                                     │
│ [Cerrar Sesión]                     │
└─────────────────────────────────────┘
```

---

## 📋 Casos de Uso

### Caso 1: Usuario del Centro Formador Intenta Acceder

```
1. Usuario: admin@centroformador.cl
2. Login: ✅ Correcto (existe en auth.users)
3. Verificación: ❌ NO está en usuarios_portal_rotaciones
4. Resultado: Acceso Denegado
```

### Caso 2: Usuario del Hospital Intenta Acceder

```
1. Usuario: doctor@hospital.cl
2. Login: ✅ Correcto (existe en auth.users)
3. Verificación: ❌ NO está en usuarios_portal_rotaciones
4. Resultado: Acceso Denegado
```

### Caso 3: Usuario Autorizado del Portal

```
1. Usuario: admin@hospital.cl
2. Login: ✅ Correcto (existe en auth.users)
3. Verificación: ✅ SÍ está en usuarios_portal_rotaciones
4. Resultado: Acceso Permitido ✅
```

---

## 👥 Crear Usuario Autorizado

Para dar acceso a un nuevo usuario:

### Paso 1: Crear en Authentication

1. Ve a Supabase → **Authentication** → **Users**
2. Clic en **Add user** → **Create new user**
3. Completa:
   ```
   Email: nuevo.admin@hospital.cl
   Password: [contraseña segura]
   ✅ Auto Confirm User
   ```
4. Copia el **UUID** del usuario

### Paso 2: Registrar en usuarios_portal_rotaciones

```sql
INSERT INTO usuarios_portal_rotaciones (
  user_id,
  nombre,
  apellido,
  email,
  cargo,
  activo
) VALUES (
  'UUID_DEL_USUARIO',
  'Nombre',
  'Apellido',
  'nuevo.admin@hospital.cl',
  'Administrador de Rotaciones',
  true
);
```

### Paso 3: Verificar

```sql
SELECT * FROM usuarios_portal_rotaciones
WHERE email = 'nuevo.admin@hospital.cl';
```

---

## 🔄 Flujo Completo

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuario ingresa credenciales                        │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Supabase Auth verifica credenciales                 │
│    ✅ Usuario existe y password correcto                │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 3. SessionContext busca en usuarios_portal_rotaciones  │
│    SELECT * WHERE user_id = ?                           │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ ❌ NO EXISTE  │   │ ✅ EXISTE     │
│               │   │               │
│ Acceso        │   │ Acceso        │
│ Denegado      │   │ Permitido     │
└───────────────┘   └───────────────┘
```

---

## 🔍 Verificar Acceso

### Ver usuarios autorizados:

```sql
SELECT 
  u.email,
  up.nombre,
  up.apellido,
  up.cargo,
  up.activo
FROM usuarios_portal_rotaciones up
JOIN auth.users u ON u.id = up.user_id
WHERE up.activo = true;
```

### Ver intentos de acceso no autorizados:

Puedes agregar logging en el SessionContext para registrar intentos:

```javascript
if (!data) {
  console.warn('Intento de acceso no autorizado:', userId);
  // Opcional: Guardar en tabla de logs
}
```

---

## 🛡️ Seguridad

### Protecciones Implementadas:

1. **Doble verificación**:
   - Auth de Supabase (credenciales)
   - Tabla usuarios_portal_rotaciones (permisos)

2. **Sesión independiente**:
   - Clave: `rotaciones-auth`
   - No interfiere con Hospital ni Centros Formadores

3. **RLS en Supabase**:
   - Solo usuarios autenticados pueden leer
   - Solo pueden ver su propio perfil

4. **Redirección automática**:
   - Si no tiene permisos, no puede navegar
   - Todas las rutas están protegidas

---

## ⚠️ Importante

### No confundir con otros portales:

| Portal | Tabla de Usuarios | Sesión |
|--------|-------------------|--------|
| Hospital | `usuarios` (?) | default |
| Centros Formadores | `usuarios_centros` | `portal-auth` |
| **Portal Rotaciones** | **`usuarios_portal_rotaciones`** | **`rotaciones-auth`** |

### Cada portal tiene:
- ✅ Su propia tabla de usuarios
- ✅ Su propia clave de sesión
- ✅ Su propio control de acceso

---

## 🔧 Desactivar Usuario

Para revocar acceso sin eliminar:

```sql
UPDATE usuarios_portal_rotaciones
SET activo = false
WHERE email = 'usuario@hospital.cl';
```

El usuario ya no podrá acceder (aunque sus credenciales sean correctas).

---

## 📊 Ejemplo Práctico

### Escenario: 3 usuarios intentan acceder

**Usuario 1: admin@hospital.cl**
- ✅ En auth.users
- ✅ En usuarios_portal_rotaciones (activo: true)
- **Resultado**: Acceso Permitido ✅

**Usuario 2: centro@formador.cl**
- ✅ En auth.users
- ❌ NO en usuarios_portal_rotaciones
- **Resultado**: Acceso Denegado ❌

**Usuario 3: antiguo@hospital.cl**
- ✅ En auth.users
- ⚠️ En usuarios_portal_rotaciones (activo: false)
- **Resultado**: Acceso Denegado ❌

---

## ✅ Resumen

**Implementado**:
- ✅ Solo usuarios en `usuarios_portal_rotaciones` pueden acceder
- ✅ Pantalla de "Acceso Denegado" para no autorizados
- ✅ Verificación automática en cada carga
- ✅ Botón para cerrar sesión si no tiene permisos

**Seguridad**:
- 🔒 Doble verificación (auth + permisos)
- 🔒 Sesión independiente
- 🔒 Todas las rutas protegidas
- 🔒 RLS habilitado

---

**¡Recarga el Portal de Rotaciones e intenta acceder con un usuario no autorizado para probarlo!** 🔐
