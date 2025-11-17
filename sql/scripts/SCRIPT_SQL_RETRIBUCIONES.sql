-- ============================================
-- SCRIPT PARA CREAR MÓDULO DE RETRIBUCIONES
-- Copiar y pegar en Supabase SQL Editor
-- ============================================

-- 1. Crear tabla de retribuciones
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

-- 2. Agregar campo a rotaciones
ALTER TABLE rotaciones 
ADD COLUMN IF NOT EXISTS retribucion_id UUID REFERENCES retribuciones(id) ON DELETE SET NULL;

-- 3. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_retribuciones_centro ON retribuciones(centro_formador_id);
CREATE INDEX IF NOT EXISTS idx_retribuciones_periodo ON retribuciones(periodo);
CREATE INDEX IF NOT EXISTS idx_retribuciones_estado ON retribuciones(estado);
CREATE INDEX IF NOT EXISTS idx_rotaciones_retribucion ON rotaciones(retribucion_id);

-- 4. Habilitar seguridad RLS
ALTER TABLE retribuciones ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas de seguridad
CREATE POLICY "Usuarios autenticados pueden ver retribuciones"
  ON retribuciones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear retribuciones"
  ON retribuciones FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar retribuciones"
  ON retribuciones FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar retribuciones"
  ON retribuciones FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- FIN DEL SCRIPT
-- Si todo salió bien, deberías ver "Success"
-- ============================================
