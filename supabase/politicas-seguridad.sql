-- ============================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- Sistema de Gestión de Campos Clínicos
-- ============================================

-- ============================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================

ALTER TABLE centros_formadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios_clinicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE retribuciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_cupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_historial ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_centros ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA CENTROS FORMADORES
-- ============================================

-- Lectura pública
CREATE POLICY "Permitir lectura pública" ON centros_formadores 
FOR SELECT USING (true);

-- Escritura solo para autenticados
CREATE POLICY "Permitir inserción autenticada" ON centros_formadores 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir actualización autenticada" ON centros_formadores 
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir eliminación autenticada" ON centros_formadores 
FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA SERVICIOS CLÍNICOS
-- ============================================

CREATE POLICY "Permitir lectura pública" ON servicios_clinicos 
FOR SELECT USING (true);

CREATE POLICY "Permitir inserción autenticada" ON servicios_clinicos 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir actualización autenticada" ON servicios_clinicos 
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir eliminación autenticada" ON servicios_clinicos 
FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA TUTORES
-- ============================================

CREATE POLICY "Permitir lectura pública" ON tutores 
FOR SELECT USING (true);

CREATE POLICY "Permitir inserción autenticada" ON tutores 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir actualización autenticada" ON tutores 
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir eliminación autenticada" ON tutores 
FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA ALUMNOS
-- ============================================

CREATE POLICY "Permitir lectura pública" ON alumnos 
FOR SELECT USING (true);

CREATE POLICY "Permitir inserción autenticada" ON alumnos 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir actualización autenticada" ON alumnos 
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir eliminación autenticada" ON alumnos 
FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA ROTACIONES
-- ============================================

CREATE POLICY "Permitir lectura pública" ON rotaciones 
FOR SELECT USING (true);

CREATE POLICY "Permitir inserción autenticada" ON rotaciones 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir actualización autenticada" ON rotaciones 
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir eliminación autenticada" ON rotaciones 
FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA ASISTENCIAS
-- ============================================

CREATE POLICY "Permitir lectura pública" ON asistencias 
FOR SELECT USING (true);

CREATE POLICY "Permitir inserción autenticada" ON asistencias 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir actualización autenticada" ON asistencias 
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir eliminación autenticada" ON asistencias 
FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA RETRIBUCIONES
-- ============================================

CREATE POLICY "Permitir lectura pública" ON retribuciones 
FOR SELECT USING (true);

CREATE POLICY "Permitir inserción autenticada" ON retribuciones 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir actualización autenticada" ON retribuciones 
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir eliminación autenticada" ON retribuciones 
FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA SOLICITUDES DE CUPOS
-- ============================================

-- Los centros formadores solo ven sus propias solicitudes
CREATE POLICY "Centros ven sus solicitudes" ON solicitudes_cupos
FOR SELECT
USING (
    centro_formador_id = get_user_centro_formador()
    OR 
    EXISTS (
        SELECT 1 FROM usuarios_centros 
        WHERE user_id = auth.uid() 
        AND rol = 'admin'
    )
);

-- Los centros formadores solo pueden crear sus propias solicitudes
CREATE POLICY "Centros crean sus solicitudes" ON solicitudes_cupos
FOR INSERT
WITH CHECK (
    centro_formador_id = get_user_centro_formador()
);

-- Los centros formadores pueden actualizar solo sus solicitudes pendientes
CREATE POLICY "Centros actualizan sus solicitudes" ON solicitudes_cupos
FOR UPDATE
USING (
    centro_formador_id = get_user_centro_formador()
    AND estado = 'pendiente'
);

-- Solo admins pueden aprobar/rechazar
CREATE POLICY "Admins gestionan solicitudes" ON solicitudes_cupos
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM usuarios_centros 
        WHERE user_id = auth.uid() 
        AND rol = 'admin'
    )
);

-- ============================================
-- POLÍTICAS PARA DOCUMENTOS
-- ============================================

CREATE POLICY "Permitir lectura pública" ON documentos 
FOR SELECT USING (true);

CREATE POLICY "Permitir inserción autenticada" ON documentos 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir actualización autenticada" ON documentos 
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir eliminación autenticada" ON documentos 
FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA CATEGORÍAS DE DOCUMENTOS
-- ============================================

CREATE POLICY "Permitir lectura pública categorías" ON documentos_categorias 
FOR SELECT USING (true);

CREATE POLICY "Permitir inserción autenticada categorías" ON documentos_categorias 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA HISTORIAL DE DOCUMENTOS
-- ============================================

CREATE POLICY "Permitir lectura pública historial" ON documentos_historial 
FOR SELECT USING (true);

CREATE POLICY "Permitir inserción autenticada historial" ON documentos_historial 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA PERMISOS DE DOCUMENTOS
-- ============================================

CREATE POLICY "Permitir lectura pública permisos" ON documentos_permisos 
FOR SELECT USING (true);

CREATE POLICY "Permitir inserción autenticada permisos" ON documentos_permisos 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA USUARIOS
-- ============================================

CREATE POLICY "Permitir lectura pública usuarios" ON usuarios 
FOR SELECT USING (true);

CREATE POLICY "Permitir inserción autenticada usuarios" ON usuarios 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA USUARIOS_CENTROS
-- ============================================

-- Usuarios ven su propio centro
CREATE POLICY "Usuarios ven su propio centro" ON usuarios_centros
FOR SELECT
USING (user_id = auth.uid());

-- Admins gestionan usuarios_centros
CREATE POLICY "Admins gestionan usuarios_centros" ON usuarios_centros
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM usuarios_centros 
        WHERE user_id = auth.uid() 
        AND rol = 'admin'
    )
);
