# 📋 Instrucciones para Crear el Proyecto Portal

## PASO 1: Crear el proyecto base

Ejecuta estos comandos en tu terminal (en la carpeta padre de `hospital-regional`):

```bash
npm create vite@latest portal-centros -- --template react
cd portal-centros
npm install
npm install @supabase/supabase-js react-router-dom @heroicons/react tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## PASO 2: Configurar Tailwind CSS

Edita `portal-centros/tailwind.config.js`:

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

Edita `portal-centros/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## PASO 3: Configurar puerto diferente

Edita `portal-centros/vite.config.js`:

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

## PASO 4: Copiar archivo .env

```bash
# Desde la carpeta padre
cp hospital-regional/.env portal-centros/.env
```

## PASO 5: Avísame cuando termines

Una vez que hayas ejecutado estos pasos, avísame y yo crearé todos los archivos necesarios del portal.

---

**Nota:** NO ejecutes `npm run dev` todavía, primero necesito crear los archivos.
