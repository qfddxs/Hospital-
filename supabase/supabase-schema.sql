-- ============================================
-- SISTEMA DE GESTIÓN DE CAMPOS CLÍNICOS
-- Base de datos para Hospital
-- ============================================

-- Tabla: Centros Formadores (Universidades/Instituciones)
CREATE TABLE centros_formadores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) UNIQUE,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    contacto_nombre VARCHAR(255),
    contacto_cargo VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Servicios Clínicos (Áreas del hospital)
CREATE TABLE servicios_clinicos (
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
CREATE TABLE tutores (
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
CREATE TABLE alumnos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rut VARCHAR(12) UNIQUE NOT NULL,
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    centro_formador_id UUID REFERENCES centros_formadores(id) ON DELETE CASCADE,
    carrera VARCHAR(255),
    nivel VARCHAR(50), -- Ej: "4to año", "Internado", etc.
    fecha_ingreso DATE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Rotaciones (Asignación de alumnos a servicios)
CREATE TABLE rotaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
    servicio_id UUID REFERENCES servicios_clinicos(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutores(id) ON DELETE SET NULL,
    fecha_inicio DATE NOT NULL,
    fecha_termino DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'programada', -- programada, en_curso, finalizada, cancelada
    horas_semanales INTEGER DEFAULT 40,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_fechas CHECK (fecha_termino >= fecha_inicio)
);

-- Tabla: Asistencias
CREATE TABLE asistencias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rotacion_id UUID REFERENCES rotaciones(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- 'alumno' o 'tutor'
    presente BOOLEAN DEFAULT false,
    horas_trabajadas DECIMAL(5, 2) DEFAULT 0,
    observaciones TEXT,
    registrado_por VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rotacion_id, fecha, tipo)
);

-- Tabla: Retribuciones (Cálculos económicos)
CREATE TABLE retribuciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rotacion_id UUID REFERENCES rotaciones(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutores(id) ON DELETE CASCADE,
    centro_formador_id UUID REFERENCES centros_formadores(id) ON DELETE CASCADE,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    anio INTEGER NOT NULL,
    total_horas DECIMAL(10, 2) DEFAULT 0,
    tarifa_hora DECIMAL(10, 2) DEFAULT 0,
    monto_total DECIMAL(12, 2) DEFAULT 0,
    estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, aprobado, pagado
    fecha_calculo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    aprobado_por VARCHAR(255),
    fecha_aprobacion TIMESTAMP WITH TIME ZONE,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rotacion_id, mes, anio)
);

-- Tabla: Documentos (Normativas y protocolos)
CREATE TABLE documentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50), -- 'normativa', 'protocolo', 'convenio', 'otro'
    archivo_url TEXT,
    archivo_nombre VARCHAR(255),
    version VARCHAR(20),
    fecha_vigencia DATE,
    fecha_vencimiento DATE,
    subido_por VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: Usuarios del sistema (para autenticación y roles)
CREATE TABLE usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL, -- 'admin', 'encargado_docencia', 'jefe_servicio', 'tutor', 'centro_formador'
    servicio_id UUID REFERENCES servicios_clinicos(id) ON DELETE SET NULL,
    centro_formador_id UUID REFERENCES centros_formadores(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES para mejorar el rendimiento
-- ============================================

CREATE INDEX idx_alumnos_centro ON alumnos(centro_formador_id);
CREATE INDEX idx_alumnos_rut ON alumnos(rut);
CREATE INDEX idx_tutores_servicio ON tutores(servicio_id);
CREATE INDEX idx_tutores_rut ON tutores(rut);
CREATE INDEX idx_rotaciones_alumno ON rotaciones(alumno_id);
CREATE INDEX idx_rotaciones_servicio ON rotaciones(servicio_id);
CREATE INDEX idx_rotaciones_tutor ON rotaciones(tutor_id);
CREATE INDEX idx_rotaciones_fechas ON rotaciones(fecha_inicio, fecha_termino);
CREATE INDEX idx_asistencias_rotacion ON asistencias(rotacion_id);
CREATE INDEX idx_asistencias_fecha ON asistencias(fecha);
CREATE INDEX idx_retribuciones_periodo ON retribuciones(mes, anio);
CREATE INDEX idx_retribuciones_tutor ON retribuciones(tutor_id);

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

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_centros_formadores_updated_at BEFORE UPDATE ON centros_formadores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_servicios_clinicos_updated_at BEFORE UPDATE ON servicios_clinicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tutores_updated_at BEFORE UPDATE ON tutores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alumnos_updated_at BEFORE UPDATE ON alumnos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rotaciones_updated_at BEFORE UPDATE ON rotaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asistencias_updated_at BEFORE UPDATE ON asistencias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_retribuciones_updated_at BEFORE UPDATE ON retribuciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documentos_updated_at BEFORE UPDATE ON documentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Función para calcular retribuciones automáticamente
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

-- ============================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE centros_formadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios_clinicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE retribuciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir todo por ahora, ajustar según roles después)
CREATE POLICY "Permitir lectura pública" ON centros_formadores FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública" ON servicios_clinicos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública" ON tutores FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública" ON alumnos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública" ON rotaciones FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública" ON asistencias FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública" ON retribuciones FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública" ON documentos FOR SELECT USING (true);

-- Políticas de escritura (ajustar según necesites)
CREATE POLICY "Permitir inserción autenticada" ON centros_formadores FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Permitir inserción autenticada" ON servicios_clinicos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Permitir inserción autenticada" ON tutores FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Permitir inserción autenticada" ON alumnos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Permitir inserción autenticada" ON rotaciones FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Permitir inserción autenticada" ON asistencias FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Permitir inserción autenticada" ON retribuciones FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Permitir inserción autenticada" ON documentos FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- DATOS DE EJEMPLO (Opcional)
-- ============================================

-- Insertar un centro formador de ejemplo
INSERT INTO centros_formadores (nombre, codigo, email) VALUES 
('Universidad de Chile', 'UCH', 'contacto@uchile.cl');

-- Insertar servicios clínicos de ejemplo
INSERT INTO servicios_clinicos (nombre, codigo, capacidad_maxima) VALUES 
('Medicina Interna', 'MED-INT', 10),
('Cirugía', 'CIR', 8),
('Pediatría', 'PED', 12),
('Urgencias', 'URG', 15);

-- Insertar un tutor de ejemplo
INSERT INTO tutores (rut, nombres, apellidos, email, especialidad, tarifa_hora) VALUES 
('12345678-9', 'Juan', 'Pérez', 'juan.perez@hospital.cl', 'Medicina Interna', 15000);
