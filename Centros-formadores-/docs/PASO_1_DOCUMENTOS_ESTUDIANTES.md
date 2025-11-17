# ✅ Paso 1: Página "Documentos de Estudiantes" - Centro Formador

## 🎯 Implementado

Se creó la página para que los centros formadores puedan **subir documentos de sus estudiantes**.

---

## 📁 Archivos Creados/Modificados

1. **`Centros-formadores-/src/pages/DocumentosEstudiantes.jsx`** ✅
   - Página completa de gestión de documentos

2. **`Centros-formadores-/src/routes/router.jsx`** ✅
   - Agregada ruta `/documentos-estudiantes`

---

## 🎨 Funcionalidades Implementadas

### 1. Selección de Estudiante
- Lista de todos los estudiantes del centro en rotación
- Filtrados automáticamente por `centro_formador_id`
- Selección con highlight visual

### 2. Checklist Automático
- Muestra los 8 documentos requeridos por estudiante
- Estados visuales con colores:
  - ⚪ **Pendiente**: Gris - No subido
  - 🔵 **Subido**: Azul - Esperando aprobación
  - 🟢 **Aprobado**: Verde - Aprobado por hospital
  - 🔴 **Rechazado**: Rojo - Rechazado, debe corregir
  - 🟠 **Vencido**: Naranja - Documento expiró

### 3. Subida de Documentos
- Modal para subir archivos
- Validación de tamaño (máx 10MB)
- Formatos: PDF, JPG, PNG
- Campo de fecha de expiración (si aplica)
- Subida a Supabase Storage
- Registro automático en BD

### 4. Progreso Visual
- Porcentaje de completitud por estudiante
- Contador de documentos aprobados
- Indicadores de estado por documento

### 5. Información de Documentos
- Nombre del archivo subido
- Fecha de expiración
- Estado de aprobación
- Comentarios del hospital (si rechazado)
- Botón para ver documento

---

## 🔄 Flujo de Uso

```
1. Centro Formador hace login
   ↓
2. Va a "Documentos de Estudiantes"
   ↓
3. Selecciona un estudiante de la lista
   ↓
4. Ve checklist de 8 documentos requeridos
   ↓
5. Hace clic en "Subir" en documento pendiente
   ↓
6. Selecciona archivo y fecha de expiración
   ↓
7. Hace clic en "Subir Documento"
   ↓
8. Documento se sube a Storage
   ↓
9. Se registra en BD con estado "subido"
   ↓
10. Checklist se actualiza automáticamente
   ↓
11. Hospital recibe notificación (próximo paso)
```

---

## 📊 Interfaz Visual

```
┌─────────────────────────────────────────────────────────┐
│ 📄 Documentos de Estudiantes                            │
│ 🏫 Universidad de O'Higgins (UOH)                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────────┐  ┌────────────────────────────────┐   │
│ │ Estudiantes  │  │ Juan Pérez Gómez               │   │
│ │              │  │ RUT: 12.345.678-9              │   │
│ │ [Juan Pérez] │  │                          75%   │   │
│ │  María G.    │  │                                │   │
│ │  Pedro L.    │  │ Documentos Requeridos (6/8)    │   │
│ └──────────────┘  │                                │   │
│                   │ ✅ 1. Constancia Vacunación    │   │
│                   │    Aprobado - Vigente          │   │
│                   │    [Ver]                       │   │
│                   │                                │   │
│                   │ ⏳ 2. Certificado Antecedentes │   │
│                   │    Pendiente aprobación        │   │
│                   │    [Ver]                       │   │
│                   │                                │   │
│                   │ ❌ 3. Certificado Alumno       │   │
│                   │    No subido                   │   │
│                   │    [Subir]                     │   │
│                   │                                │   │
│                   │ ⚠️ 4. Programa Rotación        │   │
│                   │    Vencido - Actualizar        │   │
│                   │    [Actualizar]                │   │
│                   └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Detalles Técnicos

### Consulta Principal
```javascript
// Obtiene checklist con estado de cada documento
const { data } = await supabase
  .from('vista_documentos_alumno')
  .select('*')
  .eq('alumno_id', estudianteSeleccionado.id)
```

### Subida de Archivo
```javascript
// 1. Subir a Storage
await supabase.storage
  .from('documentos')
  .upload(filePath, archivo)

// 2. Obtener URL pública
const { data: { publicUrl } } = supabase.storage
  .from('documentos')
  .getPublicUrl(filePath)

// 3. Registrar en BD
await supabase
  .from('documentos')
  .insert([{
    alumno_id: estudianteSeleccionado.id,
    centro_formador_id: centroInfo.centro_formador_id,
    tipo_documento: documentoASubir.tipo_documento,
    archivo_url: publicUrl,
    // ... otros campos
  }])
```

### Actualización Automática
El trigger `trigger_actualizar_checklist` actualiza automáticamente el estado en `documentos_checklist` cuando se inserta un documento.

---

## 🧪 Cómo Probar

### 1. Acceder a la página
```
URL: http://localhost:5173/documentos-estudiantes
```

### 2. Verificar que aparezcan estudiantes
- Deben aparecer solo estudiantes del centro formador logueado
- Filtrados por `centro_formador_id`

### 3. Seleccionar estudiante
- Hacer clic en un estudiante de la lista
- Debe mostrar checklist de 8 documentos

### 4. Subir documento
- Hacer clic en "Subir" en documento pendiente
- Seleccionar archivo PDF/JPG/PNG
- Ingresar fecha de expiración (si aplica)
- Hacer clic en "Subir Documento"

### 5. Verificar en BD
```sql
-- Ver documentos subidos
SELECT 
  d.titulo,
  d.tipo_documento,
  d.archivo_nombre,
  a.nombre || ' ' || a.primer_apellido as alumno,
  cf.nombre as centro,
  d.aprobado
FROM documentos d
JOIN alumnos a ON d.alumno_id = a.id
JOIN centros_formadores cf ON d.centro_formador_id = cf.id
WHERE d.alumno_id IS NOT NULL
ORDER BY d.created_at DESC;

-- Ver checklist actualizado
SELECT * FROM documentos_checklist 
WHERE alumno_id = 'uuid-del-alumno';
```

---

## ⚠️ Requisitos Previos

1. **Bucket de Storage creado**:
   - Ir a Supabase → Storage
   - Crear bucket llamado `documentos`
   - Configurar como público o con políticas RLS

2. **Estudiantes con centro asignado**:
```sql
-- Verificar que estudiantes tengan centro_formador_id
SELECT id, nombre, centro_formador_id 
FROM alumnos 
WHERE estado = 'en_rotacion';
```

3. **Usuario vinculado en usuarios_centros**:
```sql
-- Verificar vinculación
SELECT * FROM usuarios_centros 
WHERE user_id = 'uuid-del-usuario';
```

---

## 📝 Próximos Pasos

### Paso 2: Vista "Documentos Pendientes" (Hospital)
Para que el hospital pueda:
- Ver documentos subidos por centros
- Aprobar documentos
- Rechazar con comentarios

### Paso 3: Vista "Expediente Digital" (Hospital)
Para ver expediente completo de cada estudiante.

---

## ✅ Estado Actual

- [x] Página creada
- [x] Ruta agregada al router
- [x] Selección de estudiantes
- [x] Checklist visual
- [x] Subida de documentos
- [x] Integración con Storage
- [x] Actualización automática de checklist
- [ ] Notificaciones (próximo paso)
- [ ] Aprobación por hospital (próximo paso)

---

**Fecha**: 16 de noviembre de 2025
**Estado**: ✅ Paso 1 Completado
**Siguiente**: Paso 2 - Vista de Documentos Pendientes (Hospital)
