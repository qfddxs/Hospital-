-- ============================================
-- DATOS DE EJEMPLO PARA GESTIÓN DOCUMENTAL
-- ============================================

-- Insertar documentos de ejemplo
INSERT INTO documentos (
    titulo,
    descripcion,
    tipo,
    categoria,
    version,
    fecha_vigencia,
    fecha_vencimiento,
    tags,
    estado,
    visibilidad
) VALUES
-- Convenios
(
    'Convenio Marco Universidad de Chile',
    'Convenio de colaboración para prácticas clínicas con la Universidad de Chile, Facultad de Medicina',
    'convenio',
    'Convenios',
    '1.0',
    '2024-01-01',
    '2025-12-31',
    ARRAY['convenio', 'universidad', 'medicina', 'vigente'],
    'vigente',
    'publico'
),
(
    'Convenio Específico Pediatría - U. Católica',
    'Convenio específico para rotaciones de pediatría con estudiantes de la Universidad Católica',
    'convenio',
    'Convenios',
    '2.1',
    '2024-03-01',
    '2025-02-28',
    ARRAY['convenio', 'pediatria', 'universidad-catolica'],
    'vigente',
    'publico'
),

-- Protocolos
(
    'Protocolo de Asistencia Estudiantil',
    'Protocolo para el registro y control de asistencia de estudiantes en rotaciones clínicas',
    'protocolo',
    'Protocolos',
    '3.0',
    '2024-01-15',
    NULL,
    ARRAY['protocolo', 'asistencia', 'estudiantes', 'obligatorio'],
    'vigente',
    'publico'
),
(
    'Protocolo de Evaluación de Desempeño',
    'Lineamientos para la evaluación de desempeño de estudiantes durante las rotaciones',
    'protocolo',
    'Protocolos',
    '2.5',
    '2023-09-01',
    NULL,
    ARRAY['protocolo', 'evaluacion', 'desempeño'],
    'vigente',
    'restringido'
),
(
    'Protocolo de Seguridad en Áreas Clínicas',
    'Normas de seguridad y bioseguridad para estudiantes en áreas clínicas',
    'protocolo',
    'Protocolos',
    '1.8',
    '2023-06-01',
    '2024-05-31',
    ARRAY['protocolo', 'seguridad', 'bioseguridad', 'urgente'],
    'vencido',
    'publico'
),

-- Normativas
(
    'Reglamento de Campos Clínicos 2024',
    'Reglamento general para la gestión de campos clínicos y rotaciones de estudiantes',
    'normativa',
    'Normativas',
    '4.0',
    '2024-01-01',
    '2024-12-31',
    ARRAY['normativa', 'reglamento', 'campos-clinicos', '2024'],
    'vigente',
    'publico'
),
(
    'Normativa de Retribuciones Económicas',
    'Normativa para el cálculo y pago de retribuciones a centros formadores',
    'normativa',
    'Normativas',
    '2.0',
    '2024-01-01',
    NULL,
    ARRAY['normativa', 'retribuciones', 'pagos', 'financiero'],
    'vigente',
    'privado'
),
(
    'Código de Ética para Estudiantes',
    'Código de ética y conducta profesional para estudiantes en rotación',
    'normativa',
    'Normativas',
    '1.0',
    '2023-01-01',
    NULL,
    ARRAY['normativa', 'etica', 'conducta', 'estudiantes'],
    'vigente',
    'publico'
),

-- Evaluaciones
(
    'Formato de Evaluación Mensual',
    'Formato estándar para evaluación mensual de estudiantes por tutores clínicos',
    'otro',
    'Evaluaciones',
    '1.5',
    '2024-01-01',
    NULL,
    ARRAY['evaluacion', 'formato', 'mensual', 'tutores'],
    'vigente',
    'publico'
),
(
    'Rúbrica de Evaluación Final',
    'Rúbrica para evaluación final de rotación con criterios específicos por especialidad',
    'otro',
    'Evaluaciones',
    '2.0',
    '2024-02-01',
    NULL,
    ARRAY['evaluacion', 'rubrica', 'final', 'especialidades'],
    'vigente',
    'publico'
),

-- Reportes
(
    'Reporte Anual 2023 - Campos Clínicos',
    'Reporte estadístico anual de gestión de campos clínicos y rotaciones año 2023',
    'otro',
    'Reportes',
    '1.0',
    '2024-01-15',
    NULL,
    ARRAY['reporte', 'estadisticas', '2023', 'anual'],
    'vigente',
    'restringido'
),
(
    'Informe Trimestral Q1 2024',
    'Informe de gestión primer trimestre 2024 - Indicadores y métricas',
    'otro',
    'Reportes',
    '1.0',
    '2024-04-01',
    NULL,
    ARRAY['reporte', 'trimestral', 'q1', '2024', 'indicadores'],
    'vigente',
    'privado'
),

-- Contratos
(
    'Contrato Tutor Clínico - Dr. Juan Pérez',
    'Contrato de prestación de servicios como tutor clínico',
    'otro',
    'Contratos',
    '1.0',
    '2024-01-01',
    '2024-12-31',
    ARRAY['contrato', 'tutor', 'servicios'],
    'vigente',
    'privado'
),

-- Documentos próximos a vencer (para probar alertas)
(
    'Convenio Temporal - Centro Formador B',
    'Convenio temporal que vence pronto, requiere renovación',
    'convenio',
    'Convenios',
    '1.0',
    '2024-01-01',
    CURRENT_DATE + INTERVAL '15 days',
    ARRAY['convenio', 'temporal', 'renovacion-pendiente'],
    'vigente',
    'publico'
),
(
    'Protocolo de Emergencias COVID-19',
    'Protocolo específico para manejo de emergencias relacionadas con COVID-19',
    'protocolo',
    'Protocolos',
    '3.2',
    '2023-01-01',
    CURRENT_DATE + INTERVAL '25 days',
    ARRAY['protocolo', 'emergencias', 'covid', 'temporal'],
    'vigente',
    'publico'
);

-- Insertar historial de ejemplo para algunos documentos
INSERT INTO documentos_historial (documento_id, accion, detalles, usuario_email, usuario_nombre)
SELECT 
    id,
    'creado',
    'Documento creado: ' || titulo,
    'admin@hospital.cl',
    'Administrador Sistema'
FROM documentos
WHERE titulo IN ('Convenio Marco Universidad de Chile', 'Protocolo de Asistencia Estudiantil', 'Reglamento de Campos Clínicos 2024');

-- Simular algunas descargas
INSERT INTO documentos_historial (documento_id, accion, detalles, usuario_email, usuario_nombre, created_at)
SELECT 
    id,
    'descargado',
    'Documento descargado',
    'usuario@hospital.cl',
    'Usuario Test',
    NOW() - INTERVAL '5 days'
FROM documentos
WHERE tipo = 'protocolo'
LIMIT 3;

-- Simular algunas visualizaciones
INSERT INTO documentos_historial (documento_id, accion, detalles, usuario_email, usuario_nombre, created_at)
SELECT 
    id,
    'visto',
    'Documento visualizado',
    'jefe.docencia@hospital.cl',
    'Jefe de Docencia',
    NOW() - INTERVAL '2 days'
FROM documentos
WHERE categoria = 'Normativas'
LIMIT 2;

-- Insertar permisos de ejemplo
INSERT INTO documentos_permisos (documento_id, usuario_email, rol, puede_ver, puede_descargar, puede_editar, puede_eliminar)
SELECT 
    id,
    'admin@hospital.cl',
    'admin',
    true,
    true,
    true,
    true
FROM documentos
WHERE visibilidad = 'privado';

-- Verificar datos insertados
SELECT 
    'Total documentos insertados' as descripcion,
    COUNT(*) as cantidad
FROM documentos
UNION ALL
SELECT 
    'Documentos vigentes',
    COUNT(*)
FROM documentos
WHERE estado = 'vigente'
UNION ALL
SELECT 
    'Documentos vencidos',
    COUNT(*)
FROM documentos
WHERE estado = 'vencido'
UNION ALL
SELECT 
    'Documentos próximos a vencer (30 días)',
    COUNT(*)
FROM documentos
WHERE fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
UNION ALL
SELECT 
    'Registros en historial',
    COUNT(*)
FROM documentos_historial;

-- Mostrar documentos por categoría
SELECT 
    categoria,
    COUNT(*) as cantidad,
    COUNT(*) FILTER (WHERE estado = 'vigente') as vigentes,
    COUNT(*) FILTER (WHERE estado = 'vencido') as vencidos
FROM documentos
GROUP BY categoria
ORDER BY cantidad DESC;

-- Mostrar documentos próximos a vencer
SELECT 
    titulo,
    categoria,
    fecha_vencimiento,
    fecha_vencimiento - CURRENT_DATE as dias_restantes
FROM documentos
WHERE fecha_vencimiento IS NOT NULL
AND fecha_vencimiento >= CURRENT_DATE
ORDER BY fecha_vencimiento;
