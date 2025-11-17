# ✅ Filtro por Institución Implementado

## 🎯 Problema Resuelto
**Antes**: Todos los centros formadores veían todos los estudiantes (UOH veía estudiantes de INACAP y viceversa)

**Ahora**: Cada centro formador solo ve sus propios estudiantes

---

## 🚀 Cambios Implementados

### 1. Uso de Tabla `usuarios_centros`
La tabla `usuarios_centros` vincula usuarios de Supabase Auth con centros formadores:
- `user_id` → ID del usuario en auth.users
- `centro_formador_id` → ID del centro formador (UOH, INACAP, etc.)
- `rol` → Rol del usuario (centro_formador, admin, etc.)
- `activo` → Si el usuario está activo

### 2. Filtrado Automático
- Al hacer login, se verifica que el usuario esté en `usuarios_centros`
- Se obtiene el `centro_formador_id` desde esta tabla
- Todas las consultas de estudiantes se filtran por este ID
- Cada institución solo ve sus propios estudiantes

---

## 📋 Pasos para Usar

### Para cualquier Centro Formador:
1. Abrir portal Centros Formadores
2. Ingresar **email y contraseña** del centro formador
3. Hacer clic en **"Iniciar Sesión"**
4. El sistema automáticamente:
   - Verifica que el usuario esté en `usuarios_centros`
   - Obtiene el `centro_formador_id` asociado
   - Filtra los estudiantes por ese centro
5. Ir a **"Seguimiento de Estudiantes"**
6. ✅ Solo verás estudiantes de tu institución

---

## 🗄️ Configuración de Base de Datos

### Paso 1: Verificar Centros Formadores
```sql
-- Ver centros formadores existentes
SELECT id, nombre, codigo FROM centros_formadores;

-- Resultado esperado:
-- 1 | Universidad de O'Higgins (UOH) | UOH
-- 2 | INACAP                          | INACAP
```

### Paso 2: Crear Usuarios en Supabase Auth
```bash
1. Ir a Supabase → Authentication → Users
2. Hacer clic en "Add User"
3. Crear un usuario por cada centro formador
4. Confirmar email automáticamente: ✓
```

### Paso 3: Vincular Usuarios con Centros en `usuarios_centros`
```sql
-- Insertar relación usuario-centro
INSERT INTO usuarios_centros (user_id, centro_formador_id, rol, activo)
VALUES 
  ('uuid-del-usuario-uoh', 1, 'centro_formador', true),
  ('uuid-del-usuario-inacap', 2, 'centro_formador', true);

-- Verificar
SELECT 
  uc.user_id,
  au.email,
  cf.nombre as centro_formador,
  uc.rol,
  uc.activo
FROM usuarios_centros uc
JOIN auth.users au ON uc.user_id = au.id
JOIN centros_formadores cf ON uc.centro_formador_id = cf.id
WHERE uc.activo = true;
```

### Paso 4: Asignar Estudiantes a Centros
```sql
-- Ver estudiantes sin centro asignado
SELECT id, nombre, primer_apellido 
FROM alumnos 
WHERE centro_formador_id IS NULL;

-- Asignar a UOH (ejemplo)
UPDATE alumnos
SET centro_formador_id = 1
WHERE id IN ('uuid-estudiante-1', 'uuid-estudiante-2');

-- Asignar a INACAP (ejemplo)
UPDATE alumnos
SET centro_formador_id = 2
WHERE id IN ('uuid-estudiante-3', 'uuid-estudiante-4');
```

---

## 🧪 Verificación

### En la Consola del Navegador (F12):
```
📚 Estudiantes filtrados para centro Universidad de O'Higgins (UOH): 5
```

### En la Base de Datos:
```sql
-- Verificar distribución de estudiantes
SELECT 
  cf.nombre,
  COUNT(a.id) as total_estudiantes
FROM centros_formadores cf
LEFT JOIN alumnos a ON cf.id = a.centro_formador_id
WHERE a.estado = 'en_rotacion'
GROUP BY cf.nombre;

-- Resultado esperado:
-- Universidad de O'Higgins (UOH) | 5
-- INACAP                          | 3
```

---

## 📁 Archivos Modificados

1. **Centros-formadores-/src/pages/Login.jsx**
   - Agregado sistema de perfiles
   - Guardado de centro_formador_id en localStorage

2. **Centros-formadores-/src/pages/SeguimientoEstudiantes.jsx**
   - Lectura de centro_formador_id desde localStorage
   - Filtrado de estudiantes por centro

3. **Centros-formadores-/docs/FILTRO_POR_INSTITUCION.md**
   - Documentación técnica completa

4. **Centros-formadores-/docs/database/VERIFICAR_CENTROS_FORMADORES.sql**
   - Script para configurar base de datos

---

## ⚠️ Importante

### Credenciales por Defecto:
- **UOH**: `uoh@centroformador.cl` / `uoh2024`
- **INACAP**: `inacap@centroformador.cl` / `inacap2024`

### IDs de Centros Formadores:
- **UOH**: `centro_formador_id = 1`
- **INACAP**: `centro_formador_id = 2`

### Verificar en BD:
```sql
-- Todos los estudiantes deben tener centro_formador_id
SELECT COUNT(*) FROM alumnos 
WHERE estado = 'en_rotacion' 
AND centro_formador_id IS NULL;

-- Debe retornar 0
```

---

## 🔄 Agregar Nueva Institución

Para agregar una tercera institución (ej: Universidad de Chile):

### 1. Crear usuario en Supabase Auth
```
Email: uchile@centroformador.cl
Password: uchile2024
```

### 2. Crear centro en BD
```sql
INSERT INTO centros_formadores (id, nombre, codigo, activo)
VALUES (3, 'Universidad de Chile', 'UCHILE', true);
```

### 3. Agregar perfil en Login.jsx
```javascript
{
  id: 'uchile',
  nombre: 'Universidad de Chile',
  email: 'uchile@centroformador.cl',
  password: 'uchile2024',
  color: 'bg-red-500',
  centro_formador_id: 3
}
```

---

## ✅ Checklist Final

Antes de usar el sistema, verificar:

- [ ] Script SQL ejecutado en Supabase
- [ ] 2 centros formadores creados (UOH e INACAP)
- [ ] 2 usuarios creados en Supabase Auth
- [ ] Estudiantes tienen centro_formador_id asignado
- [ ] Login muestra 2 opciones de perfil
- [ ] UOH solo ve estudiantes de UOH
- [ ] INACAP solo ve estudiantes de INACAP
- [ ] Consola muestra log de filtrado

---

## 🐛 Solución de Problemas

### "No aparecen estudiantes"
```javascript
// Verificar en consola del navegador:
localStorage.getItem('centro_formador_id')  // Debe mostrar 1 o 2

// Si es null:
localStorage.clear()
// Hacer login nuevamente
```

### "Veo estudiantes de otra institución"
```sql
-- Verificar en BD que los estudiantes tengan el centro correcto:
SELECT nombre, primer_apellido, centro_formador_id 
FROM alumnos 
WHERE estado = 'en_rotacion';
```

---

**Estado**: ✅ Implementado y listo para usar
**Fecha**: 16 de noviembre de 2025
**Próximo paso**: Ejecutar script SQL y crear usuarios en Supabase Auth
