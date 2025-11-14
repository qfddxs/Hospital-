# ✅ Probar el Portal

## 🎉 ¡El portal está listo!

Todos los archivos han sido creados y configurados.

---

## PASO 1: Iniciar el Portal

Abre una terminal en la carpeta `portal-centros` y ejecuta:

```bash
cd portal-centros
npm run dev
```

Deberías ver:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

---

## PASO 2: Abrir en el navegador

Abre tu navegador en: **http://localhost:5174**

Deberías ver la página de login del portal.

---

## PASO 3: Probar el registro

1. Click en "Registrar Centro Formador"
2. Completa el formulario
3. Crea una cuenta de prueba
4. Deberías ser redirigido al login

---

## PASO 4: Probar el login

1. Ingresa con las credenciales que creaste
2. Deberías ver el dashboard del portal
3. Prueba crear una solicitud de cupos

---

## PASO 5: Verificar sesiones independientes

### Abrir ambos proyectos:

**Terminal 1 - Hospital:**
```bash
cd hospital-regional
npm run dev
```
→ http://localhost:5173

**Terminal 2 - Portal:**
```bash
cd portal-centros
npm run dev
```
→ http://localhost:5174

### Probar:
1. Haz login en el portal (localhost:5174)
2. Abre el hospital (localhost:5173)
3. Deberías ver que NO estás logueado en el hospital
4. ✅ Las sesiones son independientes!

---

## 🐛 Si hay errores

### Error: "Cannot find module"
```bash
cd portal-centros
npm install
```

### Error: "VITE_SUPABASE_URL is not defined"
- Verifica que el archivo `.env` existe en `portal-centros/`
- Verifica que tiene las variables correctas

### Error en las páginas
- Verifica que todas las rutas de importación usan `../` en lugar de `../../`

---

## ✅ Checklist

- [ ] Portal inicia sin errores
- [ ] Puedo ver la página de login
- [ ] Puedo registrar un centro formador
- [ ] Puedo hacer login
- [ ] Puedo ver el dashboard
- [ ] Puedo crear solicitudes
- [ ] Las sesiones son independientes del hospital

---

## 🎯 Próximos Pasos

Una vez que todo funcione:

1. ✅ Limpiar el proyecto hospital (eliminar archivos del portal)
2. ✅ Subir ambos proyectos a GitHub
3. ✅ Desplegar en Vercel

---

¿Todo funcionó? Avísame para continuar con la limpieza del proyecto hospital.
