-- ============================================
-- DATOS DE EJEMPLO PARA EL SISTEMA
-- Crear datos de prueba para todas las tablas
-- ============================================

-- Nota: Ejecuta este SQL solo si quieres datos de ejemplo
-- Si ya tienes datos reales, NO ejecutes esto

-- 1. Insertar servicios clínicos (si no existen)
INSERT INTO servicios_clinicos (nombre, codigo, capacidad_maxima, capacidad_actual, jefe_servicio, activo)
VALUES 
  ('Medicina Interna', 'MED-INT', 10, 3, 'Dr. Juan Pérez', true),
  ('Cirugía', 'CIR', 8, 2, 'Dr. María González', true),
  ('Pediatría', 'PED', 12, 4, 'Dra. Ana Martínez', true),
  ('Urgencias', 'URG', 15, 5, 'Dr. Carlos López', true)
ON CONFLICT (codigo) DO NOTHING;

-- 2. Insertar tutores (si no existen)
INSERT INTO tutores (rut, nombres, apellidos, email, especialidad, tarifa_hora, activo)
VALUES 
  ('12345678-9', 'Juan', 'Pérez', 'juan.perez@hospital.cl', 'Medicina Interna', 15000, true),
  ('98765432-1', 'María', 'González', 'maria.gonzalez@hospital.cl', 'Cirugía', 18000, true),
  ('11223344-5', 'Ana', 'Martínez', 'ana.martinez@hospital.cl', 'Pediatría', 16000, true),
  ('55667788-9', 'Carlos', 'López', 'carlos.lopez@hospital.cl', 'Urgencias', 17000, true)
ON CONFLICT (rut) DO NOTHING;

-- 3. Insertar centros formadores (si no existen)
INSERT INTO centros_formadores (nombre, codigo, email, activo)
VALUES 
  ('Universidad de Chile', 'UCH', 'contacto@uchile.cl', true),
  ('Universidad de Santiago', 'USACH', 'contacto@usach.cl', true),
  ('Pontificia Universidad Católica', 'PUC', 'contacto@uc.cl', true)
ON CONFLICT (codigo) DO NOTHING;

-- 4. Insertar alumnos de ejemplo
INSERT INTO alumnos (rut, nombres, apellidos, email, centro_formador_id, carrera, nivel, activo)
SELECT 
  '20111222-3', 'Pedro', 'Ramírez', 'pedro.ramirez@estudiante.cl',
  (SELECT id FROM centros_formadores WHERE codigo = 'UCH' LIMIT 1),
  'Medicina', '5to año', true
WHERE NOT EXISTS (SELECT 1 FROM alumnos WHERE rut = '20111222-3');

INSERT INTO alumnos (rut, nombres, apellidos, email, centro_formador_id, carrera, nivel, activo)
SELECT 
  '20222333-4', 'Laura', 'Silva', 'laura.silva@estudiante.cl',
  (SELECT id FROM centros_formadores WHERE codigo = 'USACH' LIMIT 1),
  'Enfermería', '4to año', true
WHERE NOT EXISTS (SELECT 1 FROM alumnos WHERE rut = '20222333-4');

INSERT INTO alumnos (rut, nombres, apellidos, email, centro_formador_id, carrera, nivel, activo)
SELECT 
  '20333444-5', 'Diego', 'Torres', 'diego.torres@estudiante.cl',
  (SELECT id FROM centros_formadores WHERE codigo = 'PUC' LIMIT 1),
  'Medicina', 'Internado', true
WHERE NOT EXISTS (SELECT 1 FROM alumnos WHERE rut = '20333444-5');

INSERT INTO alumnos (rut, nombres, apellidos, email, centro_formador_id, carrera, nivel, activo)
SELECT 
  '20444555-6', 'Camila', 'Rojas', 'camila.rojas@estudiante.cl',
  (SELECT id FROM centros_formadores WHERE codigo = 'UCH' LIMIT 1),
  'Kinesiología', '3er año', true
WHERE NOT EXISTS (SELECT 1 FROM alumnos WHERE rut = '20444555-6');

-- 5. Crear rotaciones activas (fechas dinámicas: hoy ± 30 días)
INSERT INTO rotaciones (
  alumno_id, 
  servicio_id, 
  tutor_id, 
  fecha_inicio, 
  fecha_termino, 
  estado, 
  horas_semanales
)
SELECT 
  (SELECT id FROM alumnos WHERE rut = '20111222-3'),
  (SELECT id FROM servicios_clinicos WHERE codigo = 'MED-INT'),
  (SELECT id FROM tutores WHERE rut = '12345678-9'),
  CURRENT_DATE - INTERVAL '15 days',
  CURRENT_DATE + INTERVAL '15 days',
  'en_curso',
  40
WHERE NOT EXISTS (
  SELECT 1 FROM rotaciones 
  WHERE alumno_id = (SELECT id FROM alumnos WHERE rut = '20111222-3')
  AND estado = 'en_curso'
);

INSERT INTO rotaciones (
  alumno_id, 
  servicio_id, 
  tutor_id, 
  fecha_inicio, 
  fecha_termino, 
  estado, 
  horas_semanales
)
SELECT 
  (SELECT id FROM alumnos WHERE rut = '20222333-4'),
  (SELECT id FROM servicios_clinicos WHERE codigo = 'CIR'),
  (SELECT id FROM tutores WHERE rut = '98765432-1'),
  CURRENT_DATE - INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '20 days',
  'en_curso',
  40
WHERE NOT EXISTS (
  SELECT 1 FROM rotaciones 
  WHERE alumno_id = (SELECT id FROM alumnos WHERE rut = '20222333-4')
  AND estado = 'en_curso'
);

INSERT INTO rotaciones (
  alumno_id, 
  servicio_id, 
  tutor_id, 
  fecha_inicio, 
  fecha_termino, 
  estado, 
  horas_semanales
)
SELECT 
  (SELECT id FROM alumnos WHERE rut = '20333444-5'),
  (SELECT id FROM servicios_clinicos WHERE codigo = 'PED'),
  (SELECT id FROM tutores WHERE rut = '11223344-5'),
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '25 days',
  'en_curso',
  40
WHERE NOT EXISTS (
  SELECT 1 FROM rotaciones 
  WHERE alumno_id = (SELECT id FROM alumnos WHERE rut = '20333444-5')
  AND estado = 'en_curso'
);

INSERT INTO rotaciones (
  alumno_id, 
  servicio_id, 
  tutor_id, 
  fecha_inicio, 
  fecha_termino, 
  estado, 
  horas_semanales
)
SELECT 
  (SELECT id FROM alumnos WHERE rut = '20444555-6'),
  (SELECT id FROM servicios_clinicos WHERE codigo = 'URG'),
  (SELECT id FROM tutores WHERE rut = '55667788-9'),
  CURRENT_DATE - INTERVAL '20 days',
  CURRENT_DATE + INTERVAL '10 days',
  'en_curso',
  40
WHERE NOT EXISTS (
  SELECT 1 FROM rotaciones 
  WHERE alumno_id = (SELECT id FROM alumnos WHERE rut = '20444555-6')
  AND estado = 'en_curso'
);

-- 6. Insertar algunas asistencias de ejemplo (últimos 3 días)
INSERT INTO asistencias (rotacion_id, fecha, tipo, presente, horas_trabajadas)
SELECT 
  r.id,
  CURRENT_DATE - INTERVAL '1 day',
  'alumno',
  true,
  8
FROM rotaciones r
WHERE r.estado = 'en_curso'
ON CONFLICT (rotacion_id, fecha, tipo) DO NOTHING;

INSERT INTO asistencias (rotacion_id, fecha, tipo, presente, horas_trabajadas)
SELECT 
  r.id,
  CURRENT_DATE - INTERVAL '1 day',
  'tutor',
  true,
  8
FROM rotaciones r
WHERE r.estado = 'en_curso'
ON CONFLICT (rotacion_id, fecha, tipo) DO NOTHING;

-- Verificar datos creados
SELECT 'Servicios Clínicos' as tabla, COUNT(*) as total FROM servicios_clinicos
UNION ALL
SELECT 'Tutores', COUNT(*) FROM tutores
UNION ALL
SELECT 'Centros Formadores', COUNT(*) FROM centros_formadores
UNION ALL
SELECT 'Alumnos', COUNT(*) FROM alumnos
UNION ALL
SELECT 'Rotaciones Activas', COUNT(*) FROM rotaciones WHERE estado = 'en_curso'
UNION ALL
SELECT 'Asistencias', COUNT(*) FROM asistencias;
