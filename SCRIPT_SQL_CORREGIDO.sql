-- ============================================
-- SCRIPT CORREGIDO PARA RETRIBUCIONES
-- Ejecutar línea por línea si es necesario
-- ============================================

-- PASO 1: Crear la tabla
CREATE TABLE IF NOT EXISTS retribuciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  centro_formador_id UUID REFERENCES centros_formadores(id) ON DELETE CASCADE,
  periodo VARCHAR(10) NOT NULL,
  fecha_calculo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_pago TIMESTAMP WITH TIME ZONE,
  cantidad_rotaciones INTEGER DEFAULT 0,
  monto_total DECIMAL(12, 2) DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'pendiente',
  detalles JSONB,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 2: Agregar campo a rotaciones (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rotaciones' AND column_name = 'retribucion_id'
  ) THEN
    ALTER TABLE rotaciones ADD COLUMN retribucion_id UUID REFERENCES retribuciones(id) ON DELETE SET NULL;
  END IF;
END $$;

-- PASO 3: Crear índices
CREATE INDEX IF NOT EXISTS idx_retribuciones_centro ON retribuciones(centro_formador_id);
CREATE INDEX IF NOT EXISTS idx_retribuciones_periodo ON retribuciones(periodo);
CREATE INDEX IF NOT EXISTS idx_retribuciones_estado ON retribuciones(estado);
CREATE INDEX IF NOT EXISTS idx_rotaciones_retribucion ON rotaciones(retribucion_id);

-- PASO 4: Habilitar RLS
ALTER TABLE retribuciones ENABLE ROW LEVEL SECURITY;

-- PASO 5: Eliminar políticas existentes si hay (para evitar conflictos)
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver retribuciones" ON retribuciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear retribuciones" ON retribuciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar retribuciones" ON retribuciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar retribuciones" ON retribuciones;

-- PASO 6: Crear políticas correctamente
CREATE POLICY "Usuarios autenticados pueden ver retribuciones"
  ON retribuciones
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear retribuciones"
  ON retribuciones
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar retribuciones"
  ON retribuciones
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar retribuciones"
  ON retribuciones
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- VERIFICACIÓN: Ejecuta esto para confirmar
-- ============================================
-- SELECT * FROM retribuciones LIMIT 1;
