-- ============================================
-- MEJORAS PARA GESTIÓN DOCUMENTAL
-- ============================================

-- Agregar campos adicionales a la tabla documentos
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS tamaño_bytes BIGINT;
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS documento_padre_id UUID REFERENCES documentos(id) ON DELETE SET NULL;
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS es_version BOOLEAN DEFAULT false;
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'vigente'; -- vigente, vencido, archivado
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS visibilidad VARCHAR(50) DEFAULT 'publico'; -- publico, privado, restringido

-- Tabla: Historial de documentos
CREATE TABLE IF NOT EXISTS documentos_historial (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    documento_id UUID REFERENCES documentos(id) ON DELETE CASCADE,
    accion VARCHAR(50) NOT NULL, -- creado, modificado, eliminado, descargado, visto
    usuario_email VARCHAR(100),
    usuario_nombre VARCHAR(255),
    detalles TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Categorías de documentos
CREATE TABLE IF NOT EXISTS documentos_categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    color VARCHAR(20),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Permisos de documentos
CREATE TABLE IF NOT EXISTS documentos_permisos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    documento_id UUID REFERENCES documentos(id) ON DELETE CASCADE,
    usuario_email VARCHAR(100),
    rol VARCHAR(50),
    puede_ver BOOLEAN DEFAULT true,
    puede_descargar BOOLEAN DEFAULT true,
    puede_editar BOOLEAN DEFAULT false,
    puede_eliminar BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(documento_id, usuario_email)
);

-- Índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos(tipo);
CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON documentos(categoria);
CREATE INDEX IF NOT EXISTS idx_documentos_estado ON documentos(estado);
CREATE INDEX IF NOT EXISTS idx_documentos_tags ON documentos USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documentos_historial_documento ON documentos_historial(documento_id);
CREATE INDEX IF NOT EXISTS idx_documentos_historial_fecha ON documentos_historial(created_at);

-- Función para registrar acciones en el historial
CREATE OR REPLACE FUNCTION registrar_accion_documento()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO documentos_historial (documento_id, accion, detalles)
        VALUES (NEW.id, 'creado', 'Documento creado: ' || NEW.titulo);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO documentos_historial (documento_id, accion, detalles)
        VALUES (NEW.id, 'modificado', 'Documento modificado');
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO documentos_historial (documento_id, accion, detalles)
        VALUES (OLD.id, 'eliminado', 'Documento eliminado: ' || OLD.titulo);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para historial automático
DROP TRIGGER IF EXISTS trigger_historial_documentos ON documentos;
CREATE TRIGGER trigger_historial_documentos
AFTER INSERT OR UPDATE OR DELETE ON documentos
FOR EACH ROW EXECUTE FUNCTION registrar_accion_documento();

-- Función para verificar documentos vencidos
CREATE OR REPLACE FUNCTION actualizar_estado_documentos()
RETURNS void AS $$
BEGIN
    UPDATE documentos
    SET estado = 'vencido'
    WHERE fecha_vencimiento IS NOT NULL 
    AND fecha_vencimiento < CURRENT_DATE
    AND estado = 'vigente';
END;
$$ LANGUAGE plpgsql;

-- Insertar categorías predefinidas
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

-- Políticas de seguridad para nuevas tablas
ALTER TABLE documentos_historial ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_permisos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura pública historial" ON documentos_historial FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública categorías" ON documentos_categorias FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública permisos" ON documentos_permisos FOR SELECT USING (true);

CREATE POLICY "Permitir inserción autenticada historial" ON documentos_historial FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Permitir inserción autenticada permisos" ON documentos_permisos FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Vista para documentos con información completa
CREATE OR REPLACE VIEW vista_documentos_completa AS
SELECT 
    d.*,
    dc.nombre as categoria_nombre,
    dc.color as categoria_color,
    dc.icono as categoria_icono,
    COUNT(DISTINCT dh.id) as total_acciones,
    MAX(dh.created_at) as ultima_accion
FROM documentos d
LEFT JOIN documentos_categorias dc ON d.categoria = dc.nombre
LEFT JOIN documentos_historial dh ON d.id = dh.documento_id
GROUP BY d.id, dc.nombre, dc.color, dc.icono;

-- Función para obtener estadísticas de documentos
CREATE OR REPLACE FUNCTION obtener_estadisticas_documentos()
RETURNS TABLE (
    total_documentos BIGINT,
    documentos_vigentes BIGINT,
    documentos_vencidos BIGINT,
    documentos_por_vencer BIGINT,
    total_descargas BIGINT,
    tamaño_total_mb NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_documentos,
        COUNT(*) FILTER (WHERE estado = 'vigente')::BIGINT as documentos_vigentes,
        COUNT(*) FILTER (WHERE estado = 'vencido')::BIGINT as documentos_vencidos,
        COUNT(*) FILTER (WHERE fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days')::BIGINT as documentos_por_vencer,
        (SELECT COUNT(*) FROM documentos_historial WHERE accion = 'descargado')::BIGINT as total_descargas,
        ROUND(COALESCE(SUM(tamaño_bytes), 0) / 1024.0 / 1024.0, 2) as tamaño_total_mb
    FROM documentos;
END;
$$ LANGUAGE plpgsql;
