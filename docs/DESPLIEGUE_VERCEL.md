# 🚀 Guía de Despliegue en Vercel

## 📋 Resumen

Vas a desplegar **2 proyectos separados** en Vercel, cada uno con su propio dominio/subdominio.

```
hospital-regional/  → https://hospital.tudominio.com
portal-centros/     → https://portal.tudominio.com
```

---

## 🎯 OPCIÓN 1: Dos Proyectos Separados en Vercel (Recomendado)

### **Ventajas:**
- ✅ Despliegues independientes
- ✅ Fácil de configurar
- ✅ Cada proyecto tiene su propio dashboard
- ✅ Puedes usar subdominios diferentes

### **Paso a Paso:**

#### **1. Subir ambos proyectos a GitHub**

```bash
# Proyecto Hospital
cd hospital-regional
git init
git add .
git commit -m "Initial commit - Hospital"
git remote add origin https://github.com/tu-usuario/hospital-regional.git
git push -u origin main

# Proyecto Portal
cd ../portal-centros
git init
git add .
git commit -m "Initial commit - Portal"
git remote add origin https://github.com/tu-usuario/portal-centros.git
git push -u origin main
```

#### **2. Desplegar Hospital en Vercel**

1. Ve a [vercel.com](https://vercel.com)
2. Click en "Add New Project"
3. Importa el repositorio `hospital-regional`
4. Configuración:
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
5. Agrega las variables de entorno:
   ```
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_key_de_supabase
   ```
6. Click en "Deploy"
7. Vercel te dará una URL como: `hospital-regional.vercel.app`

#### **3. Desplegar Portal en Vercel**

1. Click en "Add New Project" nuevamente
2. Importa el repositorio `portal-centros`
3. Misma configuración que el hospital
4. Mismas variables de entorno
5. Click en "Deploy"
6. Vercel te dará una URL como: `portal-centros.vercel.app`

#### **4. Configurar Dominios Personalizados (Opcional)**

Si tienes un dominio propio (ej: `tudominio.com`):

**Para el Hospital:**
1. Ve al proyecto en Vercel
2. Settings → Domains
3. Agrega: `hospital.tudominio.com`
4. Configura el DNS según las instrucciones de Vercel

**Para el Portal:**
1. Ve al proyecto en Vercel
2. Settings → Domains
3. Agrega: `portal.tudominio.com`
4. Configura el DNS según las instrucciones de Vercel

---

## 🎯 OPCIÓN 2: Monorepo con Vercel (Avanzado)

Si prefieres tener ambos proyectos en un solo repositorio:

### **Estructura:**

```
mi-sistema/
├── hospital-regional/
│   ├── src/
│   ├── package.json
│   └── vercel.json
├── portal-centros/
│   ├── src/
│   ├── package.json
│   └── vercel.json
└── README.md
```

### **Configuración:**

**hospital-regional/vercel.json:**
```json
{
  "buildCommand": "cd hospital-regional && npm install && npm run build",
  "outputDirectory": "hospital-regional/dist",
  "installCommand": "cd hospital-regional && npm install"
}
```

**portal-centros/vercel.json:**
```json
{
  "buildCommand": "cd portal-centros && npm install && npm run build",
  "outputDirectory": "portal-centros/dist",
  "installCommand": "cd portal-centros && npm install"
}
```

Luego en Vercel:
1. Importa el repositorio principal
2. Crea 2 proyectos desde el mismo repo
3. En cada proyecto, configura el "Root Directory":
   - Hospital: `hospital-regional`
   - Portal: `portal-centros`

---

## 🔧 Configuración de Variables de Entorno

### **En Vercel Dashboard:**

Para cada proyecto:
1. Settings → Environment Variables
2. Agregar:

```
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**Importante:** Las variables deben empezar con `VITE_` para que Vite las reconozca.

---

## 🔄 Despliegue Automático

Una vez configurado, cada vez que hagas `git push`:

```bash
# Hospital
cd hospital-regional
git add .
git commit -m "Actualización"
git push
# → Vercel despliega automáticamente

# Portal
cd portal-centros
git add .
git commit -m "Actualización"
git push
# → Vercel despliega automáticamente
```

---

## 🌐 URLs Finales

### **Con dominios de Vercel (gratis):**
```
Hospital: https://hospital-regional.vercel.app
Portal:   https://portal-centros.vercel.app
```

### **Con dominio propio:**
```
Hospital: https://hospital.tudominio.com
Portal:   https://portal.tudominio.com
```

### **Con subdominio de Vercel personalizado:**
```
Hospital: https://hospital-rancagua.vercel.app
Portal:   https://portal-rancagua.vercel.app
```

---

## 📊 Comparación de Opciones

| Característica | Opción 1 (2 Repos) | Opción 2 (Monorepo) |
|----------------|-------------------|---------------------|
| **Facilidad** | ⭐⭐⭐ Muy fácil | ⭐⭐ Media |
| **Despliegues** | Independientes | Independientes |
| **Gestión** | 2 repos separados | 1 repo, 2 proyectos |
| **Recomendado** | ✅ Sí | Para equipos grandes |

---

## 🎯 MI RECOMENDACIÓN

### **Para tu caso, usa OPCIÓN 1:**

1. **Crea 2 repositorios en GitHub:**
   - `hospital-regional`
   - `portal-centros`

2. **Despliega cada uno por separado en Vercel**

3. **URLs que obtendrás:**
   ```
   Hospital: https://hospital-regional-xxx.vercel.app
   Portal:   https://portal-centros-xxx.vercel.app
   ```

4. **Comparte la URL del portal con las universidades**

---

## 🔐 Seguridad

### **Variables de Entorno:**
- ✅ Nunca subas el archivo `.env` a GitHub
- ✅ Configura las variables en Vercel Dashboard
- ✅ Usa las mismas credenciales de Supabase en ambos

### **Supabase:**
- ✅ Las RLS Policies protegen los datos
- ✅ Cada proyecto se conecta al mismo Supabase
- ✅ Las sesiones son independientes

---

## 📝 Checklist de Despliegue

### **Antes de desplegar:**
- [ ] Ambos proyectos funcionan en local
- [ ] Variables de entorno configuradas
- [ ] Archivos `.env` en `.gitignore`
- [ ] Build funciona: `npm run build`

### **Hospital:**
- [ ] Repositorio creado en GitHub
- [ ] Proyecto creado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Dominio configurado (opcional)
- [ ] Despliegue exitoso

### **Portal:**
- [ ] Repositorio creado en GitHub
- [ ] Proyecto creado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Dominio configurado (opcional)
- [ ] Despliegue exitoso

### **Pruebas:**
- [ ] Hospital funciona en producción
- [ ] Portal funciona en producción
- [ ] Login funciona en ambos
- [ ] Sesiones son independientes
- [ ] Datos se guardan correctamente

---

## 🆘 Troubleshooting

### **Error: "Failed to load module"**
```bash
# Asegúrate de que el build command sea correcto
npm run build
```

### **Error: "Environment variables not found"**
- Verifica que las variables empiecen con `VITE_`
- Configúralas en Vercel Dashboard
- Redespliega el proyecto

### **Error: "404 on refresh"**
Agrega `vercel.json` en la raíz de cada proyecto:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 💡 Consejos

1. **Usa nombres descriptivos:**
   - `hospital-regional-rancagua`
   - `portal-centros-rancagua`

2. **Configura dominios personalizados** para verse más profesional

3. **Activa los despliegues automáticos** en Vercel

4. **Monitorea los logs** en Vercel Dashboard

5. **Usa Preview Deployments** para probar cambios antes de producción

---

¿Necesitas ayuda con algún paso específico del despliegue?
