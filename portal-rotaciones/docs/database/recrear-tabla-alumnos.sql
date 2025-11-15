-- ============================================
-- RECREAR TABLA ALUMNOS CORRECTAMENTE
-- ============================================
-- ADVERTENCIA: Esto eliminará la tabla alumnos existente y todos sus datos
-- Solo ejecuta esto si estás seguro

-- 1. Hacer backup de datos existentes (opcional)
-- Descomenta estas líneas si quieres guardar los datos actuales
/*
CREATE TABLE alumnos_backup AS 
SELECT * FROM alumnos;
*/

-- 2. Eliminar tabla antigua
DROP TABLE IF EXISTS alumnos CASCADE;

-- 3. Crear tabla nueva con estructura correcta
CREATE TABLE alumnos (
  -- IDs y referencias
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_rotacion_id UUID REFERENCES solicitudes_rotacion(id) ON DELETE SET NULL,
  centro_formador_id UUID REFERENCES centros_formadores(id) ON DELETE SET NULL,
  
  -- Datos personales básicos
  rut VARCHAR NOT NULL,
  numero INT4,
  nombre VARCHAR NOT NULL,
  primer_apellido VARCHAR NOT NULL,
  segundo_apellido VARCHAR,
  
  -- Contacto del estudiante
  telefono VARCHAR,
  correo_electronico VARCHAR,
  lugar_residencia VARCHAR,
  
  -- Contacto de emergencia
  nombre_contacto_emergencia VARCHAR,
  telefono_contacto_emergencia VARCHAR,
  
  -- Datos académicos
  carrera VARCHAR,
  nivel_que_cursa VARCHAR,
  tipo_practica VARCHAR,
  campo_clinico_solicitado VARCHAR,
  
  -- Fechas
  fecha_inicio DATE,
  fecha_termino DATE,
  fecha_inicio_rotacion DATE,
  fecha_termino_rotacion DATE,
  fecha_supervision DATE,
  
  -- Horarios
  numero_semanas_practica INT4,
  horario_desde TIME,
  horario_hasta TIME,
  cuarto_turno VARCHAR,
  
  -- Docente a cargo
  nombre_docente_cargo VARCHAR,
  telefono_docente_cargo VARCHAR,
  
  -- Información adicional
  numero_registro_estudiante VARCHAR,
  inmunizacion_al_dia VARCHAR,
  numero_visitas INT4,
  observaciones TEXT,
  
  -- Estado y control
  estado VARCHAR DEFAULT 'en_rotacion',
  activo BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT alumnos_rut_unique UNIQUE (rut)
);

-- 4. Crear índices para mejor rendimiento
CREATE INDEX idx_alumnos_rut ON alumnos(rut);
CREATE INDEX idx_alumnos_solicitud ON alumnos(solicitud_rotacion_id);
CREATE INDEX idx_alumnos_centro ON alumnos(centro_formador_id);
CREATE INDEX idx_alumnos_estado ON alumnos(estado);
CREATE INDEX idx_alumnos_activo ON alumnos(activo);
CREATE INDEX idx_alumnos_carrera ON alumnos(carrera);
CREATE INDEX idx_alumnos_fecha_inicio ON alumnos(fecha_inicio_rotacion);

-- 5. Habilitar RLS
ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas RLS
-- Permitir lectura a usuarios autenticados
CREATE POLICY "Permitir lectura a usuarios autenticados"
  ON alumnos FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Permitir escritura a usuarios autenticados
CREATE POLICY "Permitir escritura a usuarios autenticados"
  ON alumnos FOR ALL
  USING (auth.uid() IS NOT NULL);

-- 7. Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_alumnos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Crear trigger para updated_at
CREATE TRIGGER update_alumnos_updated_at_trigger
  BEFORE UPDATE ON alumnos
  FOR EACH ROW
  EXECUTE FUNCTION update_alumnos_updated_at();

-- 9. Comentarios en las columnas (documentación)
COMMENT ON TABLE alumnos IS 'Tabla de alumnos aprobados para rotación en el hospital';
COMMENT ON COLUMN alumnos.solicitud_rotacion_id IS 'Referencia a la solicitud de rotación original';
COMMENT ON COLUMN alumnos.centro_formador_id IS 'Centro formador de donde proviene el alumno';
COMMENT ON COLUMN alumnos.estado IS 'Estado del alumno: en_rotacion, activo, finalizado, inactivo';
COMMENT ON COLUMN alumnos.activo IS 'Indica si el alumno está activo en el sistema';

-- 10. Verificar estructura
SELECT 
  column_name,
  data_type,
  CASE WHEN is_nullable = 'YES' THEN '✅ Nullable' ELSE '❌ Not Null' END as nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'alumnos'
ORDER BY ordinal_position;

-- 11. Mensaje de éxito
SELECT '✅ Tabla alumnos recreada exitosamente!' as mensaje,
       COUNT(*) as total_columnas
FROM information_schema.columns
WHERE table_name = 'alumnos';
