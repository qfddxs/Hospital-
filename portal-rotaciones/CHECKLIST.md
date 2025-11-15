# ✅ Checklist de Instalación y Pruebas

## 📋 Pre-requisitos

- [ ] Node.js instalado (v18 o superior)
- [ ] Cuenta de Supabase activa
- [ ] Proyecto de Supabase configurado
- [ ] Credenciales de Supabase en `.env`

## 🗄️ Base de Datos

- [ ] Ejecutar `database-schema.sql` en Supabase SQL Editor
- [ ] Verificar que se crearon las 4 tablas:
  - [ ] `usuarios_portal_rotaciones`
  - [ ] `solicitudes_rotacion`
  - [ ] `estudiantes_rotacion`
  - [ ] `alumnos_hospital`
- [ ] Verificar que se crearon los índices
- [ ] Verificar que RLS está habilitado en todas las tablas

## 👤 Usuario Administrador

- [ ] Crear usuario en Supabase Authentication
- [ ] Copiar UUID del usuario
- [ ] Ejecutar INSERT en `usuarios_portal_rotaciones`
- [ ] Verificar que el registro se creó correctamente

## 📦 Instalación

- [ ] Ejecutar `npm install` en la carpeta `portal-rotaciones`
- [ ] Verificar que no hay errores de instalación
- [ ] Verificar que existe `node_modules/`
- [ ] Verificar que existe `.env` con las credenciales

## 🚀 Inicio del Servidor

- [ ] Ejecutar `npm run dev`
- [ ] Verificar que inicia en puerto 5175
- [ ] Abrir http://localhost:5175 en el navegador
- [ ] Verificar que carga la página de login

## 🔐 Prueba de Login

- [ ] Ingresar email del usuario creado
- [ ] Ingresar contraseña
- [ ] Hacer clic en "Iniciar Sesión"
- [ ] Verificar que redirige al Dashboard
- [ ] Verificar que muestra el nombre del usuario en el header

## 📊 Prueba de Dashboard

- [ ] Verificar que se muestran las estadísticas (Total, Pendientes, etc.)
- [ ] Verificar que se muestra la lista de solicitudes (puede estar vacía)
- [ ] Probar el filtro por estado
- [ ] Probar la búsqueda
- [ ] Probar el botón de modo oscuro/claro
- [ ] Probar el botón de cerrar sesión

## 📝 Crear Solicitud de Prueba

### Desde Centros Formadores (puerto 5174)

- [ ] Iniciar sesión en Centros Formadores
- [ ] Ir a "Solicitar Rotación"
- [ ] Completar el formulario:
  - [ ] Especialidad
  - [ ] Fecha inicio
  - [ ] Fecha término
  - [ ] Subir Excel con estudiantes
- [ ] Enviar solicitud
- [ ] Verificar mensaje de éxito

### Verificar en Portal Rotaciones

- [ ] Volver al Portal Rotaciones (puerto 5175)
- [ ] Refrescar la página
- [ ] Verificar que aparece la nueva solicitud
- [ ] Verificar que el estado es "Pendiente"
- [ ] Verificar que muestra el número correcto de estudiantes

## 🔍 Prueba de Detalle de Solicitud

- [ ] Hacer clic en una solicitud
- [ ] Verificar que muestra la información completa
- [ ] Verificar que muestra el centro formador
- [ ] Verificar que muestra las fechas
- [ ] Verificar que muestra la lista de estudiantes
- [ ] Verificar que el botón "Descargar Excel" funciona

## ✏️ Prueba de Edición de Estudiantes

- [ ] Hacer clic en el ícono de lápiz de un estudiante
- [ ] Editar el nombre
- [ ] Hacer clic fuera del campo
- [ ] Verificar que se guardó el cambio
- [ ] Refrescar la página
- [ ] Verificar que el cambio persiste

## 🗑️ Prueba de Eliminación de Estudiantes

- [ ] Hacer clic en el ícono de basura de un estudiante
- [ ] Confirmar la eliminación
- [ ] Verificar que desaparece de la lista
- [ ] Verificar que el contador de estudiantes se actualiza

## ✅ Prueba de Aprobación

- [ ] Hacer clic en "Aprobar Solicitud"
- [ ] Confirmar la aprobación
- [ ] Esperar el mensaje de éxito
- [ ] Verificar que redirige al Dashboard
- [ ] Verificar que la solicitud ahora está en "Aprobada"

### Verificar en Base de Datos

- [ ] Ir a Supabase > Table Editor
- [ ] Abrir tabla `alumnos_hospital`
- [ ] Verificar que se crearon los estudiantes
- [ ] Verificar que tienen:
  - [ ] `solicitud_rotacion_id` correcto
  - [ ] `centro_formador_id` correcto
  - [ ] `estado` = "en_rotacion"
  - [ ] Fechas de inicio y término
  - [ ] Todos los datos del estudiante

## ❌ Prueba de Rechazo

### Crear otra solicitud de prueba

- [ ] Crear nueva solicitud desde Centros Formadores
- [ ] Volver al Portal Rotaciones
- [ ] Abrir la nueva solicitud
- [ ] Hacer clic en "Rechazar Solicitud"
- [ ] Ingresar motivo del rechazo
- [ ] Confirmar el rechazo
- [ ] Verificar mensaje de éxito
- [ ] Verificar que redirige al Dashboard
- [ ] Verificar que la solicitud está en "Rechazada"

### Verificar en Base de Datos

- [ ] Ir a Supabase > Table Editor
- [ ] Abrir tabla `solicitudes_rotacion`
- [ ] Buscar la solicitud rechazada
- [ ] Verificar que tiene:
  - [ ] `estado` = "rechazada"
  - [ ] `motivo_rechazo` con el texto ingresado
  - [ ] `fecha_respuesta` con la fecha actual
  - [ ] `respondido_por` con el UUID del admin

## 🔄 Prueba de Estados

- [ ] Filtrar por "Pendientes" - Ver solo pendientes
- [ ] Filtrar por "Aprobadas" - Ver solo aprobadas
- [ ] Filtrar por "Rechazadas" - Ver solo rechazadas
- [ ] Filtrar por "Todas" - Ver todas

## 🔍 Prueba de Búsqueda

- [ ] Buscar por especialidad (ej: "Enfermería")
- [ ] Verificar que filtra correctamente
- [ ] Buscar por centro formador
- [ ] Verificar que filtra correctamente
- [ ] Limpiar búsqueda
- [ ] Verificar que muestra todas las solicitudes

## 🌙 Prueba de Modo Oscuro

- [ ] Hacer clic en el ícono de sol/luna
- [ ] Verificar que cambia a modo oscuro
- [ ] Verificar que todos los elementos se ven bien
- [ ] Hacer clic nuevamente
- [ ] Verificar que vuelve a modo claro
- [ ] Refrescar la página
- [ ] Verificar que mantiene la preferencia

## 📱 Prueba Responsive

- [ ] Abrir DevTools (F12)
- [ ] Cambiar a vista móvil
- [ ] Verificar que el diseño se adapta
- [ ] Probar navegación en móvil
- [ ] Probar filtros en móvil
- [ ] Probar tabla de estudiantes en móvil

## 🔐 Prueba de Seguridad

- [ ] Cerrar sesión
- [ ] Intentar acceder a `/dashboard` directamente
- [ ] Verificar que redirige a `/login`
- [ ] Intentar acceder a `/solicitud/[id]` directamente
- [ ] Verificar que redirige a `/login`

## 🚦 Prueba de Permisos

- [ ] Verificar que solo solicitudes pendientes tienen botones de edición
- [ ] Verificar que solicitudes aprobadas/rechazadas son solo lectura
- [ ] Verificar que no se pueden editar estudiantes en solicitudes aprobadas
- [ ] Verificar que no se pueden eliminar estudiantes en solicitudes aprobadas

## 📊 Verificación Final

- [ ] Todas las funcionalidades funcionan correctamente
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en la consola del servidor
- [ ] Los datos se guardan correctamente en Supabase
- [ ] Las sesiones son independientes (puedes estar logueado en los 3 portales)

## 🎯 Integración con Hospital (Siguiente Fase)

- [ ] Los alumnos aprobados están en `alumnos_hospital`
- [ ] Tienen toda la información necesaria
- [ ] Están listos para ser mostrados en el Hospital
- [ ] El Hospital puede consultar la tabla sin problemas

---

## ✅ Resultado Esperado

Si todos los checkboxes están marcados:

✅ **El Portal de Rotaciones está funcionando correctamente**

Puedes proceder a:
1. Integrar con el Hospital
2. Agregar mejoras adicionales
3. Desplegar a producción

---

## 🐛 Si algo no funciona

1. Revisa `PASOS-INSTALACION.md`
2. Revisa los logs en la consola
3. Verifica las credenciales en `.env`
4. Verifica que las tablas existen en Supabase
5. Verifica que el usuario está en `usuarios_portal_rotaciones`

---

**Fecha de verificación**: _______________

**Verificado por**: _______________

**Estado**: ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado
