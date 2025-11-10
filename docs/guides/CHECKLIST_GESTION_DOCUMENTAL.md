# ✅ Checklist de Implementación - Gestión Documental

## 📋 Pre-requisitos

- [ ] Proyecto de Supabase creado y configurado
- [ ] Conexión a Supabase funcionando (`supabaseClient.js`)
- [ ] Dependencias instaladas: `@heroicons/react`
- [ ] Usuario autenticado en el sistema

## 🗄️ Base de Datos

### Paso 1: Ejecutar Migraciones SQL

- [ ] Ejecutar `supabase-schema.sql` (si no se ha hecho antes)
- [ ] Ejecutar `supabase-gestion-documental.sql`
- [ ] Verificar que no hay errores en la ejecución

### Paso 2: Verificar Tablas Creadas

```sql
-- Ejecutar en SQL Editor para verificar
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'documento%';
```

Debe mostrar:
- [ ] `documentos`
- [ ] `documentos_historial`
- [ ] `documentos_categorias`
- [ ] `documentos_permisos`

### Paso 3: Verificar Funciones

```sql
-- Verificar funciones creadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%documento%';
```

Debe incluir:
- [ ] `registrar_accion_documento`
- [ ] `actualizar_estado_documentos`
- [ ] `obtener_estadisticas_documentos`

### Paso 4: Verificar Categorías

```sql
-- Verificar categorías insertadas
SELECT nombre, descripcion FROM documentos_categorias;
```

Debe mostrar al menos:
- [ ] Convenios
- [ ] Protocolos
- [ ] Normativas
- [ ] Evaluaciones
- [ ] Asistencia
- [ ] Contratos
- [ ] Reportes
- [ ] Otros

## 📦 Storage de Supabase

### Paso 5: Crear Bucket

- [ ] Ir a Storage en dashboard de Supabase
- [ ] Crear bucket llamado `documentos`
- [ ] Configurar como público o privado según necesidad

### Paso 6: Configurar Políticas de Storage

Ejecutar en SQL Editor:

```sql
-- Política para subir archivos
CREATE POLICY "Permitir subir documentos autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos');

-- Política para leer archivos
CREATE POLICY "Permitir leer documentos públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documentos');

-- Política para eliminar archivos
CREATE POLICY "Permitir eliminar documentos autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos');
```

- [ ] Política de INSERT creada
- [ ] Política de SELECT creada
- [ ] Política de DELETE creada

### Paso 7: Verificar Storage

- [ ] Intentar subir un archivo de prueba manualmente
- [ ] Verificar que se puede acceder a la URL pública
- [ ] Intentar eliminar el archivo de prueba

## 💻 Código Frontend

### Paso 8: Verificar Archivos Creados

- [ ] `src/pages/GestionDocumental.jsx` (modificado)
- [ ] `src/services/documentosService.js` (nuevo)
- [ ] `src/components/DocumentoCard.jsx` (nuevo)
- [ ] `src/components/DocumentosAlerta.jsx` (nuevo)

### Paso 9: Verificar Imports

En `GestionDocumental.jsx`:
- [ ] Import de `DocumentosAlerta`
- [ ] Import de `DocumentoCard`
- [ ] Import de iconos adicionales (`Squares2X2Icon`, `TableCellsIcon`)

### Paso 10: Verificar Componentes UI

Asegurarse de que existen:
- [ ] `src/components/UI/Table.jsx`
- [ ] `src/components/UI/Button.jsx`
- [ ] `src/components/UI/Modal.jsx`

## 🧪 Pruebas Funcionales

### Paso 11: Datos de Ejemplo (Opcional)

- [ ] Ejecutar `supabase-datos-ejemplo-documentos.sql`
- [ ] Verificar que se insertaron documentos de ejemplo
- [ ] Verificar que hay documentos próximos a vencer

### Paso 12: Probar Funcionalidades Básicas

#### Visualización
- [ ] Acceder a la página de Gestión Documental
- [ ] Ver estadísticas en el header
- [ ] Ver lista de documentos (si hay datos de ejemplo)
- [ ] Cambiar entre vista de tabla y tarjetas

#### Búsqueda y Filtros
- [ ] Buscar por título
- [ ] Buscar por descripción
- [ ] Buscar por tags
- [ ] Filtrar por tipo
- [ ] Filtrar por categoría
- [ ] Filtrar por estado
- [ ] Expandir/contraer filtros avanzados

#### Subir Documento
- [ ] Click en "Subir Documento"
- [ ] Completar formulario con datos válidos
- [ ] Seleccionar un archivo
- [ ] Subir documento exitosamente
- [ ] Verificar que aparece en la lista
- [ ] Verificar que el archivo se subió a Storage

#### Ver Detalles
- [ ] Click en ícono de ojo
- [ ] Ver modal con información completa
- [ ] Ver historial de actividad
- [ ] Cerrar modal

#### Descargar
- [ ] Click en ícono de descarga
- [ ] Verificar que se abre/descarga el archivo
- [ ] Verificar que se registra en historial

#### Duplicar
- [ ] Click en ícono de duplicar
- [ ] Confirmar acción
- [ ] Verificar que se crea nueva versión
- [ ] Verificar incremento de versión

#### Eliminar
- [ ] Click en ícono de eliminar
- [ ] Confirmar acción
- [ ] Verificar que se elimina de la lista
- [ ] Verificar que se elimina de Storage

### Paso 13: Probar Alertas

- [ ] Verificar que aparece alerta de documentos próximos a vencer
- [ ] Verificar que muestra documentos correctos
- [ ] Cerrar alerta
- [ ] Verificar que no vuelve a aparecer

### Paso 14: Probar Historial

- [ ] Subir un documento
- [ ] Ver detalles del documento
- [ ] Verificar que aparece "creado" en historial
- [ ] Descargar el documento
- [ ] Ver detalles nuevamente
- [ ] Verificar que aparece "descargado" en historial

## 🔐 Seguridad

### Paso 15: Verificar RLS

```sql
-- Verificar que RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'documento%';
```

Todas las tablas deben tener `rowsecurity = true`:
- [ ] `documentos`
- [ ] `documentos_historial`
- [ ] `documentos_categorias`
- [ ] `documentos_permisos`

### Paso 16: Verificar Políticas

```sql
-- Ver políticas activas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE 'documento%';
```

- [ ] Políticas de lectura existen
- [ ] Políticas de escritura existen
- [ ] Políticas son apropiadas para tu caso de uso

## 📊 Rendimiento

### Paso 17: Verificar Índices

```sql
-- Ver índices creados
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename LIKE 'documento%';
```

Debe incluir:
- [ ] `idx_documentos_tipo`
- [ ] `idx_documentos_categoria`
- [ ] `idx_documentos_estado`
- [ ] `idx_documentos_tags`
- [ ] `idx_documentos_historial_documento`
- [ ] `idx_documentos_historial_fecha`

## 🐛 Troubleshooting

### Problemas Comunes

#### Error: "No se puede subir archivo"
- [ ] Verificar que bucket `documentos` existe
- [ ] Verificar políticas de Storage
- [ ] Verificar que usuario está autenticado
- [ ] Revisar console del navegador para errores

#### Error: "No se pueden cargar documentos"
- [ ] Verificar conexión a Supabase
- [ ] Verificar políticas RLS
- [ ] Revisar console del navegador
- [ ] Verificar que tabla `documentos` existe

#### Error: "No se pueden cargar estadísticas"
- [ ] Verificar que función `obtener_estadisticas_documentos()` existe
- [ ] Ejecutar función manualmente en SQL Editor
- [ ] Revisar errores en logs de Supabase

#### Documentos no se marcan como vencidos
- [ ] Ejecutar manualmente: `SELECT actualizar_estado_documentos();`
- [ ] Verificar que función existe
- [ ] Considerar crear cron job

#### Historial no se registra
- [ ] Verificar que trigger `trigger_historial_documentos` existe
- [ ] Verificar que función `registrar_accion_documento()` existe
- [ ] Revisar logs de Supabase

## 📝 Documentación

### Paso 18: Revisar Documentación

- [ ] Leer `INSTRUCCIONES_GESTION_DOCUMENTAL.md`
- [ ] Leer `RESUMEN_GESTION_DOCUMENTAL.md`
- [ ] Entender estructura de base de datos
- [ ] Entender flujo de la aplicación

## ✅ Checklist Final

### Funcionalidades Core
- [ ] ✅ Subir documentos con archivos
- [ ] ✅ Ver lista de documentos
- [ ] ✅ Buscar documentos
- [ ] ✅ Filtrar documentos
- [ ] ✅ Ver detalles completos
- [ ] ✅ Descargar archivos
- [ ] ✅ Duplicar/versionar documentos
- [ ] ✅ Eliminar documentos
- [ ] ✅ Ver historial de actividad
- [ ] ✅ Ver estadísticas
- [ ] ✅ Alertas de vencimiento

### Funcionalidades Avanzadas
- [ ] ✅ Dos vistas (tabla/tarjetas)
- [ ] ✅ Filtros avanzados
- [ ] ✅ Sistema de tags
- [ ] ✅ Control de vigencia
- [ ] ✅ Versionamiento automático
- [ ] ✅ Categorización
- [ ] ✅ Control de visibilidad

### Base de Datos
- [ ] ✅ Tablas creadas
- [ ] ✅ Funciones creadas
- [ ] ✅ Triggers configurados
- [ ] ✅ Índices creados
- [ ] ✅ RLS habilitado
- [ ] ✅ Políticas configuradas

### Storage
- [ ] ✅ Bucket creado
- [ ] ✅ Políticas configuradas
- [ ] ✅ Upload funciona
- [ ] ✅ Download funciona
- [ ] ✅ Delete funciona

### Frontend
- [ ] ✅ Componentes creados
- [ ] ✅ Servicios implementados
- [ ] ✅ UI responsive
- [ ] ✅ Sin errores en console
- [ ] ✅ Sin warnings de React

## 🎉 ¡Listo para Producción!

Si todos los checkboxes están marcados, el módulo de Gestión Documental está completamente implementado y listo para usar.

### Próximos Pasos Recomendados:

1. **Capacitación de usuarios**
   - Crear manual de usuario
   - Realizar sesiones de capacitación
   - Documentar casos de uso comunes

2. **Monitoreo**
   - Configurar alertas de errores
   - Monitorear uso de Storage
   - Revisar logs periódicamente

3. **Optimización**
   - Analizar consultas lentas
   - Optimizar índices si es necesario
   - Implementar caché si es necesario

4. **Mejoras Futuras**
   - Previsualización de PDFs
   - Firma digital
   - Workflow de aprobación
   - Notificaciones por email

---

**Fecha de Verificación:** _______________  
**Verificado por:** _______________  
**Estado:** [ ] Completo [ ] Pendiente [ ] Con Observaciones
