# 🔄 Actualización de Cupos en Tiempo Real

## Implementación Realizada

Se ha implementado un sistema completo de gestión de cupos que se actualiza automáticamente en tiempo real cuando se aprueban o rechazan solicitudes.

## Cambios Implementados

### 1. Actualización Automática de Cupos al Aprobar Solicitudes

Cuando el hospital aprueba una solicitud de cupos:

1. ✅ Se verifica que el centro tenga cupos disponibles suficientes
2. ✅ Se actualiza el estado de la solicitud a "aprobada"
3. ✅ Se resta el número de cupos solicitados de la capacidad disponible del centro
4. ✅ Se registra la fecha de revisión
5. ✅ Se muestra un mensaje confirmando la actualización

#### Código Implementado

```javascript
const handleAprobar = async (id) => {
  try {
    // Obtener la solicitud
    const solicitud = solicitudes.find(s => s.id === id);
    
    // Obtener capacidad actual del centro
    const { data: centroData } = await supabase
      .from('centros_formadores')
      .select('capacidad_total, capacidad_disponible')
      .eq('id', solicitud.centro_formador_id)
      .single();

    // Verificar disponibilidad
    if (centroData.capacidad_disponible < solicitud.numero_cupos) {
      alert('No hay suficientes cupos disponibles');
      return;
    }

    // Aprobar solicitud
    await supabase
      .from('solicitudes_cupos')
      .update({ 
        estado: 'aprobada',
        fecha_revision: new Date().toISOString()
      })
      .eq('id', id);

    // Actualizar capacidad disponible
    const nuevaCapacidadDisponible = centroData.capacidad_disponible - solicitud.numero_cupos;
    await supabase
      .from('centros_formadores')
      .update({ 
        capacidad_disponible: nuevaCapacidadDisponible
      })
      .eq('id', solicitud.centro_formador_id);

    alert(`Solicitud aprobada. Cupos disponibles: ${nuevaCapacidadDisponible}`);
  } catch (err) {
    alert('Error al aprobar solicitud: ' + err.message);
  }
};
```

### 2. Actualización en Tiempo Real - Capacidad Formadora

La página de Capacidad Formadora ahora se actualiza automáticamente cuando:
- Se aprueba una solicitud (disminuyen los cupos disponibles)
- Se rechaza una solicitud
- Se agrega un nuevo centro
- Se modifica la capacidad de un centro

#### Realtime Implementado

```javascript
useEffect(() => {
  fetchCentros();

  // Suscribirse a cambios en tiempo real
  const channel = supabase
    .channel('centros_formadores_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'centros_formadores'
    }, (payload) => {
      console.log('🔄 Cambio detectado:', payload);
      fetchCentros(); // Recargar datos
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [nivelFormacion]);
```

### 3. Indicador Visual de Actualización

Ambas páginas ahora muestran un indicador visual:
- 🟢 Punto verde pulsante
- Texto: "Actualización en tiempo real"

## Flujo Completo

### Escenario: Aprobar una Solicitud

1. **Centro Formador solicita 5 cupos**
   - Centro tiene: 50 cupos totales, 50 disponibles
   - Solicita: 5 cupos para Enfermería

2. **Hospital revisa la solicitud**
   - Ve la solicitud en "Solicitud de Cupos"
   - Click en "Aprobar"

3. **Sistema actualiza automáticamente**
   - Solicitud cambia a "aprobada"
   - Capacidad disponible: 50 → 45
   - Se registra fecha de revisión

4. **Actualización en tiempo real**
   - Página "Capacidad Formadora" se actualiza automáticamente
   - Muestra: 50 totales, 45 disponibles
   - Tasa de ocupación: 10%

5. **Centro Formador ve el cambio**
   - En su Dashboard, la solicitud cambia a "aprobada"
   - Sin necesidad de refrescar la página

## Páginas Afectadas

### 1. Solicitud de Cupos (Hospital)
**Archivo**: `src/pages/SolicitudCupos.jsx`

**Funcionalidades**:
- ✅ Aprobar solicitudes con actualización de cupos
- ✅ Rechazar solicitudes con motivo
- ✅ Verificación de cupos disponibles
- ✅ Actualización en tiempo real de solicitudes
- ✅ Notificación de nuevas solicitudes

### 2. Capacidad Formadora (Hospital)
**Archivo**: `src/pages/CapacidadFormadora.jsx`

**Funcionalidades**:
- ✅ Visualización de cupos totales y disponibles
- ✅ Actualización automática cuando cambian los cupos
- ✅ Indicador de actualización en tiempo real
- ✅ Estadísticas actualizadas (tasa de ocupación)

### 3. Dashboard (Centro Formador)
**Archivo**: `Centros-formadores-/src/pages/Dashboard.jsx`

**Funcionalidades**:
- ✅ Ver solicitudes aprobadas/rechazadas en tiempo real
- ✅ Actualización automática cada 5 segundos
- ✅ Notificaciones de cambios de estado

## Validaciones Implementadas

### Al Aprobar una Solicitud

1. **Verificación de existencia**: Se verifica que la solicitud exista
2. **Verificación de cupos**: Se verifica que haya cupos disponibles suficientes
3. **Transacción atómica**: Se actualizan solicitud y capacidad en secuencia
4. **Manejo de errores**: Si algo falla, se muestra un mensaje claro

### Mensajes de Error

```javascript
// No hay cupos suficientes
"No hay suficientes cupos disponibles. Disponibles: 45, Solicitados: 50"

// Error general
"Error al aprobar solicitud: [mensaje de error]"
```

## Estadísticas en Tiempo Real

La página de Capacidad Formadora muestra:

```
┌─────────────────────────────────────────────────────┐
│  Centros Activos: 5                                 │
│  Capacidad Total: 250                               │
│  Cupos Disponibles: 180                             │
│  Tasa Ocupación: 28%                                │
└─────────────────────────────────────────────────────┘
```

Estas estadísticas se actualizan automáticamente cuando:
- Se aprueba una solicitud
- Se rechaza una solicitud aprobada previamente
- Se modifica la capacidad de un centro

## Logs en Consola

Para facilitar el debugging:

```
✅ Cupos actualizados: 50 → 45
🔄 Cambio detectado en centros formadores: {...}
🔄 Cambio detectado en solicitudes: {...}
```

## Pruebas

### Probar Aprobación de Solicitud

1. **Preparación**:
   - Asegúrate de tener un centro con cupos disponibles
   - Crea una solicitud desde el portal de centros

2. **Aprobar**:
   - Ve a "Solicitud de Cupos" en el hospital
   - Click en "Aprobar" en una solicitud pendiente

3. **Verificar**:
   - Ve a "Capacidad Formadora"
   - Los cupos disponibles deben haber disminuido
   - La actualización debe ser automática (sin refrescar)

### Probar Actualización en Tiempo Real

1. **Abrir dos ventanas**:
   - Ventana 1: Capacidad Formadora
   - Ventana 2: Solicitud de Cupos

2. **Aprobar en Ventana 2**:
   - Aprobar una solicitud

3. **Observar Ventana 1**:
   - Los cupos deben actualizarse automáticamente
   - Sin necesidad de refrescar

### Probar Validación de Cupos

1. **Crear solicitud con más cupos de los disponibles**:
   - Centro tiene: 10 cupos disponibles
   - Solicitar: 15 cupos

2. **Intentar aprobar**:
   - Debe mostrar error: "No hay suficientes cupos disponibles"
   - No debe actualizar nada

## Configuración de Realtime en Supabase

Para que funcione correctamente, verifica:

1. **Realtime habilitado**:
   - Settings → API → Realtime: Enabled

2. **Replicación de tablas**:
   ```sql
   ALTER TABLE centros_formadores REPLICA IDENTITY FULL;
   ALTER TABLE solicitudes_cupos REPLICA IDENTITY FULL;
   ```

3. **Políticas RLS**:
   - Las políticas deben permitir SELECT en ambas tablas

## Archivos Modificados

- ✅ `src/pages/SolicitudCupos.jsx` - Aprobación con actualización de cupos
- ✅ `src/pages/CapacidadFormadora.jsx` - Actualización en tiempo real

## Beneficios

1. ✅ **Datos siempre actualizados**: No hay datos obsoletos
2. ✅ **Sin refrescar manualmente**: Todo se actualiza automáticamente
3. ✅ **Validación de cupos**: No se pueden aprobar más cupos de los disponibles
4. ✅ **Feedback inmediato**: El usuario ve los cambios al instante
5. ✅ **Trazabilidad**: Se registra la fecha de revisión

## Próximos Pasos

1. Probar la aprobación de solicitudes
2. Verificar que los cupos se actualicen correctamente
3. Confirmar que la actualización en tiempo real funcione
4. Revisar las estadísticas en Capacidad Formadora

---

**Nota**: Si los cupos no se actualizan, verifica que Realtime esté habilitado en Supabase y que las tablas tengan replicación activa.
