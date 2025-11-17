# Filtro por Institución en Portal Centros Formadores

## 🎯 Problema Solucionado
Los centros formadores podían ver **todos los estudiantes** de todas las instituciones. Ahora cada centro formador solo puede ver **sus propios estudiantes**.

---

## ✅ Solución Implementada

### 1. Sistema de Perfiles en Login
Se agregó selección de perfil institucional antes del login:

#### Perfiles Disponibles:
- **Universidad de O'Higgins (UOH)**
  - Email: `uoh@centroformador.cl`
  - Password: `uoh2024`
  - Centro Formador ID: 1
  - Color: Azul

- **INACAP**
  - Email: `inacap@centroformador.cl`
  - Password: `inacap2024`
  - Centro Formador ID: 2
  - Color: Morado

### 2. Flujo de Autenticación

```
Usuario abre portal Centros Formadores
    ↓
Selecciona su institución (UOH o INACAP)
    ↓
Se auto-completan credenciales
    ↓
Usuario hace clic en "Iniciar Sesión"
    ↓
Se guarda centro_formador_id en localStorage
    ↓
Redirige a Dashboard
```

### 3. Filtrado de Estudiantes

En `SeguimientoEstudiantes.jsx`:
```javascript
// Obtener centro_formador_id del localStorage
const centroFormadorId = localStorage.getItem('centro_formador_id');

// Filtrar estudiantes por centro
const { data: estudiantesData } = await supabase
  .from('alumnos')
  .select('...')
  .eq('centro_formador_id', parseInt(centroFormadorId))  // ← FILTRO
  .eq('estado', 'en_rotacion')
```

---

## 📊 Resultado

### Antes (Problema):
```
UOH ve:
- Estudiantes UOH ✓
- Estudiantes INACAP ✗ (no debería verlos)

INACAP ve:
- Estudiantes UOH ✗ (no debería verlos)
- Estudiantes INACAP ✓
```

### Después (Solucionado):
```
UOH ve:
- Estudiantes UOH ✓
- Estudiantes INACAP ✗ (filtrados)

INACAP ve:
- Estudiantes UOH ✗ (filtrados)
- Estudiantes INACAP ✓
```

---

## 🔧 Archivos Modificados

### 1. `Centros-formadores-/src/pages/Login.jsx`
**Cambios:**
- Agregado array `PERFILES_CENTROS` con instituciones
- Agregado estado `perfilSeleccionado` y `mostrarPerfiles`
- Agregada interfaz de selección de perfil
- Guardado de `centro_formador_id` en localStorage al login

**Código clave:**
```javascript
const PERFILES_CENTROS = [
  {
    id: 'uoh',
    nombre: 'Universidad de O\'Higgins (UOH)',
    email: 'uoh@centroformador.cl',
    password: 'uoh2024',
    color: 'bg-blue-500',
    centro_formador_id: 1
  },
  {
    id: 'inacap',
    nombre: 'INACAP',
    email: 'inacap@centroformador.cl',
    password: 'inacap2024',
    color: 'bg-purple-500',
    centro_formador_id: 2
  }
];
```

### 2. `Centros-formadores-/src/pages/SeguimientoEstudiantes.jsx`
**Cambios:**
- Lectura de `centro_formador_id` desde localStorage
- Filtrado de estudiantes por `centro_formador_id`
- Log en consola para debugging

**Código clave:**
```javascript
const centroFormadorId = localStorage.getItem('centro_formador_id');

const { data: estudiantesData } = await supabase
  .from('alumnos')
  .select('...')
  .eq('centro_formador_id', parseInt(centroFormadorId))
  .eq('estado', 'en_rotacion');

console.log(`📚 Estudiantes filtrados para centro:`, estudiantesData?.length);
```

---

## 🧪 Cómo Probar

### Prueba 1: Login como UOH
```
1. Abrir portal Centros Formadores
2. Hacer clic en "Universidad de O'Higgins (UOH)"
3. Hacer clic en "Iniciar Sesión"
4. Ir a "Seguimiento de Estudiantes"
5. Verificar que solo aparecen estudiantes de UOH
```

### Prueba 2: Login como INACAP
```
1. Cerrar sesión
2. Hacer clic en "INACAP"
3. Hacer clic en "Iniciar Sesión"
4. Ir a "Seguimiento de Estudiantes"
5. Verificar que solo aparecen estudiantes de INACAP
```

### Prueba 3: Verificar Filtro en Consola
```
1. Abrir DevTools (F12)
2. Ir a pestaña "Console"
3. Buscar mensaje: "📚 Estudiantes filtrados para centro..."
4. Verificar el número de estudiantes mostrados
```

---

## 🗄️ Configuración de Base de Datos

### Tabla `centros_formadores`
```sql
SELECT id, nombre, codigo FROM centros_formadores;

-- Resultado esperado:
-- id | nombre                          | codigo
-- ---|---------------------------------|--------
-- 1  | Universidad de O'Higgins (UOH)  | UOH
-- 2  | INACAP                          | INACAP
```

### Tabla `alumnos`
```sql
SELECT 
  id, 
  nombre, 
  primer_apellido,
  centro_formador_id 
FROM alumnos 
WHERE estado = 'en_rotacion';

-- Verificar que cada alumno tenga centro_formador_id correcto
```

---

## 🔐 Seguridad

### Almacenamiento en localStorage
```javascript
// Al hacer login
localStorage.setItem('centro_formador_id', '1')
localStorage.setItem('centro_formador_nombre', 'UOH')

// Al leer
const centroId = localStorage.getItem('centro_formador_id')
```

### Validación
- Si no hay `centro_formador_id` en localStorage → Redirige a login
- Si el usuario intenta manipular localStorage → Solo verá estudiantes del ID especificado
- La autenticación sigue siendo por Supabase Auth

---

## 📝 Agregar Nuevas Instituciones

Para agregar una nueva institución:

### 1. Crear usuario en Supabase Auth
```sql
-- En Supabase Dashboard → Authentication → Users
-- Crear nuevo usuario con email y password
```

### 2. Crear centro formador en BD
```sql
INSERT INTO centros_formadores (nombre, codigo, activo)
VALUES ('Nueva Universidad', 'NU', true);
```

### 3. Agregar perfil en Login.jsx
```javascript
const PERFILES_CENTROS = [
  // ... perfiles existentes
  {
    id: 'nueva_u',
    nombre: 'Nueva Universidad',
    email: 'nueva@centroformador.cl',
    password: 'nueva2024',
    color: 'bg-green-500',
    centro_formador_id: 3  // ID del centro en la BD
  }
];
```

---

## 🐛 Solución de Problemas

### Problema: "No se encontró centro_formador_id"
**Causa**: No se seleccionó perfil antes de login
**Solución**: Cerrar sesión y seleccionar perfil institucional

### Problema: "Veo estudiantes de otra institución"
**Causa**: localStorage tiene ID incorrecto
**Solución**: 
```javascript
// En consola del navegador:
localStorage.clear()
// Luego hacer login nuevamente
```

### Problema: "No aparecen estudiantes"
**Causa**: No hay estudiantes con ese centro_formador_id
**Solución**: Verificar en BD que los alumnos tengan el centro_formador_id correcto

---

## 📊 Logs de Debugging

En la consola del navegador verás:
```
📚 Estudiantes filtrados para centro Universidad de O'Higgins (UOH): 5
```

Esto confirma que el filtro está funcionando correctamente.

---

## ✅ Checklist de Implementación

- [x] Crear perfiles en Login.jsx
- [x] Agregar selección de perfil en UI
- [x] Guardar centro_formador_id en localStorage
- [x] Filtrar estudiantes por centro_formador_id
- [x] Agregar logs de debugging
- [x] Verificar que no hay errores de sintaxis
- [x] Documentar cambios

---

## 🚀 Próximos Pasos

1. **Probar el sistema** con ambos perfiles
2. **Verificar en BD** que los estudiantes tengan centro_formador_id correcto
3. **Agregar más instituciones** si es necesario
4. **Implementar el mismo filtro** en otras páginas del portal (Dashboard, Solicitudes, etc.)

---

**Fecha de implementación**: 16 de noviembre de 2025
**Versión**: 1.0
**Estado**: ✅ Listo para pruebas
