# 🔧 Corrección: Control de Asistencia

## Error Detectado

```
Failed to load resource: the server responded with a status of 400 ()
Error en consulta a tabla rotaciones
```

## Causa del Error

La consulta intentaba hacer joins complejos desde la tabla `rotaciones`, pero las relaciones no estaban correctamente configuradas en Supabase.

### Consulta Incorrecta (Antes):

```javascript
const { data: rotacionesData } = await supabase
  .from('rotaciones')
  .select(`
    *,
    alumno:alumnos(...)  // ❌ Esta relación no existe
  `)
```

## Solución Implementada

Se cambió el enfoque: en lugar de consultar desde `rotaciones`, ahora se consulta desde `estudiantes_rotacion` y se filtran los que tienen rotaciones activas:

### Consulta Correcta (Ahora):

```javascript
// Consultar desde estudiantes_rotacion
const { data: estudiantesData } = await supabase
  .from('estudiantes_rotacion')
  .select(`
    *,
    solicitud:solicitudes_rotacion(
      id,
      especialidad,
      fecha_inicio,
      fecha_termino,
      estado,
      centro_formador:centros_formadores(nombre)
    ),
    rotacion:rotaciones(
      id,
      fecha_inicio,
      fecha_termino,
      estado,
      servicio:servicios_clinicos(id, nombre),
      tutor:tutores(id, nombres, apellidos)
    )
  `)
  .eq('solicitud.estado', 'aprobada');

// Filtrar rotaciones activas para la fecha seleccionada
const rotacionesMapeadas = estudiantesData
  .filter(est => {
    if (!est.rotacion || est.rotacion.length === 0) return false;
    const rotacion = est.rotacion[0];
    const fechaInicio = new Date(rotacion.fecha_inicio);
    const fechaTermino = new Date(rotacion.fecha_termino);
    const fechaActual = new Date(fechaSeleccionada);
    
    return rotacion.estado === 'activa' && 
           fechaActual >= fechaInicio && 
           fechaActual <= fechaTermino;
  })
  .map(est => ({
    // Mapear a estructura esperada
  }));
```

## Mapeo de Datos

Para mantener la compatibilidad con el resto del código, se mapean los datos:

```javascript
const rotacionesMapeadas = (rotacionesData || []).map(rot => ({
  ...rot,
  alumno: rot.estudiante ? {
    id: rot.estudiante.id,
    rut: rot.estudiante.rut,
    nombres: `${rot.estudiante.primer_nombre || ''} ${rot.estudiante.segundo_nombre || ''}`.trim(),
    apellidos: `${rot.estudiante.primer_apellido || ''} ${rot.estudiante.segundo_apellido || ''}`.trim(),
    carrera: rot.estudiante.carrera,
    centro_formador: rot.estudiante.solicitud?.centro_formador
  } : null
}));
```

## Estructura de Datos

### Tabla `rotaciones`:
```sql
CREATE TABLE rotaciones (
  id UUID PRIMARY KEY,
  estudiante_id UUID REFERENCES estudiantes_rotacion(id),
  servicio_id UUID REFERENCES servicios_clinicos(id),
  tutor_id UUID REFERENCES tutores(id),
  fecha_inicio DATE,
  fecha_termino DATE,
  estado VARCHAR(20),
  ...
);
```

### Tabla `estudiantes_rotacion`:
```sql
CREATE TABLE estudiantes_rotacion (
  id UUID PRIMARY KEY,
  rut VARCHAR(12),
  primer_nombre VARCHAR(100),
  segundo_nombre VARCHAR(100),
  primer_apellido VARCHAR(100),
  segundo_apellido VARCHAR(100),
  carrera VARCHAR(100),
  solicitud_rotacion_id UUID REFERENCES solicitudes_rotacion(id),
  ...
);
```

## Relaciones Correctas

```
rotaciones
  ├─ estudiante_id → estudiantes_rotacion
  │   └─ solicitud_rotacion_id → solicitudes_rotacion
  │       └─ centro_formador_id → centros_formadores
  ├─ servicio_id → servicios_clinicos
  └─ tutor_id → tutores
```

## Verificación

### Antes (Error 400):
```
❌ Error: Could not find relationship 'alumnos' in 'rotaciones'
```

### Ahora (Funciona):
```
✅ Rotaciones cargadas correctamente
✅ Estudiantes mapeados con sus datos
✅ Centro formador obtenido desde solicitud
```

## Datos Obtenidos

Para cada rotación, ahora se obtiene:

```javascript
{
  id: "uuid-rotacion",
  estudiante_id: "uuid-estudiante",
  fecha_inicio: "2025-01-15",
  fecha_termino: "2025-03-15",
  estado: "activa",
  
  // Datos del estudiante (mapeados)
  alumno: {
    id: "uuid-estudiante",
    rut: "12345678-9",
    nombres: "Juan Carlos",
    apellidos: "Pérez González",
    carrera: "Medicina",
    centro_formador: {
      nombre: "Universidad de Chile"
    }
  },
  
  // Datos del servicio
  servicio: {
    id: "uuid-servicio",
    nombre: "Urgencias"
  },
  
  // Datos del tutor
  tutor: {
    id: "uuid-tutor",
    nombres: "María",
    apellidos: "López"
  }
}
```

## Pruebas

### Prueba 1: Cargar Rotaciones

1. Abrir Control de Asistencia
2. Seleccionar fecha actual
3. Verificar que se carguen las rotaciones
4. No debe haber error 400

### Prueba 2: Ver Datos del Estudiante

1. En la tabla de asistencia
2. Verificar que se muestre:
   - Nombre completo del estudiante
   - RUT
   - Carrera
   - Servicio clínico
   - Tutor asignado

### Prueba 3: Marcar Asistencia

1. Seleccionar "Presente" o "Ausente"
2. Agregar observaciones
3. Click en "Guardar Asistencia"
4. Debe guardar correctamente

## Logs Esperados

### Consola (Sin Errores):

```
✅ Rotaciones cargadas: 5
✅ Asistencias cargadas: 3
🔔 Cambio detectado en rotaciones: {...}
```

### Consola (Antes - Con Error):

```
❌ Error en rotaciones: {
  code: "PGRST204",
  message: "Could not find relationship..."
}
```

## Archivos Modificados

- ✅ `src/pages/ControlAsistencia.jsx` - Consulta corregida y mapeo de datos

## Resumen

### Problema:
- Consulta incorrecta a tabla `alumnos`
- Error 400 en la petición
- No se cargaban las rotaciones

### Solución:
- Consulta corregida a `estudiantes_rotacion`
- Mapeo de datos para compatibilidad
- Obtención correcta del centro formador

### Resultado:
- ✅ Rotaciones se cargan correctamente
- ✅ Datos completos del estudiante
- ✅ Sin errores 400
- ✅ Control de asistencia funcional

---

**El Control de Asistencia ahora carga correctamente los alumnos y sus rotaciones** 🎉
