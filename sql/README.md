# 📁 Estructura de Carpeta SQL

Esta carpeta contiene todos los scripts SQL organizados por categoría.

## 📂 Estructura

```
sql/
├── rls/                    # Políticas de Row Level Security
│   ├── rls_usuarios_centros.sql
│   ├── rls_centros_formadores.sql
│   ├── rls_solicitudes_rotacion.sql
│   ├── rls_estudiantes_rotacion.sql
│   ├── rls_documentos_requeridos.sql
│   └── rls_vistas.sql
│
├── migraciones/            # Scripts de migración de datos
│   ├── agregar-alumno-id-rotaciones.sql
│   ├── cambiar-telefono-por-email.sql
│   ├── eliminar-tabla-tutores.sql
│   ├── limpiar-estudiantes-duplicados.sql
│   ├── migrar-datos-contacto.sql
│   └── renombrar-columna-contacto.sql
│
├── scripts/                # Scripts de utilidad y mantenimiento
│   ├── verificar-permisos-estudiantes.sql
│   ├── SCRIPT_PASO_A_PASO.sql
│   ├── SCRIPT_SQL_CORREGIDO.sql
│   └── SCRIPT_SQL_RETRIBUCIONES.sql
│
├── README_RLS.md          # Documentación de RLS
└── INSTRUCCIONES_RLS.md   # Guía de implementación RLS
```

## 🔐 RLS (Row Level Security)

Políticas de seguridad a nivel de fila para proteger los datos:
- **usuarios_centros**: Solo usuarios de centros ven sus datos
- **centros_formadores**: Centros ven solo sus datos, hospital ve todos
- **solicitudes_rotacion**: Filtrado por centro formador
- **estudiantes_rotacion**: Aislamiento entre centros
- **documentos_requeridos**: Lectura pública, escritura restringida
- **vistas**: Filtradas automáticamente por centro

## 🔄 Migraciones

Scripts para actualizar la estructura de la base de datos:
- Cambios de esquema
- Renombrado de columnas
- Limpieza de datos
- Migraciones de datos entre tablas

## 🛠️ Scripts

Utilidades y scripts de mantenimiento:
- Verificación de permisos
- Scripts de corrección
- Módulos específicos (retribuciones)

## 📝 Orden de Ejecución

### Para configurar RLS:
1. `rls/rls_usuarios_centros.sql`
2. `rls/rls_centros_formadores.sql`
3. `rls/rls_solicitudes_rotacion.sql`
4. `rls/rls_documentos_requeridos.sql`
5. `rls/rls_vistas.sql`

### Para migraciones (ya aplicadas):
Los scripts en `migraciones/` ya fueron ejecutados en el desarrollo del proyecto.

## ⚠️ Importante

- Siempre hacer backup antes de ejecutar scripts
- Probar en ambiente de desarrollo primero
- Leer la documentación en `README_RLS.md` antes de aplicar RLS
