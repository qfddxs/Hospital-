-- ============================================
-- EJECUTAR PASO A PASO (UNO POR UNO)
-- Copia y ejecuta cada bloque por separado
-- ============================================

-- ========== PASO 1: CREAR TABLA ==========
-- Copia solo esto y ejecuta (Run)
CREATE TABLE IF NOT EXISTS retribuciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  centro_formador_id UUID,
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

-- Si esto funciona, continúa con el siguiente paso
-- ============================================


-- ========== PASO 2: AGREGAR FOREIGN KEY ==========
-- Copia solo esto y ejecuta
ALTER TABLE retribuciones 
ADD CONSTRAINT fk_centro_formador 
FOREIGN KEY (centro_formador_id) 
REFERENCES centros_formadores(id) 
ON DELETE CASCADE;

-- ============================================


-- ========== PASO 3: AGREGAR CAMPO A ROTACIONES ==========
-- Copia solo esto y ejecuta
ALTER TABLE rotaciones 
ADD COLUMN IF NOT EXISTS retribucion_id UUID;

-- ============================================


-- ========== PASO 4: AGREGAR FOREIGN KEY A ROTACIONES ==========
-- Copia solo esto y ejecuta
ALTER TABLE rotaciones
ADD CONSTRAINT fk_retribucion
FOREIGN KEY (retribucion_id)
REFERENCES retribuciones(id)
ON DELETE SET NULL;

-- ============================================


-- ========== PASO 5: CREAR ÍNDICES ==========
-- Copia solo esto y ejecuta
CREATE INDEX idx_retribuciones_centro ON retribuciones(centro_formador_id);
CREATE INDEX idx_retribuciones_periodo ON retribuciones(periodo);
CREATE INDEX idx_retribuciones_estado ON retribuciones(estado);
CREATE INDEX idx_rotaciones_retribucion ON rotaciones(retribucion_id);

-- ============================================


-- ========== PASO 6: HABILITAR RLS ==========
-- Copia solo esto y ejecuta
ALTER TABLE retribuciones ENABLE ROW LEVEL SECURITY;

-- ============================================


-- ========== PASO 7: POLÍTICA DE LECTURA ==========
-- Copia solo esto y ejecuta
CREATE POLICY select_retribuciones
  ON retribuciones
  FOR SELECT
  USING (true);

-- ============================================


-- ========== PASO 8: POLÍTICA DE INSERCIÓN ==========
-- Copia solo esto y ejecuta
CREATE POLICY insert_retribuciones
  ON retribuciones
  FOR INSERT
  WITH CHECK (true);

-- ============================================


-- ========== PASO 9: POLÍTICA DE ACTUALIZACIÓN ==========
-- Copia solo esto y ejecuta
CREATE POLICY update_retribuciones
  ON retribuciones
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================


-- ========== PASO 10: POLÍTICA DE ELIMINACIÓN ==========
-- Copia solo esto y ejecuta
CREATE POLICY delete_retribuciones
  ON retribuciones
  FOR DELETE
  USING (true);

-- ============================================


-- ========== VERIFICACIÓN FINAL ==========
-- Copia solo esto y ejecuta para verificar
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'retribuciones'
ORDER BY ordinal_position;

-- Si ves todas las columnas, ¡funcionó! ✅
-- ============================================
