# 🚀 Instrucciones para Activar el Módulo de Retribuciones

## ⚠️ Error Actual

El error que ves indica que la tabla `retribuciones` no existe en tu base de datos. Necesitas ejecutar el script SQL primero.

## 📋 Pasos para Solucionar

### Opción 1: Ejecutar desde Supabase Dashboard (Recomendado)

1. **Ir a Supabase Dashboard**
   - Abre tu proyecto en https://supabase.com
   - Ve a la sección **SQL Editor** en el menú lateral

2. **Crear Nueva Query**
   - Haz clic en **"New query"**
   - Copia y pega el siguiente código SQL:

```sql
-- PASO 1: Crear tabla de retribuciones
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

-- PASO 2: Agregar campo a rotaciones
ALTER TABLE rotaciones 
ADD COLUMN IF NOT EXISTS retribucion_id UUID REFERENCES retribuciones(id) ON DELETE SET NULL;

-- PASO 3: Crear índices
CREATE INDEX IF NOT EXISTS idx_retribuciones_centro ON retribuciones(centro_formador_id);
CREATE INDEX IF NOT EXISTS idx_retribuciones_periodo ON retribuciones(periodo);
CREATE INDEX IF NOT EXISTS idx_retribuciones_estado ON retribuciones(estado);
CREATE INDEX IF NOT EXISTS idx_rotaciones_retribucion ON rotaciones(retribucion_id);

-- PASO 4: Habilitar RLS
ALTER TABLE retribuciones ENABLE ROW LEVEL SECURITY;

-- PASO 5: Crear políticas
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
```

3. **Ejecutar el Script**
   - Haz clic en **"Run"** o presiona `Ctrl + Enter`
   - Espera a que termine (debería decir "Success")

4. **Verificar**
   - Ve a **Table Editor**
   - Deberías ver la tabla `retribuciones` en la lista

### Opción 2: Ejecutar desde CLI de Supabase

Si tienes Supabase CLI instalado:

```bash
# Navega a tu proyecto
cd tu-proyecto

# Ejecuta la migración
supabase db push
```

## ✅ Verificación

Después de ejecutar el script:

1. **Refresca la página** del sistema
2. Ve a **Retribuciones** en el menú
3. Haz clic en **"Calcular Retribuciones"**
4. Ahora debería funcionar correctamente

## 🔍 Solución de Problemas

### Error: "relation retribuciones does not exist"
- **Causa**: No ejecutaste el script SQL
- **Solución**: Sigue los pasos de arriba

### Error: "column retribucion_id does not exist in rotaciones"
- **Causa**: El ALTER TABLE no se ejecutó
- **Solución**: Ejecuta solo esta parte:
```sql
ALTER TABLE rotaciones 
ADD COLUMN IF NOT EXISTS retribucion_id UUID REFERENCES retribuciones(id) ON DELETE SET NULL;
```

### Error: "permission denied for table retribuciones"
- **Causa**: Las políticas RLS no están configuradas
- **Solución**: Ejecuta las políticas (PASO 5 del script)

### No hay rotaciones para calcular
- **Causa**: No hay rotaciones con estado "completada"
- **Solución**: 
  1. Ve a **Gestión de Alumnos**
  2. Asigna rotaciones a alumnos
  3. Cambia el estado de las rotaciones a "completada"

## 📊 Estructura de la Tabla

Una vez creada, la tabla `retribuciones` tendrá:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| centro_formador_id | UUID | Centro formador |
| periodo | VARCHAR | Ej: "2024-1" |
| fecha_calculo | TIMESTAMP | Fecha de cálculo |
| fecha_pago | TIMESTAMP | Fecha de pago |
| cantidad_rotaciones | INTEGER | Cantidad de rotaciones |
| monto_total | DECIMAL | Monto total en $ |
| estado | VARCHAR | pendiente/pagada/rechazada |
| detalles | JSONB | Detalle de rotaciones |
| observaciones | TEXT | Notas adicionales |

## 🎯 Próximos Pasos

Una vez que la tabla esté creada:

1. ✅ El botón "Calcular Retribuciones" funcionará
2. ✅ Podrás ver las retribuciones en la tabla
3. ✅ Podrás exportar reportes
4. ✅ Podrás marcar pagos como completados

## 💡 Consejo

Si tienes dudas, puedes verificar que la tabla existe ejecutando:

```sql
SELECT * FROM retribuciones LIMIT 1;
```

Si esto funciona, la tabla está creada correctamente.

---

**¿Necesitas ayuda?** Revisa los logs de error en la consola del navegador (F12) para más detalles.
