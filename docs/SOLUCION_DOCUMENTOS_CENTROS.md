# ✅ Solución: Documentos de Centros Formadores al Hospital

## 🎯 Problema Identificado

Los centros formadores suben documentos institucionales pero estos **NO llegan al hospital** para su revisión y aprobación.

## 📋 Solución Implementada

### 1. Base de Datos
- ✅ Agregar campos de aprobación a `documentos_centro`
- ✅ Crear vistas para consultas rápidas
- ✅ Índices para mejorar rendimiento

### 2. Portal Hospital
- ✅ Pestaña "Documentos de Centros Formadores" ya existe
- ✅ Funciones de aprobación/rechazo
- ✅ Filtros por centro formador
- ✅ Filtros por estado de aprobación

### 3. Portal Centro Formador
- ✅ Ver estado de aprobación de sus documentos
- ✅ Indicadores visuales (Pendiente/Aprobado/Rechazado)

## 🔄 Flujo Correcto

```
Centro Formador sube documento institucional
    ↓
Se guarda en tabla documentos_centro (aprobado: NULL)
    ↓
Hospital ve en pestaña "Documentos de Centros Formadores"
    ↓
Hospital puede filtrar por:
    - Centro formador
    - Estado de aprobación (Pendiente/Aprobado/Rechazado)
    - Tipo de documento
    ↓
Hospital aprueba o rechaza con comentarios
    ↓
Centro ve el estado actualizado en su portal
```

## 📊 Estructura de Pestañas

### Portal Hospital - Gestión Documental

```
┌─────────────────────────────────────────────────────┐
│ 📚 Gestión Documental                               │
├─────────────────────────────────────────────────────┤
│                                                      │
│ [Institucionales] [Documentos de Centros]           │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Pestaña 1: Documentos Institucionales**
- Documentos propios del hospital
- Normativas, protocolos, convenios

**Pestaña 2: Documentos de Centros Formadores**
- Documentos institucionales de centros
- Certificados, seguros, convenios de centros
- Aprobar/Rechazar
- Filtrar por centro
- Filtrar por estado

## 🛠️ Pasos de Implementación

### Paso 1: Ejecutar Script SQL
```bash
# Ejecutar en Supabase SQL Editor
docs/database/AGREGAR_APROBACION_DOCUMENTOS_CENTRO.sql
```

### Paso 2: Actualizar Funciones de Aprobación
El código ya está implementado en `src/pages/GestionDocumental.jsx`:
- `handleAprobarClick()` - Abre modal de aprobación
- `handleRechazarClick()` - Abre modal de rechazo
- `handleProcesarAprobacion()` - Procesa la aprobación/rechazo

**PROBLEMA DETECTADO:** Las funciones actuales solo funcionan con tabla `documentos`, necesitan actualizarse para trabajar con `documentos_centro`.

### Paso 3: Actualizar Portal Centro Formador
Ya implementado en `Centros-formadores-/src/pages/GestionDocumental.jsx`:
- Muestra estado de aprobación
- Badges visuales (Pendiente/Aprobado/Rechazado)

## 🔧 Corrección Necesaria

Las funciones de aprobación en el hospital necesitan detectar qué tipo de documento es:

```javascript
const handleProcesarAprobacion = async () => {
  // Detectar si es documento de centro o de estudiante
  const tabla = pestañaActiva === 'centros' ? 'documentos_centro' : 'documentos';
  
  await supabase
    .from(tabla)
    .update({
      aprobado: accionAprobacion === 'aprobar',
      aprobado_por: user?.id,
      fecha_aprobacion: new Date().toISOString(),
      comentarios_aprobacion: comentariosAprobacion.trim() || null
    })
    .eq('id', documentoAprobar.id);
};
```

## ✅ Resultado Final

1. Centro sube documento → Estado: Pendiente
2. Hospital ve documento en pestaña "Documentos de Centros"
3. Hospital aprueba/rechaza con comentarios
4. Centro ve el estado actualizado
5. Trazabilidad completa del proceso

---

**Fecha:** 16 de noviembre de 2025  
**Estado:** Listo para implementar corrección
