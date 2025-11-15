-- ============================================
-- CONFIGURAR RLS CORRECTAMENTE PARA PORTAL DE ROTACIONES
-- ============================================
-- Esto permite que el portal vea las solicitudes SIN desactivar RLS

-- 1. Crear tabla de usuarios del portal (si no existe)
CREATE TABLE IF NOT EXISTS usuarios_portal_rotaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  cargo VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS en las tablas
ALTER TABLE solicitudes_rotacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes_rotacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_portal_rotaciones ENABLE ROW LEVEL SECURITY;

-- 3. ELIMINAR políticas antiguas si existen
DROP POLICY IF EXISTS "Usuarios portal pueden ver solicitudes" ON solicitudes_rotacion;
DROP POLICY IF EXISTS "Usuarios portal pueden actualizar solicitudes" ON solicitudes_rotacion;
DROP POLICY IF EXISTS "Usuarios portal pueden ver estudiantes" ON estudiantes_rotacion;
DROP POLICY IF EXISTS "Usuarios portal pueden editar estudiantes" ON estudiantes_rotacion;
DROP POLICY IF EXISTS "Usuarios portal pueden ver su perfil" ON usuarios_portal_rotaciones;

-- 4. CREAR políticas nuevas que permitan acceso

-- Política para VER solicitudes (cualquier usuario autenticado)
CREATE POLICY "Permitir ver solicitudes a usuarios autenticados"
  ON solicitudes_rotacion
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Política para ACTUALIZAR solicitudes (cualquier usuario autenticado)
CREATE POLICY "Permitir actualizar solicitudes a usuarios autenticados"
  ON solicitudes_rotacion
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Política para VER estudiantes (cualquier usuario autenticado)
CREATE POLICY "Permitir ver estudiantes a usuarios autenticados"
  ON estudiantes_rotacion
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Política para EDITAR estudiantes (cualquier usuario autenticado)
CREATE POLICY "Permitir editar estudiantes a usuarios autenticados"
  ON estudiantes_rotacion
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Política para ver perfil propio
CREATE POLICY "Permitir ver perfil propio"
  ON usuarios_portal_rotaciones
  FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Verificar que las políticas se crearon
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN cmd = 'r' THEN 'SELECT'
    WHEN cmd = 'w' THEN 'UPDATE'
    WHEN cmd = '*' THEN 'ALL'
  END as comando
FROM pg_policies
WHERE tablename IN ('solicitudes_rotacion', 'estudiantes_rotacion', 'usuarios_portal_rotaciones')
ORDER BY tablename, policyname;

-- 6. Verificar RLS está habilitado
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS Habilitado' ELSE '❌ RLS Deshabilitado' END as estado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('solicitudes_rotacion', 'estudiantes_rotacion', 'usuarios_portal_rotaciones')
ORDER BY tablename;

-- 7. IMPORTANTE: Ahora necesitas crear un usuario administrador
-- Sigue estos pasos:

-- A. Ve a Authentication > Users en Supabase
-- B. Crea un nuevo usuario con email y password
-- C. Copia el UUID del usuario
-- D. Ejecuta este INSERT (reemplaza TU_UUID_AQUI):

/*
INSERT INTO usuarios_portal_rotaciones (user_id, nombre, apellido, email, cargo, activo)
VALUES (
  'TU_UUID_AQUI',
  'Admin',
  'Rotaciones',
  'admin@hospital.cl',
  'Administrador de Rotaciones',
  true
);
*/

-- E. Ahora podrás iniciar sesión en el portal con ese usuario
