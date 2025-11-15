# 🚀 EMPIEZA AQUÍ - Portal de Rotaciones

## 👋 Bienvenido

Ya tienes la mayoría de las tablas creadas en tu base de datos. Solo necesitas hacer unos ajustes mínimos para que el Portal de Rotaciones funcione.

---

## ⚡ Instalación en 3 Pasos

### 📝 Paso 1: Ejecutar SQL (5 minutos)

1. Abre Supabase → **SQL Editor**
2. Abre el archivo `docs/database/setup-minimo.sql` de este proyecto
3. Copia TODO el contenido
4. Pégalo en el SQL Editor
5. Haz clic en **Run**
6. Espera el mensaje "Setup completado exitosamente!"

**¿Qué hace este SQL?**
- ✅ Crea tabla `usuarios_portal_rotaciones` (nueva)
- ✅ Agrega columnas a tus tablas existentes (si faltan)
- ✅ Configura seguridad (RLS)
- ❌ NO borra ningún dato tuyo

---

### 👤 Paso 2: Crear Usuario Admin (3 minutos)

#### 2.1 En Supabase Authentication
1. Ve a **Authentication** → **Users**
2. Clic en **Add user** → **Create new user**
3. Completa:
   - Email: `admin@hospital.cl`
   - Password: `[tu contraseña]`
   - ✅ Marca "Auto Confirm User"
4. Clic en **Create user**
5. **COPIA el UUID** del usuario (columna ID)

#### 2.2 En SQL Editor
1. Ve a **SQL Editor**
2. Ejecuta esto (reemplaza `TU_UUID_AQUI` con el UUID que copiaste):

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

---

### 🚀 Paso 3: Iniciar Portal (2 minutos)

Abre la terminal en la carpeta `portal-rotaciones`:

```bash
npm install
npm run dev
```

Abre en tu navegador: **http://localhost:5175**

---

## ✅ Probar que Funciona

1. **Login**
   - Email: `admin@hospital.cl`
   - Password: [la que configuraste]
   - Deberías entrar al Dashboard

2. **Ver solicitudes**
   - Si tienes solicitudes en tu BD, las verás aquí
   - Si no, crea una desde Centros Formadores (puerto 5174)

3. **Aprobar una solicitud**
   - Haz clic en una solicitud
   - Revisa los estudiantes
   - Haz clic en "Aprobar Solicitud"
   - ✅ Los estudiantes se crean en tu tabla `alumnos`

---

## 📚 Documentación

Si necesitas más detalles:

1. **INSTALACION.md** - Guía detallada paso a paso
2. **USUARIO.md** - Crear usuarios adicionales
3. **../guides/FLUJO-SISTEMA.md** - Cómo funciona el sistema
4. **../../README.md** - Documentación completa

---

## 🎯 Resumen de Puertos

- **Hospital**: http://localhost:5173
- **Centros Formadores**: http://localhost:5174
- **Portal Rotaciones**: http://localhost:5175 ← NUEVO

---

## 🐛 Problemas Comunes

### "No aparecen solicitudes"
→ Crea una solicitud desde Centros Formadores (puerto 5174)

### "Error al iniciar sesión"
→ Verifica que ejecutaste el INSERT en `usuarios_portal_rotaciones`

### "Error al aprobar solicitud"
→ Ejecuta `setup-minimo.sql` de nuevo

---

## 🎉 ¡Listo!

Una vez que funcione, tendrás:

✅ Portal de Rotaciones funcionando
✅ Gestión de solicitudes
✅ Aprobación/Rechazo de solicitudes
✅ Estudiantes aprobados en tu tabla `alumnos`
✅ Integración con tus tablas existentes
