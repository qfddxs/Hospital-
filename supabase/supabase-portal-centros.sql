-- ============================================
-- PORTAL PARA CENTROS FORMADORES
-- Sistema de usuarios y permisos
-- ============================================

-- Actualizar tabla de usuarios para incluir rol de centro formador
ALTER TABLE usuarios 
DROP CONSTRAINT IF EXISTS usuarios_rol_check;

ALTER TABLE usuarios
ADD CONSTRAINT usuarios_rol_check 
CHECK (rol IN ('admin', 'encargado_docencia', 'jefe_servicio', 'tutor', 'centro_formador'));

-- Vincular usuarios de Supabase Auth con centros formadores
CREATE TABLE IF NOT EXISTS usuarios_centros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    centro_formador_id UUID REFERENCES centros_formadores(id) ON DELETE CASCADE,
    rol VARCHAR(50) DEFAULT 'centro_formador',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, centro_formador_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuarios_centros_user ON usuarios_centros(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_centros_centro ON usuarios_centros(centro_formador_id);

-- Trigger para updated_at
CREATE TRIGGER update_usuarios_centros_updated_at 
BEFORE UPDATE ON usuarios_centros 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para obtener el centro formador del usuario actual
CREATE OR REPLACE FUNCTION get_user_centro_formador()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT centro_formador_id 
        FROM usuarios_centros 
        WHERE user_id = auth.uid() 
        AND activo = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar políticas de solicitudes_cupos para centros formadores
DROP POLICY IF EXISTS "Permitir todo para autenticados" ON solicitudes_cupos;

-- Los centros formadores solo ven sus propias solicitudes
CREATE POLICY "Centros ven sus solicitudes" ON solicitudes_cupos
  FOR SELECT
  USING (
    centro_formador_id = get_user_centro_formador()
    OR 
    EXISTS (
      SELECT 1 FROM usuarios_centros 
      WHERE user_id = auth.uid() 
      AND rol = 'admin'
    )
  );

-- Los centros formadores solo pueden crear sus propias solicitudes
CREATE POLICY "Centros crean sus solicitudes" ON solicitudes_cupos
  FOR INSERT
  WITH CHECK (
    centro_formador_id = get_user_centro_formador()
  );

-- Los centros formadores pueden actualizar solo sus solicitudes pendientes
CREATE POLICY "Centros actualizan sus solicitudes" ON solicitudes_cupos
  FOR UPDATE
  USING (
    centro_formador_id = get_user_centro_formador()
    AND estado = 'pendiente'
  );

-- Solo admins pueden aprobar/rechazar
CREATE POLICY "Admins gestionan solicitudes" ON solicitudes_cupos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_centros 
      WHERE user_id = auth.uid() 
      AND rol = 'admin'
    )
  );

-- Políticas para usuarios_centros
ALTER TABLE usuarios_centros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su propio centro" ON usuarios_centros
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins gestionan usuarios_centros" ON usuarios_centros
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_centros 
      WHERE user_id = auth.uid() 
      AND rol = 'admin'
    )
  );

-- Comentarios
COMMENT ON TABLE usuarios_centros IS 'Vincula usuarios de Supabase Auth con centros formadores';
COMMENT ON FUNCTION get_user_centro_formador() IS 'Obtiene el centro formador del usuario autenticado';
