# Flujo Completo del Sistema de Documentación

## 📋 Visión General

El sistema de documentación maneja tres tipos de documentos:
1. **Documentos Institucionales del Hospital**
2. **Documentos Institucionales de Centros Formadores**
3. **Documentos de Estudiantes**

---

## 🏥 PORTAL HOSPITAL

### Páginas Disponibles

#### 1. Gestión Documental (`/gestion-documental`)
**Pestañas:**
- 📄 **Documentos Institucionales**
- 👥 **Documentos de Estudiantes**

##### Pestaña: Documentos Institucionales
**Funcionalidades:**
- ✅ Subir documentos (normativas, protocolos, convenios)
- ✅ Ver, descargar, editar, eliminar
- ✅ Versionar documentos
- ✅ Duplicar documentos
- ✅ Filtros: tipo, categoría, estado
- ✅ Vista tabla o tarjetas

**Flujo:**
```
Hospital sube documento
    ↓
Se almacena en tabla 'documentos' (alumno_id = NULL)
    ↓
Disponible para consulta interna
```

##### Pestaña: Documentos de Estudiantes
**Funcionalidades:**
- ✅ Ver documentos subidos por centros formadores
- ✅ Aprobar documentos ✅
- ✅ Rechazar documentos ❌
- ✅ Agregar comentarios
- ✅ Ver información del estudiante y centro
- ✅ Filtros: centro formador, tipo, estado aprobación

**Flujo:**
```
Centro sube documento de estudiante
    ↓
Aparece en esta pestaña (estado: Pendiente)
    ↓
Hospital revisa el documento
    ↓
┌─────────────┬─────────────┐
│   APROBAR   │  RECHAZAR   │
└─────────────┴─────────────┘
      ↓              ↓
Estado: Aprobado  Estado: Rechazado
      ↓              ↓
Documento válido  Centro debe corregir
```

**Columnas mostradas:**
- Estudiante (nombre y RUT)
- Centro Formador
- Documento (título y archivo)
- Tipo de documento
- Estado de Aprobación (Pendiente/Aprobado/Rechazado)
- Fecha (subida y expiración)
- Acciones (Ver, Aprobar, Rechazar)

#### 2. Documentos Pendientes (`/documentos-pendientes`)
**Funcionalidades:**
- ⚠️ Vista rápida de documentos pendientes de aprobación
- 📊 Estadísticas por centro formador
- 🔍 Filtros rápidos

**Observación:**
> 💡 Esta página muestra un resumen. Para gestión completa, usar "Gestión Documental"

---

## 🏫 PORTAL CENTRO FORMADOR

### Páginas Disponibles

#### 1. Gestión Documental (`/gestion-documental`)
**Pestañas:**
- 🏢 **Documentos del Centro**
- 👥 **Documentos de Estudiantes**

##### Pestaña: Documentos del Centro
**Funcionalidades:**
- ✅ Subir documentos institucionales (certificados, seguros, convenios)
- ✅ Ver y descargar documentos
- ✅ Eliminar documentos propios
- ✅ Agregar tipo y descripción

**Flujo:**
```
Centro sube documento institucional
    ↓
Se almacena en tabla 'documentos_centro'
    ↓
Solo visible para el centro
```

##### Pestaña: Documentos de Estudiantes
**Funcionalidades:**
- 👁️ Ver documentos subidos de sus estudiantes
- 📊 Ver estado de aprobación
- ❌ NO puede eliminar
- ❌ NO puede aprobar/rechazar

**Información mostrada:**
- Nombre del estudiante y RUT
- Título del documento
- Estado de aprobación:
  - 🕐 Pendiente (azul)
  - ✅ Aprobado (verde)
  - ❌ Rechazado (rojo)
- Fecha de subida

**Observación:**
> 💡 Esta pestaña es solo para consulta. Para subir documentos de estudiantes, usar "Documentos Estudiantes" del menú.

#### 2. Documentos Estudiantes (`/documentos-estudiantes`)
**Funcionalidades:**
- 📤 Subir documentos para estudiantes específicos
- 📋 Ver checklist de documentos requeridos
- 📊 Ver progreso de completitud por estudiante
- 🔄 Actualizar documentos vencidos o rechazados

**Flujo:**
```
Centro selecciona estudiante
    ↓
Ve checklist de documentos requeridos
    ↓
Sube documento para un item específico
    ↓
Se almacena en tabla 'documentos' (con alumno_id y centro_formador_id)
    ↓
Estado: Pendiente de aprobación
    ↓
Hospital revisa y aprueba/rechaza
    ↓
Centro ve el resultado en "Gestión Documental > Documentos de Estudiantes"
```

**Observación:**
> 💡 Para revisar y aprobar documentos, el hospital debe usar "Gestión Documental" en su portal.

---

## 🔄 Flujo Completo: Documentos de Estudiantes

### Paso 1: Centro Formador Sube Documento
```
Portal Centro Formador
    ↓
Documentos Estudiantes
    ↓
Selecciona estudiante
    ↓
Ve checklist de documentos requeridos
    ↓
Sube documento (ej: Certificado de Vacunación)
    ↓
Estado: Pendiente ⏳
```

**Tabla BD:** `documentos`
```sql
{
  alumno_id: 'uuid-estudiante',
  centro_formador_id: 'uuid-centro',
  tipo_documento: 'vacunacion',
  archivo_url: 'url-del-archivo',
  aprobado: NULL,  -- Pendiente
  ...
}
```

### Paso 2: Hospital Revisa Documento
```
Portal Hospital
    ↓
Gestión Documental
    ↓
Pestaña: Documentos de Estudiantes
    ↓
Filtra por centro (opcional)
    ↓
Ve documento pendiente
    ↓
Revisa el archivo
```

### Paso 3: Hospital Aprueba o Rechaza
```
┌─────────────────────┬─────────────────────┐
│      APROBAR ✅      │     RECHAZAR ❌      │
└─────────────────────┴─────────────────────┘
         ↓                       ↓
   aprobado: true          aprobado: false
   comentarios: "OK"       comentarios: "Falta firma"
         ↓                       ↓
   Estado: Aprobado        Estado: Rechazado
```

### Paso 4: Centro Ve el Resultado
```
Portal Centro Formador
    ↓
Gestión Documental
    ↓
Pestaña: Documentos de Estudiantes
    ↓
Ve badge de estado:
  - ✅ Aprobado (verde)
  - ❌ Rechazado (rojo)
```

### Paso 5: Si fue Rechazado
```
Portal Centro Formador
    ↓
Documentos Estudiantes
    ↓
Selecciona mismo estudiante
    ↓
Ve documento rechazado en checklist
    ↓
Botón: "Actualizar"
    ↓
Sube nuevo documento
    ↓
Vuelve a estado: Pendiente ⏳
    ↓
Hospital revisa nuevamente
```

---

## 📊 Tablas de Base de Datos

### 1. `documentos` (Tabla Principal)
**Almacena:**
- Documentos institucionales del hospital (alumno_id = NULL)
- Documentos de estudiantes (alumno_id != NULL)

**Campos clave:**
```sql
- id: UUID
- titulo: VARCHAR
- tipo: VARCHAR (normativa, protocolo, convenio, otro)
- archivo_url: TEXT
- alumno_id: UUID (NULL si es institucional)
- centro_formador_id: UUID (NULL si es del hospital)
- tipo_documento: VARCHAR (vacunacion, seguro, etc.)
- aprobado: BOOLEAN (NULL=pendiente, true=aprobado, false=rechazado)
- aprobado_por: UUID
- fecha_aprobacion: TIMESTAMPTZ
- comentarios_aprobacion: TEXT
- fecha_expiracion: DATE
```

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
```

### 3. `documentos_requeridos`
**Almacena:**
- Catálogo de documentos requeridos para rotaciones

**Campos clave:**
```sql
- id: UUID
- nombre: VARCHAR
- tipo_documento: VARCHAR
- es_obligatorio: BOOLEAN
- dias_vigencia: INTEGER
- aplica_a: VARCHAR
```

### 4. `documentos_checklist`
**Almacena:**
- Tracking de documentos por estudiante

**Campos clave:**
```sql
- id: UUID
- alumno_id: UUID
- documento_requerido_id: UUID
- documento_id: UUID
- estado: VARCHAR (pendiente, subido, aprobado, rechazado, vencido)
```

---

## 🎯 Estados de Documentos de Estudiantes

| Estado | Descripción | Color | Quién lo ve |
|--------|-------------|-------|-------------|
| **Pendiente** | Subido, esperando revisión | 🔵 Azul | Hospital y Centro |
| **Aprobado** | Revisado y aprobado | 🟢 Verde | Hospital y Centro |
| **Rechazado** | Revisado y rechazado | 🔴 Rojo | Hospital y Centro |
| **Vencido** | Fecha de expiración pasada | 🟠 Naranja | Hospital y Centro |

---

## 🔐 Permisos y Restricciones

### Hospital puede:
- ✅ Subir documentos institucionales propios
- ✅ Ver todos los documentos de estudiantes
- ✅ Aprobar documentos de estudiantes
- ✅ Rechazar documentos de estudiantes
- ✅ Agregar comentarios
- ✅ Eliminar documentos institucionales propios
- ✅ Filtrar por centro formador

### Centro Formador puede:
- ✅ Subir documentos institucionales propios
- ✅ Subir documentos de sus estudiantes
- ✅ Ver documentos de sus estudiantes
- ✅ Ver estado de aprobación
- ✅ Eliminar documentos institucionales propios
- ❌ NO puede aprobar/rechazar documentos
- ❌ NO puede eliminar documentos de estudiantes
- ❌ NO puede ver documentos de otros centros

---

## 📱 Navegación Rápida

### Para Hospital:
```
Dashboard
    ↓
Gestión Documental
    ├─ Pestaña: Documentos Institucionales (subir/gestionar)
    └─ Pestaña: Documentos de Estudiantes (aprobar/rechazar)
```

### Para Centro Formador:
```
Dashboard
    ├─ Documentos Estudiantes (subir documentos por alumno)
    └─ Gestión Documental
        ├─ Pestaña: Documentos del Centro (subir/gestionar)
        └─ Pestaña: Documentos de Estudiantes (ver estado)
```

---

## 🚀 Casos de Uso Comunes

### Caso 1: Hospital sube normativa interna
```
Hospital → Gestión Documental → Documentos Institucionales → Subir Documento
```

### Caso 2: Centro sube certificado de vacunación de estudiante
```
Centro → Documentos Estudiantes → Selecciona alumno → Sube certificado
```

### Caso 3: Hospital aprueba documento de estudiante
```
Hospital → Gestión Documental → Documentos de Estudiantes → Filtra por centro → Aprobar
```

### Caso 4: Centro verifica si documento fue aprobado
```
Centro → Gestión Documental → Documentos de Estudiantes → Ve badge verde ✅
```

### Caso 5: Centro corrige documento rechazado
```
Centro → Documentos Estudiantes → Selecciona alumno → Ve rechazado → Actualizar
```

---

## ⚠️ Observaciones Importantes

1. **Separación clara:** Los documentos institucionales y de estudiantes están separados en pestañas
2. **Flujo unidireccional:** Centro sube → Hospital aprueba → Centro ve resultado
3. **No hay edición:** Si un documento está mal, se rechaza y se sube uno nuevo
4. **Vencimientos:** Los documentos con fecha de expiración se marcan automáticamente como vencidos
5. **Trazabilidad:** Todos los cambios quedan registrados con usuario y fecha
6. **Comentarios:** El hospital puede agregar comentarios al aprobar o rechazar

---

## 📝 Checklist de Implementación

- [x] Tabla `documentos` extendida con campos de aprobación
- [x] Tabla `documentos_centro` para docs institucionales de centros
- [x] Tabla `documentos_requeridos` con catálogo
- [x] Tabla `documentos_checklist` para tracking
- [x] Portal Hospital: Gestión Documental con pestañas
- [x] Portal Hospital: Funciones de aprobación/rechazo
- [x] Portal Hospital: Filtro por centro formador
- [x] Portal Centro: Gestión Documental con pestañas
- [x] Portal Centro: Documentos Estudiantes con checklist
- [x] Observaciones en páginas relevantes
- [ ] Sistema de notificaciones (pendiente)
- [ ] Verificación automática de vencimientos (pendiente)

---

## 📚 Documentos Relacionados

- `docs/SISTEMA_DOCUMENTAL_UNIFICADO.md` - Arquitectura completa
- `docs/PESTAÑAS_GESTION_DOCUMENTAL.md` - Pestañas portal hospital
- `Centros-formadores-/docs/PESTAÑAS_GESTION_DOCUMENTAL_CENTRO.md` - Pestañas portal centro
- `docs/TODO_VERIFICACION_DOCUMENTOS_VENCIDOS.md` - Sistema de vencimientos
- `docs/database/SISTEMA_DOCUMENTAL_UNIFICADO.sql` - Scripts SQL

---

**Fecha de Creación:** Noviembre 16, 2025  
**Última Actualización:** Noviembre 16, 2025  
**Estado:** ✅ Implementado y Documentado
