-- ============================================
-- SCHEMA PARA SISTEMA DE ROTACIONES
-- ============================================

-- Tabla de usuarios del portal de rotaciones (administradores)
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

-- Tabla de solicitudes de rotación (si no existe)
CREATE TABLE IF NOT EXISTS solicitudes_rotacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centro_formador_id UUID REFERENCES centros_formadores(id) ON DELETE CASCADE,
  especialidad VARCHAR(200) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_termino DATE NOT NULL,
  comentarios TEXT,
  archivo_excel_url TEXT,
  archivo_excel_nombre VARCHAR(255),
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, aprobada, rechazada
  fecha_solicitud DATE NOT NULL,
  fecha_respuesta TIMESTAMP WITH TIME ZONE,
  respondido_por UUID REFERENCES usuarios_portal_rotaciones(id),
  motivo_rechazo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de estudiantes en solicitudes (temporal, antes de aprobar)
CREATE TABLE IF NOT EXISTS estudiantes_rotacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_rotacion_id UUID REFERENCES solicitudes_rotacion(id) ON DELETE CASCADE,
  rut VARCHAR(12) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(20),
  nivel_formacion VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de alumnos aprobados (aparecen en el hospital)
CREATE TABLE IF NOT EXISTS alumnos_hospital (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_rotacion_id UUID REFERENCES solicitudes_rotacion(id),
  centro_formador_id UUID REFERENCES centros_formadores(id),
  rut VARCHAR(12) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(20),
  especialidad VARCHAR(200),
  nivel_formacion VARCHAR(100),
  fecha_inicio_rotacion DATE,
  fecha_termino_rotacion DATE,
  estado VARCHAR(50) DEFAULT 'en_rotacion', -- en_rotacion, activo, finalizado, inactivo
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_rotacion(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_centro ON solicitudes_rotacion(centro_formador_id);
CREATE INDEX IF NOT EXISTS idx_estudiantes_solicitud ON estudiantes_rotacion(solicitud_rotacion_id);
CREATE INDEX IF NOT EXISTS idx_alumnos_estado ON alumnos_hospital(estado);
CREATE INDEX IF NOT EXISTS idx_alumnos_centro ON alumnos_hospital(centro_formador_id);
CREATE INDEX IF NOT EXISTS idx_alumnos_rut ON alumnos_hospital(rut);

-- Políticas RLS (Row Level Security)
ALTER TABLE usuarios_portal_rotaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_rotacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes_rotacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumnos_hospital ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios del portal pueden ver sus propios datos
CREATE POLICY "Usuarios portal pueden ver su perfil"
  ON usuarios_portal_rotaciones FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuarios del portal pueden ver todas las solicitudes
CREATE POLICY "Usuarios portal pueden ver solicitudes"
  ON solicitudes_rotacion FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_portal_rotaciones
      WHERE user_id = auth.uid() AND activo = true
    )
  );

-- Política: Usuarios del portal pueden actualizar solicitudes
CREATE POLICY "Usuarios portal pueden actualizar solicitudes"
  ON solicitudes_rotacion FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_portal_rotaciones
      WHERE user_id = auth.uid() AND activo = true
    )
  );

-- Política: Usuarios del portal pueden ver estudiantes de rotación
CREATE POLICY "Usuarios portal pueden ver estudiantes"
  ON estudiantes_rotacion FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_portal_rotaciones
      WHERE user_id = auth.uid() AND activo = true
    )
  );

-- Política: Usuarios del portal pueden editar estudiantes
CREATE POLICY "Usuarios portal pueden editar estudiantes"
  ON estudiantes_rotacion FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_portal_rotaciones
      WHERE user_id = auth.uid() AND activo = true
    )
  );

-- Política: Usuarios del portal pueden gestionar alumnos del hospital
CREATE POLICY "Usuarios portal pueden gestionar alumnos"
  ON alumnos_hospital FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_portal_rotaciones
      WHERE user_id = auth.uid() AND activo = true
    )
  );

-- Política: Hospital puede ver alumnos
CREATE POLICY "Hospital puede ver alumnos"
  ON alumnos_hospital FOR SELECT
  USING (true); -- Ajustar según tu lógica de autenticación del hospital

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_portal_updated_at
  BEFORE UPDATE ON usuarios_portal_rotaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_solicitudes_updated_at
  BEFORE UPDATE ON solicitudes_rotacion
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alumnos_updated_at
  BEFORE UPDATE ON alumnos_hospital
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
