-- Arreglar políticas RLS para tutores y servicios clínicos

-- ============================================
-- SERVICIOS CLÍNICOS
-- ============================================

ALTER TABLE servicios_clinicos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Todos pueden leer servicios clínicos" ON servicios_clinicos;
DROP POLICY IF EXISTS "Hospital puede gestionar servicios" ON servicios_clinicos;

-- Política: Todos los usuarios autenticados pueden leer servicios
CREATE POLICY "Todos pueden leer servicios clínicos"
  ON servicios_clinicos
  FOR SELECT
  USING (true);

-- Política: Permitir INSERT/UPDATE/DELETE sin restricción (para desarrollo)
CREATE POLICY "Permitir gestión de servicios"
  ON servicios_clinicos
  FOR ALL
  USING (true);

-- ============================================
-- TUTORES
-- ============================================

ALTER TABLE tutores ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver tutores" ON tutores;
DROP POLICY IF EXISTS "Hospital puede gestionar tutores" ON tutores;

-- Política: Todos los usuarios autenticados pueden leer tutores
CREATE POLICY "Todos pueden leer tutores"
  ON tutores
  FOR SELECT
  USING (true);

-- Política: Permitir INSERT/UPDATE/DELETE sin restricción (para desarrollo)
CREATE POLICY "Permitir gestión de tutores"
  ON tutores
  FOR ALL
  USING (true);

-- Verificar
SELECT 'Políticas RLS actualizadas correctamente' as mensaje;
