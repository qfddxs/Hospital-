# 📋 Instrucciones: Habilitar Aprobación de Documentos de Centros

## 🎯 Objetivo
Permitir que el hospital apruebe o rechace documentos institucionales subidos por los centros formadores.

## ⚡ Paso 1: Ejecutar Script SQL en Supabase

1. Abre tu proyecto en Supabase
2. Ve a **SQL Editor**
3. Copia y pega el siguiente script:

```sql
-- ============================================
-- AGREGAR CAMPOS DE APROBACIÓN A DOCUMENTOS_CENTRO
-- ============================================

-- 1. Agregar campos de aprobación
ALTER TABLE documentos_centro 
ADD COLUMN IF NOT EXISTS aprobado BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS aprobado_por UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS fecha_aprobacion TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS comentarios_aprobacion TEXT;

-- 2. Crear índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_documentos_centro_aprobado ON documentos_centro(aprobado);
CREATE INDEX IF NOT EXISTS idx_documentos_centro_centro_id ON documentos_centro(centro_formador_id);

-- 3. Comentarios para documentación
COMMENT ON COLUMN documentos_centro.aprobado IS 'Estado de aprobación (NULL=pendiente, true=aprobado, false=rechazado)';
COMMENT ON COLUMN documentos_centro.aprobado_por IS 'Usuario del hospital que aprobó/rechazó';
COMMENT ON COLUMN documentos_centro.fecha_aprobacion IS 'Fecha de aprobación/rechazo';
COMMENT ON COLUMN documentos_centro.comentarios_aprobacion IS 'Comentarios del hospital al aprobar/rechazar';

-- 4. Vista para consultas del hospital
CREATE OR REPLACE VIEW vista_documentos_centros_pendientes AS
SELECT 
  dc.*,
  cf.nombre as centro_nombre,
  cf.codigo as centro_codigo,
  cf.email as centro_email
FROM documentos_centro dc
JOIN centros_formadores cf ON dc.centro_formador_id = cf.id
WHERE dc.aprobado IS NULL
ORDER BY dc.fecha_subida DESC;

-- 5. Vista de estadísticas por centro
CREATE OR REPLACE VIEW vista_estadisticas_documentos_centros AS
SELECT 
  cf.id as centro_formador_id,
  cf.nombre as centro_nombre,
  cf.codigo as centro_codigo,
  COUNT(*) as total_documentos,
  COUNT(CASE WHEN dc.aprobado IS NULL THEN 1 END) as pendientes,
  COUNT(CASE WHEN dc.aprobado = true THEN 1 END) as aprobados,
  COUNT(CASE WHEN dc.aprobado = false THEN 1 END) as rechazados,
  ROUND(
    COUNT(CASE WHEN dc.aprobado = true THEN 1 END)::NUMERIC / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as porcentaje_aprobacion
FROM centros_formadores cf
LEFT JOIN documentos_centro dc ON cf.id = dc.centro_formador_id
WHERE cf.activo = true
GROUP BY cf.id, cf.nombre, cf.codigo;
```

4. Haz clic en **Run** o presiona `Ctrl + Enter`
5. Verifica que aparezca: **Success. No rows returned**

## ✅ Paso 2: Verificar que Funciona

### En el Portal del Hospital:

1. Ve a **Gestión Documental**
2. Haz clic en la pestaña **"Documentos de Centros Formadores"**
3. Deberías ver:
   - Lista de documentos subidos por centros
   - Columna "Estado Aprobación" con badges:
     - 🔵 Pendiente (azul)
     - ✅ Aprobado (verde)
     - ❌ Rechazado (rojo)
   - Botones de acción:
     - ✅ Aprobar (solo si está pendiente)
     - ❌ Rechazar (solo si está pendiente)
     - 👁️ Ver

4. **Filtros disponibles:**
   - Por centro formador
   - Por estado de aprobación (Pendiente/Aprobado/Rechazado)
   - Por tipo de documento
   - Búsqueda por texto

### Probar Aprobación:

1. Selecciona un documento pendiente
2. Haz clic en el botón **✅ Aprobar**
3. Agrega comentarios (opcional)
4. Confirma
5. El documento cambia a estado "Aprobado" ✅

### Probar Rechazo:

1. Selecciona un documento pendiente
2. Haz clic en el botón **❌ Rechazar**
3. Agrega motivo del rechazo (obligatorio)
4. Confirma
5. El documento cambia a estado "Rechazado" ❌

### En el Portal del Centro Formador:

1. Ve a **Gestión Documental**
2. Pestaña **"Documentos del Centro"**
3. Los documentos muestran su estado:
   - 🕐 Pendiente de aprobación (azul)
   - ✅ Aprobado (verde)
   - ❌ Rechazado (rojo)

## 🔄 Flujo Completo

```
1. Centro sube documento
   ↓
2. Estado: Pendiente (aprobado: NULL)
   ↓
3. Hospital ve en "Documentos de Centros Formadores"
   ↓
4. Hospital filtra por centro (opcional)
   ↓
5. Hospital revisa documento
   ↓
6. Hospital aprueba o rechaza
   ↓
7. Centro ve el estado actualizado
```

## 📊 Consultas Útiles

### Ver documentos pendientes:
```sql
SELECT * FROM vista_documentos_centros_pendientes;
```

### Ver estadísticas por centro:
```sql
SELECT * FROM vista_estadisticas_documentos_centros;
```

### Ver todos los documentos de un centro:
```sql
SELECT 
  dc.*,
  cf.nombre as centro_nombre,
  CASE 
    WHEN dc.aprobado IS NULL THEN 'Pendiente'
    WHEN dc.aprobado = true THEN 'Aprobado'
    WHEN dc.aprobado = false THEN 'Rechazado'
  END as estado_aprobacion
FROM documentos_centro dc
JOIN centros_formadores cf ON dc.centro_formador_id = cf.id
WHERE dc.centro_formador_id = 'uuid-del-centro'
ORDER BY dc.fecha_subida DESC;
```

## ⚠️ Notas Importantes

1. **Documentos existentes:** Los documentos que ya existen tendrán `aprobado: NULL` (Pendiente)
2. **Comentarios obligatorios:** Al rechazar, es obligatorio agregar un motivo
3. **No se puede editar:** Una vez aprobado/rechazado, no se puede cambiar (el centro debe subir uno nuevo)
4. **Trazabilidad:** Se guarda quién aprobó/rechazó y cuándo

## 🐛 Solución de Problemas

### No aparecen documentos en el hospital:
- Verifica que los centros hayan subido documentos
- Revisa que la tabla `documentos_centro` tenga registros

### Error al aprobar/rechazar:
- Verifica que ejecutaste el script SQL
- Revisa que los campos existan en la tabla

### No se ven los estados en el centro:
- Refresca la página
- Verifica que el código del centro esté actualizado

---

**Fecha:** 16 de noviembre de 2025  
**Estado:** ✅ Listo para usar
