# Separación de Proyectos: Hospital vs Portal

## 📋 Resumen

Actualmente el sistema tiene el Hospital y el Portal en el mismo proyecto, compartiendo la sesión de Supabase Auth. Para separarlos completamente, se recomienda crear dos proyectos independientes.

## 🏗️ Estructura Propuesta

```
hospital-sistema/          ← Proyecto actual (React + Vite)
  ├── src/
  ├── package.json
  └── Puerto: 5173

portal-centros/           ← Nuevo proyecto separado (React + Vite)
  ├── src/
  ├── package.json
  └── Puerto: 5174
```

## 🔄 Flujo de Usuarios

### HOSPITAL (Sistema Interno - Privado)
- URL Desarrollo: `http://localhost:5173`
- URL Producción: `https://hospital.tudominio.cl`

**Flujo:**
1. Personal del hospital accede a `/login`
2. Ingresa credenciales
3. Sistema verifica que NO sea centro formador
4. Redirige a `/dashboard`
5. Ve solicitudes de cupos de los centros formadores
6. Aprueba o rechaza solicitudes
7. Gestiona alumnos, asistencias, etc.

### PORTAL (Sistema Público)
- URL Desarrollo: `http://localhost:5174`
- URL Producción: `https://portal.tudominio.cl`

**Flujo:**
1. Coordinador accede a `/` (login del portal)
2. Si no tiene cuenta → `/registro`
   - Crea su centro formador
   - Especifica nivel (pregrado/postgrado)
   - Selecciona especialidades
   - Crea credenciales
3. Hace login
4. Redirige a `/dashboard`
5. Crea solicitudes de cupos
6. Ve estado de sus solicitudes

## 📊 Arquitectura

```
┌─────────────────────┐
│   SUPABASE DB       │
│  (Compartida)       │
├─────────────────────┤
│ • centros_formadores│
│ • solicitudes_cupos │
│ • usuarios_centros  │
│ • alumnos           │
│ • asistencias       │
└─────────────────────┘
         ↑     ↑
         │     │
    ┌────┘     └────┐
    │               │
┌───┴────┐    ┌────┴───┐
│HOSPITAL│    │ PORTAL │
│:5173   │    │ :5174  │
└────────┘    └────────┘
```

## ✅ Ventajas

1. **Sesiones independientes:** Cerrar sesión en uno no afecta al otro
2. **URLs diferentes:** Fácil de compartir con coordinadores
3. **Código más limpio:** Sin mezclar lógicas
4. **Despliegue independiente:** Actualizar uno sin afectar al otro
5. **Escalable:** Cada uno puede crecer independientemente

## 🚀 Implementación

### 1. Crear nuevo proyecto
```bash
npm create vite@latest portal-centros -- --template react
cd portal-centros
npm install
npm install @supabase/supabase-js react-router-dom @heroicons/react
```

### 2. Configurar puerto diferente
```js
// portal-centros/vite.config.js
export default {
  server: {
    port: 5174
  }
}
```

### 3. Mover archivos del portal
- `src/pages/portal/*` → `portal-centros/src/pages/`
- Simplificar rutas (quitar prefijo `/portal-formadora`)

### 4. Limpiar proyecto del hospital
- Eliminar carpeta `src/pages/portal/`
- Eliminar rutas del portal en router

## 📝 Ejemplo Práctico

**Coordinador INACAP:**
1. Accede a `http://localhost:5174`
2. Registra INACAP con especialidades
3. Crea solicitud de 5 cupos de Enfermería
4. Ve solicitud en estado "Pendiente"

**Personal Hospital:**
1. Accede a `http://localhost:5173`
2. Ve solicitud de INACAP
3. Aprueba la solicitud
4. INACAP ve su solicitud "Aprobada"

## 🔐 Seguridad

- **Hospital:** Solo personal autorizado
- **Portal:** Público para universidades
- **Base de datos:** RLS policies protegen datos
- **Sesiones:** Completamente independientes

## 📅 Próximos Pasos

1. Crear proyecto `portal-centros`
2. Mover archivos del portal
3. Configurar rutas simplificadas
4. Limpiar proyecto del hospital
5. Probar ambos sistemas en paralelo
6. Desplegar en subdominios diferentes

---

**Nota:** Esta separación se recomienda para producción. En desarrollo actual, ambos sistemas conviven en el mismo proyecto con sesión compartida.
