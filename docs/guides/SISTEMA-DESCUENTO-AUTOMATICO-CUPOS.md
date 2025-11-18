# Sistema de Descuento Automático de Cupos

## 📋 Descripción General

Sistema completo con **triggers automáticos** que descuenta y devuelve cupos de los centros formadores cuando cambia el estado de las solicitudes. No requiere lógica manual en el frontend.

## 🎯 Características

### ✅ Descuento Automático
- Cuando una solicitud se **aprueba**, los cupos se descuentan automáticamente
- Validación de cupos disponibles antes de aprobar
- Registro completo en historial

### ✅ Devolución Automática
- Cuando una solicitud **aprobada** se rechaza, los cupos se devuelven
- Cuando se elimina una solicitud aprobada, los cupos se devuelven
- Cuando se revierte una aprobación, los cupos se devuelven

### ✅ Ajuste Dinámico
- Si se cambia el número de cupos en una solicitud aprobada, se ajusta automáticamente
- Validación de cupos disponibles para aumentos
- Registro de todos los cambios

### ✅ Historial Completo
- Tabla `historial_movimientos_cupos` registra cada movimiento
- Auditoría completa: quién, cuándo, cuánto, por qué
- Consultas para análisis y reportes

## 🔄 Flujos del Sistema

### Flujo 1: Aprobar Solicitud Nueva

```
1. Centro formador crea solicitud
   └─> Estado: "pendiente"
   └─> Cupos del centro: NO cambian

2. Hospital valida cupos disponibles
   └─> Llama a: validar_cupos_disponibles()
   └─> Verifica: capacidad_disponible >= cupos_solicitados

3. Hospital aprueba solicitud
   └─> UPDATE solicitudes_cupos SET estado = 'aprobada'
   └─> TRIGGER se ejecuta automáticamente:
       ├─> Descuenta cupos: capacidad_disponible -= numero_cupos
       └─> Registra en historial_movimientos_cupos

4. Resultado
   └─> Solicitud: estado = "aprobada"
   └─> Centro: capacidad_disponible reducida
   └─> Historial: movimiento registrado
```

### Flujo 2: Rechazar Solicitud Aprobada

```
1. Solicitud está aprobada
   └─> Cupos ya descontados

2. Hospital rechaza solicitud
   └─> UPDATE solicitudes_cupos SET estado = 'rechazada'
   └─> TRIGGER se ejecuta automáticamente:
       ├─> Devuelve cupos: capacidad_disponible += numero_cupos
       └─> Registra en historial_movimientos_cupos

3. Resultado
   └─> Solicitud: estado = "rechazada"
   └─> Centro: capacidad_disponible restaurada
   └─> Historial: devolución registrada
```

### Flujo 3: Eliminar Solicitud Aprobada

```
1. Solicitud está aprobada
   └─> Cupos ya descontados

2. Se elimina la solicitud
   └─> DELETE FROM solicitudes_cupos WHERE id = ...
   └─> TRIGGER se ejecuta automáticamente:
       ├─> Devuelve cupos: capacidad_disponible += numero_cupos
       └─> Registra en historial_movimientos_cupos

3. Resultado
   └─> Solicitud: eliminada
   └─> Centro: capacidad_disponible restaurada
   └─> Historial: devolución registrada
```

### Flujo 4: Cambiar Número de Cupos (Solicitud Aprobada)

```
1. Solicitud aprobada con 10 cupos
   └─> Cupos ya descontados: -10

2. Se cambia a 15 cupos
   └─> UPDATE solicitudes_cupos SET numero_cupos = 15
   └─> TRIGGER detecta cambio:
       ├─> Diferencia: +5 cupos
       ├─> Valida disponibilidad
       ├─> Descuenta adicionales: capacidad_disponible -= 5
       └─> Registra en historial

3. Se cambia a 8 cupos
   └─> UPDATE solicitudes_cupos SET numero_cupos = 8
   └─> TRIGGER detecta cambio:
       ├─> Diferencia: -2 cupos
       ├─> Devuelve excedente: capacidad_disponible += 2
       └─> Registra en historial
```

## 🗄️ Estructura de Base de Datos

### Tabla: `historial_movimientos_cupos`

```sql
CREATE TABLE historial_movimientos_cupos (
  id UUID PRIMARY KEY,
  centro_formador_id UUID NOT NULL,
  solicitud_cupos_id UUID,
  tipo_movimiento VARCHAR(20), -- 'descuento', 'devolucion', 'reinicio', 'ajuste_manual'
  cupos_afectados INTEGER NOT NULL,
  capacidad_antes INTEGER NOT NULL,
  capacidad_despues INTEGER NOT NULL,
  estado_solicitud VARCHAR(20),
  motivo TEXT,
  usuario_id UUID,
  created_at TIMESTAMPTZ
);
```

### Función: `sincronizar_cupos_solicitud()`

Trigger principal que maneja todos los casos:
- INSERT con estado 'aprobada'
- UPDATE de estado (pendiente → aprobada, aprobada → rechazada, etc.)
- UPDATE de numero_cupos en solicitud aprobada
- DELETE de solicitud aprobada

### Función: `validar_cupos_disponibles()`

```sql
SELECT validar_cupos_disponibles(
  'uuid-del-centro',
  10 -- cupos solicitados
);
```

**Retorna:**
```json
{
  "valido": true,
  "centro_nombre": "Universidad XYZ",
  "capacidad_total": 50,
  "capacidad_disponible": 30,
  "cupos_solicitados": 10,
  "cupos_faltantes": 0
}
```

### Función: `registrar_movimiento_cupos()`

Función interna usada por el trigger para registrar movimientos.

## 💻 Uso en el Frontend

### Validar Cupos Antes de Aprobar

```javascript
const validarCupos = async (centroId, cuposSolicitados) => {
  const { data, error } = await supabase
    .rpc('validar_cupos_disponibles', {
      p_centro_id: centroId,
      p_cupos_solicitados: cuposSolicitados
    });

  if (!data.valido) {
    alert(`No hay suficientes cupos. Faltan: ${data.cupos_faltantes}`);
    return false;
  }

  return true;
};
```

### Aprobar Solicitud (Simple)

```javascript
const aprobarSolicitud = async (solicitudId) => {
  // El trigger se encarga de todo automáticamente
  const { error } = await supabase
    .from('solicitudes_cupos')
    .update({ estado: 'aprobada' })
    .eq('id', solicitudId);

  if (error) {
    // Puede fallar si no hay cupos suficientes
    alert('Error: ' + error.message);
  } else {
    alert('✅ Solicitud aprobada. Cupos descontados automáticamente.');
  }
};
```

### Rechazar Solicitud

```javascript
const rechazarSolicitud = async (solicitudId, motivo) => {
  // El trigger devuelve cupos automáticamente si estaba aprobada
  const { error } = await supabase
    .from('solicitudes_cupos')
    .update({ 
      estado: 'rechazada',
      motivo_rechazo: motivo
    })
    .eq('id', solicitudId);

  if (!error) {
    alert('⚠️ Solicitud rechazada. Cupos devueltos automáticamente.');
  }
};
```

### Ver Historial de Movimientos

```javascript
const verHistorial = async (centroId) => {
  const { data } = await supabase
    .from('historial_movimientos_cupos')
    .select(`
      *,
      centro_formador:centros_formadores(nombre),
      solicitud:solicitudes_cupos(especialidad)
    `)
    .eq('centro_formador_id', centroId)
    .order('created_at', { ascending: false });

  return data;
};
```

## 📊 Consultas Útiles

### Ver movimientos de un centro

```sql
SELECT 
  created_at,
  tipo_movimiento,
  cupos_afectados,
  capacidad_antes,
  capacidad_despues,
  motivo
FROM historial_movimientos_cupos
WHERE centro_formador_id = 'uuid-del-centro'
ORDER BY created_at DESC;
```

### Resumen de movimientos por centro

```sql
SELECT 
  cf.nombre,
  COUNT(*) as total_movimientos,
  SUM(CASE WHEN tipo_movimiento = 'descuento' THEN cupos_afectados ELSE 0 END) as total_descontados,
  SUM(CASE WHEN tipo_movimiento = 'devolucion' THEN cupos_afectados ELSE 0 END) as total_devueltos
FROM historial_movimientos_cupos hmc
JOIN centros_formadores cf ON hmc.centro_formador_id = cf.id
GROUP BY cf.nombre
ORDER BY total_movimientos DESC;
```

### Movimientos del último mes

```sql
SELECT 
  cf.nombre,
  hmc.tipo_movimiento,
  hmc.cupos_afectados,
  hmc.created_at
FROM historial_movimientos_cupos hmc
JOIN centros_formadores cf ON hmc.centro_formador_id = cf.id
WHERE hmc.created_at >= NOW() - INTERVAL '30 days'
ORDER BY hmc.created_at DESC;
```

### Centros con más movimientos

```sql
SELECT 
  cf.nombre,
  COUNT(*) as total_movimientos,
  cf.capacidad_total,
  cf.capacidad_disponible
FROM historial_movimientos_cupos hmc
JOIN centros_formadores cf ON hmc.centro_formador_id = cf.id
GROUP BY cf.id, cf.nombre, cf.capacidad_total, cf.capacidad_disponible
ORDER BY total_movimientos DESC
LIMIT 10;
```

## 🔒 Seguridad

### Políticas RLS
- ✅ Usuarios autenticados pueden **ver** el historial
- ❌ Solo triggers (SECURITY DEFINER) pueden **insertar** registros
- Previene manipulación manual del historial

### Validaciones
- Verifica cupos disponibles antes de descontar
- Lanza excepción si no hay cupos suficientes
- Transacciones atómicas (todo o nada)

### Auditoría
- Cada movimiento registra:
  - Centro afectado
  - Solicitud relacionada
  - Tipo de movimiento
  - Cupos afectados
  - Capacidad antes/después
  - Motivo
  - Fecha y hora

## 🚀 Instalación

### Paso 1: Ejecutar Script SQL

```sql
-- En Supabase SQL Editor
\i sql/scripts/sistema_descuento_cupos_automatico.sql
```

### Paso 2: Verificar Instalación

```sql
-- Verificar que la tabla existe
SELECT * FROM historial_movimientos_cupos LIMIT 1;

-- Verificar que el trigger existe
SELECT tgname FROM pg_trigger WHERE tgname = 'trigger_sincronizar_cupos';

-- Probar función de validación
SELECT validar_cupos_disponibles('uuid-de-un-centro', 5);
```

### Paso 3: Actualizar Frontend

Reemplazar lógica manual de descuento por llamadas simples al trigger.

## ✅ Ventajas del Sistema

1. **Automático**: No requiere código manual en frontend
2. **Consistente**: Funciona incluso si se modifica desde SQL
3. **Transaccional**: Todo o nada, sin estados inconsistentes
4. **Auditable**: Historial completo de todos los movimientos
5. **Robusto**: Maneja todos los casos edge
6. **Escalable**: Funciona con miles de solicitudes
7. **Integrado**: Compatible con sistema de reinicio de cupos

## 🔄 Integración con Sistema de Reinicio

El sistema de descuento automático es **compatible** con el sistema de reinicio de cupos (Fase 1):

```sql
-- Reiniciar cupos (Fase 1)
SELECT reiniciar_cupos_manual('pregrado', auth.uid(), 'Reinicio semestral');

-- Resultado:
-- 1. capacidad_disponible = capacidad_total (todos los centros)
-- 2. solicitudes aprobadas → "finalizada"
-- 3. Historial de reinicio registrado

-- Después del reinicio:
-- 1. Nuevas solicitudes pueden ser aprobadas
-- 2. Triggers siguen funcionando normalmente
-- 3. Historial de movimientos continúa registrando
```

## 🐛 Troubleshooting

### Error: "No hay suficientes cupos disponibles"
**Causa**: El centro no tiene cupos suficientes  
**Solución**: Verificar capacidad_disponible del centro o rechazar solicitud

### Error: "relation does not exist"
**Causa**: Tabla historial_movimientos_cupos no existe  
**Solución**: Ejecutar script de instalación

### Los cupos no se descuentan
**Causa**: Trigger no está creado  
**Solución**: Verificar con `SELECT tgname FROM pg_trigger WHERE tgname = 'trigger_sincronizar_cupos'`

### Cupos negativos
**Causa**: Datos inconsistentes antes de instalar el sistema  
**Solución**: Ejecutar `UPDATE centros_formadores SET capacidad_disponible = GREATEST(0, capacidad_disponible)`

## 📚 Archivos Relacionados

- `sql/scripts/sistema_descuento_cupos_automatico.sql` - Script de instalación
- `src/pages/SolicitudCupos.jsx` - Interfaz de gestión de solicitudes
- `src/components/HistorialMovimientosCupos.jsx` - Componente de historial
- `docs/guides/SISTEMA-DESCUENTO-AUTOMATICO-CUPOS.md` - Esta documentación
