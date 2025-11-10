-- ============================================
-- ARREGLAR PERMISOS PARA REGISTRO DE CENTROS
-- Permitir que usuarios puedan registrarse como centros formadores
-- ============================================

-- Eliminar políticas restrictivas de centros_formadores
DROP POLICY IF EXISTS "Permitir todo para autenticados" ON centros_formadores;
DROP POLICY IF EXISTS "Permitir lectura pública" ON centros_formadores;
DROP POLICY IF EXISTS "Permitir inserción autenticada" ON centros_formadores;

-- Crear políticas más permisivas para centros_formadores
-- Permitir lectura a todos (para el formulario de registro)
CREATE POLICY "Permitir lectura a todos" ON centros_formadores
  FOR SELECT
  USING (true);

-- Permitir inserción a usuarios autenticados (durante el registro)
CREATE POLICY "Permitir inserción a autenticados" ON centros_formadores
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Permitir actualización solo a admins o al propio centro
CREATE POLICY "Permitir actualización a admins" ON centros_formadores
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_centros 
      WHERE user_id = auth.uid() 
      AND (rol = 'admin' OR centro_formador_id = centros_formadores.id)
    )
  );

-- Permitir eliminación solo a admins
CREATE POLICY "Permitir eliminación a admins" ON centros_formadores
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_centros 
      WHERE user_id = auth.uid() 
      AND rol = 'admin'
    )
  );

-- Arreglar políticas de usuarios_centros para permitir auto-registro
DROP POLICY IF EXISTS "Usuarios ven su propio centro" ON usuarios_centros;
DROP POLICY IF EXISTS "Admins gestionan usuarios_centros" ON usuarios_centros;

-- Permitir que usuarios recién registrados se vinculen con su centro
CREATE POLICY "Usuarios pueden auto-registrarse" ON usuarios_centros
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Permitir que usuarios vean su propio vínculo
CREATE POLICY "Usuarios ven su vínculo" ON usuarios_centros
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins pueden ver y gestionar todo
CREATE POLICY "Admins gestionan todo" ON usuarios_centros
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_centros 
      WHERE user_id = auth.uid() 
      AND rol = 'admin'
    )
  );

-- Verificar que RLS esté habilitado
ALTER TABLE centros_formadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_centros ENABLE ROW LEVEL SECURITY;
