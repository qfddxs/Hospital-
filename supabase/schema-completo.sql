-- ============================================
-- SISTEMA DE GESTIÓN DE CAMPOS CLÍNICOS
-- Schema Completo y Consolidado
-- Hospital Regional
-- Versión: 2.0
-- Fecha: 2025-11-10
-- ============================================

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Tabla: Centros Formadores (Universidades/Instituciones)
CREATE TABLE IF NOT EXISTS centros_formadores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) UNIQUE,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    contacto_nombre VARCHAR(255),
    contacto_cargo VARCHAR(100),
    capacidad_total INTEGER DEFAULT 0,
    capacidad_disponible INTEGER DEFAULT 0,
    especialidades TEXT[] DEFAULT '{}',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_capacidad_disponible CHECK (capacidad_disponible <= capacidad_total)
);

-- Tabla: Servicios Clínicos (Áreas del hospital)
CREATE TABLE IF NOT EXISTS servicios_clinicos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) UNIQUE,
    descripcion TEXT,
    capacidad_maxima INTEGER NOT NULL DEFAULT 0,
    capacidad_actual INTEGER DEFAULT 0,
    jefe_servicio VARCHAR(255),
    ubicacion VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_capacidad CHECK (capacidad_actual <= capacidad_maxima)
);

-- Tabla: Tutores Clínicos
CREATE TABLE IF NOT EXISTS tutores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rut VARCHAR(12) UNIQUE NOT NULL,
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    especialidad VARCHAR(255),
    servicio_id UUID REFERENCES servicios_clinicos(id) ON DELETE SET NULL,
    tarifa_hora DECIMAL(10, 2) DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Alumnos/Estudiantes
CREATE TABLE IF NOT EXISTS alumnos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rut VARCHAR(12) UNIQUE NOT NULL,
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    centro_formador_id UUID REFERENCES centros_formadores(id) ON DELETE CASCADE,
    carrera VARCHAR(255),
    nivel VARCHAR(50),
    fecha_ingreso DATE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Rotaciones (Asignación de alumnos a servicios)
CREATE TABLE IF NOT EXISTS rotaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
    servicio_id UUID REFERENCES servicios_clinicos(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutores(id) ON DELETE SET NULL,
    fecha_inicio DATE NOT NULL,
    fecha_termino DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'programada',
    horas_semanales INTEGER DEFAULT 40,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_fechas CHECK (fecha_termino >= fecha_inicio),
    CONSTRAINT check_estado_rotacion CHECK (estado IN ('programada', 'en_curso', 'finalizada', 'cancelada'))
);

-- Tabla: Asistencias
CREATE TABLE IF NOT EXISTS asistencias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rotacion_id UUID REFERENCES rotaciones(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    presente BOOLEAN DEFAULT false,
    horas_trabajadas DECIMAL(5, 2) DEFAULT 0,
    observaciones TEXT,
    registrado_por VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rotacion_id, fecha, tipo),
    CONSTRAINT check_tipo_asistencia CHECK (tipo IN ('alumno', 'tutor'))
);

-- Tabla: Retribuciones (Cálculos económicos)
CREATE TABLE IF NOT EXISTS retribuciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rotacion_id UUID REFERENCES rotaciones(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutores(id) ON DELETE CASCADE,
    centro_formador_id UUID REFERENCES centros_formadores(id) ON DELETE CASCADE,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    anio INTEGER NOT NULL,
    total_horas DECIMAL(10, 2) DEFAULT 0,
    tarifa_hora DECIMAL(10, 2) DEFAULT 0,
    monto_total DECIMAL(12, 2) DEFAULT 0,
    estado VARCHAR(50) DEFAULT 'pendiente',
    fecha_calculo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    aprobado_por VARCHAR(255),
    fecha_aprobacion TIMESTAMP WITH TIME ZONE,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rotacion_id, mes, anio),
    CONSTRAINT check_estado_retribucion CHECK (estado IN ('pendiente', 'aprobado', 'pagado'))
);

-- Tabla: Solicitudes de Cupos
CREATE TABLE IF NOT EXISTS solicitudes_cupos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    centro_formador_id UUID REFERENCES centros_formadores(id) ON DELETE CASCADE,
    especialidad VARCHAR(255) NOT NULL,
    numero_cupos INTEGER NOT NULL DEFAULT 1,
    fecha_solicitud DATE DEFAULT CURRENT_DATE,
    fecha_inicio DATE,
    fecha_termino DATE,
    solicitante VARCHAR(255),
    comentarios TEXT,
    estado VARCHAR(50) DEFAULT 'pendiente',
    motivo_rechazo TEXT,
    aprobado_por VARCHAR(255),
    fecha_aprobacion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_numero_cupos CHECK (numero_cupos > 0),
    CONSTRAINT check_estado_solicitud CHECK (estado IN ('pendiente', 'aprobada', 'rechazada'))
);

-- ============================================
-- GESTIÓN DOCUMENTAL
-- ============================================

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

-- Tabla: Documentos (Normativas y protocolos)
CREATE TABLE IF NOT EXISTS documentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50),
    categoria VARCHAR(100),
    archivo_url TEXT,
    archivo_nombre VARCHAR(255),
    version VARCHAR(20),
    fecha_vigencia DATE,
    fecha_vencimiento DATE,
    subido_por VARCHAR(255),
    tags TEXT[],
    tamaño_bytes BIGINT,
    mime_type VARCHAR(100),
    documento_padre_id UUID REFERENCES documentos(id) ON DELETE SET NULL,
    es_version BOOLEAN DEFAULT false,
    estado VARCHAR(50) DEFAULT 'vigente',
    visibilidad VARCHAR(50) DEFAULT 'publico',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_estado_documento CHECK (estado IN ('vigente', 'vencido', 'archivado')),
    CONSTRAINT check_visibilidad CHECK (visibilidad IN ('publico', 'privado', 'restringido'))
);

-- Tabla: Historial de documentos
CREATE TABLE IF NOT EXISTS documentos_historial (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    documento_id UUID REFERENCES documentos(id) ON DELETE CASCADE,
    accion VARCHAR(50) NOT NULL,
    usuario_email VARCHAR(100),
    usuario_nombre VARCHAR(255),
    detalles TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_accion CHECK (accion IN ('creado', 'modificado', 'eliminado', 'descargado', 'visto'))
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

-- ============================================
-- USUARIOS Y AUTENTICACIÓN
-- ============================================

-- Tabla: Usuarios del sistema
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    servicio_id UUID REFERENCES servicios_clinicos(id) ON DELETE SET NULL,
    centro_formador_id UUID REFERENCES centros_formadores(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_rol CHECK (rol IN ('admin', 'encargado_docencia', 'jefe_servicio', 'tutor', 'centro_formador'))
);

-- Tabla: Vinculación de usuarios con centros formadores
CREATE TABLE IF NOT EXISTS usuarios_centros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    centro_formador_id UUID REFERENCES centros_formadores(id) ON DELETE CASCADE,
    rol VARCHAR(50) DEFAULT 'centro_formador',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, centro_formador_id)
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Centros Formadores
CREATE INDEX IF NOT EXISTS idx_centros_activo ON centros_formadores(activo);
CREATE INDEX IF NOT EXISTS idx_centros_codigo ON centros_formadores(codigo);

-- Alumnos
CREATE INDEX IF NOT EXISTS idx_alumnos_centro ON alumnos(centro_formador_id);
CREATE INDEX IF NOT EXISTS idx_alumnos_rut ON alumnos(rut);
CREATE INDEX IF NOT EXISTS idx_alumnos_activo ON alumnos(activo);

-- Tutores
CREATE INDEX IF NOT EXISTS idx_tutores_servicio ON tutores(servicio_id);
CREATE INDEX IF NOT EXISTS idx_tutores_rut ON tutores(rut);
CREATE INDEX IF NOT EXISTS idx_tutores_activo ON tutores(activo);

-- Rotaciones
CREATE INDEX IF NOT EXISTS idx_rotaciones_alumno ON rotaciones(alumno_id);
CREATE INDEX IF NOT EXISTS idx_rotaciones_servicio ON rotaciones(servicio_id);
CREATE INDEX IF NOT EXISTS idx_rotaciones_tutor ON rotaciones(tutor_id);
CREATE INDEX IF NOT EXISTS idx_rotaciones_fechas ON rotaciones(fecha_inicio, fecha_termino);
CREATE INDEX IF NOT EXISTS idx_rotaciones_estado ON rotaciones(estado);

-- Asistencias
CREATE INDEX IF NOT EXISTS idx_asistencias_rotacion ON asistencias(rotacion_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias(fecha);
CREATE INDEX IF NOT EXISTS idx_asistencias_tipo ON asistencias(tipo);

-- Retribuciones
CREATE INDEX IF NOT EXISTS idx_retribuciones_periodo ON retribuciones(mes, anio);
CREATE INDEX IF NOT EXISTS idx_retribuciones_tutor ON retribuciones(tutor_id);
CREATE INDEX IF NOT EXISTS idx_retribuciones_estado ON retribuciones(estado);

-- Solicitudes
CREATE INDEX IF NOT EXISTS idx_solicitudes_centro ON solicitudes_cupos(centro_formador_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_cupos(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_fecha ON solicitudes_cupos(fecha_solicitud);

-- Documentos
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos(tipo);
CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON documentos(categoria);
CREATE INDEX IF NOT EXISTS idx_documentos_estado ON documentos(estado);
CREATE INDEX IF NOT EXISTS idx_documentos_tags ON documentos USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documentos_historial_documento ON documentos_historial(documento_id);
CREATE INDEX IF NOT EXISTS idx_documentos_historial_fecha ON documentos_historial(created_at);

-- Usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_centros_user ON usuarios_centros(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_centros_centro ON usuarios_centros(centro_formador_id);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_centros_formadores_updated_at BEFORE UPDATE ON centros_formadores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_servicios_clinicos_updated_at BEFORE UPDATE ON servicios_clinicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tutores_updated_at BEFORE UPDATE ON tutores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alumnos_updated_at BEFORE UPDATE ON alumnos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rotaciones_updated_at BEFORE UPDATE ON rotaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asistencias_updated_at BEFORE UPDATE ON asistencias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_retribuciones_updated_at BEFORE UPDATE ON retribuciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documentos_updated_at BEFORE UPDATE ON documentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_solicitudes_cupos_updated_at BEFORE UPDATE ON solicitudes_cupos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_centros_updated_at BEFORE UPDATE ON usuarios_centros FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar capacidad actual del servicio
CREATE OR REPLACE FUNCTION actualizar_capacidad_servicio()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE servicios_clinicos 
        SET capacidad_actual = capacidad_actual + 1
        WHERE id = NEW.servicio_id AND NEW.estado = 'en_curso';
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.estado != 'en_curso' AND NEW.estado = 'en_curso' THEN
            UPDATE servicios_clinicos 
            SET capacidad_actual = capacidad_actual + 1
            WHERE id = NEW.servicio_id;
        ELSIF OLD.estado = 'en_curso' AND NEW.estado != 'en_curso' THEN
            UPDATE servicios_clinicos 
            SET capacidad_actual = capacidad_actual - 1
            WHERE id = OLD.servicio_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE servicios_clinicos 
        SET capacidad_actual = capacidad_actual - 1
        WHERE id = OLD.servicio_id AND OLD.estado = 'en_curso';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_capacidad 
AFTER INSERT OR UPDATE OR DELETE ON rotaciones
FOR EACH ROW EXECUTE FUNCTION actualizar_capacidad_servicio();

-- Función para registrar acciones en el historial de documentos
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

-- Función para calcular retribuciones
CREATE OR REPLACE FUNCTION calcular_retribuciones(p_mes INTEGER, p_anio INTEGER)
RETURNS TABLE (
    rotacion_id UUID,
    tutor_id UUID,
    centro_formador_id UUID,
    total_horas DECIMAL,
    tarifa DECIMAL,
    monto DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id as rotacion_id,
        r.tutor_id,
        a.centro_formador_id,
        SUM(ast.horas_trabajadas) as total_horas,
        t.tarifa_hora as tarifa,
        SUM(ast.horas_trabajadas) * t.tarifa_hora as monto
    FROM rotaciones r
    JOIN alumnos a ON r.alumno_id = a.id
    JOIN tutores t ON r.tutor_id = t.id
    JOIN asistencias ast ON ast.rotacion_id = r.id
    WHERE 
        EXTRACT(MONTH FROM ast.fecha) = p_mes
        AND EXTRACT(YEAR FROM ast.fecha) = p_anio
        AND ast.tipo = 'tutor'
        AND ast.presente = true
    GROUP BY r.id, r.tutor_id, a.centro_formador_id, t.tarifa_hora;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener el centro formador del usuario actual
CREATE OR REPLACE FUNCTION get_user_centro_formador()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT centro_formador_id 
        FROM usuarios_centros 
        WHERE user_id = auth.uid() 
        AND activo = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- ============================================
-- VISTAS
-- ============================================

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

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE centros_formadores IS 'Universidades e instituciones formadoras';
COMMENT ON TABLE servicios_clinicos IS 'Servicios y áreas del hospital';
COMMENT ON TABLE tutores IS 'Tutores clínicos del hospital';
COMMENT ON TABLE alumnos IS 'Estudiantes en rotación';
COMMENT ON TABLE rotaciones IS 'Asignaciones de alumnos a servicios';
COMMENT ON TABLE asistencias IS 'Registro de asistencia de alumnos y tutores';
COMMENT ON TABLE retribuciones IS 'Cálculos de retribuciones económicas';
COMMENT ON TABLE solicitudes_cupos IS 'Solicitudes de cupos de centros formadores';
COMMENT ON TABLE documentos IS 'Documentos del sistema';
COMMENT ON TABLE documentos_categorias IS 'Categorías de documentos';
COMMENT ON TABLE documentos_historial IS 'Historial de acciones sobre documentos';
COMMENT ON TABLE documentos_permisos IS 'Permisos de acceso a documentos';
COMMENT ON TABLE usuarios IS 'Usuarios del sistema';
COMMENT ON TABLE usuarios_centros IS 'Vinculación de usuarios con centros formadores';

COMMENT ON COLUMN centros_formadores.capacidad_total IS 'Capacidad total de cupos que puede ofrecer el centro formador';
COMMENT ON COLUMN centros_formadores.capacidad_disponible IS 'Cupos actualmente disponibles';
COMMENT ON COLUMN centros_formadores.especialidades IS 'Array de especialidades que ofrece el centro';

COMMENT ON FUNCTION get_user_centro_formador() IS 'Obtiene el centro formador del usuario autenticado';
COMMENT ON FUNCTION calcular_retribuciones(INTEGER, INTEGER) IS 'Calcula retribuciones para un mes y año específico';
COMMENT ON FUNCTION obtener_estadisticas_documentos() IS 'Obtiene estadísticas generales de documentos';
