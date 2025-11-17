# 🔍 Diagnóstico: Documentos de Centros No Aparecen en el Hospital

## 🚨 Problema Reportado

Los documentos subidos por centros formadores **NO aparecen** en el portal del hospital:
- No aparecen como pendientes
- No aparecen como aprobados/rechazados
- La pestaña "Documentos de Centros Formadores" está vacía

---

## 🔎 Posibles Causas

### 1. ❌ Campos de Aprobación No Existen en la Tabla
**Síntoma:** Error en consola al cargar documentos

**Solución:**
```sql
-- Ejecutar en Supabase SQL Editor
-- Ver: docs/database/AGREGAR_APROBACION_DOCUMENTOS_CENTRO.sql
```

**Verificar:**
```sql
-- Ejecutar: docs/database/VERIFICAR_DOCUMENTOS_CENTRO.sql
-- Debe mostrar columnas: aprobado, aprobado_por, fecha_aprobacion, comentarios_aprobacion
```

---

### 2. 🔒 Políticas RLS Bloqueando el Acceso
**Síntoma:** No hay error, pero la lista está vacía

**Causa:** Las políticas de Row Level Security (RLS) están impidiendo que el hospital vea los documentos

**Solución:**
```sql
-- Ejecutar en Supabase SQL Editor
-- Ver: docs/database/FIX_RLS_DOCUMENTOS_CENTRO.sql
```

**Verificar:**
```sql
-- Ver políticas actuales
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'documentos_centro';
```

---

### 3. 📭 No Hay Documentos en la Tabla
**Síntoma:** La tabla está vacía

**Verificar:**
```sql
SELECT COUNT(*) as total FROM documentos_centro;
```

**Solución:** Los centros formadores deben subir documentos primero

---

### 4. 👤 Usuario del Hospital Está en usuarios_centros
**Síntoma:** El hospital ve la interfaz pero no los documentos

**Causa:** Si el usuario del hospital está registrado en `usuarios_centros`, las políticas RLS lo tratan como centro formador

**Verificar:**
```sql
-- Ver si el usuario actual está en usuarios_centros
SELECT * FROM usuarios_centros WHERE user_id = auth.uid();
```

**Solución:** El usuario del hospital NO debe estar en `usuarios_centros`

---

### 5. 🔌 Error en la Consulta del Frontend
**Síntoma:** Error en consola del navegador

**Verificar en:** `src/pages/GestionDocumental.jsx` línea ~110

**Consulta actual:**
```javascript
const { data, error } = await supabase
  .from('documentos_centro')
  .select(`
    *,
    centro_formador:centros_formadores(id, nombre, codigo)
  `)
  .order('fecha_subida', { ascending: false });
```

**Revisar:**
- ¿Hay error en la consola?
- ¿La variable `data` está vacía?
- ¿La variable `error` tiene algún mensaje?

---

## 🛠️ Pasos de Diagnóstico

### Paso 1: Verificar Estructura de la Tabla
```sql
-- Ejecutar en Supabase SQL Editor
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'documentos_centro'
ORDER BY ordinal_position;
```

**Resultado esperado:** Debe incluir las columnas:
- `aprobado` (boolean)
- `aprobado_por` (uuid)
- `fecha_aprobacion` (timestamp)
- `comentarios_aprobacion` (text)

**Si NO aparecen:** Ejecutar `docs/database/AGREGAR_APROBACION_DOCUMENTOS_CENTRO.sql`

---

### Paso 2: Verificar Documentos Existentes
```sql
-- Ver todos los documentos
SELECT 
  dc.id,
  dc.nombre_archivo,
  dc.tipo_documento,
  dc.fecha_subida,
  dc.aprobado,
  cf.nombre as centro_nombre
FROM documentos_centro dc
LEFT JOIN centros_formadores cf ON dc.centro_formador_id = cf.id
ORDER BY dc.fecha_subida DESC;
```

**Resultado esperado:** Debe mostrar documentos subidos por centros

**Si está vacío:** Los centros deben subir documentos primero

---

### Paso 3: Verificar Políticas RLS
```sql
-- Ver políticas actuales
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'documentos_centro';
```

**Resultado esperado:** Debe haber políticas para:
- Hospital puede ver todos (SELECT)
- Hospital puede actualizar (UPDATE)
- Centros pueden ver solo suyos (SELECT)
- Centros pueden insertar (INSERT)
- Centros pueden actualizar suyos (UPDATE)
- Centros pueden eliminar suyos (DELETE)

**Si faltan políticas:** Ejecutar `docs/database/FIX_RLS_DOCUMENTOS_CENTRO.sql`

---

### Paso 4: Verificar Usuario Actual
```sql
-- Ver información del usuario actual
SELECT 
  auth.uid() as user_id,
  auth.email() as email,
  EXISTS(
    SELECT 1 FROM usuarios_centros WHERE user_id = auth.uid()
  ) as es_centro_formador;
```

**Resultado esperado para hospital:** `es_centro_formador = false`

**Si es true:** El usuario del hospital NO debe estar en `usuarios_centros`

---

### Paso 5: Probar Consulta Directa
```sql
-- Como usuario del hospital, ejecutar:
SELECT * FROM documentos_centro LIMIT 10;
```

**Si devuelve datos:** El problema está en el frontend
**Si NO devuelve datos:** El problema está en RLS o permisos

---

### Paso 6: Revisar Consola del Navegador
1. Abrir DevTools (F12)
2. Ir a pestaña "Console"
3. Recargar la página de Gestión Documental
4. Buscar errores en rojo

**Errores comunes:**
- `column "aprobado" does not exist` → Ejecutar script de campos
- `permission denied` → Problema de RLS
- `relation "documentos_centro" does not exist` → Tabla no existe

---

## 🔧 Soluciones Rápidas

### Solución 1: Ejecutar Scripts SQL
```bash
# En Supabase SQL Editor, ejecutar en orden:

1. docs/database/AGREGAR_APROBACION_DOCUMENTOS_CENTRO.sql
2. docs/database/FIX_RLS_DOCUMENTOS_CENTRO.sql
3. docs/database/VERIFICAR_DOCUMENTOS_CENTRO.sql
```

---

### Solución 2: Verificar Permisos del Usuario
```sql
-- Asegurar que el usuario del hospital NO esté en usuarios_centros
DELETE FROM usuarios_centros 
WHERE user_id = 'uuid-del-usuario-hospital';
```

---

### Solución 3: Deshabilitar RLS Temporalmente (SOLO PARA PRUEBAS)
```sql
-- ⚠️ SOLO PARA DESARROLLO
ALTER TABLE documentos_centro DISABLE ROW LEVEL SECURITY;

-- Probar si ahora aparecen los documentos
-- Si aparecen, el problema es RLS

-- Volver a habilitar
ALTER TABLE documentos_centro ENABLE ROW LEVEL SECURITY;
```

---

### Solución 4: Agregar Logs en el Frontend
```javascript
// En src/pages/GestionDocumental.jsx, línea ~110
console.log('🔍 Consultando documentos_centro...');
const { data, error } = await supabase
  .from('documentos_centro')
  .select(`
    *,
    centro_formador:centros_formadores(id, nombre, codigo)
  `)
  .order('fecha_subida', { ascending: false });

console.log('📊 Datos recibidos:', data);
console.log('❌ Error:', error);
console.log('📈 Total documentos:', data?.length || 0);
```

---

## 📋 Checklist de Verificación

### Base de Datos
- [ ] Tabla `documentos_centro` existe
- [ ] Campos de aprobación existen (`aprobado`, `aprobado_por`, etc.)
- [ ] Hay documentos en la tabla
- [ ] Políticas RLS están configuradas correctamente
- [ ] Usuario del hospital NO está en `usuarios_centros`

### Frontend
- [ ] Consulta en `GestionDocumental.jsx` es correcta
- [ ] No hay errores en consola del navegador
- [ ] Pestaña "Documentos de Centros Formadores" está visible
- [ ] Filtros no están bloqueando los resultados

### Centros Formadores
- [ ] Centros han subido documentos
- [ ] Documentos se guardaron correctamente
- [ ] Centros pueden ver sus propios documentos

---

## 🎯 Prueba Completa

### 1. Como Centro Formador
```
1. Login en portal de centro formador
2. Ir a Gestión Documental > Documentos del Centro
3. Subir un documento PDF
4. Verificar que aparece en la lista
```

### 2. Como Hospital
```
1. Login en portal del hospital
2. Ir a Gestión Documental
3. Hacer clic en pestaña "Documentos de Centros Formadores"
4. Verificar que aparece el documento subido por el centro
5. Debe mostrar: nombre, centro, tipo, estado "Pendiente"
```

### 3. Aprobar Documento
```
1. Hacer clic en botón "Aprobar" ✅
2. Agregar comentarios (opcional)
3. Confirmar
4. Verificar que el estado cambia a "Aprobado"
```

### 4. Verificar en Centro
```
1. Volver al portal del centro formador
2. Ir a Gestión Documental > Documentos de Estudiantes
3. Verificar que el documento muestra estado "Aprobado" ✅
```

---

## 📞 Si Nada Funciona

### Opción 1: Revisar Logs de Supabase
1. Ir a Supabase Dashboard
2. Logs > API Logs
3. Buscar errores relacionados con `documentos_centro`

### Opción 2: Verificar Permisos de la Tabla
```sql
-- Ver permisos de la tabla
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'documentos_centro';
```

### Opción 3: Recrear la Tabla (ÚLTIMO RECURSO)
```sql
-- ⚠️ ESTO BORRARÁ TODOS LOS DATOS
DROP TABLE IF EXISTS documentos_centro CASCADE;

-- Luego ejecutar el script de creación original
```

---

## 📚 Archivos de Referencia

- `docs/database/AGREGAR_APROBACION_DOCUMENTOS_CENTRO.sql` - Agregar campos
- `docs/database/FIX_RLS_DOCUMENTOS_CENTRO.sql` - Corregir permisos
- `docs/database/VERIFICAR_DOCUMENTOS_CENTRO.sql` - Diagnóstico
- `src/pages/GestionDocumental.jsx` - Código del hospital
- `Centros-formadores-/src/pages/GestionDocumental.jsx` - Código del centro

---

## 🎓 Próximos Pasos

1. **Ejecutar scripts de verificación**
2. **Identificar la causa específica**
3. **Aplicar la solución correspondiente**
4. **Probar el flujo completo**
5. **Documentar la solución aplicada**

---

**Fecha:** Noviembre 16, 2025  
**Estado:** 🔍 Diagnóstico en Proceso
