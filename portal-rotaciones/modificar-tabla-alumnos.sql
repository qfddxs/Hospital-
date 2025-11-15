-- ============================================
-- MODIFICAR TABLA ALUMNOS PARA COINCIDIR CON ESTUDIANTES_ROTACION
-- ============================================

-- 1. Agregar columnas que faltan en alumnos (si no existen)
DO $$ 
BEGIN
  -- Agregar primer_apellido si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='primer_apellido') THEN
    ALTER TABLE alumnos ADD COLUMN primer_apellido VARCHAR;
  END IF;

  -- Agregar segundo_apellido si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='segundo_apellido') THEN
    ALTER TABLE alumnos ADD COLUMN segundo_apellido VARCHAR;
  END IF;

  -- Agregar correo_electronico si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='correo_electronico') THEN
    ALTER TABLE alumnos ADD COLUMN correo_electronico VARCHAR;
  END IF;

  -- Agregar nivel_que_cursa si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='nivel_que_cursa') THEN
    ALTER TABLE alumnos ADD COLUMN nivel_que_cursa VARCHAR;
  END IF;

  -- Agregar nombre (singular) si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='nombre') THEN
    ALTER TABLE alumnos ADD COLUMN nombre VARCHAR;
  END IF;

  -- Agregar numero si no existe (de estudiantes_rotacion)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='numero') THEN
    ALTER TABLE alumnos ADD COLUMN numero INT4;
  END IF;

  -- Agregar lugar_residencia si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='lugar_residencia') THEN
    ALTER TABLE alumnos ADD COLUMN lugar_residencia VARCHAR;
  END IF;

  -- Agregar tipo_practica si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='tipo_practica') THEN
    ALTER TABLE alumnos ADD COLUMN tipo_practica VARCHAR;
  END IF;

  -- Agregar campo_clinico_solicitado si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='campo_clinico_solicitado') THEN
    ALTER TABLE alumnos ADD COLUMN campo_clinico_solicitado VARCHAR;
  END IF;

  -- Agregar numero_semanas_practica si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='numero_semanas_practica') THEN
    ALTER TABLE alumnos ADD COLUMN numero_semanas_practica INT4;
  END IF;

  -- Agregar horario_desde si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='horario_desde') THEN
    ALTER TABLE alumnos ADD COLUMN horario_desde TIME;
  END IF;

  -- Agregar horario_hasta si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='horario_hasta') THEN
    ALTER TABLE alumnos ADD COLUMN horario_hasta TIME;
  END IF;

  -- Agregar cuarto_turno si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='cuarto_turno') THEN
    ALTER TABLE alumnos ADD COLUMN cuarto_turno VARCHAR;
  END IF;

  -- Agregar nombre_docente_cargo si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='nombre_docente_cargo') THEN
    ALTER TABLE alumnos ADD COLUMN nombre_docente_cargo VARCHAR;
  END IF;

  -- Agregar telefono_docente_cargo si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='telefono_docente_cargo') THEN
    ALTER TABLE alumnos ADD COLUMN telefono_docente_cargo VARCHAR;
  END IF;

  -- Agregar nombre_contacto_emergencia si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='nombre_contacto_emergencia') THEN
    ALTER TABLE alumnos ADD COLUMN nombre_contacto_emergencia VARCHAR;
  END IF;

  -- Agregar telefono_contacto_emergencia si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='telefono_contacto_emergencia') THEN
    ALTER TABLE alumnos ADD COLUMN telefono_contacto_emergencia VARCHAR;
  END IF;

  -- Agregar numero_registro_estudiante si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='numero_registro_estudiante') THEN
    ALTER TABLE alumnos ADD COLUMN numero_registro_estudiante VARCHAR;
  END IF;

  -- Agregar inmunizacion_al_dia si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='inmunizacion_al_dia') THEN
    ALTER TABLE alumnos ADD COLUMN inmunizacion_al_dia VARCHAR;
  END IF;

  -- Agregar numero_visitas si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='numero_visitas') THEN
    ALTER TABLE alumnos ADD COLUMN numero_visitas INT4;
  END IF;

  -- Agregar fecha_supervision si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='fecha_supervision') THEN
    ALTER TABLE alumnos ADD COLUMN fecha_supervision DATE;
  END IF;

  -- Agregar observaciones si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='alumnos' AND column_name='observaciones') THEN
    ALTER TABLE alumnos ADD COLUMN observaciones TEXT;
  END IF;

END $$;

-- 2. Migrar datos existentes (si hay datos en columnas antiguas)
-- Copiar nombres → nombre (si nombres existe y nombre está vacío)
UPDATE alumnos 
SET nombre = nombres 
WHERE nombre IS NULL AND nombres IS NOT NULL;

-- Copiar apellidos → primer_apellido (si apellidos existe)
UPDATE alumnos 
SET primer_apellido = SPLIT_PART(apellidos, ' ', 1),
    segundo_apellido = SPLIT_PART(apellidos, ' ', 2)
WHERE primer_apellido IS NULL AND apellidos IS NOT NULL;

-- Copiar email → correo_electronico
UPDATE alumnos 
SET correo_electronico = email 
WHERE correo_electronico IS NULL AND email IS NOT NULL;

-- Copiar nivel → nivel_que_cursa
UPDATE alumnos 
SET nivel_que_cursa = nivel 
WHERE nivel_que_cursa IS NULL AND nivel IS NOT NULL;

-- 3. Verificar columnas agregadas
SELECT 
  column_name,
  data_type,
  CASE WHEN is_nullable = 'YES' THEN '✅ Nullable' ELSE '❌ Not Null' END as nullable
FROM information_schema.columns
WHERE table_name = 'alumnos'
  AND column_name IN (
    'primer_apellido',
    'segundo_apellido',
    'correo_electronico',
    'nivel_que_cursa',
    'nombre',
    'numero',
    'lugar_residencia',
    'tipo_practica',
    'campo_clinico_solicitado'
  )
ORDER BY column_name;

-- 4. Ver estructura completa de alumnos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'alumnos'
ORDER BY ordinal_position;

-- 5. Mensaje de éxito
SELECT '✅ Tabla alumnos actualizada exitosamente!' as mensaje;
