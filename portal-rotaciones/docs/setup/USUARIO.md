# Instrucciones para Crear Usuario del Portal de Rotaciones

## Paso 1: Crear usuario en Supabase Authentication

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Navega a **Authentication** > **Users**
3. Haz clic en **Add user** > **Create new user**
4. Ingresa:
   - **Email**: `rotacion@gmail.com`
   - **Password**: La contraseña que desees (ejemplo: `Rotacion123!`)
   - Deja **Auto Confirm User** activado
5. Haz clic en **Create user**
6. **IMPORTANTE**: Copia el **UUID** del usuario creado (aparece en la columna ID)

## Paso 2: Agregar usuario a la tabla usuarios_portal_rotaciones

1. Ve a **SQL Editor** en Supabase
2. Ejecuta el siguiente SQL (reemplaza `USER_ID_AQUI` con el UUID copiado):

```sql
INSERT INTO usuarios_portal_rotaciones (user_id, nombre, apellido, email, cargo, activo)
VALUES (
  'USER_ID_AQUI',  -- Reemplazar con el UUID del usuario
  'Usuario',
  'Rotaciones',
  'rotacion@gmail.com',
  'Administrador Portal',
  true
)
ON CONFLICT (email) DO UPDATE
SET activo = true;
```

## Paso 3: Verificar que el usuario fue creado correctamente

Ejecuta esta consulta en SQL Editor:

```sql
SELECT u.id, u.email, upr.nombre, upr.apellido, upr.activo
FROM auth.users u
LEFT JOIN usuarios_portal_rotaciones upr ON u.id = upr.user_id
WHERE u.email = 'rotacion@gmail.com';
```

Deberías ver el usuario con todos sus datos.

## Paso 4: Iniciar sesión

Ahora puedes iniciar sesión en el Portal de Rotaciones con:
- **Email**: `rotacion@gmail.com`
- **Password**: La contraseña que configuraste en el Paso 1

---

## Crear usuarios adicionales

Para crear más usuarios, repite los pasos anteriores con diferentes emails.

## Solución de problemas

### Error: "Invalid login credentials"
- Verifica que el usuario existe en Authentication > Users
- Verifica que la contraseña es correcta
- Verifica que el usuario está en la tabla `usuarios_portal_rotaciones`

### Error: "Credenciales incorrectas o usuario no autorizado"
- El usuario existe en Auth pero NO está en la tabla `usuarios_portal_rotaciones`
- Ejecuta el INSERT del Paso 2

### No puedo ver solicitudes después de iniciar sesión
- Verifica que el campo `activo` es `true` en la tabla `usuarios_portal_rotaciones`
- Ejecuta: `UPDATE usuarios_portal_rotaciones SET activo = true WHERE email = 'rotacion@gmail.com';`
