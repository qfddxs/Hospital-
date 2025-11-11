-- Crear tabla usuarios_centros para vincular usuarios con centros formadores
-- Esta tabla conecta los usuarios de Supabase Auth con los centros formadores

CREATE TABLE IF NOT EXISTS usuarios_centros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  centro_formador_id UUID NOT NULL REFERENCES centros_formadores(id) ON DELETE CASCADE,
  rol VARCHAR(50) NOT NULL DEFAULT 'centro_formador',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar duplicados: un usuario solo puede estar vinculado una vez a un centro
  UNIQUE(user_id, centro_formador_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_centros_user_id ON usuarios_centros(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_centros_centro_id ON usuarios_centros(centro_formador_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_centros_activo ON usuarios_centros(activo);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_usuarios_centros_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_usuarios_centros_updated_at
  BEFORE UPDATE ON usuarios_centros
  FOR EACH ROW
  EXECUTE FUNCTION update_usuarios_centros_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE usuarios_centros ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propios vínculos
CREATE POLICY "Usuarios pueden ver sus propios vínculos"
  ON usuarios_centros
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propios vínculos (al registrarse)
CREATE POLICY "Usuarios pueden crear sus propios vínculos"
  ON usuarios_centros
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propios vínculos
CREATE POLICY "Usuarios pueden actualizar sus propios vínculos"
  ON usuarios_centros
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Comentarios para documentación
COMMENT ON TABLE usuarios_centros IS 'Vincula usuarios de Supabase Auth con centros formadores';
COMMENT ON COLUMN usuarios_centros.user_id IS 'ID del usuario en Supabase Auth';
COMMENT ON COLUMN usuarios_centros.centro_formador_id IS 'ID del centro formador';
COMMENT ON COLUMN usuarios_centros.rol IS 'Rol del usuario (centro_formador, coordinador, etc)';
COMMENT ON COLUMN usuarios_centros.activo IS 'Si el vínculo está activo';
