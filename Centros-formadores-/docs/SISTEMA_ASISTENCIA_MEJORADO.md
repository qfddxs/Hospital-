# 📊 Sistema de Asistencia Mejorado

## ✅ Cambios Implementados en Centros-Formadores

### 1. Calendario con Indicadores Visuales

**Esquina Superior Izquierda** - Estado de Asistencia:
- 🟢 **Verde** (`bg-green-500`): Presente
- 🔴 **Rojo suave** (`bg-red-400`): Ausente
- 🟡 **Amarillo** (`bg-yellow-500`): Justificado
- 🟠 **Naranja** (`bg-orange-500`): Tarde

**Esquina Superior Derecha** - Observaciones:
- 🔵 **Azul** (`bg-blue-500`): Tiene observaciones
- Color amigable que funciona en dark/light mode

### 2. Compatibilidad Dark/Light Mode

Todos los indicadores tienen variantes para modo oscuro:
- Verde: `bg-green-500 dark:bg-green-400`
- Rojo: `bg-red-400 dark:bg-red-500`
- Amarillo: `bg-yellow-500 dark:bg-yellow-400`
- Naranja: `bg-orange-500 dark:bg-orange-400`
- Azul: `bg-blue-500 dark:bg-blue-400`

---

## 🔄 Cambios Pendientes en Hospital (Control de Asistencia)

### 1. Agregar Nuevas Opciones de Asistencia

Necesitas modificar el componente de Control de Asistencia en el proyecto Hospital para agregar:

#### Opciones de Estado:
- ✅ Presente
- ❌ Ausente
- 🕐 **Presente pero tarde** (NUEVO)
- ⚠️ **Ausencia justificada** (NUEVO)

#### Flujo para "Ausencia Justificada":
1. Usuario selecciona "Ausencia justificada"
2. Sistema muestra modal/campo obligatorio para observación
3. No permite guardar sin observación
4. Guarda en BD con `estado = 'justificado'` y la observación

---

## 🗄️ Actualización de Base de Datos

### Script SQL Creado

Archivo: `Centros-formadores-/docs/database/UPDATE_TABLA_ASISTENCIA.sql`

**Ejecutar en Supabase** para:
1. Agregar columna `estado` si no existe
2. Actualizar constraint para incluir nuevos estados
3. Agregar índices para mejorar rendimiento

### Estructura de la Tabla Asistencia

```sql
CREATE TABLE IF NOT EXISTS asistencia (
  id BIGSERIAL PRIMARY KEY,
  alumno_id BIGINT REFERENCES alumnos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'presente' 
    CHECK (estado IN ('presente', 'ausente', 'tarde', 'justificado')),
  observaciones TEXT,
  registrado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(alumno_id, fecha)
);
```

### Columnas Necesarias:
- ✅ `id`: Identificador único
- ✅ `alumno_id`: Referencia al estudiante
- ✅ `fecha`: Fecha de la asistencia
- ✅ `estado`: **'presente', 'ausente', 'tarde', 'justificado'**
- ✅ `observaciones`: Texto libre para justificaciones
- ✅ `registrado_por`: Usuario que registró
- ✅ `created_at`: Fecha de creación
- ✅ `updated_at`: Fecha de actualización

---

## 📝 Pasos para Completar la Implementación

### Paso 1: Actualizar Base de Datos ✅ LISTO
1. Ir a Supabase Dashboard
2. SQL Editor
3. Ejecutar el script: `UPDATE_TABLA_ASISTENCIA.sql`
4. Verificar que se crearon los índices

### Paso 2: Actualizar Hospital - Control de Asistencia ⏳ PENDIENTE

Archivo a modificar: `Hospital/src/pages/ControlAsistencia.jsx`

#### Cambios necesarios:

**1. Agregar opciones de estado:**
```jsx
const estadosAsistencia = [
  { value: 'presente', label: 'Presente', icon: CheckCircleIcon, color: 'green' },
  { value: 'ausente', label: 'Ausente', icon: XCircleIcon, color: 'red' },
  { value: 'tarde', label: 'Presente pero tarde', icon: ClockIcon, color: 'orange' },
  { value: 'justificado', label: 'Ausencia justificada', icon: ExclamationTriangleIcon, color: 'yellow' }
];
```

**2. Agregar estado para observación obligatoria:**
```jsx
const [requiereObservacion, setRequiereObservacion] = useState(false);
const [observacionObligatoria, setObservacionObligatoria] = useState('');
```

**3. Detectar cuando se selecciona "justificado":**
```jsx
const handleEstadoChange = (alumnoId, nuevoEstado) => {
  if (nuevoEstado === 'justificado') {
    setRequiereObservacion(true);
    setAlumnoSeleccionado(alumnoId);
    // Mostrar modal o campo de observación
  } else {
    // Guardar normalmente
    guardarAsistencia(alumnoId, nuevoEstado, null);
  }
};
```

**4. Modal para observación obligatoria:**
```jsx
{requiereObservacion && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
      <h3 className="text-lg font-semibold mb-4">Justificación de Ausencia</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Debe proporcionar una justificación para la ausencia
      </p>
      <textarea
        value={observacionObligatoria}
        onChange={(e) => setObservacionObligatoria(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg"
        rows="4"
        placeholder="Ej: Certificado médico presentado..."
        required
      />
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => {
            setRequiereObservacion(false);
            setObservacionObligatoria('');
          }}
          className="flex-1 px-4 py-2 bg-gray-300 rounded-lg"
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            if (observacionObligatoria.trim()) {
              guardarAsistencia(alumnoSeleccionado, 'justificado', observacionObligatoria);
              setRequiereObservacion(false);
              setObservacionObligatoria('');
            } else {
              alert('La observación es obligatoria');
            }
          }}
          className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg"
          disabled={!observacionObligatoria.trim()}
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
)}
```

**5. Función para guardar:**
```jsx
const guardarAsistencia = async (alumnoId, estado, observacion) => {
  try {
    const { error } = await supabase
      .from('asistencia')
      .upsert({
        alumno_id: alumnoId,
        fecha: fechaSeleccionada,
        estado: estado,
        observaciones: observacion,
        registrado_por: user.id
      }, {
        onConflict: 'alumno_id,fecha'
      });

    if (error) throw error;
    
    // Recargar datos
    fetchAsistencias();
  } catch (err) {
    console.error('Error al guardar asistencia:', err);
    alert('Error al guardar la asistencia');
  }
};
```

### Paso 3: Probar el Sistema ⏳ PENDIENTE

1. **En Hospital**:
   - Ir a Control de Asistencia
   - Seleccionar un estudiante
   - Probar marcar como "Presente pero tarde"
   - Probar marcar como "Ausencia justificada"
   - Verificar que pide observación obligatoria

2. **En Centros-Formadores**:
   - Ir a Seguimiento de Estudiantes
   - Seleccionar un estudiante
   - Ver el calendario
   - Verificar que aparecen los círculos de colores en las esquinas
   - Verificar que funciona en dark/light mode

---

## 🎨 Guía Visual

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

### Leyenda de Colores

**Asistencia (Esquina Superior Izquierda)**:
- 🟢 Verde: Presente
- 🔴 Rojo suave: Ausente  
- 🟡 Amarillo: Justificado
- 🟠 Naranja: Tarde

**Observaciones (Esquina Superior Derecha)**:
- 🔵 Azul: Tiene observaciones

---

## 📋 Checklist de Implementación

### Centros-Formadores ✅
- [x] Indicadores visuales en calendario
- [x] Círculos de colores en esquinas
- [x] Compatibilidad dark/light mode
- [x] Indicador de observaciones
- [x] Funciones getEstadoColor y getEstadoIcon actualizadas

### Base de Datos ⏳
- [ ] Ejecutar script UPDATE_TABLA_ASISTENCIA.sql
- [ ] Verificar columna `estado` con nuevos valores
- [ ] Verificar índices creados

### Hospital - Control de Asistencia ⏳
- [ ] Agregar opción "Presente pero tarde"
- [ ] Agregar opción "Ausencia justificada"
- [ ] Implementar modal de observación obligatoria
- [ ] Validar que no se guarde sin observación
- [ ] Actualizar función de guardado

### Testing ⏳
- [ ] Probar todos los estados en Hospital
- [ ] Verificar que se guardan correctamente en BD
- [ ] Verificar que aparecen en Centros-Formadores
- [ ] Probar en dark mode
- [ ] Probar en light mode

---

## 🐛 Troubleshooting

### Los indicadores no aparecen
**Causa**: La columna `estado` no existe o tiene valores incorrectos
**Solución**: Ejecutar el script SQL de actualización

### El modal de observación no aparece
**Causa**: El código no está implementado en Hospital
**Solución**: Seguir los pasos del Paso 2

### Los colores no se ven bien en dark mode
**Causa**: Falta la clase `dark:` en los estilos
**Solución**: Verificar que todos los colores tengan variante dark

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que el script SQL se ejecutó correctamente
2. Revisa la consola del navegador para errores
3. Verifica que los datos en Supabase tengan el formato correcto

---

**Última actualización**: Enero 2025  
**Estado**: Centros-Formadores ✅ | Hospital ⏳ | Base de Datos ⏳
