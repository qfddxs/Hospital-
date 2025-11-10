# 📄 Módulo de Gestión Documental

## 🎯 Resumen Ejecutivo

Sistema completo de gestión documental para el Hospital, permitiendo administrar convenios, protocolos, normativas y otros documentos críticos con control de versiones, historial de auditoría y alertas de vencimiento.

## ⚡ Inicio Rápido

### 1. Ejecutar Migraciones SQL

```sql
-- En Supabase SQL Editor, ejecutar en orden:
1. supabase-gestion-documental.sql
2. supabase-datos-ejemplo-documentos.sql (opcional, para datos de prueba)
```

### 2. Configurar Storage

```bash
# En Supabase Dashboard:
1. Ir a Storage
2. Crear bucket "documentos"
3. Aplicar políticas (ver INSTRUCCIONES_GESTION_DOCUMENTAL.md)
```

### 3. Verificar Instalación

```bash
npm install @heroicons/react
```

### 4. Acceder al Módulo

```
Navegar a: /gestion-documental
```

## 📦 Archivos del Proyecto

```
📁 Proyecto
├── 📄 supabase-gestion-documental.sql          # Migraciones SQL
├── 📄 supabase-datos-ejemplo-documentos.sql    # Datos de prueba
├── 📄 INSTRUCCIONES_GESTION_DOCUMENTAL.md      # Guía detallada
├── 📄 RESUMEN_GESTION_DOCUMENTAL.md            # Resumen técnico
├── 📄 CHECKLIST_GESTION_DOCUMENTAL.md          # Lista de verificación
├── 📄 README_GESTION_DOCUMENTAL.md             # Este archivo
│
├── 📁 src/
│   ├── 📁 pages/
│   │   └── 📄 GestionDocumental.jsx            # Página principal
│   │
│   ├── 📁 components/
│   │   ├── 📄 DocumentoCard.jsx                # Vista de tarjeta
│   │   └── 📄 DocumentosAlerta.jsx             # Alertas de vencimiento
│   │
│   └── 📁 services/
│       └── 📄 documentosService.js             # Lógica de negocio
```

## ✨ Características Principales

### 🔹 Gestión de Documentos
- Subir documentos con archivos adjuntos
- Visualizar detalles completos
- Descargar documentos
- Duplicar/Crear versiones
- Eliminar documentos

### 🔹 Organización
- **Tipos:** Normativa, Protocolo, Convenio, Otro
- **Categorías:** Convenios, Protocolos, Normativas, Evaluaciones, etc.
- **Tags:** Sistema flexible de etiquetado
- **Versiones:** Control automático de versiones

### 🔹 Control de Vigencia
- Fechas de vigencia y vencimiento
- Estados: Vigente, Vencido, Archivado
- Alertas automáticas 30 días antes de vencer
- Actualización automática de estados

### 🔹 Búsqueda y Filtros
- Búsqueda por título, descripción y tags
- Filtros por tipo, categoría y estado
- Filtros avanzados expandibles

### 🔹 Auditoría
- Historial completo de acciones
- Registro de visualizaciones y descargas
- Tracking de usuarios
- Timestamps automáticos

### 🔹 Estadísticas
- Total de documentos
- Documentos vigentes
- Documentos por vencer
- Documentos vencidos
- Tamaño total en MB

### 🔹 Interfaz
- Dos vistas: Tabla y Tarjetas
- Diseño responsive
- Iconos intuitivos
- Colores por estado

## 🗄️ Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `documentos` | Información principal de documentos |
| `documentos_historial` | Registro de todas las acciones |
| `documentos_categorias` | Categorías predefinidas |
| `documentos_permisos` | Control de acceso granular |

### Funciones SQL

| Función | Propósito |
|---------|-----------|
| `obtener_estadisticas_documentos()` | Retorna métricas del sistema |
| `actualizar_estado_documentos()` | Actualiza documentos vencidos |
| `registrar_accion_documento()` | Trigger para historial automático |

## 🎨 Capturas de Pantalla

### Vista de Tabla
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Gestión Documental                    [⬆️ Subir]    │
├─────────────────────────────────────────────────────────┤
│ 📈 Estadísticas                                         │
│ [Total: 15] [Vigentes: 12] [Por Vencer: 2] [Vencidos: 1]│
├─────────────────────────────────────────────────────────┤
│ 🔍 Buscar... [Filtros ▼]                               │
├─────────────────────────────────────────────────────────┤
│ Documento          │ Estado  │ Tamaño │ Fecha │ Acciones│
│ Convenio UCH       │ Vigente │ 2.5 MB │ 01/01 │ 👁️ ⬇️ 📋 🗑️│
│ Protocolo Asist.   │ Vigente │ 1.2 MB │ 15/01 │ 👁️ ⬇️ 📋 🗑️│
└─────────────────────────────────────────────────────────┘
```

### Vista de Tarjetas
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 📄 Convenio  │ │ 📋 Protocolo │ │ 📊 Normativa │
│ UCH          │ │ Asistencia   │ │ Reglamento   │
│              │ │              │ │              │
│ [Vigente]    │ │ [Vigente]    │ │ [Vigente]    │
│ 2.5 MB       │ │ 1.2 MB       │ │ 3.1 MB       │
│              │ │              │ │              │
│ [Ver][⬇️][📋]│ │ [Ver][⬇️][📋]│ │ [Ver][⬇️][📋]│
└──────────────┘ └──────────────┘ └──────────────┘
```

## 🚀 Casos de Uso

### 1. Subir Convenio con Centro Formador

```javascript
// Usuario: Jefe de Docencia
1. Click "Subir Documento"
2. Título: "Convenio Universidad X"
3. Tipo: Convenio
4. Categoría: Convenios
5. Fecha vigencia: 01/01/2024
6. Fecha vencimiento: 31/12/2025
7. Tags: convenio, universidad-x, 2024
8. Adjuntar PDF firmado
9. Click "Subir"
✅ Documento creado y disponible
✅ Historial registra "creado"
✅ Alerta se activará 30 días antes de vencer
```

### 2. Buscar Protocolos de Seguridad

```javascript
// Usuario: Tutor Clínico
1. Escribir "seguridad" en búsqueda
2. Click "Filtros"
3. Tipo: Protocolo
4. Categoría: Protocolos
5. Estado: Vigente
✅ Lista filtrada de protocolos de seguridad vigentes
6. Click en ojo para ver detalles
7. Click en descarga para obtener PDF
✅ Historial registra "visto" y "descargado"
```

### 3. Crear Nueva Versión de Normativa

```javascript
// Usuario: Administrador
1. Buscar normativa existente
2. Click en ícono de duplicar
3. Confirmar acción
✅ Nueva versión creada automáticamente
✅ Versión incrementada (ej: 1.0 → 1.1)
✅ Vinculada a documento original
✅ Historial registra "creado" con referencia
4. Editar título si es necesario
5. Subir nuevo archivo actualizado
```

### 4. Revisar Documentos Próximos a Vencer

```javascript
// Usuario: Encargado de Gestión
1. Ver alerta amarilla en top de página
2. Revisar lista de documentos por vencer
3. Click en documento específico
4. Verificar fecha de vencimiento
5. Contactar responsable para renovación
6. Subir nueva versión cuando esté lista
✅ Sistema mantiene historial completo
✅ Documento antiguo puede archivarse
```

## 📊 Estadísticas del Sistema

El módulo proporciona métricas en tiempo real:

- **Total Documentos:** Contador general
- **Vigentes:** Documentos activos
- **Por Vencer:** Próximos 30 días
- **Vencidos:** Pasada fecha límite
- **Tamaño Total:** Espacio usado en MB

## 🔐 Seguridad

### Row Level Security (RLS)
- ✅ Habilitado en todas las tablas
- ✅ Políticas de lectura para autenticados
- ✅ Políticas de escritura para autenticados

### Storage
- ✅ Bucket privado/público configurable
- ✅ Políticas de upload autenticado
- ✅ Políticas de descarga según visibilidad

### Auditoría
- ✅ Registro de todas las acciones
- ✅ Usuario y timestamp en cada acción
- ✅ Historial inmutable

## 🛠️ Mantenimiento

### Actualizar Estados Vencidos

```sql
-- Ejecutar periódicamente (ej: diario via cron)
SELECT actualizar_estado_documentos();
```

### Limpiar Historial Antiguo

```sql
-- Opcional: Limpiar registros > 1 año
DELETE FROM documentos_historial
WHERE created_at < NOW() - INTERVAL '1 year';
```

### Monitorear Espacio en Storage

```sql
-- Ver tamaño total usado
SELECT 
    COUNT(*) as total_documentos,
    ROUND(SUM(tamaño_bytes) / 1024.0 / 1024.0, 2) as mb_usados
FROM documentos;
```

## 📚 Documentación Adicional

| Documento | Descripción |
|-----------|-------------|
| `INSTRUCCIONES_GESTION_DOCUMENTAL.md` | Guía completa de instalación y configuración |
| `RESUMEN_GESTION_DOCUMENTAL.md` | Resumen técnico detallado |
| `CHECKLIST_GESTION_DOCUMENTAL.md` | Lista de verificación paso a paso |

## 🐛 Solución de Problemas

### Error: "No se puede subir archivo"
```
Causa: Bucket no existe o políticas incorrectas
Solución: 
1. Verificar bucket "documentos" existe
2. Revisar políticas de Storage
3. Verificar autenticación de usuario
```

### Error: "No se cargan estadísticas"
```
Causa: Función SQL no existe
Solución:
1. Ejecutar supabase-gestion-documental.sql
2. Verificar función en SQL Editor
```

### Documentos no se marcan como vencidos
```
Causa: Función no se ejecuta automáticamente
Solución:
1. Ejecutar manualmente: SELECT actualizar_estado_documentos();
2. Configurar cron job para ejecución diaria
```

## 🎯 Próximas Mejoras

- [ ] Previsualización de PDFs integrada
- [ ] Firma digital de documentos
- [ ] Workflow de aprobación (borrador → revisión → aprobado)
- [ ] Notificaciones por email de vencimientos
- [ ] Exportar reportes en Excel/PDF
- [ ] Búsqueda full-text avanzada
- [ ] OCR para documentos escaneados
- [ ] Compartir documentos por link temporal

## 📞 Soporte

Para problemas o consultas:

1. Revisar documentación en este repositorio
2. Verificar logs del navegador (Console)
3. Revisar logs de Supabase (Dashboard → Logs)
4. Consultar documentación oficial: https://supabase.com/docs

## 📄 Licencia

Este módulo es parte del Sistema de Gestión de Campos Clínicos del Hospital.

---

**Versión:** 1.0  
**Última Actualización:** Noviembre 2025  
**Estado:** ✅ Producción Ready  
**Mantenedor:** Equipo de Desarrollo Hospital
