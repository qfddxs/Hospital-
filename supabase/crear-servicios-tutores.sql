-- Crear tablas de servicios clínicos y tutores
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- SERVICIOS CLÍNICOS
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

-- Habilitar RLS
ALTER TABLE servicios_clinicos ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer servicios clínicos
CREATE POLICY "Todos pueden leer servicios clínicos"
  ON servicios_clinicos
  FOR SELECT
  USING (true);

-- Política: Solo el hospital puede gestionar servicios
CREATE POLICY "Hospital puede gestionar servicios"
  ON servicios_clinicos
  FOR ALL
  USING (
    NOT EXISTS (
      SELECT 1 FROM usuarios_centros 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- TUTORES
-- ============================================

CREATE TABLE IF NOT EXISTS tutores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rut VARCHAR(12) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  especialidad VARCHAR(100),
  email VARCHAR(100),
  telefono VARCHAR(20),
  servicio_clinico_id UUID REFERENCES servicios_clinicos(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE tutores ENABLE ROW LEVEL SECURITY;

-- Política: Todos los usuarios autenticados pueden ver tutores
CREATE POLICY "Usuarios autenticados pueden ver tutores"
  ON tutores
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Política: Solo el hospital puede gestionar tutores
CREATE POLICY "Hospital puede gestionar tutores"
  ON tutores
  FOR ALL
  USING (
    NOT EXISTS (
      SELECT 1 FROM usuarios_centros 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- DATOS DE EJEMPLO
-- ============================================

-- Servicios Clínicos (solo si no existen)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM servicios_clinicos LIMIT 1) THEN
    INSERT INTO servicios_clinicos (nombre, descripcion, capacidad_maxima, jefe_servicio, activo) VALUES
    ('Medicina Interna', 'Servicio de medicina interna y hospitalización', 10, 'Dr. Carlos Rodríguez', true),
    ('Pediatría', 'Servicio de pediatría y neonatología', 8, 'Dra. María González', true),
    ('Cirugía', 'Servicio de cirugía general', 6, 'Dr. Roberto Silva', true),
    ('Urgencias', 'Servicio de urgencias y emergencias', 12, 'Dr. Juan Pérez', true),
    ('Ginecología y Obstetricia', 'Servicio de ginecología y obstetricia', 8, 'Dra. Patricia Morales', true),
    ('Traumatología', 'Servicio de traumatología y ortopedia', 6, 'Dr. Luis Fernández', true);
  END IF;
END $$;

-- Tutores (solo si no existen)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tutores LIMIT 1) THEN
    INSERT INTO tutores (rut, nombres, apellidos, especialidad, email, activo) VALUES
    ('12345678-9', 'Carlos', 'Rodríguez López', 'Medicina Interna', 'carlos.rodriguez@hospital.cl', true),
    ('98765432-1', 'María', 'González Pérez', 'Pediatría', 'maria.gonzalez@hospital.cl', true),
    ('11223344-5', 'Roberto', 'Silva Martínez', 'Cirugía General', 'roberto.silva@hospital.cl', true),
    ('55667788-9', 'Juan', 'Pérez Sánchez', 'Medicina de Urgencia', 'juan.perez@hospital.cl', true),
    ('99887766-5', 'Patricia', 'Morales Torres', 'Ginecología', 'patricia.morales@hospital.cl', true);
  END IF;
END $$;

-- Verificar
SELECT 'Servicios Clínicos creados:' as mensaje, COUNT(*) as total FROM servicios_clinicos;
SELECT 'Tutores creados:' as mensaje, COUNT(*) as total FROM tutores;
