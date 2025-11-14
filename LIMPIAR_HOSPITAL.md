# 🧹 Limpiar Proyecto Hospital

Ahora que el portal funciona independientemente, vamos a eliminar los archivos del portal del proyecto hospital.

---

## PASO 1: Eliminar carpeta del portal

```bash
# Desde la carpeta hospital-regional
rm -rf src/pages/portal
```

O manualmente:
- Elimina la carpeta `hospital-regional/src/pages/portal/`

---

## PASO 2: Limpiar el router

Voy a actualizar el archivo `src/routes/router.jsx` para eliminar las rutas del portal.

---

## PASO 3: Verificar que el hospital sigue funcionando

```bash
cd hospital-regional
npm run dev
```

Abre: http://localhost:5173

Deberías poder:
- ✅ Hacer login como personal del hospital
- ✅ Ver el dashboard
- ✅ Acceder a todos los módulos (Gestión de Alumnos, Control de Asistencia, etc.)

---

¿Listo para que yo limpie el router del hospital?
