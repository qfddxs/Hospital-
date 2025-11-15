# 🔐 Configurar Portal con RLS Activo

## Objetivo
Mantener RLS activo (seguro) y permitir que el portal vea las solicitudes.

---

## 📋 Pasos (10 minutos)

### Paso 1: Ejecutar SQL de Configuración

1. Abre Supabase → **SQL Editor**
2. Crea una nueva query
3. Copia TODO el contenido de `configurar-rls-correcto.sql`
4. Haz clic en **Run**
5. Verifica que no haya errores

**Qué hace este SQL:**
- ✅ Crea tabla `usuarios_portal_rotaciones`
- ✅ Habilita RLS en las tablas
- ✅ Crea políticas que permiten acceso a usuarios autenticados
- ✅ Mantiene la seguridad activa

---

### Paso 2: Crear Usuario Administrador

#### 2.1 Crear en Authentication
1. En Supabase, ve a **Authentication** → **Users**
2. Haz clic en **Add user** → **Create new user**
3. Completa:
   ```
   Email: admin@hospital.cl
   Password: Admin123!
   ✅ Auto Confirm User
   ```
4. Haz clic en **Create user**
5. **IMPORTANTE**: Copia el **UUID** del usuario (columna ID)
   - Se ve algo así: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

#### 2.2 Registrar en la Tabla
1. Ve a **SQL Editor**
2. Ejecuta esto (reemplaza `TU_UUID_AQUI` con el UUID que copiaste):

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

Deberías ver tu usuario.

---

### Paso 3: Iniciar Sesión en el Portal

1. Abre el portal: http://localhost:5175
2. Ingresa las credenciales:
   - **Email**: `admin@hospital.cl`
   - **Password**: `Admin123!`
3. Haz clic en **Iniciar Sesión**
4. ✅ Deberías entrar al Dashboard

---

### Paso 4: Verificar que Funciona

En el Dashboard deberías ver:
- ✅ Estadísticas (Total: 1, Pendientes: 1)
- ✅ Tu solicitud de Enfermería
- ✅ Sin errores en la consola

---

## 🔍 Verificación

### Verificar RLS está activo:
```sql
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS Habilitado' ELSE '❌ RLS Deshabilitado' END as estado
FROM pg_tables
WHERE tablename IN ('solicitudes_rotacion', 'estudiantes_rotacion');
```

Deberías ver "✅ RLS Habilitado" en ambas.

### Verificar políticas:
```sql
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('solicitudes_rotacion', 'estudiantes_rotacion')
ORDER BY tablename;
```

Deberías ver:
- `solicitudes_rotacion` → "Permitir ver solicitudes a usuarios autenticados"
- `solicitudes_rotacion` → "Permitir actualizar solicitudes a usuarios autenticados"
- `estudiantes_rotacion` → "Permitir ver estudiantes a usuarios autenticados"
- `estudiantes_rotacion` → "Permitir editar estudiantes a usuarios autenticados"

---

## 🎯 Cómo Funciona

### Antes (sin configurar):
```
Usuario → Portal → Supabase
                    ↓
                   RLS bloquea ❌
                    ↓
                   Error 400
```

### Después (configurado):
```
Usuario → Login → Portal (autenticado)
                    ↓
                  Supabase
                    ↓
         RLS verifica: ¿Usuario autenticado? ✅
                    ↓
              Permite acceso
                    ↓
         Muestra solicitudes ✅
```

---

## 🔐 Seguridad

Con esta configuración:
- ✅ RLS está **activo** (seguro)
- ✅ Solo usuarios **autenticados** pueden ver datos
- ✅ Usuarios **no autenticados** no pueden acceder
- ✅ Cada portal tiene su **sesión independiente**

---

## ⚠️ Importante

### Las políticas permiten acceso a:
- ✅ Cualquier usuario autenticado en Supabase
- ✅ Esto incluye usuarios del Hospital, Centros Formadores y Portal Rotaciones

### Si quieres restringir SOLO a usuarios del portal:
Cambia las políticas a:

```sql
-- Solo usuarios en usuarios_portal_rotaciones
CREATE POLICY "Solo usuarios del portal"
  ON solicitudes_rotacion
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_portal_rotaciones
      WHERE user_id = auth.uid() AND activo = true
    )
  );
```

Pero por ahora, la configuración actual funciona bien.

---

## 🐛 Solución de Problemas

### Error: "Invalid login credentials"
→ Verifica email y password
→ Verifica que el usuario existe en Authentication

### Error: "new row violates row-level security policy"
→ Verifica que ejecutaste el SQL completo
→ Verifica que las políticas se crearon

### No aparecen solicitudes después de login
→ Abre DevTools (F12) → Console
→ Busca errores
→ Verifica que el usuario está autenticado

### Error: "relation usuarios_portal_rotaciones does not exist"
→ Ejecuta `configurar-rls-correcto.sql`

---

## ✅ Checklist

- [ ] Ejecuté `configurar-rls-correcto.sql`
- [ ] Creé usuario en Authentication
- [ ] Copié el UUID del usuario
- [ ] Ejecuté el INSERT en `usuarios_portal_rotaciones`
- [ ] Verifiqué que el usuario se creó
- [ ] Inicié sesión en el portal
- [ ] Veo las solicitudes en el Dashboard

---

## 🎉 Resultado Final

Con RLS activo y configurado correctamente:
- 🔐 Base de datos segura
- ✅ Portal funciona
- ✅ Solicitudes visibles
- ✅ Listo para producción

---

**¿Listo? Ejecuta `configurar-rls-correcto.sql` y crea el usuario admin.**
