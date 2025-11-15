# 🚀 Guía Completa: Separar Proyectos

## 📋 RESUMEN

Vamos a crear 2 proyectos independientes:
- `hospital-regional/` (ya existe, lo vamos a limpiar)
- `portal-centros/` (nuevo, lo vamos a crear)

---

## PASO 1: Crear el Proyecto Portal

### 1.1 Abrir terminal en la carpeta PADRE de `hospital-regional`

```bash
# Deberías estar en una carpeta que contenga hospital-regional/
# Ejemplo: C:\Users\TuUsuario\Proyectos\
```

### 1.2 Crear el nuevo proyecto

```bash
npm create vite@latest portal-centros -- --template react
```

Cuando pregunte, selecciona:
- Framework: `React`
- Variant: `JavaScript`

### 1.3 Entrar e instalar dependencias

```bash
cd portal-centros
npm install
npm install @supabase/supabase-js react-router-dom @heroicons/react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## PASO 2: Configurar Tailwind CSS

### 2.1 Editar `portal-centros/tailwind.config.js`

Reemplaza todo el contenido con:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 2.2 Editar `portal-centros/src/index.css`

Reemplaza todo el contenido con:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## PASO 3: Configurar Puerto y Variables

### 3.1 Editar `portal-centros/vite.config.js`

Reemplaza con:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174
  }
})
```

### 3.2 Copiar archivo .env

```bash
# Desde la carpeta padre
cp hospital-regional/.env portal-centros/.env
```

O copia manualmente el contenido de `.env` del hospital al portal.

---

## PASO 4: Avísame cuando llegues aquí

Una vez que hayas completado los pasos 1-3, avísame diciendo:

**"Listo, creé el proyecto portal y configuré todo"**

Entonces yo crearé todos los archivos necesarios del portal automáticamente.

---

## ¿Qué viene después?

Después de que yo cree los archivos:

1. ✅ Probarás ambos proyectos localmente
2. ✅ Limpiaremos el proyecto hospital (eliminar archivos del portal)
3. ✅ Subirás ambos a GitHub
4. ✅ Desplegarás en Vercel

---

## Estructura Final

```
📁 Carpeta Padre/
├── 📁 hospital-regional/
│   ├── src/
│   ├── package.json
│   └── .env
│
└── 📁 portal-centros/
    ├── src/
    ├── package.json
    └── .env
```

---

¿Listo para empezar? Ejecuta el PASO 1 y avísame cuando termines.
