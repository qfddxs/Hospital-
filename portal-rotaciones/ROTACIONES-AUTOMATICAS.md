# 🔄 Rotaciones Automáticas desde Excel

## Objetivo

Cuando el Centro Formador sube el Excel con los estudiantes, ya incluye:
- Campo clínico solicitado (ej: "Medicina Interna", "Urgencias")
- Fechas de inicio y término
- Horarios (desde - hasta)
- Observaciones

Al aprobar la solicitud, se crean automáticamente las rotaciones asignadas.

---

## 📋 Paso 1: Crear Tablas

Ejecuta `crear-rotaciones-automaticas.sql` en Supabase.

Esto crea:
- ✅ Tabla `servicios_clinicos` (si no existe)
- ✅ Tabla `rotaciones` (si no existe)
- ✅ Servicios clínicos comunes pre-cargados
- ✅ Función para buscar/crear servicios
- ✅ Políticas RLS
- ✅ Índices

---

## 📊 Estructura del Excel

El Excel que sube el Centro Formador incluye (columna N):
```
Campo clinico solicitado
```

Ejemplos:
- Medicina Interna
- Urgencias
- Traumatología
- Pediatría
- UCI
- etc.

---

## 🔄 Flujo Automático

### 1. Centro Formador sube Excel
```
Estudiante 1:
- Nombre: Juan Pérez
- Campo clínico: Medicina Interna
- Fecha inicio: 01/03/2025
- Fecha término: 30/04/2025
- Horario: 08:00 - 17:00
```

### 2. Portal Rotaciones aprueba
Al hacer clic en "Aprobar Solicitud":

```javascript
Para cada estudiante:
  1. Buscar servicio "Medicina Interna"
  2. Si no existe, crearlo
  3. Crear rotación:
     - estudiante_rotacion_id
     - servicio_clinico_id
     - fecha_inicio
     - fecha_termino
     - horario_desde
     - horario_hasta
     - estado: 'activa'
```

### 3. Hospital ve rotaciones
En "Gestión de Alumnos":
- ✅ Ve los estudiantes
- ✅ Ve sus rotaciones asignadas
- ✅ Ve el servicio clínico
- ✅ Ve horarios y fechas

---

## 📊 Tablas Creadas

### servicios_clinicos
```sql
- id (UUID)
- nombre (VARCHAR, UNIQUE)
- descripcion (TEXT)
- capacidad_maxima (INT4)
- activo (BOOLEAN)
```

### rotaciones
```sql
- id (UUID)
- estudiante_rotacion_id (FK)
- servicio_clinico_id (FK)
- tutor_id (FK, opcional)
- fecha_inicio (DATE)
- fecha_termino (DATE)
- horario_desde (TIME)
- horario_hasta (TIME)
- estado (VARCHAR: activa, finalizada, cancelada)
- observaciones (TEXT)
```

---

## ✅ Servicios Pre-cargados

El SQL crea automáticamente estos servicios:
- Medicina Interna
- Urgencias
- Traumatología
- Pediatría
- Ginecología
- Cirugía
- UCI
- Cardiología
- Neurología
- Psiquiatría

Si el Excel menciona otro servicio, se crea automáticamente.

---

## 🎯 Ventajas

1. **Automático**: No hay que asignar rotaciones manualmente
2. **Desde el Excel**: El centro formador define todo
3. **Flexible**: Si el servicio no existe, se crea
4. **Completo**: Incluye horarios, fechas, observaciones
5. **Trazable**: Cada rotación está vinculada al estudiante

---

## 🔍 Verificar

Después de aprobar una solicitud:

```sql
-- Ver rotaciones creadas
SELECT 
  r.id,
  e.nombre,
  e.primer_apellido,
  s.nombre as servicio,
  r.fecha_inicio,
  r.fecha_termino,
  r.horario_desde,
  r.horario_hasta,
  r.estado
FROM rotaciones r
JOIN estudiantes_rotacion e ON r.estudiante_rotacion_id = e.id
LEFT JOIN servicios_clinicos s ON r.servicio_clinico_id = s.id
ORDER BY r.created_at DESC;
```

---

## 📝 Ejemplo Completo

### Excel del Centro Formador:
```
N° | Nombre | Apellido | Campo Clínico | Fecha Inicio | Fecha Término | Desde | Hasta
1  | Juan   | Pérez    | Medicina Interna | 01/03/2025 | 30/04/2025 | 08:00 | 17:00
2  | María  | González | Urgencias        | 01/03/2025 | 30/06/2025 | 08:00 | 20:00
3  | Pedro  | Silva    | Traumatología    | 15/03/2025 | 15/05/2025 | 09:00 | 18:00
```

### Después de Aprobar:

**Tabla estudiantes_rotacion:**
- 3 estudiantes con todos sus datos

**Tabla rotaciones:**
- 3 rotaciones creadas automáticamente
- Vinculadas a sus servicios clínicos
- Con fechas y horarios del Excel

**Tabla servicios_clinicos:**
- Medicina Interna (ya existía)
- Urgencias (ya existía)
- Traumatología (ya existía)

---

## 🎯 Siguiente Paso

Actualizar "Gestión de Alumnos" en el Hospital para mostrar:
- Estudiante
- Servicio clínico asignado
- Fechas de rotación
- Horarios
- Estado de la rotación

---

**Ejecuta `crear-rotaciones-automaticas.sql` y prueba aprobar una solicitud!** 🚀
