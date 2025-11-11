# Solución: Error de Políticas RLS en Portal

## 🐛 Error

```
new row violates row-level security policy for table "usuarios_centros"
```

## 🔍 Causa

Las políticas de Row Level Security (RLS) de Supabase están bloqueando la inserción de datos en la tabla `usuarios_centros` durante el registro.

## ✅ Solución

### Opción 1: Script Rápido (Recomendado para Desarrollo)

Ejecuta este script en el SQL Editor de Supabase:

```sql
-- Ejecutar: supabase/fix-portal-simple.sql
```

Este script:
1. Elimina todas las políticas existentes
2. Crea una política permisiva que permite todo a usuarios autenticados
3. Aplica a `usuarios_centros` y `solicitudes_cupos`

### Opción 2: Desde Supabase Dashboard

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Abre el **SQL Editor**
3. Copia y pega el contenido de `supabase/fix-portal-simple.sql`
4. Click en **Run**
5. Verifica que aparezca "Success"

### Opción 3: Deshabilitar RLS (Solo para Testing)

⚠️ **ADVERTENCIA**: Esto permite acceso completo sin restricciones

```sql
ALTER TABLE usuarios_centros DISABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_cupos DISABLE ROW LEVEL SECURITY;
```

## 🧪 Verificar la Solución

1. Recarga la página de registro
2. Intenta registrar un centro formador
3. Deberías poder completar el registro sin errores

## 📋 Políticas Aplicadas

### usuarios_centros
- **Nombre**: "Permitir todo para autenticados"
- **Acción**: ALL (SELECT, INSERT, UPDATE, DELETE)
- **Condición**: Usuario debe estar autenticado

### solicitudes_cupos
- **Nombre**: "Permitir todo para autenticados"
- **Acción**: ALL (SELECT, INSERT, UPDATE, DELETE)
- **Condición**: Usuario debe estar autenticado

## 🔐 Para Producción

En producción, deberías usar políticas más restrictivas:

```sql
-- Solo el usuario puede ver su propio centro
CREATE POLICY "Ver propio centro" ON usuarios_centros
  FOR SELECT
  USING (user_id = auth.uid());

-- Solo el centro puede crear sus solicitudes
CREATE POLICY "Crear solicitudes propias" ON solicitudes_cupos
  FOR INSERT
  WITH CHECK (
    centro_formador_id IN (
      SELECT centro_formador_id 
      FROM usuarios_centros 
      WHERE user_id = auth.uid()
    )
  );
```

Ver `supabase/fix-portal-policies.sql` para políticas más seguras.

## 🆘 Si Aún No Funciona

1. **Verifica las políticas actuales**:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'usuarios_centros';
   ```

2. **Verifica que RLS esté habilitado**:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('usuarios_centros', 'solicitudes_cupos');
   ```

3. **Verifica permisos de la tabla**:
   ```sql
   SELECT grantee, privilege_type 
   FROM information_schema.role_table_grants 
   WHERE table_name = 'usuarios_centros';
   ```

4. **Revisa los logs de Supabase**:
   - Dashboard > Logs > Postgres Logs
   - Busca errores relacionados con RLS

## 📝 Notas

- Las políticas RLS se aplican a nivel de base de datos
- Los cambios son inmediatos, no requieren reiniciar
- Puedes tener múltiples políticas por tabla
- Las políticas se evalúan con OR (cualquiera que pase permite la acción)

---

**Archivo de solución**: `supabase/fix-portal-simple.sql`  
**Fecha**: Noviembre 2025
