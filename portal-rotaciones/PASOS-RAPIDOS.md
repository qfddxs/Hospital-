# ⚡ Pasos Rápidos para Ver tus Solicitudes

## Tu situación:
- ✅ Tienes una solicitud en la BD (Enfermería, pendiente)
- ❌ El portal no la muestra (Error 400)
- 🔒 Problema: RLS está bloqueando el acceso

---

## 🎯 Solución en 3 Pasos (2 minutos)

### Paso 1: Abrir Supabase
1. Ve a https://supabase.com
2. Abre tu proyecto
3. Ve a **SQL Editor** (menú lateral izquierdo)

### Paso 2: Ejecutar SQL
1. Haz clic en **New query**
2. Copia y pega esto:

```sql
ALTER TABLE solicitudes_rotacion DISABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes_rotacion DISABLE ROW LEVEL SECURITY;
ALTER TABLE centros_formadores DISABLE ROW LEVEL SECURITY;
ALTER TABLE alumnos DISABLE ROW LEVEL SECURITY;
```

3. Haz clic en **Run** (o presiona Ctrl+Enter)
4. Deberías ver "Success. No rows returned"

### Paso 3: Recargar Portal
1. Ve al navegador con el portal abierto (http://localhost:5175)
2. Presiona **Ctrl + Shift + R** (recarga forzada)
3. ✅ Deberías ver tu solicitud de Enfermería

---

## ✅ Verificación

Después de ejecutar el SQL, verifica:

```sql
-- Ejecuta esto en Supabase SQL Editor
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '🔒 Habilitado' ELSE '✅ Deshabilitado' END as rls
FROM pg_tables
WHERE tablename IN ('solicitudes_rotacion', 'estudiantes_rotacion', 'centros_formadores', 'alumnos');
```

Deberías ver "✅ Deshabilitado" en todas las tablas.

---

## 🎉 Resultado Esperado

En el portal deberías ver:

```
┌─────────────────────────────────────┐
│ Portal de Rotaciones                │
├─────────────────────────────────────┤
│ Total: 1  Pendientes: 1             │
├─────────────────────────────────────┤
│ 📋 Enfermería                       │
│    Estado: Pendiente                │
│    Fecha: 2025-11-14 a 2026-02-28   │
│    Estudiantes: 3                   │
└─────────────────────────────────────┘
```

---

## 🐛 Si sigue sin funcionar

1. **Abre la consola del navegador** (F12)
2. Ve a la pestaña **Console**
3. Busca mensajes que empiecen con:
   - 🔍 Intentando cargar solicitudes...
   - ✅ Solicitudes cargadas...
   - ❌ Error...

4. **Copia el error** y dime qué dice

---

## 📝 Notas

- Esto deshabilita RLS **temporalmente** para pruebas
- Es seguro en desarrollo local
- Más tarde puedes habilitar RLS correctamente con `setup-minimo.sql`

---

## 🚀 Siguiente Paso

Una vez que veas la solicitud:
1. Haz clic en ella
2. Verás los 3 estudiantes
3. Podrás aprobar la solicitud
4. Los estudiantes se crearán en la tabla `alumnos`

---

**¿Listo? Ejecuta el SQL y recarga el portal!** 🎯
