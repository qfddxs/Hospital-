# 🚀 Guía para Separar los Proyectos

## Paso 1: Crear el nuevo proyecto Portal

Abre una terminal en la **carpeta padre** (donde está `hospital-regional/`) y ejecuta:

```bash
# Crear nuevo proyecto React con Vite
npm create vite@latest portal-centros -- --template react

# Entrar al proyecto
cd portal-centros

# Instalar dependencias
npm install

# Instalar dependencias adicionales
npm install @supabase/supabase-js react-router-dom @heroicons/react tailwindcss postcss autoprefixer

# Inicializar Tailwind
npx tailwindcss init -p
```

## Paso 2: Esperar a que Kiro cree los archivos

Kiro va a crear todos los archivos necesarios del portal en el nuevo proyecto.

## Paso 3: Configurar puerto diferente

Edita `portal-centros/vite.config.js` y agrega:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174  // ← Puerto diferente
  }
})
```

## Paso 4: Copiar archivo .env

Copia el archivo `.env` del proyecto hospital al portal:

```bash
# Desde la carpeta padre
cp hospital-regional/.env portal-centros/.env
```

## Paso 5: Iniciar ambos proyectos

```bash
# Terminal 1 - Hospital
cd hospital-regional
npm run dev

# Terminal 2 - Portal
cd portal-centros
npm run dev
```

## Paso 6: Probar

- Hospital: http://localhost:5173
- Portal: http://localhost:5174

---

**Nota:** Ejecuta el Paso 1 ahora y avísame cuando esté listo para que Kiro cree los archivos.
