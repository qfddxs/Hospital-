# 🔧 Solución al Error 400

## Problema

El portal muestra "Error al cargar solicitudes" con error 400. Esto significa que Supabase está bloqueando el acceso a las tablas.

---

## ✅ Solución Rápida (2 opciones)

### Opción 1: Deshabilitar RLS Temporalmente (Más Rápido)

**Para pruebas locales solamente**

1. Abre Supabase → **SQL Editor**
2. Ejecuta el archivo `deshabilitar-rls-temporal.sql`
3. Recarga el portal en el navegador
4. Deberías ver las solicitudes

**Ventajas**: Rápido, funciona inmediatamente
**Desventajas**: No es seguro para producción

---

### Opción 2: Configurar RLS Correctamente (Recomendado)

**Para desarrollo y producción**

1. Abre Supabase → **SQL Editor**
2. Ejecuta el archivo `setup-minimo.sql` completo
3. Crea el usuario administrador (ver pasos abajo)
4. Recarga el portal

**Ventajas**: Seguro, correcto
**Desventajas**: Requiere crear usuario admin

---

## 📋 Pasos Detallados - Opción 1 (Rápido)

### 1. Ejecutar SQL
```sql
-- Copiar y pegar en Supabase SQL Editor
ALTER TABLE solicitudes_rotacion DISABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes_rotacion DISABLE ROW LEVEL SECURITY;
ALTER TABLE centros_formadores DISABLE ROW LEVEL SECURITY;
ALTER TABLE alumnos DISABLE ROW LEVEL SECURITY;
```

### 2. Verificar
```sql
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '🔒 Habilitado' ELSE '🔓 Deshabilitado' END as rls
FROM pg_tables
WHERE tablename IN ('solicitudes_rotacion', 'estudiantes_rotacion', 'centros_formadores', 'alumnos');
```

Deberías ver "🔓 Deshabilitado" en todas.

### 3. Recargar Portal
- Abre http://localhost:5175
- Recarga con Ctrl + Shift + R
- Deberías ver las solicitudes

---

## 📋 Pasos Detallados - Opción 2 (Correcto)

### 1. Ejecutar setup-minimo.sql
1. Abre Supabase → **SQL Editor**
2. Copia TODO el contenido de `setup-minimo.sql`
3. Pégalo en el editor
4. Haz clic en **Run**
5. Espera el mensaje de éxito

### 2. Crear Usuario en Authentication
1. Ve a **Authentication** → **Users**
2. Clic en **Add user** → **Create new user**
3. Completa:
   - Email: `admin@hospital.cl`
   - Password: `Admin123!` (o la que prefieras)
   - ✅ Marca "Auto Confirm User"
4. Clic en **Create user**
5. **COPIA el UUID** del usuario (columna ID)

### 3. Registrar Usuario en la Tabla
Ejecuta en SQL Editor (reemplaza `TU_UUID_AQUI`):

```sql
INSERT INTO usuarios_portal_rotaciones (user_id, nombre, apellido, email, cargo, activo)
VALUES (
  'TU_UUID_AQUI',
  'Admin',
  'Rotaciones',
  'admin@hospital.cl',
  'Administrador de Rotaciones',
  true
);
```

### 4. Iniciar Sesión
1. Abre http://localhost:5175
2. Email: `admin@hospital.cl`
3. Password: `Admin123!` (o la que pusiste)
4. Deberías ver el dashboard con solicitudes

---

## 🔍 Diagnóstico

Si sigues teniendo problemas, ejecuta `diagnostico.sql` para ver qué falta:

```sql
-- Ver en Supabase SQL Editor
-- Ejecuta el contenido de diagnostico.sql
```

Esto te mostrará:
- ✅ Qué tablas existen
- ✅ Estado de RLS
- ✅ Políticas configuradas
- ✅ Número de registros
- ✅ Usuarios del portal

---

## ⚠️ Errores Comunes

### Error: "relation usuarios_portal_rotaciones does not exist"
→ Ejecuta `setup-minimo.sql`

### Error: "new row violates row-level security policy"
→ Opción 1: Deshabilita RLS temporalmente
→ Opción 2: Crea el usuario administrador

### Error: "No se encontraron solicitudes"
→ Crea una solicitud desde Centros Formadores (puerto 5174)

### Error: "Invalid login credentials"
→ Verifica email y contraseña
→ Verifica que el usuario existe en Authentication

---

## 🎯 Recomendación

**Para empezar rápido**: Usa Opción 1 (deshabilitar RLS)
**Para producción**: Usa Opción 2 (configurar RLS correctamente)

Una vez que funcione con Opción 1, puedes migrar a Opción 2 ejecutando `setup-minimo.sql`.

---

## ✅ Verificación

Después de aplicar la solución:

1. **Abre el portal**: http://localhost:5175
2. **Deberías ver**:
   - Dashboard sin errores
   - Estadísticas (Total, Pendientes, etc.)
   - Lista de solicitudes (si existen)
3. **En la consola del navegador** (F12):
   - No deberías ver errores 400
   - No deberías ver errores de Supabase

---

## 📞 Siguiente Paso

Una vez que veas las solicitudes:
1. Haz clic en una solicitud
2. Revisa los estudiantes
3. Prueba aprobar una solicitud
4. Verifica que los alumnos se crean en la tabla `alumnos`

---

**¿Cuál opción prefieres?**
- Opción 1: Rápido pero temporal
- Opción 2: Correcto y seguro
