# ✅ Checklist de Implementación: Documentos de Centros

## 📋 Verificación Paso a Paso

### 1. Base de Datos

- [ ] **Ejecutar script SQL en Supabase**
  - Abrir Supabase SQL Editor
  - Copiar script de `docs/database/AGREGAR_APROBACION_DOCUMENTOS_CENTRO.sql`
  - Ejecutar (Ctrl + Enter)
  - Verificar: "Success. No rows returned"

- [ ] **Verificar campos agregados**
  ```sql
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'documentos_centro' 
  AND column_name IN ('aprobado', 'aprobado_por', 'fecha_aprobacion', 'comentarios_aprobacion');
  ```
  Debe mostrar 4 filas

- [ ] **Verificar vistas creadas**
  ```sql
  SELECT * FROM vista_documentos_centros_pendientes LIMIT 1;
  SELECT * FROM vista_estadisticas_documentos_centros LIMIT 1;
  ```

### 2. Portal Hospital

- [ ] **Verificar pestaña "Documentos de Centros Formadores"**
  - Ir a Gestión Documental
  - Ver 2 pestañas:
    - Documentos Institucionales
    - Documentos de Centros Formadores ⭐

- [ ] **Verificar que carga documentos**
  - Hacer clic en pestaña "Documentos de Centros Formadores"
  - Debe mostrar lista de documentos (o mensaje "No hay documentos")
  - Verificar columnas:
    - Centro Formador
    - Documento
    - Tipo
    - Estado Aprobación
    - Tamaño
    - Fecha
    - Acciones

- [ ] **Verificar filtros**
  - Clic en botón "Filtros"
  - Debe mostrar:
    - Centro Formador (dropdown con centros)
    - Estado Aprobación (Todos/Pendientes/Aprobados/Rechazados)
    - Tipo de documento
  - Probar cada filtro

- [ ] **Verificar búsqueda**
  - Escribir en campo de búsqueda
  - Debe filtrar documentos en tiempo real

### 3. Funcionalidad de Aprobación

- [ ] **Probar aprobación**
  - Seleccionar documento con estado "Pendiente"
  - Clic en botón ✅ Aprobar
  - Debe abrir modal
  - Verificar que muestra:
    - Nombre del documento
    - Centro formador
    - Campo de comentarios (opcional)
  - Agregar comentario
  - Clic en "Aprobar"
  - Verificar mensaje de éxito
  - Documento debe cambiar a estado "Aprobado" ✅

- [ ] **Probar rechazo**
  - Seleccionar documento con estado "Pendiente"
  - Clic en botón ❌ Rechazar
  - Debe abrir modal
  - Verificar que muestra:
    - Nombre del documento
    - Centro formador
    - Campo de motivo (obligatorio)
  - Intentar rechazar sin motivo → debe mostrar error
  - Agregar motivo
  - Clic en "Rechazar"
  - Verificar mensaje de éxito
  - Documento debe cambiar a estado "Rechazado" ❌

- [ ] **Verificar botones desaparecen**
  - Documentos aprobados NO deben tener botones de aprobar/rechazar
  - Documentos rechazados NO deben tener botones de aprobar/rechazar
  - Solo documentos pendientes tienen botones

### 4. Portal Centro Formador

- [ ] **Verificar vista de documentos**
  - Ir a Gestión Documental
  - Pestaña "Documentos del Centro"
  - Verificar que muestra documentos subidos

- [ ] **Verificar estados visuales**
  - Documentos pendientes: Badge azul 🔵 "Pendiente de aprobación"
  - Documentos aprobados: Badge verde ✅ "Aprobado"
  - Documentos rechazados: Badge rojo ❌ "Rechazado"

- [ ] **Verificar comentarios**
  - Si documento fue aprobado/rechazado con comentarios
  - Debe mostrar los comentarios del hospital

### 5. Flujo Completo End-to-End

- [ ] **Test completo de aprobación**
  1. Centro sube documento nuevo
  2. Verificar que aparece en hospital como "Pendiente"
  3. Hospital aprueba con comentario
  4. Verificar que centro ve estado "Aprobado"
  5. Verificar que centro ve comentario

- [ ] **Test completo de rechazo**
  1. Centro sube documento nuevo
  2. Verificar que aparece en hospital como "Pendiente"
  3. Hospital rechaza con motivo
  4. Verificar que centro ve estado "Rechazado"
  5. Verificar que centro ve motivo
  6. Centro elimina documento rechazado
  7. Centro sube documento corregido
  8. Hospital aprueba
  9. Verificar que centro ve estado "Aprobado"

### 6. Casos Edge

- [ ] **Sin documentos**
  - Hospital sin documentos de centros
  - Debe mostrar mensaje: "No hay documentos subidos aún"

- [ ] **Filtro sin resultados**
  - Aplicar filtro que no tiene resultados
  - Debe mostrar: "No se encontraron documentos"

- [ ] **Múltiples centros**
  - Subir documentos de diferentes centros
  - Filtrar por cada centro
  - Verificar que solo muestra documentos de ese centro

- [ ] **Búsqueda**
  - Buscar por nombre de archivo
  - Buscar por descripción
  - Buscar por tipo
  - Verificar que filtra correctamente

### 7. Performance

- [ ] **Carga rápida**
  - Pestaña debe cargar en menos de 2 segundos
  - Filtros deben responder instantáneamente

- [ ] **Muchos documentos**
  - Con 50+ documentos, verificar que:
    - Tabla se renderiza correctamente
    - Filtros funcionan
    - Búsqueda es rápida

### 8. Responsive

- [ ] **Vista móvil**
  - Abrir en móvil o reducir ventana
  - Verificar que tabla se adapta
  - Verificar que filtros son accesibles
  - Verificar que modales se ven bien

### 9. Dark Mode

- [ ] **Modo oscuro**
  - Activar modo oscuro
  - Verificar que todos los elementos se ven bien:
    - Pestañas
    - Tabla
    - Filtros
    - Modales
    - Badges de estado

### 10. Seguridad

- [ ] **Permisos**
  - Usuario de centro NO puede aprobar/rechazar
  - Usuario de centro solo ve sus propios documentos
  - Usuario de hospital ve documentos de todos los centros

- [ ] **Validaciones**
  - No se puede aprobar sin estar autenticado
  - No se puede rechazar sin motivo
  - No se puede modificar documento ya aprobado/rechazado

## 🐛 Problemas Comunes y Soluciones

### Problema: No aparecen documentos en hospital
**Solución:**
- Verificar que centros hayan subido documentos
- Ejecutar: `SELECT * FROM documentos_centro;`
- Verificar que `centro_formador_id` no sea NULL

### Problema: Error al aprobar/rechazar
**Solución:**
- Verificar que script SQL se ejecutó correctamente
- Verificar que campos existen: `aprobado`, `aprobado_por`, etc.
- Revisar consola del navegador para errores

### Problema: Estados no se actualizan en centro
**Solución:**
- Refrescar página del centro
- Verificar que query incluye campo `aprobado`
- Verificar que centro está consultando tabla correcta

### Problema: Filtros no funcionan
**Solución:**
- Verificar que `centrosFormadores` se carga correctamente
- Revisar función `fetchCentrosFormadores()`
- Verificar que filtros se aplican en `datosFiltrados`

## ✅ Criterios de Aceptación

El sistema está listo cuando:

1. ✅ Centro puede subir documentos institucionales
2. ✅ Hospital ve todos los documentos de centros
3. ✅ Hospital puede filtrar por centro y estado
4. ✅ Hospital puede aprobar documentos con comentarios
5. ✅ Hospital puede rechazar documentos con motivo
6. ✅ Centro ve estado actualizado de sus documentos
7. ✅ Centro ve comentarios/motivos del hospital
8. ✅ Flujo completo funciona sin errores
9. ✅ Performance es aceptable (< 2 seg)
10. ✅ UI es clara y fácil de usar

## 📊 Métricas de Éxito

- **Tiempo de aprobación:** < 2 minutos por documento
- **Tasa de rechazo:** < 20% (indica calidad de documentos)
- **Satisfacción usuario:** Hospital puede gestionar fácilmente
- **Claridad:** Centro entiende por qué fue rechazado

---

**Fecha:** 16 de noviembre de 2025  
**Estado:** Checklist completo  
**Próximo paso:** Ejecutar verificación
