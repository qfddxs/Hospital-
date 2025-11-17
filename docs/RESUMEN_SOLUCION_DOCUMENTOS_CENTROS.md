# ✅ Solución Implementada: Documentos de Centros al Hospital

## 🎯 Problema Original

Los centros formadores subían documentos institucionales pero estos **NO llegaban al hospital** para revisión y aprobación. No había visibilidad ni control.

## ✨ Solución Implementada

### 1. Base de Datos ✅
- Agregados campos de aprobación a `documentos_centro`:
  - `aprobado` (NULL=pendiente, true=aprobado, false=rechazado)
  - `aprobado_por` (usuario que aprobó/rechazó)
  - `fecha_aprobacion`
  - `comentarios_aprobacion`
- Creadas vistas para consultas rápidas
- Índices para mejorar rendimiento

### 2. Portal Hospital ✅
**Gestión Documental con 2 pestañas:**

#### Pestaña 1: Documentos Institucionales
- Documentos propios del hospital
- Normativas, protocolos, convenios

#### Pestaña 2: Documentos de Centros Formadores ⭐ NUEVA
- Ver todos los documentos de centros
- **Filtros:**
  - Por centro formador
  - Por estado (Pendiente/Aprobado/Rechazado)
  - Por tipo de documento
  - Búsqueda por texto
- **Acciones:**
  - ✅ Aprobar (con comentarios opcionales)
  - ❌ Rechazar (con motivo obligatorio)
  - 👁️ Ver documento

### 3. Portal Centro Formador ✅
**Gestión Documental - Pestaña "Documentos del Centro":**
- Ver estado de aprobación de sus documentos
- **Indicadores visuales:**
  - 🔵 Pendiente de aprobación
  - ✅ Aprobado
  - ❌ Rechazado

## 🔄 Flujo Completo

```
┌─────────────────────────────────────────────────────┐
│ 1. Centro Formador sube documento institucional     │
│    (certificado, seguro, convenio, etc.)            │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 2. Se guarda en tabla documentos_centro             │
│    Estado: Pendiente (aprobado: NULL)               │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 3. Hospital ve en "Documentos de Centros"           │
│    - Puede filtrar por centro                       │
│    - Puede filtrar por estado                       │
│    - Ve toda la información del documento           │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 4. Hospital revisa el documento                     │
│    - Descarga y revisa el PDF                       │
│    - Verifica que cumpla requisitos                 │
└────────────────────┬────────────────────────────────┘
                     ↓
         ┌───────────┴───────────┐
         ↓                       ↓
┌─────────────────┐    ┌─────────────────┐
│ 5a. APROBAR ✅  │    │ 5b. RECHAZAR ❌ │
│ - Comentarios   │    │ - Motivo        │
│   opcionales    │    │   obligatorio   │
└────────┬────────┘    └────────┬────────┘
         │                      │
         └───────────┬──────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 6. Estado actualizado en base de datos              │
│    - aprobado: true/false                           │
│    - aprobado_por: usuario                          │
│    - fecha_aprobacion: timestamp                    │
│    - comentarios_aprobacion: texto                  │
└────────────────────┬────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 7. Centro ve el estado actualizado                  │
│    - Badge verde (Aprobado) o rojo (Rechazado)     │
│    - Puede ver comentarios del hospital             │
└─────────────────────────────────────────────────────┘
```

## 📋 Archivos Modificados

### Backend (SQL)
- `docs/database/AGREGAR_APROBACION_DOCUMENTOS_CENTRO.sql` - Script para ejecutar en Supabase

### Frontend Hospital
- `src/pages/GestionDocumental.jsx` - Actualizado:
  - Pestaña "Documentos de Centros Formadores"
  - Funciones de aprobación/rechazo
  - Filtros por centro y estado
  - Modal de aprobación actualizado

### Frontend Centro (ya estaba)
- `Centros-formadores-/src/pages/GestionDocumental.jsx` - Ya muestra estados

## 🚀 Cómo Usar

### Para el Hospital:

1. **Ver documentos pendientes:**
   - Ir a Gestión Documental
   - Pestaña "Documentos de Centros Formadores"
   - Filtrar por "Pendientes"

2. **Aprobar un documento:**
   - Clic en botón ✅ Aprobar
   - Agregar comentarios (opcional)
   - Confirmar

3. **Rechazar un documento:**
   - Clic en botón ❌ Rechazar
   - Agregar motivo (obligatorio)
   - Confirmar

4. **Filtrar por centro:**
   - Usar filtro "Centro Formador"
   - Seleccionar centro específico

### Para el Centro Formador:

1. **Subir documento:**
   - Ir a Gestión Documental
   - Pestaña "Documentos del Centro"
   - Subir documento
   - Estado inicial: Pendiente 🔵

2. **Ver estado:**
   - Mismo lugar donde subió
   - Ver badge de estado:
     - 🔵 Pendiente
     - ✅ Aprobado
     - ❌ Rechazado

3. **Si fue rechazado:**
   - Ver comentarios del hospital
   - Corregir y subir nuevo documento

## 📊 Estadísticas Disponibles

### Vista: `vista_documentos_centros_pendientes`
- Todos los documentos pendientes
- Información del centro
- Ordenados por fecha

### Vista: `vista_estadisticas_documentos_centros`
- Total de documentos por centro
- Pendientes, aprobados, rechazados
- Porcentaje de aprobación

## ⚡ Próximos Pasos

1. **Ejecutar script SQL** en Supabase (ver `docs/INSTRUCCIONES_APROBACION_CENTROS.md`)
2. **Probar flujo completo:**
   - Centro sube documento
   - Hospital aprueba/rechaza
   - Centro ve resultado
3. **Opcional:** Agregar notificaciones por email

## 🎉 Beneficios

✅ **Visibilidad total** - Hospital ve todos los documentos de centros  
✅ **Control de calidad** - Hospital aprueba/rechaza documentos  
✅ **Trazabilidad** - Se registra quién, cuándo y por qué  
✅ **Filtros potentes** - Por centro, estado, tipo  
✅ **Feedback claro** - Centros ven estado y comentarios  
✅ **Proceso ordenado** - Flujo claro y definido  

---

**Fecha:** 16 de noviembre de 2025  
**Estado:** ✅ Implementado y listo para usar  
**Siguiente paso:** Ejecutar script SQL en Supabase
