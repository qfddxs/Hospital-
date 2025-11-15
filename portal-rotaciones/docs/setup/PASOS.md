# 📝 Pasos para Poner en Marcha el Portal de Rotaciones

## ✅ Paso 1: Ejecutar el SQL en Supabase

1. Abre tu proyecto en Supabase (https://supabase.com)
2. Ve a **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega TODO el contenido del archivo `database-schema.sql`
5. Haz clic en **Run** para ejecutar el SQL
6. Verifica que se crearon las tablas sin errores

## ✅ Paso 2: Crear Usuario Administrador

### 2.1 Crear usuario en Authentication
1. En Supabase, ve a **Authentication** > **Users**
2. Haz clic en **Add user** > **Create new user**
3. Ingresa:
   - Email: `admin@hospital.cl` (o el que prefieras)
   - Password: Una contraseña segura
   - ✅ Marca "Auto Confirm User"
4. Haz clic en **Create user**
5. **IMPORTANTE**: Copia el UUID del usuario (aparece en la columna ID)

### 2.2 Registrar en la tabla
1. Ve a **SQL Editor**
2. Ejecuta este SQL (reemplaza `TU_USER_UUID_AQUI` con el UUID que copiaste):

```sql
INSERT INTO usuarios_portal_rotaciones (user_id, nombre, apellido, email, cargo, activo)
VALUES (
  'TU_USER_UUID_AQUI',
  'Admin',
  'Rotaciones',
  'admin@hospital.cl',
  'Administrador de Rotaciones',
  true
);
```

## ✅ Paso 3: Instalar Dependencias

Abre la terminal en la carpeta `portal-rotaciones` y ejecuta:

```bash
npm install
```

## ✅ Paso 4: Iniciar el Servidor

```bash
npm run dev
```

El portal estará disponible en: **http://localhost:5175**

## ✅ Paso 5: Probar el Login

1. Abre http://localhost:5175 en tu navegador
2. Ingresa las credenciales que creaste:
   - Email: `admin@hospital.cl`
   - Password: La que configuraste
3. Deberías ver el Dashboard con las solicitudes

## 🧪 Paso 6: Probar el Flujo Completo

### Crear una solicitud de prueba (desde Centros Formadores)
1. Abre el portal de Centros Formadores (puerto 5174)
2. Inicia sesión con un centro formador
3. Crea una nueva solicitud de rotación con estudiantes

### Gestionar la solicitud (desde Portal Rotaciones)
1. Vuelve al Portal de Rotaciones (puerto 5175)
2. Deberías ver la nueva solicitud en estado "Pendiente"
3. Haz clic en la solicitud para ver los detalles
4. Prueba editar un estudiante (haz clic en el ícono de lápiz)
5. Prueba eliminar un estudiante (haz clic en el ícono de basura)
6. Haz clic en "Aprobar Solicitud"

### Verificar en el Hospital
1. Ve a Supabase > **Table Editor** > `alumnos_hospital`
2. Deberías ver los estudiantes aprobados con:
   - Estado: "en_rotacion"
   - Referencia al centro formador
   - Fechas de inicio y término

## 🎯 Resumen de Puertos

- **Hospital**: http://localhost:5173
- **Centros Formadores**: http://localhost:5174
- **Portal Rotaciones**: http://localhost:5175

## ❓ Solución de Problemas

### Error: "No se puede conectar a Supabase"
- Verifica que el archivo `.env` tenga las credenciales correctas
- Verifica que las credenciales sean las mismas que en los otros proyectos

### Error: "Usuario no autorizado"
- Verifica que ejecutaste el INSERT en `usuarios_portal_rotaciones`
- Verifica que el `user_id` coincida con el UUID del usuario en Authentication

### Error: "Tabla no existe"
- Verifica que ejecutaste todo el SQL de `database-schema.sql`
- Revisa en Supabase > **Table Editor** que existan las tablas

### No aparecen solicitudes
- Verifica que existan solicitudes en la tabla `solicitudes_rotacion`
- Crea una solicitud de prueba desde el portal de Centros Formadores

## 📞 Siguiente Paso

Una vez que funcione el Portal de Rotaciones, el siguiente paso es:

**Integrar la vista de alumnos en el Hospital** para que puedan ver y gestionar los estudiantes aprobados desde la tabla `alumnos_hospital`.

¿Quieres que te ayude con eso ahora?
