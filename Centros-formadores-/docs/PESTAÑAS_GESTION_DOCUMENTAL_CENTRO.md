# Pestañas en Gestión Documental - Portal Centro Formador

## Implementación Completada

Se han agregado pestañas en la página de Gestión Documental del portal de centros formadores para separar:

### 1. Documentos del Centro
- Documentos institucionales del centro formador
- Certificados, seguros, convenios, etc.
- **Funcionalidades:**
  - ✅ Subir documentos PDF
  - ✅ Ver/Descargar documentos
  - ✅ Eliminar documentos propios
  - ✅ Agregar descripción y tipo

### 2. Documentos de Estudiantes
- Documentos subidos por el centro para sus estudiantes
- Vista de solo lectura (no se pueden eliminar)
- **Información mostrada:**
  - 👤 Nombre completo del estudiante y RUT
  - 📄 Título y nombre del archivo
  - 📅 Fecha de subida
  - 📊 Estado de aprobación:
    - 🕐 Pendiente de aprobación (azul)
    - ✅ Aprobado (verde)
    - ❌ Rechazado (rojo)

## Características Implementadas

### Pestañas
- Navegación entre "Documentos del Centro" y "Documentos de Estudiantes"
- Cambio automático de contenido según pestaña activa
- Recarga de datos al cambiar de pestaña

### Área de Subida
- Solo visible en pestaña "Documentos del Centro"
- Formulario con tipo de documento y descripción
- Drag & drop para archivos PDF
- Validación de tamaño (máx 10MB)

### Visualización de Documentos

#### Pestaña "Documentos del Centro":
- Nombre del archivo
- Tipo de documento
- Fecha de subida
- Tamaño del archivo
- Descripción (si existe)
- Botones: Ver/Descargar y Eliminar

#### Pestaña "Documentos de Estudiantes":
- **Información del estudiante** (nombre y RUT)
- Título del documento
- Tipo de documento
- Fecha de subida
- **Estado de aprobación** con badge de color
- Solo botón: Ver/Descargar (no se puede eliminar)

## Flujo de Trabajo

### Para Documentos del Centro:
1. Centro sube documentos institucionales
2. Quedan almacenados en tabla `documentos_centro`
3. Centro puede ver, descargar y eliminar sus propios documentos

### Para Documentos de Estudiantes:
1. Centro sube documentos desde "Documentos Estudiantes" (otra página)
2. Hospital revisa y aprueba/rechaza en su portal
3. Centro puede ver el estado de aprobación en esta pestaña
4. Centro NO puede eliminar documentos de estudiantes (solo hospital)

## Diferencias con Portal Hospital

| Característica | Portal Hospital | Portal Centro Formador |
|----------------|-----------------|------------------------|
| Pestañas | ✅ Institucionales + Estudiantes | ✅ Centro + Estudiantes |
| Subir docs institucionales | ✅ Sí | ✅ Sí |
| Subir docs estudiantes | ❌ No (lo hace el centro) | ✅ Sí (en otra página) |
| Aprobar/Rechazar | ✅ Sí | ❌ No (solo ver estado) |
| Eliminar docs estudiantes | ✅ Sí | ❌ No |
| Filtro por centro | ✅ Sí | ❌ No (solo ve su centro) |

## Archivos Modificados

1. `Centros-formadores-/src/pages/GestionDocumental.jsx`
   - Agregadas pestañas
   - Carga condicional de documentos según pestaña
   - Visualización diferenciada por tipo de documento
   - Área de subida solo para documentos del centro
   - Botones de acción condicionales
   - Mostrar estado de aprobación en docs de estudiantes

## Consultas SQL Utilizadas

### Documentos del Centro:
```sql
SELECT * FROM documentos_centro
WHERE centro_formador_id = 'uuid-del-centro'
ORDER BY fecha_subida DESC;
```

### Documentos de Estudiantes:
```sql
SELECT 
  d.*,
  a.id, a.nombre, a.primer_apellido, a.segundo_apellido, a.rut
FROM documentos d
JOIN alumnos a ON d.alumno_id = a.id
WHERE d.centro_formador_id = 'uuid-del-centro'
  AND d.alumno_id IS NOT NULL
ORDER BY d.created_at DESC;
```

## Observaciones Importantes

1. **Permisos:** El centro solo puede eliminar sus documentos institucionales, no los de estudiantes
2. **Aprobación:** El estado de aprobación es solo informativo para el centro, no puede modificarlo
3. **Navegación:** Para subir documentos de estudiantes, usar la página "Documentos Estudiantes" del menú
4. **Sincronización:** Los cambios de estado (aprobación/rechazo) se reflejan automáticamente al recargar

## Próximos Pasos Sugeridos

- [ ] Agregar filtros por tipo de documento
- [ ] Agregar búsqueda por nombre de estudiante
- [ ] Mostrar comentarios de rechazo (si aplica)
- [ ] Agregar notificaciones cuando un documento sea aprobado/rechazado
- [ ] Estadísticas de documentos por estado

## Notas de Uso

### Para Centros Formadores:
1. Usa "Documentos del Centro" para subir certificados institucionales
2. Usa "Documentos de Estudiantes" para ver el estado de los documentos que subiste para tus alumnos
3. Si un documento fue rechazado, debes volver a subirlo desde "Documentos Estudiantes"

### Para Administradores:
- Los documentos del centro se almacenan en `documentos_centro`
- Los documentos de estudiantes se almacenan en `documentos` con `alumno_id` y `centro_formador_id`
- El campo `aprobado` indica el estado: NULL=pendiente, true=aprobado, false=rechazado

---

## Fecha de Creación
Noviembre 16, 2025

## Estado
✅ Implementado y funcional
