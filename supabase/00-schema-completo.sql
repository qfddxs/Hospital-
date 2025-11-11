-- ============================================
-- SCHEMA COMPLETO DEL SISTEMA
-- Hospital Regional Rancagua - Gestión de Campos Clínicos
-- ============================================

-- IMPORTANTE: Ejecutar este script en un proyecto Supabase limpio
-- Este script crea todas las tablas necesarias para el sistema

-- ============================================
-- 1. CENTROS FORMADORES
-- ============================================

CREATE TABLE IF NOT EXISTS centros_formadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(200) NOT NULL,
  codigo VARCHAR(50),
  direccion TEXT,
  telefono VARCHAR(20),
  email VARCHAR(100),
  contacto_nombre VARCHAR(100),
  contacto_cargo VARCHAR(100),
  nivel_formacion VARCHAR(20) NOT NULL CHECK (nivel_formacion IN ('pregrado', 'postgrado')),
  especialidades TEXT[] DEFAULT '{}',
  capacidad_total INTEGER DEFAULT 0,
  capacidad_disponible INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice único parcial para código (permite NULL y vacíos duplicados)
CREATE UNIQUE INDEX IF NOT EXISTS centros_formadores_codigo_unique_idx 
ON centros_formadores (codigo) 
WHERE codigo IS NOT NULL AND codigo != '';

-- Índices para búsqueda
CREATE INDEX IF NOT EXISTS idx_centros_nivel ON centros_formadores(nivel_formacion);
CREATE INDEX IF NOT EXISTS idx_centros_activo ON centros_formadores(activo);

-- ============================================
-- 2. USUARIOS_CENTROS (Vinculación Auth)
-- ============================================

CREATE TABLE IF NOT EXISTS usuarios_centros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  centro_formador_id UUID NOT NULL REFERENCES centros_formadores(id) ON DELETE CASCADE,
  rol VARCHAR(50) NOT NULL DEFAULT 'centro_formador',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, centro_formador_id)
);

CREATE INDEX IF NOT EXISTS idx_usuarios_centros_user_id ON usuarios_centros(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_centros_centro_id ON usuarios_centros(centro_formador_id);

-- ============================================
-- 3. SOLICITUDES DE CUPOS
-- ============================================

CREATE TABLE IF NOT EXISTS solicitudes_cupos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centro_formador_id UUID NOT NULL REFERENCES centros_formadores(id) ON DELETE CASCADE,
  especialidad VARCHAR(100) NOT NULL,
  numero_cupos INTEGER NOT NULL CHECK (numero_cupos > 0),
  fecha_inicio DATE NOT NULL,
  fecha_termino DATE NOT NULL,
  fecha_solicitud DATE NOT NULL DEFAULT CURRENT_DATE,
  solicitante VARCHAR(200),
  comentarios TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  motivo_rechazo TEXT,
  revisado_por UUID REFERENCES auth.users(id),
  fecha_revision TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fecha_valida CHECK (fecha_termino > fecha_inicio)
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_centro_id ON solicitudes_cupos(centro_formador_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_cupos(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_especialidad ON solicitudes_cupos(especialidad);

-- ============================================
-- 4. ALUMNOS
-- ============================================

CREATE TABLE IF NOT EXISTS alumnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centro_formador_id UUID NOT NULL REFERENCES centros_formadores(id) ON DELETE CASCADE,
  rut VARCHAR(12) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  email VARCHAR(100),
  telefono VARCHAR(20),
  carrera VARCHAR(100) NOT NULL,
  nivel_formacion VARCHAR(20) NOT NULL CHECK (nivel_formacion IN ('pregrado', 'postgrado')),
  año_ingreso INTEGER,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alumnos_centro ON alumnos(centro_formador_id);
CREATE INDEX IF NOT EXISTS idx_alumnos_rut ON alumnos(rut);
CREATE INDEX IF NOT EXISTS idx_alumnos_activo ON alumnos(activo);

-- ============================================
-- 5. ROTACIONES
-- ============================================

CREATE TABLE IF NOT EXISTS rotaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  servicio_clinico VARCHAR(100) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_termino DATE NOT NULL,
  tutor_responsable VARCHAR(100),
  estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'completada', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT rotacion_fecha_valida CHECK (fecha_termino > fecha_inicio)
);

CREATE INDEX IF NOT EXISTS idx_rotaciones_alumno ON rotaciones(alumno_id);
CREATE INDEX IF NOT EXISTS idx_rotaciones_estado ON rotaciones(estado);

-- ============================================
-- 6. ASISTENCIAS
-- ============================================

CREATE TABLE IF NOT EXISTS asistencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rotacion_id UUID NOT NULL REFERENCES rotaciones(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('presente', 'ausente', 'justificado', 'tardanza')),
  observaciones TEXT,
  registrado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(rotacion_id, fecha)
);

CREATE INDEX IF NOT EXISTS idx_asistencias_rotacion ON asistencias(rotacion_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias(fecha);

-- ============================================
-- 7. SERVICIOS CLÍNICOS
-- ============================================

CREATE TABLE IF NOT EXISTS servicios_clinicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  capacidad_maxima INTEGER DEFAULT 0,
  jefe_servicio VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. RETRIBUCIONES
-- ============================================

CREATE TABLE IF NOT EXISTS retribuciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centro_formador_id UUID NOT NULL REFERENCES centros_formadores(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  monto DECIMAL(10,2),
  fecha DATE NOT NULL,
  descripcion TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retribuciones_centro ON retribuciones(centro_formador_id);
CREATE INDEX IF NOT EXISTS idx_retribuciones_estado ON retribuciones(estado);

-- ============================================
-- 9. TUTORES
-- ============================================

CREATE TABLE IF NOT EXISTS tutores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rut VARCHAR(12) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  especialidad VARCHAR(100),
  email VARCHAR(100),
  telefono VARCHAR(20),
  servicio_clinico_id UUID REFERENCES servicios_clinicos(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_centros_formadores_updated_at
  BEFORE UPDATE ON centros_formadores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_usuarios_centros_updated_at
  BEFORE UPDATE ON usuarios_centros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_solicitudes_cupos_updated_at
  BEFORE UPDATE ON solicitudes_cupos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_alumnos_updated_at
  BEFORE UPDATE ON alumnos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_rotaciones_updated_at
  BEFORE UPDATE ON rotaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE centros_formadores IS 'Universidades e instituciones que envían estudiantes';
COMMENT ON TABLE usuarios_centros IS 'Vincula usuarios de Supabase Auth con centros formadores';
COMMENT ON TABLE solicitudes_cupos IS 'Solicitudes de cupos clínicos de centros formadores';
COMMENT ON TABLE alumnos IS 'Estudiantes en rotación clínica';
COMMENT ON TABLE rotaciones IS 'Rotaciones clínicas de estudiantes';
COMMENT ON TABLE asistencias IS 'Control de asistencia de estudiantes';
COMMENT ON TABLE servicios_clinicos IS 'Servicios clínicos del hospital';
COMMENT ON TABLE retribuciones IS 'Pagos y retribuciones a centros formadores';
COMMENT ON TABLE tutores IS 'Tutores clínicos del hospital';
