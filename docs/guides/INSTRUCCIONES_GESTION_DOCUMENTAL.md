# Módulo de Gestión Documental - Instrucciones de Implementación

## 📋 Descripción

El módulo de Gestión Documental permite administrar todos los documentos del sistema hospitalario, incluyendo convenios, protocolos, normativas, evaluaciones y más.

## 🚀 Características Implementadas

### ✅ Funcionalidades Principales

1. **Gestión de Documentos**
   - Subir documentos con archivos adjuntos
   - Visualizar detalles completos
   - Descargar documentos
   - Duplicar/Crear versiones
   - Eliminar documentos

2. **Categorización y Organización**
   - Tipos: Normativa, Protocolo, Convenio, Otro
   - Categorías predefinidas: Convenios, Protocolos, Normativas, Evaluaciones, etc.
   - Sistema de tags para búsqueda avanzada
   - Versionamiento de documentos

3. **Control de Vigencia**
   - Fecha de vigencia
   - Fecha de vencimiento
   - Estados: Vigente, Vencido, Archivado
   - Alertas automáticas de documentos próximos a vencer

4. **Búsqueda y Filtros**
   - Búsqueda por título, descripción y tags
   - Filtros por tipo, categoría y estado
   - Filtros avanzados expandibles

5. **Historial y Auditoría**
   - Registro automático de todas las acciones
   - Historial de visualizaciones, descargas, modificaciones
   - Tracking de usuarios que realizan acciones

6. **Estadísticas**
   - Total de documentos
   - Documentos vigentes
   - Documentos por vencer (próximos 30 días)
   - Documentos vencidos
   - Tamaño total en MB

7. **Seguridad y Permisos**
   - Visibilidad: Público, Privado, Restringido
   - Sistema de permisos por documento
   - Row Level Security (RLS) en Supabase

## 📦 Archivos Creados/Modificados

### Nuevos Archivos

1. **supabase-gestion-documental.sql**
   - Mejoras al esquema de base de datos
   - Tablas de historial, categorías y permisos
   - Funciones y triggers automáticos
   - Vistas y estadísticas

2. **src/services/documentosService.js**
   - Servicio completo para gestión de documentos
   - Funciones para CRUD, búsqueda, versionamiento
   - Gestión de historial y estadísticas

3. **src/components/DocumentosAlerta.jsx**
   - Componente de alertas para documentos próximos a vencer
   - Notificaciones visuales

### Archivos Modificados

1. **src/pages/GestionDocumental.jsx**
   - Interfaz completa mejorada
   - Filtros avanzados
   - Modal de visualización con historial
   - Formulario extendido con nuevos campos

## 🔧 Instalación

### Paso 1: Ejecutar Migraciones SQL

Ejecuta los siguientes archivos SQL en tu proyecto de Supabase (en orden):

1. **supabase-schema.sql** (si no lo has ejecutado antes)
2. **supabase-gestion-documental.sql** (nuevas mejoras)

#### Opción A: Desde el Dashboard de Supabase

1. Ve a tu proyecto en Supabase
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido de `supabase-gestion-documental.sql`
5. Ejecuta la query (botón "Run")

#### Opción B: Desde la CLI de Supabase

```bash
# Si tienes Supabase CLI instalado
supabase db push
```

### Paso 2: Configurar Storage en Supabase

1. Ve a **Storage** en tu dashboard de Supabase
2. Crea un nuevo bucket llamado `documentos`
3. Configura las políticas de acceso:

```sql
-- Política para permitir subir archivos (usuarios autenticados)
CREATE POLICY "Permitir subir documentos autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos');

-- Política para permitir leer archivos (público)
CREATE POLICY "Permitir leer documentos públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documentos');

-- Política para permitir eliminar archivos (usuarios autenticados)
CREATE POLICY "Permitir eliminar documentos autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos');
```

### Paso 3: Verificar Instalación de Dependencias

Asegúrate de tener instaladas las dependencias necesarias:

```bash
npm install @heroicons/react
```

## 📊 Estructura de Base de Datos

### Tablas Principales

#### `documentos`
- Información básica del documento
- Metadatos (tipo, categoría, tags)
- URLs de archivos
- Control de versiones
- Estados y vigencia

#### `documentos_historial`
- Registro de todas las acciones
- Usuario que realizó la acción
- Timestamp y detalles

#### `documentos_categorias`
- Categorías predefinidas
- Iconos y colores

#### `documentos_permisos`
- Control de acceso por documento
- Permisos granulares (ver, descargar, editar, eliminar)

### Funciones SQL Importantes

1. **`obtener_estadisticas_documentos()`**
   - Retorna estadísticas generales del sistema

2. **`actualizar_estado_documentos()`**
   - Actualiza automáticamente documentos vencidos

3. **`registrar_accion_documento()`**
   - Trigger automático para historial

## 🎨 Uso del Módulo

### Subir un Documento

1. Click en "Subir Documento"
2. Completa el formulario:
   - Título (requerido)
   - Tipo y Categoría (requerido)
   - Versión (opcional)
   - Fechas de vigencia y vencimiento
   - Tags separados por comas
   - Descripción
   - Archivo adjunto
3. Click en "Subir Documento"

### Buscar Documentos

1. Usa la barra de búsqueda principal
2. Click en "Filtros" para opciones avanzadas
3. Filtra por tipo, categoría o estado

### Ver Detalles

1. Click en el ícono de ojo en la tabla
2. Visualiza toda la información
3. Revisa el historial de actividad
4. Descarga o duplica desde el modal

### Crear Nueva Versión

1. Click en el ícono de duplicar
2. Se crea automáticamente una nueva versión
3. El número de versión se incrementa automáticamente

## 🔐 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado. Las políticas actuales permiten:

- **Lectura**: Todos los usuarios autenticados
- **Escritura**: Solo usuarios autenticados
- **Eliminación**: Solo usuarios autenticados

### Recomendaciones

Para producción, considera implementar políticas más restrictivas basadas en roles:

```sql
-- Ejemplo: Solo admins pueden eliminar
CREATE POLICY "Solo admins eliminan documentos"
ON documentos FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.email = auth.jwt() ->> 'email'
    AND usuarios.rol = 'admin'
  )
);
```

## 📈 Mantenimiento

### Actualizar Estados de Documentos Vencidos

Ejecuta periódicamente (puedes crear un cron job):

```sql
SELECT actualizar_estado_documentos();
```

### Limpiar Historial Antiguo

Para mantener el rendimiento, considera limpiar registros antiguos:

```sql
DELETE FROM documentos_historial
WHERE created_at < NOW() - INTERVAL '1 year';
```

## 🐛 Troubleshooting

### Error: "No se puede subir archivo"

1. Verifica que el bucket `documentos` existe
2. Revisa las políticas de Storage
3. Confirma que el usuario está autenticado

### Error: "No se pueden cargar estadísticas"

1. Verifica que la función `obtener_estadisticas_documentos()` existe
2. Ejecuta manualmente en SQL Editor para ver errores

### Documentos no se marcan como vencidos

1. Ejecuta manualmente: `SELECT actualizar_estado_documentos();`
2. Considera crear un trigger o cron job

## 🎯 Próximas Mejoras Sugeridas

1. **Previsualización de documentos** (PDF viewer integrado)
2. **Firma digital** de documentos
3. **Workflow de aprobación** (borrador → revisión → aprobado)
4. **Notificaciones por email** de vencimientos
5. **Exportar reportes** en Excel/PDF
6. **Búsqueda full-text** avanzada
7. **Integración con OCR** para documentos escaneados
8. **Compartir documentos** por link temporal

## 📞 Soporte

Si encuentras problemas o necesitas ayuda adicional, revisa:

1. Los logs del navegador (Console)
2. Los logs de Supabase (Dashboard → Logs)
3. La documentación de Supabase: https://supabase.com/docs

---

**Versión:** 1.0  
**Fecha:** Noviembre 2025  
**Autor:** Sistema de Gestión de Campos Clínicos
