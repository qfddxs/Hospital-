-- ============================================
-- CREAR USUARIO PARA PORTAL DE ROTACIONES
-- ============================================

-- IMPORTANTE: Este usuario debe existir primero en Supabase Auth
-- Ve a: Authentication > Users en tu panel de Supabase
-- Y crea un usuario con email: rotacion@gmail.com

-- Una vez creado el usuario en Auth, ejecuta este script
-- reemplazando 'USER_ID_AQUI' con el UUID del usuario creado

-- Ejemplo de cómo insertar el usuario en la tabla usuarios_portal_rotaciones:
INSERT INTO usuarios_portal_rotaciones (user_id, nombre, apellido, email, cargo, activo)
VALUES (
  'USER_ID_AQUI',  -- Reemplazar con el UUID del usuario de Supabase Auth
  'Usuario',
  'Rotaciones',
  'rotacion@gmail.com',
  'Administrador Portal',
  true
)
ON CONFLICT (email) DO UPDATE
SET activo = true;

-- Para obtener el user_id, puedes ejecutar esta consulta después de crear el usuario en Auth:
-- SELECT id, email FROM auth.users WHERE email = 'rotacion@gmail.com';
