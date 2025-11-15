-- ============================================
-- CREAR ROTACIONES AUTOMÁTICAS AL APROBAR SOLICITUD
-- ============================================

-- 1. Verificar que existe la tabla servicios_clinicos
-- Si no existe, créala
CREATE TABLE IF NOT EXISTS servicios_clinicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR NOT NULL UNIQUE,
  descripcion TEXT,
  capacidad_maxima INT4,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Verificar que existe la tabla rotaciones
-- Si no existe, créala
CREATE TABLE IF NOT EXISTS rotaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_rotacion_id UUID REFERENCES estudiantes_rotacion(id) ON DELETE CASCADE,
  servicio_clinico_id UUID REFERENCES servicios_clinicos(id) ON DELETE SET NULL,
  tutor_id UUID REFERENCES tutores(id) ON DELETE SET NULL,
  fecha_inicio DATE NOT NULL,
  fecha_termino DATE NOT NULL,
  horario_desde TIME,
  horario_hasta TIME,
  estado VARCHAR DEFAULT 'activa',
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insertar servicios clínicos comunes (si no existen)
INSERT INTO servicios_clinicos (nombre, descripcion, capacidad_maxima, activo)
VALUES 
  ('Medicina Interna', 'Servicio de Medicina Interna', 10, true),
  ('Urgencias', 'Servicio de Urgencias', 8, true),
  ('Traumatología', 'Servicio de Traumatología', 6, true),
  ('Pediatría', 'Servicio de Pediatría', 8, true),
  ('Ginecología', 'Servicio de Ginecología y Obstetricia', 6, true),
  ('Cirugía', 'Servicio de Cirugía', 8, true),
  ('UCI', 'Unidad de Cuidados Intensivos', 4, true),
  ('Cardiología', 'Servicio de Cardiología', 6, true),
  ('Neurología', 'Servicio de Neurología', 6, true),
  ('Psiquiatría', 'Servicio de Psiquiatría', 6, true)
ON CONFLICT (nombre) DO NOTHING;

-- 4. Crear función para buscar o crear servicio clínico
CREATE OR REPLACE FUNCTION obtener_o_crear_servicio_clinico(nombre_servicio VARCHAR)
RETURNS UUID AS $$
DECLARE
  servicio_id UUID;
BEGIN
  -- Buscar servicio existente (case insensitive)
  SELECT id INTO servicio_id
  FROM servicios_clinicos
  WHERE LOWER(nombre) = LOWER(nombre_servicio)
  LIMIT 1;
  
  -- Si no existe, crearlo
  IF servicio_id IS NULL THEN
    INSERT INTO servicios_clinicos (nombre, activo)
    VALUES (nombre_servicio, true)
    RETURNING id INTO servicio_id;
  END IF;
  
  RETURN servicio_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Habilitar RLS
ALTER TABLE servicios_clinicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotaciones ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas RLS
DROP POLICY IF EXISTS "Permitir lectura servicios" ON servicios_clinicos;
CREATE POLICY "Permitir lectura servicios"
  ON servicios_clinicos FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Permitir escritura servicios" ON servicios_clinicos;
CREATE POLICY "Permitir escritura servicios"
  ON servicios_clinicos FOR ALL
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Permitir lectura rotaciones" ON rotaciones;
CREATE POLICY "Permitir lectura rotaciones"
  ON rotaciones FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Permitir escritura rotaciones" ON rotaciones;
CREATE POLICY "Permitir escritura rotaciones"
  ON rotaciones FOR ALL
  USING (auth.uid() IS NOT NULL);

-- 7. Crear índices
CREATE INDEX IF NOT EXISTS idx_rotaciones_estudiante ON rotaciones(estudiante_rotacion_id);
CREATE INDEX IF NOT EXISTS idx_rotaciones_servicio ON rotaciones(servicio_clinico_id);
CREATE INDEX IF NOT EXISTS idx_rotaciones_tutor ON rotaciones(tutor_id);
CREATE INDEX IF NOT EXISTS idx_rotaciones_estado ON rotaciones(estado);
CREATE INDEX IF NOT EXISTS idx_rotaciones_fecha_inicio ON rotaciones(fecha_inicio);

-- 8. Verificar
SELECT 
  'servicios_clinicos' as tabla,
  COUNT(*) as registros
FROM servicios_clinicos
UNION ALL
SELECT 
  'rotaciones' as tabla,
  COUNT(*) as registros
FROM rotaciones;

SELECT '✅ Tablas de rotaciones creadas exitosamente!' as mensaje;
