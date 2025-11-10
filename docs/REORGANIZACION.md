# Reorganización de Archivos - Noviembre 2025

## 📋 Resumen

Se ha realizado una reorganización completa de los archivos SQL y de documentación del proyecto para mejorar la estructura y facilitar el mantenimiento.

## 🗂️ Nueva Estructura

```
Hospital-/
├── supabase/                        # Archivos SQL de Supabase
│   ├── schema-completo.sql          # ⭐ Schema consolidado
│   ├── politicas-seguridad.sql      # ⭐ Políticas RLS
│   ├── datos-ejemplo.sql            # ⭐ Datos de prueba
│   └── supabase-*.sql               # Archivos históricos
├── docs/
│   ├── README.md                    # Documentación principal
│   └── guides/                      # Guías y documentación
│       ├── README.md
│       ├── *_GESTION_DOCUMENTAL.md
│       └── FIX_*.md
└── README.md                        # README principal actualizado
```

## ✨ Archivos Nuevos Creados

### Base de Datos

1. **`supabase/schema-completo.sql`**
   - Schema consolidado con todas las tablas
   - Incluye todas las mejoras y correcciones
   - Funciones y triggers actualizados
   - Índices optimizados
   - Comentarios y documentación

2. **`supabase/politicas-seguridad.sql`**
   - Todas las políticas RLS en un solo archivo
   - Políticas por tabla organizadas
   - Políticas específicas para portal de centros
   - Documentación de permisos

3. **`supabase/datos-ejemplo.sql`**
   - Datos de ejemplo consolidados
   - Categorías de documentos
   - Centros formadores de ejemplo
   - Servicios clínicos
   - Tutores y alumnos de prueba

### Documentación

4. **`docs/README.md`**
   - Guía completa de la documentación
   - Instrucciones de instalación
   - Estructura de la base de datos
   - Funciones útiles
   - Notas importantes

5. **`docs/guides/README.md`**
   - Índice de todas las guías
   - Organización por tema
   - Problemas comunes y soluciones

6. **`README.md` (actualizado)**
   - Información completa del proyecto
   - Tecnologías utilizadas
   - Instrucciones de instalación
   - Estado del proyecto
   - Enlaces a documentación

## 📦 Archivos Movidos

### SQL (a `supabase/`)
- ✅ `supabase-schema.sql`
- ✅ `supabase-add-capacidad.sql`
- ✅ `supabase-add-solicitudes.sql`
- ✅ `supabase-gestion-documental.sql`
- ✅ `supabase-portal-centros.sql`
- ✅ `supabase-crear-usuario-centro.sql`
- ✅ `supabase-datos-ejemplo.sql`
- ✅ `supabase-datos-ejemplo-documentos.sql`
- ✅ `supabase-fix-*.sql` (todos los archivos de corrección)

### Markdown (a `docs/guides/`)
- ✅ `CHECKLIST_GESTION_DOCUMENTAL.md`
- ✅ `FIX_ERROR_ELIMINACION.md`
- ✅ `FIX_STORAGE_DOCUMENTOS.md`
- ✅ `INSTRUCCIONES_GESTION_DOCUMENTAL.md`
- ✅ `README_GESTION_DOCUMENTAL.md`
- ✅ `RESUMEN_GESTION_DOCUMENTAL.md`

## 🎯 Beneficios

### Organización
- ✅ Archivos SQL separados de la documentación
- ✅ Guías agrupadas por tema
- ✅ Estructura clara y navegable
- ✅ Fácil de mantener

### Desarrollo
- ✅ Schema consolidado para nuevas instalaciones
- ✅ Archivos históricos preservados
- ✅ Documentación accesible
- ✅ Ejemplos de datos listos para usar

### Mantenimiento
- ✅ Un solo archivo para el schema completo
- ✅ Políticas de seguridad centralizadas
- ✅ Guías de resolución de problemas organizadas
- ✅ Historial de cambios preservado

## 🚀 Uso Recomendado

### Para Nueva Instalación
```bash
# 1. Schema completo
psql -f supabase/schema-completo.sql

# 2. Políticas de seguridad
psql -f supabase/politicas-seguridad.sql

# 3. (Opcional) Datos de ejemplo
psql -f supabase/datos-ejemplo.sql
```

### Para Actualización
1. Revisar archivos históricos en `supabase/supabase-*.sql`
2. Aplicar solo los cambios necesarios
3. Verificar políticas de seguridad
4. Probar en ambiente de desarrollo

### Para Desarrollo
1. Consultar `docs/README.md` para información general
2. Revisar `docs/guides/` para guías específicas
3. Usar `datos-ejemplo.sql` para pruebas
4. Consultar archivos `FIX_*.md` para problemas comunes

## 📝 Notas

- Los archivos originales se mantienen en `supabase/` como referencia histórica
- El archivo `api.js` fue eliminado ya que no se usaba en el proyecto
- El schema consolidado (`schema-completo.sql`) es la fuente de verdad actual
- Todos los cambios futuros deben reflejarse en el schema consolidado
- Los archivos de migración individuales se mantienen para referencia

## 🔄 Próximos Pasos

1. ✅ Reorganización completada
2. ✅ Documentación actualizada
3. ✅ Schema consolidado creado
4. ⏳ Validar en ambiente de desarrollo
5. ⏳ Actualizar base de datos de producción
6. ⏳ Capacitar al equipo en nueva estructura

---

**Fecha de reorganización:** 10 de Noviembre, 2025  
**Versión del schema:** 2.0
