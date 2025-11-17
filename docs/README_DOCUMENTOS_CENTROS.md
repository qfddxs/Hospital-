# 🚀 Sistema de Aprobación de Documentos de Centros

## ⚡ Inicio Rápido (30 minutos)

### 1. Ejecutar SQL (5 min)
```sql
-- Abrir Supabase SQL Editor
-- Copiar y ejecutar: docs/database/AGREGAR_APROBACION_DOCUMENTOS_CENTRO.sql
```

### 2. Verificar (10 min)
- Hospital → Gestión Documental → Pestaña "Documentos de Centros Formadores"
- Probar aprobar un documento
- Probar rechazar un documento

### 3. Listo ✅
El sistema ya está funcionando.

---

## 📖 Documentación

### 🎯 Empezar Aquí
- **[RESUMEN_EJECUTIVO_SOLUCION.md](RESUMEN_EJECUTIVO_SOLUCION.md)** - Visión general (5 min)
- **[INSTRUCCIONES_APROBACION_CENTROS.md](INSTRUCCIONES_APROBACION_CENTROS.md)** - Cómo implementar (10 min)

### 📚 Documentación Completa
- **[INDICE_DOCUMENTACION_CENTROS.md](INDICE_DOCUMENTACION_CENTROS.md)** - Índice completo de toda la documentación

### 📊 Diagramas y Flujos
- **[DIAGRAMA_FLUJO_DOCUMENTOS.md](DIAGRAMA_FLUJO_DOCUMENTOS.md)** - Diagramas visuales del sistema

### ✅ Verificación
- **[CHECKLIST_IMPLEMENTACION.md](CHECKLIST_IMPLEMENTACION.md)** - Lista de verificación completa

---

## 🎯 ¿Qué Hace Este Sistema?

Permite que el **hospital apruebe o rechace** documentos institucionales subidos por centros formadores.

### Antes ❌
- Centro sube documento
- Hospital NO lo ve
- Sin control de calidad

### Ahora ✅
- Centro sube documento
- Hospital lo ve y revisa
- Hospital aprueba/rechaza con comentarios
- Centro ve el resultado

---

## 🔄 Flujo Simple

```
Centro sube documento
    ↓
Hospital ve en "Documentos de Centros Formadores"
    ↓
Hospital aprueba ✅ o rechaza ❌
    ↓
Centro ve el estado actualizado
```

---

## 📋 Características

### Para el Hospital
- ✅ Ver todos los documentos de centros
- ✅ Filtrar por centro formador
- ✅ Filtrar por estado (Pendiente/Aprobado/Rechazado)
- ✅ Aprobar con comentarios opcionales
- ✅ Rechazar con motivo obligatorio
- ✅ Trazabilidad completa

### Para los Centros
- ✅ Ver estado de sus documentos
- ✅ Indicadores visuales claros:
  - 🔵 Pendiente
  - ✅ Aprobado
  - ❌ Rechazado
- ✅ Ver comentarios del hospital

---

## 🛠️ Archivos Modificados

### Base de Datos
- `docs/database/AGREGAR_APROBACION_DOCUMENTOS_CENTRO.sql`

### Frontend Hospital
- `src/pages/GestionDocumental.jsx`

### Frontend Centro (ya estaba)
- `Centros-formadores-/src/pages/GestionDocumental.jsx`

---

## 📊 Pestañas del Sistema

### Portal Hospital - Gestión Documental

```
┌─────────────────────────────────────────┐
│ [Institucionales] [Docs de Centros]     │
└─────────────────────────────────────────┘
```

**Pestaña 1:** Documentos Institucionales del Hospital  
**Pestaña 2:** Documentos de Centros Formadores ⭐ NUEVA

### Portal Centro - Gestión Documental

```
┌─────────────────────────────────────────┐
│ [Docs del Centro] [Docs de Estudiantes] │
└─────────────────────────────────────────┘
```

**Pestaña 1:** Documentos del Centro (con estados de aprobación)  
**Pestaña 2:** Documentos de Estudiantes (solo lectura)

---

## 🎓 Capacitación

### Para Hospital (5 min)
1. Ir a Gestión Documental
2. Clic en pestaña "Documentos de Centros Formadores"
3. Ver lista de documentos
4. Clic en ✅ Aprobar o ❌ Rechazar
5. Agregar comentarios/motivo
6. Confirmar

### Para Centros (3 min)
1. Ir a Gestión Documental
2. Pestaña "Documentos del Centro"
3. Ver estado de cada documento:
   - 🔵 Pendiente = Hospital está revisando
   - ✅ Aprobado = Todo correcto
   - ❌ Rechazado = Revisar comentarios y corregir

---

## 🐛 Problemas Comunes

### No aparecen documentos en hospital
**Solución:** Verificar que centros hayan subido documentos

### Error al aprobar/rechazar
**Solución:** Verificar que ejecutaste el script SQL

### Estados no se actualizan
**Solución:** Refrescar la página

Ver más en: [CHECKLIST_IMPLEMENTACION.md](CHECKLIST_IMPLEMENTACION.md)

---

## 📞 Ayuda

- **Implementación:** Ver [INSTRUCCIONES_APROBACION_CENTROS.md](INSTRUCCIONES_APROBACION_CENTROS.md)
- **Verificación:** Ver [CHECKLIST_IMPLEMENTACION.md](CHECKLIST_IMPLEMENTACION.md)
- **Diagramas:** Ver [DIAGRAMA_FLUJO_DOCUMENTOS.md](DIAGRAMA_FLUJO_DOCUMENTOS.md)
- **Índice completo:** Ver [INDICE_DOCUMENTACION_CENTROS.md](INDICE_DOCUMENTACION_CENTROS.md)

---

## ✅ Estado

- ✅ Base de datos: Script listo
- ✅ Backend: Implementado
- ✅ Frontend Hospital: Implementado
- ✅ Frontend Centro: Implementado
- ✅ Documentación: Completa
- ⏳ **Pendiente:** Ejecutar script SQL

---

## 🚀 Siguiente Paso

**Ejecutar script SQL en Supabase** (5 minutos)

Ver instrucciones detalladas en: [INSTRUCCIONES_APROBACION_CENTROS.md](INSTRUCCIONES_APROBACION_CENTROS.md)

---

**Fecha:** 16 de noviembre de 2025  
**Versión:** 1.0  
**Estado:** ✅ Listo para implementar
