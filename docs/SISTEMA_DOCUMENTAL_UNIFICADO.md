# 📚 Sistema Documental Unificado

## 🎯 Objetivo
Centralizar la gestión de documentos del hospital, centros formadores y estudiantes en un solo sistema integrado.

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                  GESTIÓN DOCUMENTAL CENTRALIZADA                │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼──────┐ ┌───▼────┐ ┌─────▼──────┐
        │  HOSPITAL    │ │ CENTROS│ │ ESTUDIANTES│
        │              │ │FORMADOR│ │            │
        └──────────────┘ └────────┘ └────────────┘
                │             │             │
        ┌───────▼──────┐ ┌───▼────┐ ┌─────▼──────┐
        │ Normativas   │ │Vacunas │ │ Expediente │
        │ Protocolos   │ │Seguros │ │  Digital   │
        │ Convenios    │ │Certif. │ │ Checklist  │
        └──────────────┘ └────────┘ └────────────┘
```

---

## 📋 Tipos de Documentos

### 1. **Documentos Institucionales (Hospital)**
Documentos normativos y de referencia del hospital.

**Características:**
- `alumno_id`: NULL
- `centro_formador_id`: NULL
- Visibilidad: Pública o restringida
- Acceso: Todos los usuarios autorizados

**Ejemplos:**
- Normativas institucionales
- Protocolos clínicos
- Guías de procedimientos
- Convenios marco
- Reglamentos internos

---

### 2. **Documentos de Centros Formadores**
Documentos subidos por centros formadores sobre sus estudiantes.

**Características:**
- `alumno_id`: ID del estudiante
- `centro_formador_id`: ID del centro que sube
- `tipo_documento`: Tipo según catálogo
- `aprobado`: NULL (pendiente aprobación)

**Ejemplos:**
- Constancias de vacunación
- Certificados de salud
- Pólizas de seguro
- Certificados académicos
- Programas de rotación

**Flujo:**
```
Centro Formador sube documento
    ↓
Hospital revisa y aprueba/rechaza
    ↓
Documento queda en expediente del estudiante
```

---

### 3. **Documentos por Estudiante (Expediente Digital)**
Conjunto completo de documentos de cada estudiante.

**Características:**
- Checklist automático de documentos requeridos
- Estados: pendiente, subido, aprobado, rechazado, vencido
- Alertas de vencimiento
- Historial de cambios

**Documentos Requeridos:**
1. ✅ Constancia de Vacunación (vigencia: 1 año)
2. ✅ Certificado de Salud Compatible (vigencia: 6 meses)
3. ✅ Seguro de Accidentes (vigencia: 1 año)
4. ✅ Certificado de Antecedentes (vigencia: 3 meses)
5. ✅ Ficha de Identificación
6. ✅ Certificado de Alumno Regular (vigencia: 6 meses)
7. ✅ Programa de Rotación
8. ✅ Consentimiento Informado

---

## 🗄️ Estructura de Base de Datos

### Tabla: `documentos` (extendida)
```sql
documentos
├── id (UUID)
├── titulo
├── descripcion
├── tipo (normativa, protocolo, convenio, otro)
├── categoria
├── archivo_url
├── archivo_nombre
├── tamaño_bytes
├── mime_type
├── version
├── fecha_vigencia
├── fecha_vencimiento
├── tags
├── visibilidad
├── estado (vigente, vencido, archivado)
├── alumno_id (UUID) ← NUEVO
├── centro_formador_id (UUID) ← NUEVO
├── tipo_documento (VARCHAR) ← NUEVO
├── es_requerido (BOOLEAN) ← NUEVO
├── fecha_expiracion (DATE) ← NUEVO
├── aprobado (BOOLEAN) ← NUEVO
├── aprobado_por (UUID) ← NUEVO
├── fecha_aprobacion (TIMESTAMPTZ) ← NUEVO
└── comentarios_aprobacion (TEXT) ← NUEVO
```

### Tabla: `documentos_requeridos`
Catálogo de documentos que deben presentar los estudiantes.

```sql
documentos_requeridos
├── id (UUID)
├── nombre
├── descripcion
├── tipo_documento
├── es_obligatorio
├── dias_vigencia
├── aplica_a (todos, pregrado, postgrado)
├── orden
└── activo
```

### Tabla: `documentos_checklist`
Tracking de documentos por estudiante.

```sql
documentos_checklist
├── id (UUID)
├── alumno_id (UUID)
├── documento_requerido_id (UUID)
├── documento_id (UUID)
├── estado (pendiente, subido, aprobado, rechazado, vencido)
├── fecha_subida
├── fecha_revision
├── revisado_por
└── comentarios
```

---

## 🔄 Flujos de Trabajo

### Flujo 1: Hospital Sube Documento Institucional
```
1. Usuario del hospital accede a Gestión Documental
2. Hace clic en "Subir Documento"
3. Selecciona tipo: Normativa/Protocolo/Convenio
4. Completa formulario (sin alumno_id ni centro_formador_id)
5. Sube archivo
6. Documento queda disponible para todos
```

### Flujo 2: Centro Formador Sube Documento de Estudiante
```
1. Centro Formador accede a su portal
2. Va a "Documentos de Estudiantes"
3. Selecciona estudiante
4. Ve checklist de documentos requeridos
5. Sube documento (ej: Constancia de Vacunación)
6. Sistema marca como "subido" en checklist
7. Hospital recibe notificación para revisar
8. Hospital aprueba/rechaza documento
9. Estado se actualiza en checklist
```

### Flujo 3: Hospital Revisa Documentos Pendientes
```
1. Hospital accede a "Documentos Pendientes"
2. Ve lista de documentos subidos por centros
3. Revisa cada documento
4. Aprueba o rechaza con comentarios
5. Centro Formador recibe notificación
6. Si rechazado, centro puede volver a subir
```

### Flujo 4: Alertas de Vencimiento
```
1. Sistema ejecuta verificación diaria
2. Detecta documentos vencidos o por vencer
3. Actualiza estado en checklist
4. Envía notificaciones:
   - Al centro formador
   - Al hospital
   - Al estudiante (opcional)
5. Muestra alertas en dashboard
```

---

## 🎨 Interfaces de Usuario

### Portal Hospital

#### 1. Gestión Documental (Actual + Mejoras)
```
┌─────────────────────────────────────────────────────┐
│ 📚 Gestión Documental                               │
├─────────────────────────────────────────────────────┤
│                                                      │
│ [Institucionales] [Estudiantes] [Pendientes]        │
│                                                      │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│ │ Normativas  │ │ Protocolos  │ │ Convenios   │   │
│ │    45       │ │     32      │ │     12      │   │
│ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                      │
│ 📋 Documentos Institucionales                       │
│ ┌──────────────────────────────────────────────┐   │
│ │ 📄 Protocolo de Urgencia 2024                │   │
│ │ 📄 Normativa de Bioseguridad                 │   │
│ │ 📄 Convenio Marco UOH                        │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ⚠️ Documentos Pendientes de Aprobación (8)         │
│ ┌──────────────────────────────────────────────┐   │
│ │ 📄 Vacunación - Juan Pérez (UOH)             │   │
│ │    [Aprobar] [Rechazar] [Ver]                │   │
│ │ 📄 Seguro - María González (INACAP)          │   │
│ │    [Aprobar] [Rechazar] [Ver]                │   │
│ └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

#### 2. Expediente Digital del Estudiante
```
┌─────────────────────────────────────────────────────┐
│ 👤 Juan Pérez Gómez - RUT: 12.345.678-9            │
│ 🏫 Universidad de O'Higgins (UOH)                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│ 📊 Completitud: 75% (6/8 documentos)                │
│ ⚠️ 2 documentos pendientes                          │
│                                                      │
│ ✅ Constancia de Vacunación                         │
│    📄 vacuna_juan_perez.pdf (Vigente hasta 15/12/25)│
│    Aprobado el 10/01/2025 por Dr. Silva            │
│                                                      │
│ ✅ Certificado de Salud                             │
│    📄 salud_compatible.pdf (Vigente hasta 10/06/25) │
│    Aprobado el 12/01/2025 por Dr. Silva            │
│                                                      │
│ ✅ Seguro de Accidentes                             │
│    📄 poliza_seguro.pdf (Vigente hasta 01/03/26)    │
│    Aprobado el 15/01/2025 por Dr. Silva            │
│                                                      │
│ ⏳ Certificado de Antecedentes                      │
│    Estado: Subido - Pendiente de aprobación        │
│    📄 antecedentes.pdf                              │
│    [Aprobar] [Rechazar] [Ver]                      │
│                                                      │
│ ❌ Certificado de Alumno Regular                    │
│    Estado: Pendiente - No subido                    │
│    [Solicitar a Centro Formador]                    │
│                                                      │
│ ⚠️ Programa de Rotación                             │
│    Estado: Vencido (Expiró el 01/01/2025)          │
│    📄 programa_antiguo.pdf                          │
│    [Solicitar Actualización]                        │
└─────────────────────────────────────────────────────┘
```

### Portal Centro Formador

#### 1. Documentos de Estudiantes
```
┌─────────────────────────────────────────────────────┐
│ 📄 Documentos de Estudiantes                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Seleccionar estudiante:                             │
│ [Juan Pérez ▼]                                      │
│                                                      │
│ 📊 Progreso: 6/8 documentos (75%)                   │
│                                                      │
│ ┌─────────────────────────────────────────────┐    │
│ │ ✅ Constancia de Vacunación                 │    │
│ │    Aprobado - Vigente hasta 15/12/2025      │    │
│ │    [Ver] [Actualizar]                       │    │
│ │                                              │    │
│ │ ⏳ Certificado de Antecedentes               │    │
│ │    Pendiente de aprobación                  │    │
│ │    [Ver Estado]                             │    │
│ │                                              │    │
│ │ ❌ Certificado de Alumno Regular             │    │
│ │    No subido - Requerido                    │    │
│ │    [Subir Documento]                        │    │
│ │                                              │    │
│ │ ⚠️ Programa de Rotación                      │    │
│ │    Vencido - Requiere actualización         │    │
│ │    [Subir Nueva Versión]                    │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ 📚 Documentos Institucionales del Hospital          │
│ ┌─────────────────────────────────────────────┐    │
│ │ 📄 Protocolo de Urgencia 2024               │    │
│ │ 📄 Normativa de Bioseguridad                │    │
│ │ 📄 Guía de Procedimientos                   │    │
│ └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 🔔 Sistema de Notificaciones

### Notificaciones para Hospital
- ✉️ Nuevo documento subido por centro formador
- ⚠️ Documento próximo a vencer (30 días antes)
- ❌ Documento vencido
- 📋 Estudiante con documentación incompleta

### Notificaciones para Centro Formador
- ✅ Documento aprobado
- ❌ Documento rechazado (con comentarios)
- ⚠️ Documento próximo a vencer
- 📋 Documentos faltantes de estudiante

---

## 📊 Reportes y Estadísticas

### Dashboard Hospital
```
┌─────────────────────────────────────────────────────┐
│ 📊 Estadísticas Documentales                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Total Estudiantes: 45                               │
│ Documentación Completa: 32 (71%)                    │
│ Documentación Incompleta: 13 (29%)                  │
│                                                      │
│ Por Centro Formador:                                │
│ ┌─────────────────────────────────────────────┐    │
│ │ UOH:    25 estudiantes - 80% completo       │    │
│ │ INACAP: 20 estudiantes - 60% completo       │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ Documentos Pendientes: 24                           │
│ Documentos por Vencer: 8                            │
│ Documentos Vencidos: 3                              │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Beneficios del Sistema

### Para el Hospital
- ✅ Centralización de toda la documentación
- ✅ Control de documentos de estudiantes
- ✅ Trazabilidad completa
- ✅ Alertas automáticas de vencimiento
- ✅ Reducción de trabajo manual
- ✅ Cumplimiento normativo

### Para Centros Formadores
- ✅ Portal único para subir documentos
- ✅ Visibilidad del estado de documentos
- ✅ Acceso a normativas del hospital
- ✅ Notificaciones automáticas
- ✅ Checklist claro de requisitos

### Para Estudiantes (futuro)
- ✅ Expediente digital personal
- ✅ Visibilidad de documentos requeridos
- ✅ Alertas de vencimiento
- ✅ Acceso a protocolos del hospital

---

## 🚀 Plan de Implementación

### Fase 1: Base de Datos (1-2 días)
- [x] Ejecutar script SQL de extensión
- [ ] Verificar tablas creadas
- [ ] Insertar documentos requeridos
- [ ] Crear checklist para estudiantes existentes

### Fase 2: Backend (2-3 días)
- [ ] Actualizar queries de documentos
- [ ] Crear endpoints para checklist
- [ ] Implementar flujo de aprobación
- [ ] Crear sistema de notificaciones

### Fase 3: Frontend Hospital (3-4 días)
- [ ] Actualizar Gestión Documental
- [ ] Crear vista de Documentos Pendientes
- [ ] Crear vista de Expediente Digital
- [ ] Implementar flujo de aprobación/rechazo

### Fase 4: Frontend Centro Formador (2-3 días)
- [ ] Crear página de Documentos de Estudiantes
- [ ] Implementar subida de documentos
- [ ] Mostrar checklist por estudiante
- [ ] Acceso a documentos institucionales

### Fase 5: Notificaciones y Alertas (1-2 días)
- [ ] Implementar alertas de vencimiento
- [ ] Crear sistema de notificaciones
- [ ] Dashboard de estadísticas

---

## 📝 Próximos Pasos

1. **Ejecutar script SQL**: `docs/database/SISTEMA_DOCUMENTAL_UNIFICADO.sql`
2. **Verificar estructura**: Revisar tablas y vistas creadas
3. **Implementar interfaces**: Comenzar con Portal Hospital
4. **Probar flujo completo**: Subir, aprobar, rechazar documentos
5. **Capacitar usuarios**: Hospital y Centros Formadores

---

**Estado**: 📋 Diseño completo - Listo para implementación
**Fecha**: 16 de noviembre de 2025
