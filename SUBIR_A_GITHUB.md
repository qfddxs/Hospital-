# 🚀 Subir Proyectos a GitHub

## 📋 Resumen

Vamos a crear 2 repositorios en GitHub:
1. `hospital-regional` - Sistema del hospital
2. `portal-centros` - Portal de centros formadores

---

## PASO 1: Crear repositorios en GitHub

### 1.1 Ir a GitHub
- Ve a https://github.com
- Click en el botón "+" arriba a la derecha
- Selecciona "New repository"

### 1.2 Crear primer repositorio (Hospital)
- **Repository name:** `hospital-regional`
- **Description:** Sistema de Gestión de Campos Clínicos - Hospital Regional Rancagua
- **Visibility:** Private (recomendado) o Public
- ❌ NO marques "Add a README file"
- ❌ NO agregues .gitignore ni license
- Click en "Create repository"

### 1.3 Crear segundo repositorio (Portal)
- Repite el proceso
- **Repository name:** `portal-centros`
- **Description:** Portal de Centros Formadores - Hospital Regional Rancagua
- **Visibility:** Private (recomendado) o Public
- ❌ NO marques "Add a README file"
- Click en "Create repository"

---

## PASO 2: Subir Hospital a GitHub

### 2.1 Abrir terminal en `hospital-regional`

```bash
cd hospital-regional
```

### 2.2 Inicializar Git (si no está inicializado)

```bash
git init
```

### 2.3 Agregar archivos

```bash
git add .
```

### 2.4 Hacer commit

```bash
git commit -m "Initial commit - Sistema Hospital"
```

### 2.5 Conectar con GitHub

Reemplaza `TU-USUARIO` con tu usuario de GitHub:

```bash
git remote add origin https://github.com/TU-USUARIO/hospital-regional.git
git branch -M main
git push -u origin main
```

---

## PASO 3: Subir Portal a GitHub

### 3.1 Abrir terminal en `portal-centros`

```bash
cd portal-centros
```

### 3.2 Inicializar Git

```bash
git init
```

### 3.3 Agregar archivos

```bash
git add .
```

### 3.4 Hacer commit

```bash
git commit -m "Initial commit - Portal Centros Formadores"
```

### 3.5 Conectar con GitHub

Reemplaza `TU-USUARIO` con tu usuario de GitHub:

```bash
git remote add origin https://github.com/TU-USUARIO/portal-centros.git
git branch -M main
git push -u origin main
```

---

## PASO 4: Verificar en GitHub

1. Ve a https://github.com/TU-USUARIO/hospital-regional
2. Deberías ver todos los archivos del hospital
3. Ve a https://github.com/TU-USUARIO/portal-centros
4. Deberías ver todos los archivos del portal

---

## 🔐 IMPORTANTE: Verificar .gitignore

Asegúrate de que el archivo `.env` NO se subió a GitHub:

### En ambos repositorios, verifica que existe `.gitignore` con:

```
# dependencies
/node_modules

# production
/dist

# local env files
.env
.env.local
.env.production.local

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

### Si el .env se subió por error:

```bash
# Eliminar del repositorio (pero mantener local)
git rm --cached .env
git commit -m "Remove .env from repository"
git push
```

---

## ✅ Checklist

- [ ] Repositorio `hospital-regional` creado en GitHub
- [ ] Repositorio `portal-centros` creado en GitHub
- [ ] Hospital subido correctamente
- [ ] Portal subido correctamente
- [ ] Archivo `.env` NO está en GitHub
- [ ] Ambos repositorios son privados (recomendado)

---

## 🎯 Próximo Paso

Una vez que ambos proyectos estén en GitHub, podemos desplegarlos en Vercel.

Avísame cuando termines de subirlos!
