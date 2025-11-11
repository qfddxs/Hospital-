-- Script con datos de ejemplo para demostración
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- LIMPIAR DATOS EXISTENTES (OPCIONAL)
-- ============================================
-- DELETE FROM solicitudes_cupos;
-- DELETE FROM usuarios_centros;
-- DELETE FROM centros_formadores;

-- ============================================
-- CENTROS FORMADORES DE EJEMPLO
-- ============================================

-- Universidad de Chile (Pregrado)
INSERT INTO centros_formadores (
  id,
  nombre,
  codigo,
  direccion,
  telefono,
  email,
  contacto_nombre,
  contacto_cargo,
  nivel_formacion,
  especialidades,
  capacidad_total,
  capacidad_disponible,
  activo
) VALUES (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'Universidad de Chile',
  'UCH',
  'Av. Independencia 1027, Santiago',
  '+56 2 2978 6000',
  'campos.clinicos@uchile.cl',
  'Dr. Carlos Rodríguez',
  'Coordinador de Campos Clínicos',
  'pregrado',
  ARRAY['Enfermería', 'Medicina', 'Kinesiología', 'Nutrición', 'Obstetricia'],
  150,
  120,
  true
);

-- Instituto Profesional INACAP (Pregrado)
INSERT INTO centros_formadores (
  id,
  nombre,
  codigo,
  direccion,
  telefono,
  email,
  contacto_nombre,
  contacto_cargo,
  nivel_formacion,
  especialidades,
  capacidad_total,
  capacidad_disponible,
  activo
) VALUES (
  'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
  'Instituto Profesional INACAP',
  'INACAP',
  'La Serena, Región de Coquimbo',
  '+56 51 242 0000',
  'juan.perez@inacap.cl',
  'Juan Pérez González',
  'Coordinador de Campos Clínicos',
  'pregrado',
  ARRAY['Enfermería', 'Técnico de Nivel Superior en Enfermería'],
  80,
  65,
  true
);

-- Universidad de Santiago (Pregrado)
INSERT INTO centros_formadores (
  id,
  nombre,
  codigo,
  direccion,
  telefono,
  email,
  contacto_nombre,
  contacto_cargo,
  nivel_formacion,
  especialidades,
  capacidad_total,
  capacidad_disponible,
  activo
) VALUES (
  'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f',
  'Universidad de Santiago de Chile',
  'USACH',
  'Av. Libertador Bernardo O''Higgins 3363, Santiago',
  '+56 2 2718 0001',
  'coordinacion@usach.cl',
  'Dra. María González',
  'Coordinadora de Prácticas Clínicas',
  'pregrado',
  ARRAY['Enfermería', 'Tecnología Médica', 'Terapia Ocupacional'],
  100,
  85,
  true
);

-- Universidad Católica (Postgrado)
INSERT INTO centros_formadores (
  id,
  nombre,
  codigo,
  direccion,
  telefono,
  email,
  contacto_nombre,
  contacto_cargo,
  nivel_formacion,
  especialidades,
  capacidad_total,
  capacidad_disponible,
  activo
) VALUES (
  'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a',
  'Pontificia Universidad Católica de Chile',
  'UC-POST',
  'Av. Libertador Bernardo O''Higgins 340, Santiago',
  '+56 2 2354 2000',
  'postgrado@uc.cl',
  'Dr. Roberto Silva',
  'Director de Postgrado',
  'postgrado',
  ARRAY['Medicina - Especialización', 'Medicina Familiar', 'Pediatría', 'Cirugía'],
  50,
  40,
  true
);

-- Universidad de Concepción (Postgrado)
INSERT INTO centros_formadores (
  id,
  nombre,
  codigo,
  direccion,
  telefono,
  email,
  contacto_nombre,
  contacto_cargo,
  nivel_formacion,
  especialidades,
  capacidad_total,
  capacidad_disponible,
  activo
) VALUES (
  'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b',
  'Universidad de Concepción',
  'UDEC-POST',
  'Víctor Lamas 1290, Concepción',
  '+56 41 220 4000',
  'especialidades@udec.cl',
  'Dra. Patricia Morales',
  'Coordinadora de Especialidades Médicas',
  'postgrado',
  ARRAY['Medicina Interna', 'Ginecología y Obstetricia', 'Enfermería en Cuidados Críticos'],
  40,
  35,
  true
);

-- ============================================
-- SOLICITUDES DE CUPOS DE EJEMPLO
-- ============================================

-- Solicitud 1: Universidad de Chile - Enfermería (APROBADA)
INSERT INTO solicitudes_cupos (
  id,
  centro_formador_id,
  especialidad,
  numero_cupos,
  fecha_inicio,
  fecha_termino,
  fecha_solicitud,
  solicitante,
  comentarios,
  estado,
  motivo_rechazo,
  created_at
) VALUES (
  'f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c',
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'Enfermería',
  10,
  '2025-03-01',
  '2025-06-30',
  '2025-01-15',
  'Dr. Carlos Rodríguez',
  'Estudiantes de 4to año requieren rotación en servicios de medicina interna y urgencias.',
  'aprobada',
  NULL,
  '2025-01-15 10:30:00'
);

-- Solicitud 2: INACAP - TNS Enfermería (PENDIENTE)
INSERT INTO solicitudes_cupos (
  id,
  centro_formador_id,
  especialidad,
  numero_cupos,
  fecha_inicio,
  fecha_termino,
  fecha_solicitud,
  solicitante,
  comentarios,
  estado,
  motivo_rechazo,
  created_at
) VALUES (
  'a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d',
  'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
  'Técnico de Nivel Superior en Enfermería',
  5,
  '2025-04-01',
  '2025-07-31',
  '2025-01-20',
  'Juan Pérez González',
  'Alumnos de 2do año necesitan práctica en servicios básicos de enfermería.',
  'pendiente',
  NULL,
  '2025-01-20 14:15:00'
);

-- Solicitud 3: Universidad de Chile - Medicina (PENDIENTE)
INSERT INTO solicitudes_cupos (
  id,
  centro_formador_id,
  especialidad,
  numero_cupos,
  fecha_inicio,
  fecha_termino,
  fecha_solicitud,
  solicitante,
  comentarios,
  estado,
  motivo_rechazo,
  created_at
) VALUES (
  'b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e',
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'Medicina',
  15,
  '2025-03-15',
  '2025-08-15',
  '2025-01-22',
  'Dr. Carlos Rodríguez',
  'Internos de medicina requieren rotación completa en servicios clínicos.',
  'pendiente',
  NULL,
  '2025-01-22 09:00:00'
);

-- Solicitud 4: USACH - Kinesiología (RECHAZADA)
INSERT INTO solicitudes_cupos (
  id,
  centro_formador_id,
  especialidad,
  numero_cupos,
  fecha_inicio,
  fecha_termino,
  fecha_solicitud,
  solicitante,
  comentarios,
  estado,
  motivo_rechazo,
  created_at
) VALUES (
  'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f',
  'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f',
  'Kinesiología',
  8,
  '2025-02-01',
  '2025-05-31',
  '2025-01-10',
  'Dra. María González',
  'Estudiantes requieren práctica en rehabilitación física.',
  'rechazada',
  'No hay disponibilidad de cupos en el servicio de kinesiología para el período solicitado. Sugerimos solicitar para el segundo semestre.',
  '2025-01-10 11:45:00'
);

-- Solicitud 5: UC Postgrado - Pediatría (APROBADA)
INSERT INTO solicitudes_cupos (
  id,
  centro_formador_id,
  especialidad,
  numero_cupos,
  fecha_inicio,
  fecha_termino,
  fecha_solicitud,
  solicitante,
  comentarios,
  estado,
  motivo_rechazo,
  created_at
) VALUES (
  'd0e1f2a3-b4c5-4d5e-7f8a-9b0c1d2e3f4a',
  'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a',
  'Pediatría',
  3,
  '2025-03-01',
  '2025-12-31',
  '2025-01-18',
  'Dr. Roberto Silva',
  'Médicos en formación de especialidad de pediatría. Rotación anual.',
  'aprobada',
  NULL,
  '2025-01-18 16:20:00'
);

-- Solicitud 6: UDEC Postgrado - Medicina Interna (PENDIENTE)
INSERT INTO solicitudes_cupos (
  id,
  centro_formador_id,
  especialidad,
  numero_cupos,
  fecha_inicio,
  fecha_termino,
  fecha_solicitud,
  solicitante,
  comentarios,
  estado,
  motivo_rechazo,
  created_at
) VALUES (
  'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b',
  'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b',
  'Medicina Interna',
  4,
  '2025-04-01',
  '2025-12-31',
  '2025-01-25',
  'Dra. Patricia Morales',
  'Residentes de medicina interna para rotación en servicios de hospitalización.',
  'pendiente',
  NULL,
  '2025-01-25 13:30:00'
);

-- Solicitud 7: INACAP - Enfermería (APROBADA)
INSERT INTO solicitudes_cupos (
  id,
  centro_formador_id,
  especialidad,
  numero_cupos,
  fecha_inicio,
  fecha_termino,
  fecha_solicitud,
  solicitante,
  comentarios,
  estado,
  motivo_rechazo,
  created_at
) VALUES (
  'f2a3b4c5-d6e7-4f5a-9b0c-1d2e3f4a5b6c',
  'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
  'Enfermería',
  6,
  '2025-05-01',
  '2025-08-31',
  '2025-01-28',
  'Juan Pérez González',
  'Estudiantes de enfermería para práctica en servicios de hospitalización.',
  'aprobada',
  NULL,
  '2025-01-28 10:00:00'
);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver centros formadores creados
SELECT 
  nombre,
  codigo,
  nivel_formacion,
  array_length(especialidades, 1) as num_especialidades,
  capacidad_total,
  activo
FROM centros_formadores
ORDER BY nivel_formacion, nombre;

-- Ver solicitudes creadas
SELECT 
  cf.nombre as centro,
  sc.especialidad,
  sc.numero_cupos,
  sc.fecha_inicio,
  sc.fecha_termino,
  sc.estado,
  sc.fecha_solicitud
FROM solicitudes_cupos sc
JOIN centros_formadores cf ON sc.centro_formador_id = cf.id
ORDER BY sc.fecha_solicitud DESC;

-- Estadísticas
SELECT 
  estado,
  COUNT(*) as cantidad,
  SUM(numero_cupos) as total_cupos
FROM solicitudes_cupos
GROUP BY estado
ORDER BY estado;
