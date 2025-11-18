# Integración: Sistemas de Gestión de Cupos

## 📋 Descripción

Este documento explica cómo funcionan juntos los dos sistemas de gestión de cupos:

1. **Sistema de Descuento Automático** (día a día)
2. **Sistema de Reinicio Manual** (fin de período)

## 🔄 Ambos Sistemas Son Compatibles

### ✅ Funcionan Perfectamente Juntos

Los dos sistemas modifican la misma columna (`capacidad_disponible`) pero en momentos diferentes del ciclo:

```
CICLO COMPLETO:
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  REINICIO MANUAL (Inicio de período)                   │
│  └─> capacidad_disponible = capacidad_total            │
│                                                         │
│  ↓                                                      │
│                                                         │
│  DESCUENTOS AUTOMÁTICOS (Durante el período)           │
│  ├─> Aprobar: capacidad_disponible -= cupos            │
│  ├─> Rechazar: capacidad_disponible += cupos           │
│  └─> Eliminar: capacidad_disponible += cupos           │
│                                                         │
│  ↓                                                      │
│                                                         │
│  REINICIO MANUAL (Fin de período)                      │
│  └─> capacidad_disponible = capacidad_total            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Flujo Completo: Ciclo Semestral

### Fase 1: Inicio de Semestre (Enero)

```sql
-- Admin hace clic "Reiniciar Cupos"
SELECT reiniciar_cupos_manual('pregrado', auth.uid(), 'Inicio semestre 2025-1');

-- Resultado:
-- ✅ Todos los centros: capacidad_disponible = capacidad_total
-- ✅ Solicitudes aprobadas → estado "finalizada"
-- ✅ Historial de reinicio registrado
```

**Estado de los centros:**
```
Universidad ABC:
  capacidad_total: 50
  capacidad_disponible: 50 ← Restaurado
  solicitudes activas: 0
```

### Fase 2: Durante el Semestre (Enero - Junio)

#### Semana 1: Centro A solicita cupos
```sql
-- Centro A crea solicitud de 10 cupos
INSERT INTO solicitudes_cupos (centro_formador_id, numero_cupos, ...)
VALUES ('uuid-centro-a', 10, ...);

-- Hospital aprueba
UPDATE solicitudes_cupos SET estado = 'aprobada' WHERE id = 'uuid-solicitud';

-- TRIGGER automático descuenta:
-- capacidad_disponible: 50 → 40
```

**Historial registrado:**
```
historial_movimientos_cupos:
  tipo: "descuento"
  cupos_afectados: 10
  capacidad_antes: 50
  capacidad_despues: 40
```

#### Semana 3: Centro B solicita cupos
```sql
-- Centro B crea solicitud de 15 cupos
-- Hospital aprueba
-- TRIGGER automático descuenta:
-- capacidad_disponible: 40 → 25
```

#### Semana 5: Centro A rechaza su solicitud
```sql
-- Hospital rechaza solicitud de Centro A
UPDATE solicitudes_cupos SET estado = 'rechazada' WHERE id = 'uuid-solicitud-a';

-- TRIGGER automático devuelve:
-- capacidad_disponible: 25 → 35
```

**Historial registrado:**
```
historial_movimientos_cupos:
  tipo: "devolucion"
  cupos_afectados: 10
  capacidad_antes: 25
  capacidad_despues: 35
```

#### Semana 8: Centro C solicita cupos
```sql
-- Centro C crea solicitud de 20 cupos
-- Hospital aprueba
-- TRIGGER automático descuenta:
-- capacidad_disponible: 35 → 15
```

**Estado actual:**
```
Universidad ABC:
  capacidad_total: 50
  capacidad_disponible: 15
  solicitudes aprobadas: 2 (Centro B: 15, Centro C: 20)
```

### Fase 3: Fin de Semestre (Junio)

```sql
-- Admin hace clic "Reiniciar Cupos"
SELECT reiniciar_cupos_manual('pregrado', auth.uid(), 'Fin semestre 2025-1');

-- Resultado:
-- ✅ capacidad_disponible: 15 → 50 (restaurado)
-- ✅ Solicitudes de Centro B y C → "finalizada"
-- ✅ Historial de reinicio registrado
```

**Estado final:**
```
Universidad ABC:
  capacidad_total: 50
  capacidad_disponible: 50 ← Restaurado
  solicitudes activas: 0
  solicitudes finalizadas: 2
```

## 📊 Historiales Separados

### Historial 1: Movimientos Automáticos (Día a Día)

```sql
SELECT * FROM historial_movimientos_cupos
ORDER BY created_at DESC;
```

**Registra:**
- Descuentos al aprobar
- Devoluciones al rechazar
- Devoluciones al eliminar
- Ajustes al modificar

**Ejemplo:**
```
| Fecha       | Centro | Tipo       | Cupos | Antes | Después |
|-------------|--------|------------|-------|-------|---------|
| 2025-03-15  | ABC    | descuento  | 20    | 35    | 15      |
| 2025-02-10  | ABC    | devolucion | 10    | 25    | 35      |
| 2025-01-20  | ABC    | descuento  | 15    | 40    | 25      |
| 2025-01-05  | ABC    | descuento  | 10    | 50    | 40      |
```

### Historial 2: Reinicios Manuales (Fin de Período)

```sql
SELECT * FROM historial_reinicio_cupos
ORDER BY fecha_reinicio DESC;
```

**Registra:**
- Fecha de reinicio
- Centros afectados
- Cupos liberados
- Solicitudes finalizadas

**Ejemplo:**
```
| Fecha       | Centros | Cupos Liberados | Solicitudes | Observaciones      |
|-------------|---------|-----------------|-------------|--------------------|
| 2025-06-30  | 15      | 450             | 42          | Fin semestre 2025-1|
| 2024-12-20  | 15      | 380             | 38          | Fin semestre 2024-2|
| 2024-06-30  | 14      | 420             | 40          | Fin semestre 2024-1|
```

## 🔍 Verificación de Integración

### Consulta 1: Timeline Completo
```sql
-- Ver todos los eventos en orden cronológico
SELECT 
  'Movimiento' as tipo,
  cf.nombre as centro,
  hmc.tipo_movimiento as accion,
  hmc.cupos_afectados as cupos,
  hmc.created_at as fecha
FROM historial_movimientos_cupos hmc
JOIN centros_formadores cf ON hmc.centro_formador_id = cf.id

UNION ALL

SELECT 
  'Reinicio' as tipo,
  'TODOS' as centro,
  'reinicio' as accion,
  cupos_liberados as cupos,
  fecha_reinicio as fecha
FROM historial_reinicio_cupos

ORDER BY fecha DESC;
```

### Consulta 2: Resumen por Centro
```sql
-- Ver actividad completa de un centro
SELECT 
  cf.nombre,
  cf.capacidad_total,
  cf.capacidad_disponible,
  COUNT(DISTINCT hmc.id) as movimientos_automaticos,
  (SELECT COUNT(*) FROM historial_reinicio_cupos) as reinicios_totales
FROM centros_formadores cf
LEFT JOIN historial_movimientos_cupos hmc ON cf.id = hmc.centro_formador_id
WHERE cf.id = 'uuid-del-centro'
GROUP BY cf.id, cf.nombre, cf.capacidad_total, cf.capacidad_disponible;
```

### Consulta 3: Verificar Integridad
```sql
-- Verificar que no hay inconsistencias
SELECT 
  COUNT(*) as centros_con_problemas
FROM centros_formadores
WHERE capacidad_disponible < 0 
   OR capacidad_disponible > capacidad_total;

-- Resultado esperado: 0
```

## ✅ Ventajas de la Integración

### 1. Gestión Automática Durante el Período
- No requiere intervención manual
- Cupos se ajustan en tiempo real
- Historial detallado de cada movimiento

### 2. Reinicio Limpio al Final
- Un solo clic restaura todo
- Solicitudes se finalizan automáticamente
- Sistema listo para nuevo ciclo

### 3. Auditoría Completa
- Dos historiales complementarios
- Trazabilidad total
- Análisis de uso de cupos

### 4. Sin Conflictos
- Tablas separadas
- Funciones independientes
- Modifican la misma columna sin problemas

## 🎯 Casos de Uso Reales

### Caso 1: Universidad con Rotaciones Semestrales

```
Enero: Reinicio manual
  └─> 50 cupos disponibles

Enero-Junio: Descuentos automáticos
  ├─> 10 solicitudes aprobadas
  ├─> 2 solicitudes rechazadas (cupos devueltos)
  └─> 15 cupos disponibles al final

Junio: Reinicio manual
  └─> 50 cupos disponibles nuevamente

Julio-Diciembre: Nuevo ciclo
```

### Caso 2: Hospital con Múltiples Centros

```
Reinicio: Todos los centros restaurados
  ├─> Centro A: 50 cupos
  ├─> Centro B: 30 cupos
  └─> Centro C: 40 cupos

Durante período:
  ├─> Centro A: 50 → 30 (20 aprobados)
  ├─> Centro B: 30 → 10 (20 aprobados)
  └─> Centro C: 40 → 25 (15 aprobados)

Reinicio: Todos restaurados
  ├─> Centro A: 30 → 50
  ├─> Centro B: 10 → 30
  └─> Centro C: 25 → 40
```

## 📝 Mejores Prácticas

### 1. Reiniciar al Inicio de Cada Período
```sql
-- Inicio de semestre
SELECT reiniciar_cupos_manual('pregrado', auth.uid(), 'Inicio semestre 2025-1');
```

### 2. Dejar que el Sistema Automático Trabaje
```javascript
// Solo aprobar/rechazar - el trigger hace el resto
await supabase
  .from('solicitudes_cupos')
  .update({ estado: 'aprobada' })
  .eq('id', solicitudId);
```

### 3. Revisar Historiales Periódicamente
```sql
-- Ver actividad del último mes
SELECT * FROM historial_movimientos_cupos
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
```

### 4. Validar Antes de Reiniciar
```sql
-- Ver estadísticas antes de reiniciar
SELECT obtener_estadisticas_pre_reinicio();
```

## 🚀 Demo Completa

Para ver una demostración completa de cómo funcionan juntos:

```sql
-- Ejecutar en Supabase SQL Editor
\i sql/scripts/demo_integracion_sistemas.sql
```

Este script muestra:
- Estado inicial después de reinicio
- Movimientos automáticos durante el período
- Estadísticas antes de reiniciar
- Ejecución de reinicio
- Estado final después de reinicio
- Timeline completo de eventos

## 🎉 Conclusión

Los dos sistemas funcionan **perfectamente juntos**:

1. **Sistema de Descuento Automático**: Gestiona el día a día
2. **Sistema de Reinicio Manual**: Limpia al final del período

Ambos:
- ✅ Modifican `capacidad_disponible` sin conflictos
- ✅ Tienen historiales separados para auditoría
- ✅ Se complementan en el ciclo completo
- ✅ Garantizan integridad de datos
- ✅ Son fáciles de usar

**El ciclo se repite indefinidamente**: Reinicio → Descuentos → Reinicio → Descuentos...
