-- ============================================
-- DATOS DE PRUEBA PARA PORTAL DE ROTACIONES
-- ============================================
-- Ejecuta este SQL DESPUÉS de crear las tablas y el usuario administrador

-- NOTA: Estos son datos de ejemplo. Ajusta según tu base de datos real.

-- Ejemplo: Insertar una solicitud de prueba (si no tienes ninguna)
-- Reemplaza 'CENTRO_FORMADOR_UUID' con un UUID real de tu tabla centros_formadores

/*
INSERT INTO solicitudes_rotacion (
  centro_formador_id,
  especialidad,
  fecha_inicio,
  fecha_termino,
  comentarios,
  estado,
  fecha_solicitud
) VALUES (
  'CENTRO_FORMADOR_UUID',
  'Enfermería',
  '2025-01-15',
  '2025-03-15',
  'Solicitud de rotación para estudiantes de tercer año',
  'pendiente',
  CURRENT_DATE
);
*/

-- Ejemplo: Insertar estudiantes de prueba para una solicitud
-- Reemplaza 'SOLICITUD_UUID' con el UUID de la solicitud que creaste arriba

/*
INSERT INTO estudiantes_rotacion (solicitud_rotacion_id, rut, nombre, apellido, email, telefono, nivel_formacion)
VALUES
  ('SOLICITUD_UUID', '12345678-9', 'Juan', 'Pérez', 'juan.perez@ejemplo.cl', '+56912345678', 'Tercer Año'),
  ('SOLICITUD_UUID', '98765432-1', 'María', 'González', 'maria.gonzalez@ejemplo.cl', '+56987654321', 'Tercer Año'),
  ('SOLICITUD_UUID', '11223344-5', 'Pedro', 'Rodríguez', 'pedro.rodriguez@ejemplo.cl', '+56911223344', 'Tercer Año'),
  ('SOLICITUD_UUID', '55667788-9', 'Ana', 'Martínez', 'ana.martinez@ejemplo.cl', '+56955667788', 'Tercer Año'),
  ('SOLICITUD_UUID', '99887766-5', 'Luis', 'Fernández', 'luis.fernandez@ejemplo.cl', '+56999887766', 'Tercer Año');
*/

-- Verificar que se crearon correctamente
SELECT 
  s.id,
  s.especialidad,
  s.estado,
  cf.nombre as centro_formador,
  COUNT(e.id) as total_estudiantes
FROM solicitudes_rotacion s
LEFT JOIN centros_formadores cf ON s.centro_formador_id = cf.id
LEFT JOIN estudiantes_rotacion e ON e.solicitud_rotacion_id = s.id
GROUP BY s.id, s.especialidad, s.estado, cf.nombre
ORDER BY s.created_at DESC;
