-- ============================================
-- DATOS DE EJEMPLO
-- Sistema de Gestión de Campos Clínicos
-- ============================================

-- ============================================
-- CATEGORÍAS DE DOCUMENTOS
-- ============================================

INSERT INTO documentos_categorias (nombre, descripcion, icono, color) VALUES
('Convenios', 'Convenios con centros formadores', 'DocumentTextIcon', 'blue'),
('Protocolos', 'Protocolos clínicos y procedimientos', 'ClipboardDocumentListIcon', 'teal'),
('Normativas', 'Normativas y reglamentos', 'ChartBarIcon', 'green'),
('Evaluaciones', 'Documentos de evaluación', 'AcademicCapIcon', 'purple'),
('Asistencia', 'Registros de asistencia', 'ClockIcon', 'orange'),
('Contratos', 'Contratos y acuerdos', 'DocumentCheckIcon', 'red'),
('Reportes', 'Reportes y estadísticas', 'DocumentChartBarIcon', 'indigo'),
('Otros', 'Otros documentos', 'FolderIcon', 'gray')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- CENTROS FORMADORES
-- ============================================

INSERT INTO centros_formadores (nombre, codigo, email, direccion, telefono, capacidad_total, capacidad_disponible, especialidades) VALUES
('Universidad de Chile', 'UCH', 'contacto@uchile.cl', 'Av. Independencia 1027, Santiago', '+56 2 2978 6000', 50, 20, ARRAY['Medicina', 'Enfermería', 'Kinesiología']),
('Pontificia Universidad Católica', 'PUC', 'contacto@uc.cl', 'Av. Libertador Bernardo O''Higgins 340, Santiago', '+56 2 2354 4000', 45, 15, ARRAY['Medicina', 'Enfermería', 'Nutrición']),
('Universidad de Santiago', 'USACH', 'contacto@usach.cl', 'Av. Libertador Bernardo O''Higgins 3363, Santiago', '+56 2 2718 0001', 30, 10, ARRAY['Enfermería', 'Tecnología Médica']),
('Universidad Andrés Bello', 'UNAB', 'contacto@unab.cl', 'Av. República 252, Santiago', '+56 2 2770 3000', 40, 18, ARRAY['Medicina', 'Enfermería', 'Kinesiología', 'Nutrición'])
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- SERVICIOS CLÍNICOS
-- ============================================

INSERT INTO servicios_clinicos (nombre, codigo, descripcion, capacidad_maxima, jefe_servicio, ubicacion) VALUES
('Medicina Interna', 'MED-INT', 'Servicio de Medicina Interna', 10, 'Dr. Juan Pérez', 'Piso 3, Ala Norte'),
('Cirugía', 'CIR', 'Servicio de Cirugía General', 8, 'Dr. María González', 'Piso 4, Ala Sur'),
('Pediatría', 'PED', 'Servicio de Pediatría', 12, 'Dra. Ana Martínez', 'Piso 2, Ala Este'),
('Urgencias', 'URG', 'Servicio de Urgencias', 15, 'Dr. Carlos Rodríguez', 'Piso 1'),
('Ginecología y Obstetricia', 'GINEOBS', 'Servicio de Ginecología y Obstetricia', 10, 'Dra. Laura Fernández', 'Piso 3, Ala Sur'),
('Traumatología', 'TRAUMA', 'Servicio de Traumatología', 8, 'Dr. Roberto Silva', 'Piso 2, Ala Oeste'),
('Cardiología', 'CARDIO', 'Servicio de Cardiología', 6, 'Dr. Fernando López', 'Piso 4, Ala Norte'),
('Neurología', 'NEURO', 'Servicio de Neurología', 6, 'Dra. Patricia Morales', 'Piso 3, Ala Oeste')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- TUTORES CLÍNICOS
-- ============================================

INSERT INTO tutores (rut, nombres, apellidos, email, telefono, especialidad, tarifa_hora) VALUES
('12345678-9', 'Juan', 'Pérez González', 'juan.perez@hospital.cl', '+56 9 8765 4321', 'Medicina Interna', 15000),
('23456789-0', 'María', 'González López', 'maria.gonzalez@hospital.cl', '+56 9 7654 3210', 'Cirugía General', 18000),
('34567890-1', 'Ana', 'Martínez Silva', 'ana.martinez@hospital.cl', '+56 9 6543 2109', 'Pediatría', 16000),
('45678901-2', 'Carlos', 'Rodríguez Díaz', 'carlos.rodriguez@hospital.cl', '+56 9 5432 1098', 'Medicina de Urgencia', 17000),
('56789012-3', 'Laura', 'Fernández Castro', 'laura.fernandez@hospital.cl', '+56 9 4321 0987', 'Ginecología', 16500),
('67890123-4', 'Roberto', 'Silva Muñoz', 'roberto.silva@hospital.cl', '+56 9 3210 9876', 'Traumatología', 17500),
('78901234-5', 'Fernando', 'López Vargas', 'fernando.lopez@hospital.cl', '+56 9 2109 8765', 'Cardiología', 19000),
('89012345-6', 'Patricia', 'Morales Rojas', 'patricia.morales@hospital.cl', '+56 9 1098 7654', 'Neurología', 18500)
ON CONFLICT (rut) DO NOTHING;

-- Actualizar servicio_id de tutores (requiere que los servicios ya existan)
UPDATE tutores SET servicio_id = (SELECT id FROM servicios_clinicos WHERE codigo = 'MED-INT') WHERE rut = '12345678-9';
UPDATE tutores SET servicio_id = (SELECT id FROM servicios_clinicos WHERE codigo = 'CIR') WHERE rut = '23456789-0';
UPDATE tutores SET servicio_id = (SELECT id FROM servicios_clinicos WHERE codigo = 'PED') WHERE rut = '34567890-1';
UPDATE tutores SET servicio_id = (SELECT id FROM servicios_clinicos WHERE codigo = 'URG') WHERE rut = '45678901-2';
UPDATE tutores SET servicio_id = (SELECT id FROM servicios_clinicos WHERE codigo = 'GINEOBS') WHERE rut = '56789012-3';
UPDATE tutores SET servicio_id = (SELECT id FROM servicios_clinicos WHERE codigo = 'TRAUMA') WHERE rut = '67890123-4';
UPDATE tutores SET servicio_id = (SELECT id FROM servicios_clinicos WHERE codigo = 'CARDIO') WHERE rut = '78901234-5';
UPDATE tutores SET servicio_id = (SELECT id FROM servicios_clinicos WHERE codigo = 'NEURO') WHERE rut = '89012345-6';

-- ============================================
-- ALUMNOS
-- ============================================

INSERT INTO alumnos (rut, nombres, apellidos, email, telefono, carrera, nivel, fecha_ingreso) VALUES
('19876543-2', 'Sofía', 'Ramírez Torres', 'sofia.ramirez@estudiante.cl', '+56 9 8888 7777', 'Medicina', '5to año', '2025-03-01'),
('20987654-3', 'Diego', 'Hernández Vega', 'diego.hernandez@estudiante.cl', '+56 9 7777 6666', 'Enfermería', '4to año', '2025-03-01'),
('21098765-4', 'Valentina', 'Castro Núñez', 'valentina.castro@estudiante.cl', '+56 9 6666 5555', 'Kinesiología', '3er año', '2025-03-15'),
('22109876-5', 'Matías', 'Soto Parra', 'matias.soto@estudiante.cl', '+56 9 5555 4444', 'Medicina', 'Internado', '2025-01-15'),
('23210987-6', 'Isidora', 'Fuentes Bravo', 'isidora.fuentes@estudiante.cl', '+56 9 4444 3333', 'Enfermería', '3er año', '2025-03-01'),
('24321098-7', 'Benjamín', 'Reyes Cortés', 'benjamin.reyes@estudiante.cl', '+56 9 3333 2222', 'Nutrición', '4to año', '2025-03-15'),
('25432109-8', 'Martina', 'Gutiérrez Flores', 'martina.gutierrez@estudiante.cl', '+56 9 2222 1111', 'Tecnología Médica', '3er año', '2025-04-01'),
('26543210-9', 'Lucas', 'Muñoz Sandoval', 'lucas.munoz@estudiante.cl', '+56 9 1111 0000', 'Medicina', '4to año', '2025-03-01')
ON CONFLICT (rut) DO NOTHING;

-- Actualizar centro_formador_id de alumnos
UPDATE alumnos SET centro_formador_id = (SELECT id FROM centros_formadores WHERE codigo = 'UCH') WHERE rut IN ('19876543-2', '22109876-5');
UPDATE alumnos SET centro_formador_id = (SELECT id FROM centros_formadores WHERE codigo = 'PUC') WHERE rut IN ('20987654-3', '23210987-6');
UPDATE alumnos SET centro_formador_id = (SELECT id FROM centros_formadores WHERE codigo = 'USACH') WHERE rut IN ('21098765-4', '25432109-8');
UPDATE alumnos SET centro_formador_id = (SELECT id FROM centros_formadores WHERE codigo = 'UNAB') WHERE rut IN ('24321098-7', '26543210-9');

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Para crear rotaciones, asistencias y retribuciones, 
-- es necesario tener los IDs de alumnos, servicios y tutores.
-- Estos datos se pueden agregar posteriormente según las necesidades específicas.
