# 📋 Copiar Archivos del Portal

## Archivos que necesitas copiar manualmente

Desde `hospital-regional/src/pages/portal/` hacia `portal-centros/src/pages/`:

### 1. Copiar y renombrar archivos:

```bash
# Desde la carpeta raíz donde están ambos proyectos

# Registro
cp hospital-regional/src/pages/portal/PortalRegistro.jsx portal-centros/src/pages/Registro.jsx

# Dashboard  
cp hospital-regional/src/pages/portal/PortalDashboard.jsx portal-centros/src/pages/Dashboard.jsx

# Solicitar
cp hospital-regional/src/pages/portal/PortalSolicitar.jsx portal-centros/src/pages/Solicitar.jsx

# Solicitudes
cp hospital-regional/src/pages/portal/PortalSolicitudes.jsx portal-centros/src/pages/Solicitudes.jsx
```

### 2. Editar los archivos copiados:

En CADA archivo copiado, cambia las rutas de importación:

**ANTES:**
```javascript
import { supabase } from '../../supabaseClient';
import Button from '../../components/UI/Button';
import { useNivelFormacion } from '../../context/NivelFormacionContext';
```

**DESPUÉS:**
```javascript
import { supabase } from '../supabaseClient';
import Button from '../components/UI/Button';
import { useNivelFormacion } from '../context/NivelFormacionContext';
```

### 3. Cambiar las rutas de navegación:

En TODOS los archivos, busca y reemplaza:

**ANTES:**
```javascript
navigate('/portal-formadora/dashboard')
navigate('/portal-formadora/login')
navigate('/portal-formadora/solicitar')
navigate('/portal-formadora/solicitudes')
navigate('/portal-formadora/registro')
```

**DESPUÉS:**
```javascript
navigate('/dashboard')
navigate('/login')
navigate('/solicitar')
navigate('/solicitudes')
navigate('/registro')
```

---

## Opción Rápida: Usar Find & Replace

En VS Code:
1. Abre cada archivo copiado
2. Presiona `Ctrl+H` (Windows) o `Cmd+H` (Mac)
3. Buscar: `../../`
4. Reemplazar: `../`
5. Click en "Replace All"

Luego:
1. Buscar: `/portal-formadora`
2. Reemplazar: `` (vacío)
3. Click en "Replace All"

---

¿Necesitas que te ayude con algo más?
