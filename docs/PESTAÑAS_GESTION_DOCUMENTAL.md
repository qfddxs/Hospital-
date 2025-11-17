# Pestañas en Gestión Documental - Portal Hospital

## Implementación Completada

Se han agregado pestañas en la página de Gestión Documental del portal del hospital para separar:

### 1. Documentos Institucionales
- Documentos normativos, protocolos, convenios
- Funcionalidades: Ver, Descargar, Editar, Eliminar
- Sin relación con estudiantes (alumno_id = null)

### 2. Documentos de Estudiantes
- Documentos subidos por centros formadores
- Información del estudiante y centro formador
- **Funcionalidades de aprobación:**
  - ✅ Aprobar documento
  - ❌ Rechazar documento
  - 💬 Agregar comentarios
  - 🔍 Ver documento

## Características Implementadas

### Pestañas
- Navegación entre "Documentos Institucionales" y "Documentos de Estudiantes"
- Cambio automático de columnas según pestaña activa
- Recarga de datos al cambiar de pestaña

### Columnas para Estudiantes
1. **Estudiante**: Nombre completo y RUT
2. **Centro Formador**: Nombre de la institución
3. **Documento**: Título y nombre del archivo
4. **Tipo**: Tipo de documento
5. **Estado Aprobación**: 
   - 🕐 Pendiente (azul)
   - ✅ Aprobado (verde)
   - ❌ Rechazado (rojo)
6. **Fecha**: Fecha de subida y expiración
7. **Acciones**: Ver, Aprobar, Rechazar

### Filtros
- Tipo de documento
- Categoría
- Estado
- **Centro Formador** (solo para estudiantes):
  - Todos los centros
  - Lista de centros formadores activos
- **Estado de Aprobación** (solo para estudiantes):
  - Todos
  - Pendientes
  - Aprobados
  - Rechazados

### Modal de Aprobación/Rechazo
- Muestra información del documento y estudiante
- Campo de comentarios (obligatorio para rechazo)
- Botones de acción con colores distintivos
- Actualiza estado en base de datos
- Registra acción en historial

## Flujo de Trabajo

### Para Documentos de Estudiantes:
1. Centro formador sube documento → Estado: Pendiente
2. Hospital revisa en pestaña "Documentos de Estudiantes"
3. Hospital puede:
   - **Aprobar**: Documento queda disponible
   - **Rechazar**: Centro debe corregir y volver a subir
4. Se registra quién aprobó/rechazó y cuándo
5. Comentarios quedan guardados para referencia

## Observaciones Agregadas

### Portal Hospital - Documentos Pendientes
Se agregó observación indicando que la gestión completa está en "Gestión Documental"

### Portal Centro Formador - Documentos Estudiantes
Se agregó observación indicando que:
- Esta página es para **subir** documentos
- Para **revisar/aprobar** usar "Gestión Documental" en el menú

## Archivos Modificados

1. `src/pages/GestionDocumental.jsx` (Hospital)
   - Agregadas pestañas
   - Nuevas columnas para estudiantes
   - Modal de aprobación/rechazo
   - Filtro de centro formador
   - Filtro de estado de aprobación
   - Funciones de aprobación
   - Carga dinámica de centros formadores

2. `src/pages/DocumentosPendientes.jsx` (Hospital)
   - Observación sobre Gestión Documental

3. `Centros-formadores-/src/pages/DocumentosEstudiantes.jsx`
   - Observación sobre Gestión Documental

## Próximos Pasos Sugeridos

1. ✅ Probar flujo completo de aprobación
2. ✅ Verificar permisos de usuarios
3. ✅ Validar notificaciones (si aplica)
4. ✅ Revisar historial de acciones
5. ✅ Documentar para usuarios finales
