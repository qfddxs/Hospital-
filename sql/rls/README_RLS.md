# Configuración de Row Level Security (RLS)

## 📁 Estructura de Archivos

```
sql/rls/
├── 00_ejecutar_todo.sql          # Script maestro (ejecuta todos en orden)
├── rls_usuarios_centros.sql      # Políticas para usuarios_centros
├── rls_centros_formadores.sql    # Políticas para centros_formadores
├── rls_solicitudes_rotacion.sql  # Políticas para solicitudes_rotacion
├── rls_estudiantes_rotacion.sql  # Políticas para estudiantes_rotacion
├── rls_documentos_requeridos.sql # Políticas para documentos_requeridos
├── rls_vistas.sql                # Políticas para vistas
├── INSTRUCCIONES_RLS.md          # Guía paso a paso
└── README_RLS.md                 # Este archivo
```

---

## ✅ Tabla: usuarios_centros

### Estado: Listo para aplicar

### Archivos creados:
- `rls_usuarios_centros.sql` - Script SQL con las políticas
- `sql/INSTRUCCIONES_RLS.md` - Guía paso a paso para aplicar

### Políticas implementadas:

1. **SELECT**: Los usuarios solo pueden ver sus propios datos
   - Condición: `auth.uid() = user_id`

2. **INSERT**: Los usuarios pueden crear su propio registro
   - Condición: `auth.uid() = user_id`

3. **UPDATE**: Los usuarios solo pueden actualizar sus propios datos
   - Condición: `auth.uid() = user_id`

4. **DELETE**: Los usuarios solo pueden eliminar sus propios datos
   - Condición: `auth.uid() = user_id`

### Validación en el código:

El Login de Centro Formador (`Centros-formadores-/src/pages/Login.jsx`) ya incluye:
- Verificación de que el usuario existe en `usuarios_centros`
- Verificación de que el usuario está activo
- Mensaje de error personalizado: "Usuario no autorizado para acceder al portal de centros formadores"
- Cierre de sesión automático si no tiene permisos

### Cómo aplicar:

1. Abre Supabase Dashboard
2. Ve a SQL Editor
3. Copia y pega el contenido de `rls_usuarios_centros.sql`
4. Ejecuta el script
5. Verifica que las políticas estén activas

### Resultado esperado:

✅ Solo usuarios de centros formadores pueden acceder a sus datos
✅ Otros usuarios verán "datos incorrectos" o "no autorizado"
✅ Seguridad a nivel de base de datos
✅ Aislamiento completo entre centros formadores

---

## ✅ Tabla: centros_formadores

### Estado: Listo para aplicar

### Archivos creados:
- `sql/rls_centros_formadores.sql` - Script SQL con las políticas

### Políticas implementadas:

1. **SELECT**: 
   - Centros formadores: Solo ven sus propios datos
   - Hospital: Ve todos los centros
   - Portal rotaciones: Ve todos los centros (lectura)

2. **INSERT**: Solo el hospital puede crear centros

3. **UPDATE**: 
   - Centros formadores: Solo actualizan sus datos
   - Hospital: Actualiza todos

4. **DELETE**: Solo el hospital puede eliminar centros

### Lógica de permisos:

```
Centro Formador:
  ✅ Ver sus datos
  ✅ Editar sus datos
  ❌ Ver otros centros
  ❌ Crear centros
  ❌ Eliminar centros

Hospital:
  ✅ Ver todos los centros
  ✅ Crear centros
  ✅ Editar todos los centros
  ✅ Eliminar centros

Portal Rotaciones:
  ✅ Ver todos los centros
  ❌ Editar centros
  ❌ Crear centros
  ❌ Eliminar centros
```

---

## ✅ Tabla: solicitudes_rotacion

### Estado: Listo para aplicar

### Archivos creados:
- `sql/rls_solicitudes_rotacion.sql` - Script SQL con las políticas

### Políticas implementadas:

1. **SELECT**: 
   - Centros formadores: Solo ven sus solicitudes
   - Hospital: Ve todas las solicitudes
   - Portal rotaciones: Ve todas las solicitudes

2. **INSERT**: 
   - Centros formadores: Solo crean solicitudes para su centro
   - Hospital: Crea solicitudes para cualquier centro

3. **UPDATE**: 
   - Centros formadores: Solo actualizan sus solicitudes
   - Hospital: Actualiza todas (aprobar/rechazar)

4. **DELETE**: 
   - Centros formadores: Solo eliminan sus solicitudes pendientes
   - Hospital: Elimina cualquier solicitud

### Lógica de permisos:

```
Centro Formador:
  ✅ Ver sus solicitudes
  ✅ Crear solicitudes para su centro
  ✅ Editar sus solicitudes
  ✅ Eliminar sus solicitudes pendientes
  ❌ Ver solicitudes de otros centros
  ❌ Eliminar solicitudes aprobadas/rechazadas

Hospital:
  ✅ Ver todas las solicitudes
  ✅ Crear solicitudes
  ✅ Editar todas las solicitudes
  ✅ Aprobar/Rechazar solicitudes
  ✅ Eliminar cualquier solicitud

Portal Rotaciones:
  ✅ Ver todas las solicitudes
  ❌ Editar solicitudes
  ❌ Crear solicitudes
  ❌ Eliminar solicitudes
```

---

## ✅ Tabla: estudiantes_rotacion

### Estado: Listo para aplicar

### Archivos creados:
- `sql/rls_estudiantes_rotacion.sql` - Script SQL con las políticas

### Políticas implementadas:

1. **SELECT**: 
   - Centros formadores: Solo ven estudiantes de sus solicitudes
   - Hospital: Ve todos los estudiantes
   - Portal rotaciones: Ve todos los estudiantes

2. **INSERT**: 
   - Centros formadores: Solo agregan estudiantes a sus solicitudes
   - Hospital: Agrega estudiantes a cualquier solicitud

3. **UPDATE**: 
   - Centros formadores: Solo actualizan sus estudiantes
   - Hospital: Actualiza todos los estudiantes

4. **DELETE**: 
   - Centros formadores: Solo eliminan estudiantes de solicitudes pendientes
   - Hospital: Elimina cualquier estudiante

### Lógica de permisos:

```
Centro Formador:
  ✅ Ver estudiantes de sus solicitudes
  ✅ Agregar estudiantes a sus solicitudes
  ✅ Editar sus estudiantes
  ✅ Eliminar estudiantes de solicitudes pendientes
  ❌ Ver estudiantes de otros centros
  ❌ Eliminar estudiantes de solicitudes aprobadas

Hospital:
  ✅ Ver todos los estudiantes
  ✅ Agregar estudiantes a cualquier solicitud
  ✅ Editar todos los estudiantes
  ✅ Eliminar cualquier estudiante

Portal Rotaciones:
  ✅ Ver todos los estudiantes
  ❌ Editar/Crear/Eliminar estudiantes
```

---

## ✅ Tabla: documentos_requeridos

### Estado: Listo para aplicar

### Archivos creados:
- `sql/rls_documentos_requeridos.sql` - Script SQL con las políticas

### Políticas implementadas:

1. **SELECT**: Lectura pública (todos los usuarios autenticados)
2. **INSERT**: Solo el hospital
3. **UPDATE**: Solo el hospital
4. **DELETE**: Solo el hospital

### Lógica de permisos:

```
Todos los usuarios:
  ✅ Ver documentos requeridos

Hospital:
  ✅ Ver documentos requeridos
  ✅ Crear documentos requeridos
  ✅ Editar documentos requeridos
  ✅ Eliminar documentos requeridos

Centro Formador:
  ✅ Ver documentos requeridos
  ❌ Crear/Editar/Eliminar
```

---

## ✅ Vistas (4 vistas)

### Estado: Listo para aplicar

### Archivos creados:
- `sql/rls_vistas.sql` - Script SQL con políticas para todas las vistas

### Vistas configuradas:

1. **vista_documentos_centros_pendientes**: Centros ven solo sus pendientes
2. **vista_documentos_completa**: Centros ven solo sus documentos
3. **vista_estadisticas_documentos_centros**: Centros ven solo sus estadísticas
4. **vista_expedientes_alumnos**: Centros ven solo sus alumnos

---

## 📋 Tablas completadas:

### ✅ Configuradas:
- [x] `usuarios_centros` - ✅ Completado
- [x] `centros_formadores` - ✅ Completado
- [x] `solicitudes_rotacion` - ✅ Completado
- [x] `documentos_requeridos` - ✅ Completado
- [x] `vista_documentos_centros_pendientes` - ✅ Completado
- [x] `vista_documentos_completa` - ✅ Completado
- [x] `vista_estadisticas_documentos_centros` - ✅ Completado
- [x] `vista_expedientes_alumnos` - ✅ Completado

### ⚠️ Nota sobre estudiantes_rotacion:
- No se configuró RLS porque es una tabla temporal que se elimina al aprobar solicitudes
- Los datos se mueven a la tabla `alumnos` permanente

### Prioridad Media:
- [ ] `solicitudes_cupos` - Solo el centro puede ver sus solicitudes
- [ ] `documentos_requeridos` - Lectura pública, escritura restringida

### Prioridad Baja:
- [ ] `servicios_clinicos` - Lectura pública
- [ ] `documentos_categorias` - Lectura pública

---

## 🔒 Principios de Seguridad

1. **Principio de mínimo privilegio**: Los usuarios solo acceden a lo que necesitan
2. **Aislamiento de datos**: Cada centro solo ve sus propios datos
3. **Validación en múltiples capas**: RLS + validación en código
4. **Mensajes de error claros**: Sin exponer información sensible

---

## 🧪 Testing

Para probar que funciona:

1. Crea un usuario de centro formador
2. Intenta acceder con ese usuario
3. Verifica que solo vea sus datos
4. Intenta acceder con un usuario del hospital
5. Verifica que vea el mensaje de error

---

## 📝 Notas

- Las políticas RLS se aplican automáticamente a todas las consultas
- Supabase las ejecuta a nivel de PostgreSQL
- No se pueden bypassear desde el cliente
- Son la forma más segura de proteger datos en Supabase
