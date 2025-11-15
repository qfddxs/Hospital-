# 🧪 Pruebas de Actualización de Cupos en Tiempo Real

## Sistema Completo Implementado

Todas las páginas relacionadas con cupos ahora se actualizan automáticamente en tiempo real.

## Páginas con Actualización Automática

### 1. Capacidad Formadora (Hospital)
- ✅ Polling cada 5 segundos
- ✅ Realtime de Supabase
- ✅ Indicador visual "Actualización en tiempo real"

### 2. Solicitud de Cupos (Hospital)
- ✅ Realtime para nuevas solicitudes
- ✅ Actualización al aprobar/rechazar
- ✅ Notificación de nuevas solicitudes

### 3. Solicitar Cupos (Centro Formador)
- ✅ Polling cada 5 segundos
- ✅ Realtime de Supabase
- ✅ Indicador visual "Actualización en tiempo real"

### 4. Dashboard (Centro Formador)
- ✅ Polling cada 5 segundos
- ✅ Realtime para solicitudes de cupos y rotación
- ✅ Indicador de última actualización

## Prueba Completa Paso a Paso

### Preparación

1. **Abrir 3 ventanas del navegador**:
   - Ventana A: Hospital - Capacidad Formadora
   - Ventana B: Hospital - Solicitud de Cupos
   - Ventana C: Centro Formador - Solicitar Cupos

2. **Verificar estado inicial**:
   - Ventana A: Ver cupos disponibles (ej: 50)
   - Ventana C: Ver cupos disponibles (ej: 50)

### Prueba 1: Aprobar Solicitud

**Objetivo**: Verificar que los cupos se actualicen en todas las páginas

1. **En Ventana C (Centro - Solicitar Cupos)**:
   - Crear una solicitud de 5 cupos para "Enfermería"
   - Click en "Enviar Solicitud"
   - Esperar confirmación

2. **En Ventana B (Hospital - Solicitud de Cupos)**:
   - Debe aparecer la nueva solicitud (puede tardar hasta 5 segundos)
   - O aparecer notificación instantánea si Realtime funciona
   - Click en "Aprobar"

3. **Verificar Actualización Automática**:
   
   **Ventana A (Hospital - Capacidad Formadora)**:
   - ✅ Cupos disponibles: 50 → 45
   - ✅ Tasa de ocupación: 0% → 10%
   - ✅ Sin refrescar la página
   - ⏱️ Tiempo: Instantáneo (Realtime) o máximo 5 segundos (Polling)
   
   **Ventana C (Centro - Solicitar Cupos)**:
   - ✅ Cupos disponibles: 50 → 45
   - ✅ Máximo a solicitar: 45
   - ✅ Sin refrescar la página
   - ⏱️ Tiempo: Instantáneo (Realtime) o máximo 5 segundos (Polling)

### Prueba 2: Múltiples Aprobaciones

**Objetivo**: Verificar que las actualizaciones sean consistentes

1. **Crear 3 solicitudes desde el Centro**:
   - Solicitud 1: 5 cupos (Enfermería)
   - Solicitud 2: 10 cupos (Medicina)
   - Solicitud 3: 8 cupos (Kinesiología)

2. **Aprobar una por una desde el Hospital**:
   - Aprobar Solicitud 1
   - Esperar actualización (máximo 5 segundos)
   - Verificar: 50 → 45 cupos
   
   - Aprobar Solicitud 2
   - Esperar actualización
   - Verificar: 45 → 35 cupos
   
   - Aprobar Solicitud 3
   - Esperar actualización
   - Verificar: 35 → 27 cupos

3. **Verificar en todas las ventanas**:
   - Todas deben mostrar 27 cupos disponibles
   - Sin refrescar ninguna página

### Prueba 3: Validación de Cupos

**Objetivo**: Verificar que no se puedan solicitar más cupos de los disponibles

1. **Estado inicial**: 27 cupos disponibles

2. **En Ventana C (Centro - Solicitar Cupos)**:
   - Intentar solicitar 30 cupos
   - ✅ Input se pone rojo
   - ✅ Mensaje: "⚠️ Excede los cupos disponibles (27)"
   - ✅ Botón "Enviar Solicitud" deshabilitado

3. **Cambiar a 27 cupos**:
   - ✅ Input vuelve a normal
   - ✅ Botón habilitado
   - ✅ Puede enviar la solicitud

4. **En Hospital, intentar aprobar solicitud de 30 cupos**:
   - ✅ Muestra error: "No hay suficientes cupos disponibles"
   - ✅ No actualiza nada
   - ✅ Cupos siguen en 27

### Prueba 4: Actualización en Tiempo Real

**Objetivo**: Verificar que Realtime funciona correctamente

1. **Abrir Consola del Navegador (F12)** en todas las ventanas

2. **Aprobar una solicitud en el Hospital**

3. **Verificar logs en consola**:
   
   **Ventana A (Hospital - Capacidad Formadora)**:
   ```
   🔔 Cambio detectado en centros formadores: {...}
   ✅ Capacidad formadora actualizada
   ```
   
   **Ventana C (Centro - Solicitar Cupos)**:
   ```
   🔔 Cambio detectado en cupos: {...}
   ✅ Cupos actualizados: 45 disponibles
   ```

4. **Si no ves los logs de Realtime**:
   - Es normal, el polling cada 5 segundos funciona como respaldo
   - Verás: `🔄 Actualizando capacidad formadora (polling)...`

### Prueba 5: Estadísticas en Tiempo Real

**Objetivo**: Verificar que las estadísticas se actualicen correctamente

1. **En Ventana A (Hospital - Capacidad Formadora)**:
   - Observar las 4 tarjetas superiores:
     - Centros Activos
     - Capacidad Total
     - Cupos Disponibles
     - Tasa Ocupación

2. **Aprobar varias solicitudes**

3. **Verificar que se actualicen**:
   - ✅ Cupos Disponibles disminuye
   - ✅ Tasa Ocupación aumenta
   - ✅ Capacidad Total se mantiene
   - ✅ Sin refrescar la página

### Prueba 6: Indicadores Visuales

**Objetivo**: Verificar que los indicadores visuales funcionen

1. **En todas las páginas, buscar**:
   ```
   🟢 Actualización en tiempo real
   ```

2. **Verificar**:
   - ✅ Punto verde pulsante visible
   - ✅ Texto "Actualización en tiempo real"
   - ✅ Indica que el sistema está activo

## Resultados Esperados

### ✅ Actualización Automática
- Los cupos se actualizan sin refrescar
- Tiempo máximo: 5 segundos
- Tiempo ideal: Instantáneo (Realtime)

### ✅ Validaciones
- No se pueden solicitar más cupos de los disponibles
- No se pueden aprobar solicitudes sin cupos suficientes
- Mensajes de error claros

### ✅ Consistencia
- Todas las páginas muestran los mismos datos
- No hay discrepancias entre ventanas
- Los datos son siempre actuales

### ✅ Feedback Visual
- Indicadores de actualización en tiempo real
- Logs en consola para debugging
- Mensajes de confirmación al aprobar

## Logs Esperados en Consola

### Capacidad Formadora (Hospital)
```
🔄 Actualizando capacidad formadora (polling)...
✅ Capacidad formadora actualizada
🔔 Cambio detectado en centros formadores: {...}
```

### Solicitar Cupos (Centro)
```
🔄 Actualizando cupos disponibles...
✅ Cupos actualizados: 45 disponibles
🔔 Cambio detectado en cupos: {...}
```

### Solicitud de Cupos (Hospital)
```
🔄 Cambio detectado en solicitudes: {...}
✅ Cupos actualizados: 50 → 45
```

## Solución de Problemas

### Problema: Los cupos no se actualizan

**Verificar**:
1. Abrir consola (F12)
2. Buscar errores en rojo
3. Verificar que aparezcan los logs de polling

**Solución**:
- Si no hay logs: Refrescar la página
- Si hay errores: Verificar conexión a Supabase
- Si polling funciona pero Realtime no: Es normal, el polling es suficiente

### Problema: Actualización muy lenta

**Causa**: Realtime no habilitado

**Solución**:
1. Ve a Supabase Dashboard
2. Settings → API
3. Verifica que Realtime esté habilitado
4. Si no está habilitado, el polling cada 5 segundos funciona perfectamente

### Problema: Error al aprobar

**Verificar**:
1. Que la columna `capacidad_disponible` exista
2. Que las políticas RLS permitan UPDATE
3. Que el centro tenga cupos disponibles

**Solución**:
```sql
-- Verificar columnas
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'centros_formadores';

-- Agregar columnas si no existen
ALTER TABLE centros_formadores 
ADD COLUMN IF NOT EXISTS capacidad_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS capacidad_disponible INTEGER DEFAULT 0;
```

## Checklist de Verificación

Antes de dar por terminada la prueba, verificar:

- [ ] Capacidad Formadora se actualiza automáticamente
- [ ] Solicitar Cupos muestra cupos actualizados
- [ ] No se pueden solicitar más cupos de los disponibles
- [ ] Al aprobar, los cupos disminuyen correctamente
- [ ] Todas las ventanas muestran los mismos datos
- [ ] Los indicadores visuales funcionan
- [ ] Los logs aparecen en consola
- [ ] Las estadísticas se actualizan
- [ ] La tasa de ocupación se calcula correctamente
- [ ] El sistema funciona sin refrescar páginas

## Resumen

### Sistema Implementado:
- ✅ Actualización automática cada 5 segundos (Polling)
- ✅ Actualización instantánea (Realtime)
- ✅ Validaciones en todos los puntos
- ✅ Indicadores visuales claros
- ✅ Logs para debugging
- ✅ Consistencia de datos

### Páginas Actualizadas:
- ✅ Capacidad Formadora (Hospital)
- ✅ Solicitud de Cupos (Hospital)
- ✅ Solicitar Cupos (Centro)
- ✅ Dashboard (Centro)

### Tiempo de Actualización:
- ⚡ Instantáneo con Realtime
- ⏱️ Máximo 5 segundos con Polling

---

**El sistema está completamente funcional y actualiza los cupos en tiempo real** 🎉
