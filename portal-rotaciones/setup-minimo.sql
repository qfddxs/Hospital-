-- ============================================
-- SETUP MÍNIMO PARA PORTAL DE ROTACIONES
-- Solo crea lo que falta en tu base de datos
-- ============================================

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

-- 2. Verificar/agregar columnas faltantes en solicitudes_rotacion (si no existen)
DO $$ 
BEGIN
  -- Agregar columna estado si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='solicitudes_rotacion' AND column_name='estado') THEN
    ALTER TABLE solicitudes_rotacion ADD COLUMN estado VARCHAR(50) DEFAULT 'pendiente';
  END IF;

  -- Agregar columna fecha_respuesta si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='solicitudes_rotacion' AND column_name='fecha_respuesta') THEN
    ALTER TABLE solicitudes_rotacion ADD COLUMN fecha_respuesta TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Agregar columna respondido_por si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='solicitudes_rotacion' AND column_name='respondido_por') THEN
    ALTER TABLE solicitudes_rotacion ADD COLUMN respondido_por UUID REFERENCES usuarios_portal_rotaciones(id);
  END IF;

  -- Agregar columna motivo_rechazo si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='solicitudes_rotacion' AND column_name='motivo_rechazo') THEN
    ALTER TABLE solicitudes_rotacion ADD COLUMN motivo_rechazo TEXT;
  END IF;
END $$;

-- 3. Verificar/agregar columnas faltantes en alumnos (si no existen)
DO $$ 
BEGIN
  -- Agregar columna solicitud_rotacion_id si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='solicitud_rotacion_id') THEN
    ALTER TABLE alumnos ADD COLUMN solicitud_rotacion_id UUID REFERENCES solicitudes_rotacion(id);
  END IF;

  -- Agregar columna centro_formador_id si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='centro_formador_id') THEN
    ALTER TABLE alumnos ADD COLUMN centro_formador_id UUID REFERENCES centros_formadores(id);
  END IF;

  -- Agregar columna fecha_inicio_rotacion si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='fecha_inicio_rotacion') THEN
    ALTER TABLE alumnos ADD COLUMN fecha_inicio_rotacion DATE;
  END IF;

  -- Agregar columna fecha_termino_rotacion si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='fecha_termino_rotacion') THEN
    ALTER TABLE alumnos ADD COLUMN fecha_termino_rotacion DATE;
  END IF;

  -- Agregar columna estado si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='estado') THEN
    ALTER TABLE alumnos ADD COLUMN estado VARCHAR(50) DEFAULT 'en_rotacion';
  END IF;
END $$;

-- 4. Crear índices para mejorar rendimiento (si no existen)
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_rotacion(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_centro ON solicitudes_rotacion(centro_formador_id);
CREATE INDEX IF NOT EXISTS idx_estudiantes_solicitud ON estudiantes_rotacion(solicitud_rotacion_id);
CREATE INDEX IF NOT EXISTS idx_alumnos_estado ON alumnos(estado);
CREATE INDEX IF NOT EXISTS idx_alumnos_centro ON alumnos(centro_formador_id);

-- 5. Habilitar RLS en las tablas (si no está habilitado)
ALTER TABLE usuarios_portal_rotaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_rotacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes_rotacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas RLS para usuarios del portal

-- Eliminar políticas existentes si existen (para evitar duplicados)
DROP POLICY IF EXISTS "Usuarios portal pueden ver su perfil" ON usuarios_portal_rotaciones;
DROP POLICY IF EXISTS "Usuarios portal pueden ver solicitudes" ON solicitudes_rotacion;
DROP POLICY IF EXISTS "Usuarios portal pueden actualizar solicitudes" ON solicitudes_rotacion;
DROP POLICY IF EXISTS "Usuarios portal pueden ver estudiantes" ON estudiantes_rotacion;
DROP POLICY IF EXISTS "Usuarios portal pueden editar estudiantes" ON estudiantes_rotacion;
DROP POLICY IF EXISTS "Usuarios portal pueden gestionar alumnos" ON alumnos;

-- Crear políticas nuevas
CREATE POLICY "Usuarios portal pueden ver su perfil"
  ON usuarios_portal_rotaciones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios portal pueden ver solicitudes"
  ON solicitudes_rotacion FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_portal_rotaciones
      WHERE user_id = auth.uid() AND activo = true
    )
  );

CREATE POLICY "Usuarios portal pueden actualizar solicitudes"
  ON solicitudes_rotacion FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_portal_rotaciones
      WHERE user_id = auth.uid() AND activo = true
    )
  );

CREATE POLICY "Usuarios portal pueden ver estudiantes"
  ON estudiantes_rotacion FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_portal_rotaciones
      WHERE user_id = auth.uid() AND activo = true
    )
  );

CREATE POLICY "Usuarios portal pueden editar estudiantes"
  ON estudiantes_rotacion FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_portal_rotaciones
      WHERE user_id = auth.uid() AND activo = true
    )
  );

CREATE POLICY "Usuarios portal pueden gestionar alumnos"
  ON alumnos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_portal_rotaciones
      WHERE user_id = auth.uid() AND activo = true
    )
  );

-- 7. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para usuarios_portal_rotaciones
DROP TRIGGER IF EXISTS update_usuarios_portal_updated_at ON usuarios_portal_rotaciones;
CREATE TRIGGER update_usuarios_portal_updated_at
  BEFORE UPDATE ON usuarios_portal_rotaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Verificación final
SELECT 'Setup completado exitosamente!' as mensaje;

-- Mostrar resumen de tablas
SELECT 
  'usuarios_portal_rotaciones' as tabla,
  COUNT(*) as registros
FROM usuarios_portal_rotaciones
UNION ALL
SELECT 
  'solicitudes_rotacion' as tabla,
  COUNT(*) as registros
FROM solicitudes_rotacion
UNION ALL
SELECT 
  'estudiantes_rotacion' as tabla,
  COUNT(*) as registros
FROM estudiantes_rotacion
UNION ALL
SELECT 
  'alumnos' as tabla,
  COUNT(*) as registros
FROM alumnos;
