# Instrucciones para Activar RLS en Supabase

## Tabla: usuarios_centros

### Paso 1: Ir a Supabase SQL Editor
1. Abre tu proyecto en Supabase Dashboard
2. Ve a la sección **SQL Editor** en el menú lateral
3. Haz clic en **New Query**

### Paso 2: Ejecutar el Script
1. Copia todo el contenido del archivo `rls_usuarios_centros.sql`
2. Pégalo en el editor SQL
3. Haz clic en **Run** o presiona `Ctrl + Enter`

### Paso 3: Verificar que se aplicó correctamente
Ejecuta esta consulta para verificar:
```sql
SELECT * FROM pg_policies WHERE tablename = 'usuarios_centros';
```

Deberías ver 4 políticas:
- `usuarios_centros_select_policy`
- `usuarios_centros_insert_policy`
- `usuarios_centros_update_policy`
- `usuarios_centros_delete_policy`

### Paso 4: Verificar en la UI de Supabase
1. Ve a **Authentication** > **Policies**
2. Busca la tabla `usuarios_centros`
3. Deberías ver el estado como **RLS enabled** con las 4 políticas activas

## ¿Qué hace esta configuración?

✅ **Seguridad mejorada**: Solo los usuarios autenticados pueden ver sus propios datos
✅ **Aislamiento de datos**: Un centro formador no puede ver datos de otros centros
✅ **Protección automática**: Supabase aplica estas reglas a nivel de base de datos
✅ **Mensaje de error**: Si alguien intenta acceder sin permisos, verá "datos incorrectos"

## Próximos pasos

Una vez aplicado esto, podemos continuar con las siguientes tablas:
- `centros_formadores`
- `solicitudes_rotacion`
- `estudiantes_rotacion`
- `documentos_centro`
- Etc.

## Troubleshooting

Si tienes problemas:
1. Verifica que el usuario esté autenticado: `SELECT auth.uid();`
2. Verifica que exista el registro en usuarios_centros
3. Revisa los logs en Supabase Dashboard > Logs
