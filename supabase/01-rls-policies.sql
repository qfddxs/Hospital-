-- ============================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- Hospital Regional Rancagua
-- ============================================

-- IMPORTANTE: Ejecutar DESPUÉS de crear el schema (00-schema-completo.sql)

-- ============================================
-- 1. CENTROS FORMADORES
-- ============================================

ALTER TABLE centros_formadores ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer centros formadores
CREATE POLICY "Todos pueden leer centros formadores"
  ON centros_formadores
  FOR SELECT
  USING (true);

-- Permitir INSERT durante el registro
CREATE POLICY "Permitir creación de centros"
  ON centros_formadores
  FOR INSERT
  WITH CHECK (true);

-- Los centros pueden actualizar su propia información
CREATE POLICY "Centros pueden actualizar su info"
  ON centros_formadores
  FOR UPDATE
  USING (
    id IN (
      SELECT centro_formador_id 
      FROM usuarios_centros 
      WHERE user_id = auth.uid() AND activo = true
    )
  );

-- ============================================
-- 2. USUARIOS_CENTROS
-- ============================================

ALTER TABLE usuarios_centros ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propios vínculos
CREATE POLICY "Usuarios pueden ver sus propios vínculos"
  ON usuarios_centros
  FOR SELECT
  USING (auth.uid() = user_id);

-- Permitir INSERT durante el registro
CREATE POLICY "Permitir creación de vínculos"
  ON usuarios_centros
  FOR INSERT
  WITH CHECK (true);

-- Los usuarios pueden actualizar sus propios vínculos
CREATE POLICY "Usuarios pueden actualizar sus propios vínculos"
  ON usuarios_centros
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. SOLICITUDES DE CUPOS
-- ============================================

ALTER TABLE solicitudes_cupos ENABLE ROW LEVEL SECURITY;

-- Los centros formadores pueden ver sus propias solicitudes
CREATE POLICY "Centros pueden ver sus propias solicitudes"
  ON solicitudes_cupos
  FOR SELECT
  USING (
    centro_formador_id IN (
      SELECT centro_formador_id 
      FROM usuarios_centros 
      WHERE user_id = auth.uid() AND activo = true
    )
  );

-- Los centros formadores pueden crear solicitudes
CREATE POLICY "Centros pueden crear solicitudes"
  ON solicitudes_cupos
  FOR INSERT
  WITH CHECK (
    centro_formador_id IN (
      SELECT centro_formador_id 
      FROM usuarios_centros 
      WHERE user_id = auth.uid() AND activo = true
    )
  );

-- Los centros formadores pueden actualizar sus solicitudes pendientes
CREATE POLICY "Centros pueden actualizar sus solicitudes pendientes"
  ON solicitudes_cupos
  FOR UPDATE
  USING (
    estado = 'pendiente' AND
    centro_formador_id IN (
      SELECT centro_formador_id 
      FROM usuarios_centros 
      WHERE user_id = auth.uid() AND activo = true
    )
  );

-- El hospital puede ver TODAS las solicitudes
CREATE POLICY "Hospital puede ver todas las solicitudes"
  ON solicitudes_cupos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'rol' = 'hospital'
    )
    OR
    -- Si no está en usuarios_centros, es personal del hospital
    NOT EXISTS (
      SELECT 1 FROM usuarios_centros 
      WHERE user_id = auth.uid()
    )
  );

-- El hospital puede actualizar cualquier solicitud (aprobar/rechazar)
CREATE POLICY "Hospital puede actualizar solicitudes"
  ON solicitudes_cupos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'rol' = 'hospital'
    )
    OR
    NOT EXISTS (
      SELECT 1 FROM usuarios_centros 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 4. ALUMNOS
-- ============================================

ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden ver alumnos
CREATE POLICY "Usuarios autenticados pueden ver alumnos"
  ON alumnos
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Solo el hospital puede crear/actualizar/eliminar alumnos
CREATE POLICY "Hospital puede gestionar alumnos"
  ON alumnos
  FOR ALL
  USING (
    NOT EXISTS (
      SELECT 1 FROM usuarios_centros 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 5. ROTACIONES
-- ============================================

ALTER TABLE rotaciones ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden ver rotaciones
CREATE POLICY "Usuarios autenticados pueden ver rotaciones"
  ON rotaciones
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Solo el hospital puede gestionar rotaciones
CREATE POLICY "Hospital puede gestionar rotaciones"
  ON rotaciones
  FOR ALL
  USING (
    NOT EXISTS (
      SELECT 1 FROM usuarios_centros 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 6. ASISTENCIAS
-- ============================================

ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden ver asistencias
CREATE POLICY "Usuarios autenticados pueden ver asistencias"
  ON asistencias
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Solo el hospital puede gestionar asistencias
CREATE POLICY "Hospital puede gestionar asistencias"
  ON asistencias
  FOR ALL
  USING (
    NOT EXISTS (
      SELECT 1 FROM usuarios_centros 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 7. SERVICIOS CLÍNICOS
-- ============================================

ALTER TABLE servicios_clinicos ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer servicios clínicos
CREATE POLICY "Todos pueden leer servicios clínicos"
  ON servicios_clinicos
  FOR SELECT
  USING (true);

-- Solo el hospital puede gestionar servicios
CREATE POLICY "Hospital puede gestionar servicios"
  ON servicios_clinicos
  FOR ALL
  USING (
    NOT EXISTS (
      SELECT 1 FROM usuarios_centros 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 8. RETRIBUCIONES
-- ============================================

ALTER TABLE retribuciones ENABLE ROW LEVEL SECURITY;

-- Los centros pueden ver sus propias retribuciones
CREATE POLICY "Centros pueden ver sus retribuciones"
  ON retribuciones
  FOR SELECT
  USING (
    centro_formador_id IN (
      SELECT centro_formador_id 
      FROM usuarios_centros 
      WHERE user_id = auth.uid() AND activo = true
    )
  );

-- El hospital puede ver y gestionar todas las retribuciones
CREATE POLICY "Hospital puede gestionar retribuciones"
  ON retribuciones
  FOR ALL
  USING (
    NOT EXISTS (
      SELECT 1 FROM usuarios_centros 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 9. TUTORES
-- ============================================

ALTER TABLE tutores ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden ver tutores
CREATE POLICY "Usuarios autenticados pueden ver tutores"
  ON tutores
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Solo el hospital puede gestionar tutores
CREATE POLICY "Hospital puede gestionar tutores"
  ON tutores
  FOR ALL
  USING (
    NOT EXISTS (
      SELECT 1 FROM usuarios_centros 
      WHERE user_id = auth.uid()
    )
  );
