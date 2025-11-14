-- ============================================
-- HABILITAR REALTIME EN SUPABASE
-- ============================================

-- Habilitar Realtime para la tabla solicitudes_cupos
ALTER PUBLICATION supabase_realtime ADD TABLE solicitudes_cupos;

-- Verificar que está habilitado
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Comentario
COMMENT ON TABLE solicitudes_cupos IS 'Tabla con Realtime habilitado para actualizaciones en tiempo real';
