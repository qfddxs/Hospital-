# 📊 Análisis del Flujo de Gestión Documental

## 🎯 Resumen Ejecutivo

El sistema de gestión documental está implementado con **dos portales independientes** que se comunican a través de una base de datos compartida. Cada portal tiene su propia página de "Gestión Documental" con pestañas específicas según el rol del usuario.

---

## 🏥 PORTAL DEL HOSPITAL

### Página: Gestión Documental (`/gestion-documental`)

#### 📑 Estructura de Pestañas

```
┌─────────────────────────────────────────────────────────┐
│  [Documentos Institucionales] [Documentos de Centros]   │
└─────────────────────────────────────────────────────────┘
```

---

### 🔵 Pestaña 1: Documentos Institucionales

**Propósito:** Gestionar documentos normativos y protocolos del hospital

**Características:**
- Documentos sin relación a estudiantes (`alumno_id = NULL`)
- Documentos sin relación a centros (`centro_formador_id = NULL`)
- Tabla: `documentos`

**Funcionalidades Disponibles:**

| Acción | Descripción | Icono |
|--------|-------------|-------|
| **Subir** | Crear nuevo documento institucional | ⬆️ |
| **Ver** | Ver detalles y historial | 👁️ |
| **Descargar** | Descargar archivo | ⬇️ |
| **Duplicar** | Crear nueva versión | 📋 |
| **Eliminar** | Borrar documento | 🗑️ |

**Filtros:**
- Tipo: normativa, protocolo, convenio, otro
- Categoría: según catálogo
- Estado: vigente, vencido, archivado
- Búsqueda: por título, descripción, tags

**Vistas:**
- 📊 Vista de tabla (columnas detalladas)
- 🎴 Vista de tarjetas (cards visuales)

**Estadísticas Mostradas:**
```
┌──────────────┬──────────┬────────────┬──────────┬──────────────┐
│ Total Docs   │ Vigentes │ Por Vencer │ Vencidos │ Tamaño Total │
└──────────────┴──────────┴────────────┴──────────┴──────────────┘
```

**Columnas de la Tabla:**
1. Documento (con icono según tipo)
2. Estado (badge de color)
3. Tamaño
4. Fecha de Subida
5. Tags
6. Acciones

---

### 🟢 Pestaña 2: Documentos de Centros Formadores

**Propósito:** Revisar y aprobar documentos subidos por centros formadores

**Características:**
- Documentos de centros formadores (`centro_formador_id != NULL`)
- Tabla: `documentos_centro`
- **Función principal: APROBACIÓN**

**Funcionalidades Disponibles:**

| Acción | Descripción | Disponible cuando |
|--------|-------------|-------------------|
| **Ver** | Abrir documento en nueva pestaña | Siempre |
| **Aprobar** ✅ | Marcar como aprobado | `aprobado = NULL` |
| **Rechazar** ❌ | Marcar como rechazado | `aprobado = NULL` |

**Filtros Específicos:**
- Centro Formador (dropdown con lista de centros)
- Estado de Aprobación:
  - Todos
  - Pendiente (`aprobado = NULL`)
  - Aprobado (`aprobado = true`)
  - Rechazado (`aprobado = false`)
- Tipo de documento
- Búsqueda por nombre

**Columnas de la Tabla:**
1. **Centro Formador** (nombre y código)
2. **Documento** (nombre y descripción)
3. **Tipo** (badge con tipo de documento)
4. **Estado Aprobación** (badge con icono):
   - 🕐 Pendiente (azul)
   - ✅ Aprobado (verde)
   - ❌ Rechazado (rojo)
5. **Tamaño** (en KB)
6. **Fecha** (fecha de subida)
7. **Acciones** (Ver, Aprobar, Rechazar)

**Modal de Aprobación/Rechazo:**
```
┌─────────────────────────────────────────┐
│  ✅ Aprobar Documento                   │
│  ❌ Rechazar Documento                  │
├─────────────────────────────────────────┤
│                                          │
│  Documento: [nombre del archivo]        │
│  Centro: [nombre del centro]            │
│                                          │
│  Comentarios: [textarea]                │
│  * Obligatorio para rechazo             │
│                                          │
│  [Cancelar]  [Aprobar/Rechazar]         │
└─────────────────────────────────────────┘
```

**Proceso de Aprobación:**
1. Hospital hace clic en "Aprobar" o "Rechazar"
2. Se abre modal con información del documento
3. Hospital puede agregar comentarios (obligatorio si rechaza)
4. Al confirmar:
   - Se actualiza campo `aprobado` (true/false)
   - Se registra `aprobado_por` (user_id)
   - Se guarda `fecha_aprobacion`
   - Se almacenan `comentarios_aprobacion`
   - Se registra acción en historial (solo para docs institucionales)

---

### 📄 Página Adicional: Documentos Pendientes (`/documentos-pendientes`)

**Propósito:** Vista rápida de documentos de estudiantes pendientes de aprobación

**Nota:** Esta página muestra documentos de **estudiantes** (no de centros formadores)
- Tabla: `documentos` con `alumno_id != NULL`
- Funcionalidad similar a la pestaña de aprobación
- Incluye estadísticas por centro

**Observación en la página:**
> 💡 Esta página muestra un resumen. Para gestión completa, usar "Gestión Documental"

---

## 🏫 PORTAL CENTRO FORMADOR

### Página: Gestión Documental (`/gestion-documental`)

#### 📑 Estructura de Pestañas

```
┌─────────────────────────────────────────────────────────┐
│  [Documentos del Centro] [Documentos de Estudiantes]    │
└─────────────────────────────────────────────────────────┘
```

---

### 🔵 Pestaña 1: Documentos del Centro

**Propósito:** Gestionar documentos institucionales del centro formador

**Características:**
- Documentos propios del centro
- Tabla: `documentos_centro`
- **Solo el centro puede ver y gestionar sus propios documentos**

**Funcionalidades Disponibles:**

| Acción | Descripción | Icono |
|--------|-------------|-------|
| **Subir** | Subir nuevo documento PDF | ⬆️ |
| **Ver/Descargar** | Abrir documento | 👁️ |
| **Eliminar** | Borrar documento propio | 🗑️ |

**Área de Subida:**
```
┌─────────────────────────────────────────────────────────┐
│  Subir Documento                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Tipo de Documento: [select]                            │
│  - Certificado de Vacunación                            │
│  - Seguro Médico                                        │
│  - Certificado de Antecedentes                          │
│  - Convenio                                             │
│  - Otro                                                 │
│                                                          │
│  Descripción: [input opcional]                          │
│                                                          │
│  ┌────────────────────────────────────────────┐        │
│  │  📄 Selecciona un archivo PDF              │        │
│  │     o arrastra aquí                        │        │
│  │  PDF - Máx. 10MB                           │        │
│  └────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

**Validaciones:**
- Solo archivos PDF
- Tamaño máximo: 10MB
- Tipo de documento obligatorio

**Lista de Documentos:**
- Muestra documentos del centro en orden cronológico
- Información: nombre, tipo, fecha, tamaño, descripción
- Acciones: Ver/Descargar, Eliminar

---

### 🟢 Pestaña 2: Documentos de Estudiantes

**Propósito:** Ver el estado de documentos subidos para estudiantes

**Características:**
- Documentos de estudiantes del centro
- Tabla: `documentos` con `alumno_id != NULL` y `centro_formador_id = [centro actual]`
- **SOLO LECTURA** - No se pueden eliminar ni modificar

**Funcionalidades Disponibles:**

| Acción | Descripción | Disponible |
|--------|-------------|------------|
| **Ver** | Abrir documento | ✅ Siempre |
| **Eliminar** | Borrar documento | ❌ No permitido |
| **Aprobar/Rechazar** | Cambiar estado | ❌ No permitido |

**Información Mostrada:**
1. **Estudiante** (nombre completo y RUT)
2. **Documento** (título y nombre de archivo)
3. **Tipo** (badge con tipo)
4. **Estado de Aprobación**:
   - 🕐 Pendiente de aprobación (azul)
   - ✅ Aprobado (verde) con icono
   - ❌ Rechazado (rojo)
5. **Tamaño** (en KB)
6. **Fecha** (fecha de subida)
7. **Acciones** (solo Ver)

**Observación en la página:**
> 💡 **Nota:** Esta página permite subir documentos de estudiantes. Para revisar, aprobar o rechazar documentos, utiliza el módulo de **Gestión Documental** en el menú principal.

---

### 📄 Página Adicional: Documentos Estudiantes (`/documentos-estudiantes`)

**Propósito:** Subir documentos específicos para cada estudiante

**Características:**
- Sistema de checklist por estudiante
- Barra de progreso de completitud
- Subida de documentos con validación

**Estructura:**
```
┌─────────────────────────────────────────────────────────┐
│  Lista de Estudiantes    │  Checklist de Documentos     │
│  (sidebar)               │  (área principal)            │
├──────────────────────────┼──────────────────────────────┤
│  👤 Juan Pérez          │  📊 Progreso: 75%            │
│  👤 María González      │                               │
│  👤 Pedro Soto          │  ✅ Certificado Vacunación   │
│                          │     Estado: Aprobado         │
│                          │                               │
│                          │  🕐 Seguro Médico            │
│                          │     Estado: Pendiente        │
│                          │     [Subir]                  │
│                          │                               │
│                          │  ❌ Antecedentes             │
│                          │     Estado: Rechazado        │
│                          │     [Actualizar]             │
└──────────────────────────┴──────────────────────────────┘
```

**Flujo de Subida:**
1. Seleccionar estudiante de la lista
2. Ver checklist de documentos requeridos
3. Hacer clic en "Subir" o "Actualizar"
4. Modal se abre con:
   - Selector de archivo (PDF, JPG, PNG)
   - Fecha de expiración (si aplica)
   - Validación de tamaño (máx 10MB)
5. Documento se sube a Storage
6. Se crea registro en tabla `documentos`
7. Estado inicial: Pendiente de aprobación

**Estados del Checklist:**
- ⏳ **Pendiente**: No subido aún
- 🕐 **Subido**: Pendiente de aprobación por hospital
- ✅ **Aprobado**: Validado por hospital
- ❌ **Rechazado**: Requiere corrección
- ⚠️ **Vencido**: Fecha de expiración pasada

---

## 🔄 FLUJO COMPLETO DE DOCUMENTOS

### Flujo 1: Documentos Institucionales del Hospital

```
┌─────────────────────────────────────────────────────────┐
│  HOSPITAL                                               │
└─────────────────────────────────────────────────────────┘
         │
         ▼
   Gestión Documental
         │
         ▼
   Pestaña: Documentos Institucionales
         │
         ▼
   [Subir Documento]
         │
         ├─ Título, descripción
         ├─ Tipo: normativa/protocolo/convenio
         ├─ Categoría, versión
         ├─ Fechas de vigencia
         └─ Tags, visibilidad
         │
         ▼
   Documento guardado en tabla 'documentos'
   (alumno_id = NULL, centro_formador_id = NULL)
         │
         ▼
   Disponible para consulta interna
```

---

### Flujo 2: Documentos Institucionales del Centro Formador

```
┌─────────────────────────────────────────────────────────┐
│  CENTRO FORMADOR                                        │
└─────────────────────────────────────────────────────────┘
         │
         ▼
   Gestión Documental
         │
         ▼
   Pestaña: Documentos del Centro
         │
         ▼
   [Subir Documento]
         │
         ├─ Tipo de documento
         ├─ Descripción (opcional)
         └─ Archivo PDF (máx 10MB)
         │
         ▼
   Documento guardado en tabla 'documentos_centro'
   (centro_formador_id = [centro actual])
         │
         ▼
   Visible solo para el centro
   (puede ver, descargar, eliminar)
```

---

### Flujo 3: Documentos de Estudiantes (FLUJO PRINCIPAL)

```
┌─────────────────────────────────────────────────────────┐
│  PASO 1: CENTRO FORMADOR SUBE DOCUMENTO                │
└─────────────────────────────────────────────────────────┘
         │
         ▼
   Portal Centro Formador
         │
         ▼
   Documentos Estudiantes
         │
         ▼
   Selecciona estudiante de la lista
         │
         ▼
   Ve checklist de documentos requeridos
         │
         ▼
   Hace clic en [Subir] o [Actualizar]
         │
         ▼
   Modal de subida:
   ├─ Selecciona archivo (PDF/JPG/PNG)
   ├─ Fecha de expiración (si aplica)
   └─ Validación de tamaño
         │
         ▼
   Archivo se sube a Supabase Storage
   (bucket: 'documentos')
         │
         ▼
   Se crea registro en tabla 'documentos':
   {
     alumno_id: 'uuid-estudiante',
     centro_formador_id: 'uuid-centro',
     tipo_documento: 'vacunacion',
     archivo_url: 'url-storage',
     aprobado: NULL,  ← PENDIENTE
     estado: 'vigente'
   }
         │
         ▼
   Estado en checklist: 🕐 Pendiente

┌─────────────────────────────────────────────────────────┐
│  PASO 2: HOSPITAL REVISA DOCUMENTO                     │
└─────────────────────────────────────────────────────────┘
         │
         ▼
   Portal Hospital
         │
         ▼
   Gestión Documental
         │
         ▼
   Pestaña: Documentos de Centros Formadores
         │
         ▼
   Ve lista de documentos pendientes
   (filtro: Estado = Pendiente)
         │
         ▼
   Hace clic en [Ver] para revisar archivo
         │
         ▼
   Decide: ¿Aprobar o Rechazar?

┌─────────────────────────────────────────────────────────┐
│  PASO 3A: HOSPITAL APRUEBA                             │
└─────────────────────────────────────────────────────────┘
         │
         ▼
   Hace clic en [Aprobar] ✅
         │
         ▼
   Modal de aprobación:
   ├─ Muestra info del documento
   ├─ Campo de comentarios (opcional)
   └─ Botón [Aprobar]
         │
         ▼
   Se actualiza registro en 'documentos':
   {
     aprobado: true,
     aprobado_por: 'uuid-usuario-hospital',
     fecha_aprobacion: '2025-11-16T10:30:00Z',
     comentarios_aprobacion: 'Documento válido'
   }
         │
         ▼
   Estado en checklist: ✅ Aprobado

┌─────────────────────────────────────────────────────────┐
│  PASO 3B: HOSPITAL RECHAZA                             │
└─────────────────────────────────────────────────────────┘
         │
         ▼
   Hace clic en [Rechazar] ❌
         │
         ▼
   Modal de rechazo:
   ├─ Muestra info del documento
   ├─ Campo de comentarios (OBLIGATORIO)
   └─ Botón [Rechazar]
         │
         ▼
   Se actualiza registro en 'documentos':
   {
     aprobado: false,
     aprobado_por: 'uuid-usuario-hospital',
     fecha_aprobacion: '2025-11-16T10:30:00Z',
     comentarios_aprobacion: 'Falta firma del director'
   }
         │
         ▼
   Estado en checklist: ❌ Rechazado

┌─────────────────────────────────────────────────────────┐
│  PASO 4: CENTRO VE EL RESULTADO                        │
└─────────────────────────────────────────────────────────┘
         │
         ▼
   Portal Centro Formador
         │
         ▼
   Gestión Documental
         │
         ▼
   Pestaña: Documentos de Estudiantes
         │
         ▼
   Ve badge de estado:
   ├─ ✅ Aprobado (verde)
   └─ ❌ Rechazado (rojo)
         │
         ▼
   Si fue rechazado:
   ├─ Ve comentarios del hospital
   └─ Debe corregir y volver a subir

┌─────────────────────────────────────────────────────────┐
│  PASO 5: SI FUE RECHAZADO, CORREGIR                    │
└─────────────────────────────────────────────────────────┘
         │
         ▼
   Portal Centro Formador
         │
         ▼
   Documentos Estudiantes
         │
         ▼
   Selecciona mismo estudiante
         │
         ▼
   Ve documento rechazado en checklist
         │
         ▼
   Hace clic en [Actualizar]
         │
         ▼
   Sube nuevo documento corregido
         │
         ▼
   Estado vuelve a: 🕐 Pendiente
         │
         ▼
   Hospital revisa nuevamente
   (vuelve al PASO 2)
```

---

## 📊 COMPARACIÓN DE FUNCIONALIDADES

### Tabla Comparativa

| Funcionalidad | Portal Hospital | Portal Centro Formador |
|---------------|-----------------|------------------------|
| **Pestañas** | Institucionales + Centros | Centro + Estudiantes |
| **Subir docs institucionales** | ✅ Sí | ✅ Sí (solo propios) |
| **Subir docs estudiantes** | ❌ No | ✅ Sí (en otra página) |
| **Ver docs institucionales** | ✅ Todos | ✅ Solo propios |
| **Ver docs estudiantes** | ✅ Todos los centros | ✅ Solo su centro |
| **Aprobar documentos** | ✅ Sí | ❌ No |
| **Rechazar documentos** | ✅ Sí | ❌ No |
| **Eliminar docs institucionales** | ✅ Sí | ✅ Solo propios |
| **Eliminar docs estudiantes** | ✅ Sí | ❌ No |
| **Filtro por centro** | ✅ Sí | ❌ No (solo ve su centro) |
| **Filtro por aprobación** | ✅ Sí | ✅ Sí (solo lectura) |
| **Agregar comentarios** | ✅ Sí | ❌ No |
| **Ver comentarios** | ✅ Sí | ✅ Sí (solo lectura) |
| **Checklist por estudiante** | ❌ No | ✅ Sí |
| **Progreso de completitud** | ❌ No | ✅ Sí |

---

## 🗄️ TABLAS DE BASE DE DATOS UTILIZADAS

### 1. `documentos` (Tabla Principal)

**Almacena:**
- Documentos institucionales del hospital
- Documentos de estudiantes

**Campos clave para gestión documental:**
```sql
- id: UUID
- titulo: VARCHAR
- tipo: VARCHAR
- archivo_url: TEXT
- archivo_nombre: VARCHAR
- alumno_id: UUID (NULL = institucional)
- centro_formador_id: UUID (NULL = hospital)
- tipo_documento: VARCHAR
- aprobado: BOOLEAN (NULL/true/false)
- aprobado_por: UUID
- fecha_aprobacion: TIMESTAMPTZ
- comentarios_aprobacion: TEXT
```

**Queries principales:**

```sql
-- Documentos institucionales del hospital
SELECT * FROM documentos
WHERE alumno_id IS NULL
  AND centro_formador_id IS NULL
ORDER BY created_at DESC;

-- Documentos de estudiantes (todos los centros)
SELECT 
  d.*,
  a.nombre, a.primer_apellido, a.segundo_apellido, a.rut,
  cf.nombre as centro_nombre, cf.codigo as centro_codigo
FROM documentos d
LEFT JOIN alumnos a ON d.alumno_id = a.id
LEFT JOIN centros_formadores cf ON d.centro_formador_id = cf.id
WHERE d.alumno_id IS NOT NULL
ORDER BY d.created_at DESC;

-- Documentos pendientes de aprobación
SELECT * FROM documentos
WHERE alumno_id IS NOT NULL
  AND aprobado IS NULL
ORDER BY created_at DESC;
```

---

### 2. `documentos_centro`

**Almacena:**
- Documentos institucionales de centros formadores

**Campos clave:**
```sql
- id: UUID
- centro_formador_id: UUID
- nombre_archivo: VARCHAR
- tipo_documento: VARCHAR
- descripcion: TEXT
- archivo_url: TEXT
- tamaño_bytes: BIGINT
- fecha_subida: TIMESTAMPTZ
- subido_por: UUID
```

**Queries principales:**

```sql
-- Documentos de un centro específico
SELECT * FROM documentos_centro
WHERE centro_formador_id = 'uuid-centro'
ORDER BY fecha_subida DESC;

-- Todos los documentos de centros (para hospital)
SELECT 
  dc.*,
  cf.nombre as centro_nombre,
  cf.codigo as centro_codigo
FROM documentos_centro dc
JOIN centros_formadores cf ON dc.centro_formador_id = cf.id
ORDER BY dc.fecha_subida DESC;
```

---

### 3. `centros_formadores`

**Utilizada para:**
- Filtro de centros en portal hospital
- Información del centro en ambos portales

**Query para filtro:**
```sql
SELECT id, nombre, codigo
FROM centros_formadores
WHERE activo = true
ORDER BY nombre;
```

---

## 🎨 COMPONENTES UI UTILIZADOS

### Componentes Comunes
- `Button` - Botones de acción
- `Modal` - Ventanas modales
- `Table` - Tablas de datos
- `Loader` - Indicadores de carga
- `DocumentoCard` - Tarjetas de documentos

### Iconos (Heroicons)
- `DocumentTextIcon` - Documentos
- `CheckCircleIcon` - Aprobado
- `XCircleIcon` - Rechazado
- `ClockIcon` - Pendiente
- `EyeIcon` - Ver
- `ArrowDownTrayIcon` - Descargar
- `TrashIcon` - Eliminar
- `ArrowUpTrayIcon` - Subir
- `FunnelIcon` - Filtros
- `MagnifyingGlassIcon` - Búsqueda

---

## ⚠️ OBSERVACIONES Y NOTAS IMPORTANTES

### 1. Separación de Responsabilidades
- **Hospital**: Aprueba/rechaza documentos
- **Centro Formador**: Sube documentos
- **Estudiante**: (futuro) Ve su expediente

### 2. Flujo Unidireccional
```
Centro sube → Hospital revisa → Centro ve resultado
```
No hay edición directa, solo subir nuevas versiones.

### 3. Estados de Aprobación
- `NULL` = Pendiente de revisión
- `true` = Aprobado por hospital
- `false` = Rechazado por hospital

### 4. Comentarios
- Opcionales al aprobar
- **Obligatorios** al rechazar
- Visibles para el centro formador

### 5. Permisos
- Centro **NO** puede eliminar documentos de estudiantes
- Centro **NO** puede aprobar/rechazar
- Hospital puede ver documentos de **todos** los centros

### 6. Validaciones
- Tamaño máximo: 10MB
- Formatos: PDF (institucionales), PDF/JPG/PNG (estudiantes)
- Tipo de documento obligatorio

### 7. Almacenamiento
- Archivos en Supabase Storage
- Bucket: `documentos`
- Path: `documentos/[filename]` o `documentos_estudiantes/[filename]`

---

## 🚀 MEJORAS FUTURAS SUGERIDAS

### Corto Plazo
- [ ] Sistema de notificaciones en tiempo real
- [ ] Alertas de documentos vencidos
- [ ] Exportar reportes en PDF/Excel
- [ ] Búsqueda avanzada con múltiples criterios

### Mediano Plazo
- [ ] Portal para estudiantes (ver su expediente)
- [ ] Firma digital de documentos
- [ ] Versionado automático de documentos
- [ ] Plantillas de documentos

### Largo Plazo
- [ ] Integración con sistemas externos
- [ ] OCR para extracción de datos
- [ ] Validación automática de documentos
- [ ] Dashboard analítico avanzado

---

## 📝 CHECKLIST DE VERIFICACIÓN

### Para Hospital
- [x] Puede subir documentos institucionales
- [x] Puede ver documentos de todos los centros
- [x] Puede aprobar documentos
- [x] Puede rechazar documentos con comentarios
- [x] Puede filtrar por centro formador
- [x] Puede filtrar por estado de aprobación
- [x] Ve estadísticas correctas

### Para Centro Formador
- [x] Puede subir documentos institucionales propios
- [x] Puede subir documentos de estudiantes
- [x] Ve checklist de documentos requeridos
- [x] Ve progreso de completitud
- [x] Ve estado de aprobación de documentos
- [x] Ve comentarios del hospital
- [x] Puede actualizar documentos rechazados
- [x] NO puede eliminar docs de estudiantes

---

## 📚 DOCUMENTOS RELACIONADOS

- `docs/FLUJO_COMPLETO_DOCUMENTACION.md` - Flujo detallado
- `docs/SISTEMA_DOCUMENTAL_UNIFICADO.md` - Arquitectura completa
- `docs/PESTAÑAS_GESTION_DOCUMENTAL.md` - Pestañas portal hospital
- `Centros-formadores-/docs/PESTAÑAS_GESTION_DOCUMENTAL_CENTRO.md` - Pestañas portal centro
- `docs/database/SISTEMA_DOCUMENTAL_UNIFICADO.sql` - Scripts SQL

---

**Fecha de Análisis:** Noviembre 16, 2025  
**Estado:** ✅ Sistema Implementado y Funcional  
**Versión:** 1.0
