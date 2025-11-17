# ✅ Seguimiento de Estudiantes - Actualizado con Realtime

## 🎯 Cambios Implementados

### 1. Actualización de Queries

**Antes** (tablas temporales):
- `estudiantes_rotacion`
- `asistencia_estudiantes`
- `observaciones_estudiantes`

**Ahora** (tablas definitivas):
- `alumnos` (con `alumno_id`)
- `asistencias` (con `alumno_id` y `estado`)
- Observaciones desde `asistencias.observaciones`

### 2. Realtime Activado 🔔

Se agregó suscripción en tiempo real a la tabla `asistencias`:
- Detecta cambios automáticamente (INSERT, UPDATE, DELETE)
- Filtra solo las asistencias del estudiante seleccionado
- Actualiza el calendario sin recargar la página
- Recalcula estadísticas automáticamente

### 3. Indicadores Visuales en Calendario

**Esquina Superior Izquierda** - Estado de Asistencia:
- 🟢 Verde: Presente
- 🔴 Rojo suave: Ausente
- 🟡 Amarillo: Justificado
- 🟠 Naranja: Tarde

**Esquina Superior Derecha** - Observaciones:
- 🔵 Azul: Tiene observaciones

---

## 🔄 Flujo de Actualización en Tiempo Real

```
1. Hospital registra asistencia
   ↓
2. Se guarda en tabla 'asistencias'
   ↓
3. Supabase Realtime detecta el cambio
   ↓
4. Centro Formador recibe notificación
   ↓
5. Se actualiza el calendario automáticamente
   ↓
6. Se recalculan las estadísticas
```

---

## 💻 Código Implementado

### Suscripción Realtime

```javascript
useEffect(() => {
  if (!estudianteSeleccionado) return;

  const asistenciasChannel = supabase
    .channel('asistencias_realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'asistencias',
        filter: `alumno_id=eq.${estudianteSeleccionado.id}`
      },
      (payload) => {
        console.log('🔔 Cambio en asistencias:', payload);
        fetchAsistencias();
        calcularEstadisticas();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(asistenciasChannel);
  };
}, [estudianteSeleccionado, mesActual]);
```

### Query de Estudiantes

```javascript
const { data: estudiantesData } = await supabase
  .from('alumnos')
  .select(`
    *,
    centro_formador:centros_formadores(nombre),
    rotaciones!alumno_id(
      id,
      fecha_inicio,
      fecha_termino,
      estado,
      servicio:servicios_clinicos(nombre)
    )
  `)
  .eq('centro_formador_id', centroData.centro_formador_id)
  .eq('estado', 'en_rotacion')
  .order('primer_apellido', { ascending: true });
```

### Query de Asistencias

```javascript
const { data } = await supabase
  .from('asistencias')
  .select('*')
  .eq('alumno_id', estudianteSeleccionado.id)
  .gte('fecha', primerDia.toISOString().split('T')[0])
  .lte('fecha', ultimoDia.toISOString().split('T')[0]);
```

### Query de Observaciones

```javascript
const { data } = await supabase
  .from('asistencias')
  .select('fecha, observaciones, estado')
  .eq('alumno_id', estudianteSeleccionado.id)
  .not('observaciones', 'is', null)
  .order('fecha', { ascending: false })
  .limit(10);
```

---

## 🧪 Cómo Probar el Realtime

### Prueba 1: Actualización Automática

1. **Abrir Centros-Formadores**:
   ```bash
   cd Centros-formadores
   npm run dev
   ```
   - Ir a Seguimiento de Estudiantes
   - Seleccionar un estudiante
   - Ver el calendario

2. **Abrir Hospital** (en otra ventana):
   ```bash
   npm run dev
   ```
   - Ir a Control de Asistencia
   - Marcar asistencia del mismo estudiante

3. **Verificar**:
   - El calendario en Centros-Formadores debe actualizarse automáticamente
   - Debe aparecer el círculo de color en la esquina
   - Las estadísticas deben recalcularse

### Prueba 2: Observaciones en Tiempo Real

1. En Hospital:
   - Marcar "Ausencia justificada"
   - Agregar observación

2. En Centros-Formadores:
   - Debe aparecer el círculo azul (observación)
   - Al hacer clic en el día, debe mostrar la observación

### Prueba 3: Múltiples Cambios

1. En Hospital:
   - Cambiar de "Presente" a "Tarde"
   - Luego a "Justificado"

2. En Centros-Formadores:
   - Cada cambio debe reflejarse inmediatamente
   - Los colores deben actualizarse

---

## 🎨 Indicadores Visuales

### Calendario - Vista de un Día

```
┌─────────────────────────┐
│ 🟢              🔵      │  ← Indicadores en esquinas
│                         │
│          15             │  ← Número del día
│                         │
│   ✓ Presente           │  ← Estado completo
└─────────────────────────┘
```

### Estados y Colores

| Estado | Círculo | Color Light | Color Dark |
|--------|---------|-------------|------------|
| Presente | 🟢 | `bg-green-500` | `bg-green-400` |
| Ausente | 🔴 | `bg-red-400` | `bg-red-500` |
| Justificado | 🟡 | `bg-yellow-500` | `bg-yellow-400` |
| Tarde | 🟠 | `bg-orange-500` | `bg-orange-400` |
| Observación | 🔵 | `bg-blue-500` | `bg-blue-400` |

---

## 📊 Estadísticas Actualizadas

El componente calcula automáticamente:
- Total de días con asistencia
- Días presentes
- Días tarde
- Días ausentes
- Días justificados
- Porcentaje de asistencia
- Promedio de horas trabajadas

---

## 🔧 Configuración de Realtime en Supabase

Para que Realtime funcione, verifica en Supabase:

### 1. Habilitar Realtime

1. Ve a tu proyecto en Supabase
2. Settings → API
3. Verifica que "Realtime" esté habilitado

### 2. Habilitar Replicación

```sql
-- Habilitar replicación para la tabla asistencias
ALTER TABLE asistencias REPLICA IDENTITY FULL;
```

### 3. Verificar Permisos

```sql
-- Verificar que los usuarios puedan leer asistencias
SELECT * FROM pg_policies WHERE tablename = 'asistencias';
```

---

## 📋 Checklist de Implementación

### Centros-Formadores ✅
- [x] Actualizar query de estudiantes (usar `alumnos`)
- [x] Actualizar query de asistencias (usar `alumno_id`)
- [x] Actualizar query de observaciones
- [x] Agregar suscripción Realtime
- [x] Indicadores visuales en calendario
- [x] Cleanup de suscripciones

### Supabase ⏳
- [ ] Habilitar Realtime en el proyecto
- [ ] Ejecutar `ALTER TABLE asistencias REPLICA IDENTITY FULL`
- [ ] Verificar permisos de lectura

### Testing ⏳
- [ ] Probar actualización en tiempo real
- [ ] Verificar indicadores visuales
- [ ] Probar con múltiples usuarios
- [ ] Verificar en dark mode

---

## 🐛 Troubleshooting

### Realtime no funciona

**Causa 1**: Realtime no está habilitado
**Solución**: Ir a Supabase Settings → API → Habilitar Realtime

**Causa 2**: Replicación no está habilitada
**Solución**: Ejecutar `ALTER TABLE asistencias REPLICA IDENTITY FULL`

**Causa 3**: Permisos insuficientes
**Solución**: Verificar políticas RLS en Supabase

### Los indicadores no aparecen

**Causa**: La columna `estado` no tiene datos
**Solución**: Verificar que Hospital esté guardando con `estado`

### Observaciones no se muestran

**Causa**: La query filtra mal
**Solución**: Verificar que `observaciones` no sea NULL en la BD

---

## 📞 Próximos Pasos

1. ✅ **Queries actualizadas** - Usa tablas correctas
2. ✅ **Realtime implementado** - Actualizaciones automáticas
3. ✅ **Indicadores visuales** - Círculos de colores
4. ⏳ **Habilitar Realtime en Supabase**
5. ⏳ **Probar flujo completo**

---

**Estado**: ✅ Código Completado | ⏳ Configuración Supabase Pendiente  
**Fecha**: Enero 2025  
**Versión**: 2.0
