-- ============================================
-- ARREGLAR POLÍTICAS DE SEGURIDAD
-- Permitir operaciones CRUD para usuarios autenticados
-- ============================================

-- Eliminar políticas existentes que pueden estar causando problemas
DROP POLICY IF EXISTS "Permitir lectura pública" ON centros_formadores;
DROP POLICY IF EXISTS "Permitir inserción autenticada" ON centros_formadores;

DROP POLICY IF EXISTS "Permitir lectura pública" ON servicios_clinicos;
DROP POLICY IF EXISTS "Permitir inserción autenticada" ON servicios_clinicos;

DROP POLICY IF EXISTS "Permitir lectura pública" ON tutores;
DROP POLICY IF EXISTS "Permitir inserción autenticada" ON tutores;

DROP POLICY IF EXISTS "Permitir lectura pública" ON alumnos;
DROP POLICY IF EXISTS "Permitir inserción autenticada" ON alumnos;

DROP POLICY IF EXISTS "Permitir lectura pública" ON rotaciones;
DROP POLICY IF EXISTS "Permitir inserción autenticada" ON rotaciones;

DROP POLICY IF EXISTS "Permitir lectura pública" ON asistencias;
DROP POLICY IF EXISTS "Permitir inserción autenticada" ON asistencias;

DROP POLICY IF EXISTS "Permitir lectura pública" ON retribuciones;
DROP POLICY IF EXISTS "Permitir inserción autenticada" ON retribuciones;

DROP POLICY IF EXISTS "Permitir lectura pública" ON documentos;
DROP POLICY IF EXISTS "Permitir inserción autenticada" ON documentos;

-- Crear nuevas políticas que permitan todas las operaciones para usuarios autenticados
-- CENTROS FORMADORES
CREATE POLICY "Permitir todo para autenticados" ON centros_formadores
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- SERVICIOS CLÍNICOS
CREATE POLICY "Permitir todo para autenticados" ON servicios_clinicos
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- TUTORES
CREATE POLICY "Permitir todo para autenticados" ON tutores
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ALUMNOS
CREATE POLICY "Permitir todo para autenticados" ON alumnos
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ROTACIONES
CREATE POLICY "Permitir todo para autenticados" ON rotaciones
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ASISTENCIAS
CREATE POLICY "Permitir todo para autenticados" ON asistencias
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- RETRIBUCIONES
CREATE POLICY "Permitir todo para autenticados" ON retribuciones
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- DOCUMENTOS
CREATE POLICY "Permitir todo para autenticados" ON documentos
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- USUARIOS
CREATE POLICY "Permitir todo para autenticados" ON usuarios
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
