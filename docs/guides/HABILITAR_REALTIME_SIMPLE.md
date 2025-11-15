# ⚡ Habilitar Realtime - Paso a Paso

## 🎯 Problema Resuelto

He arreglado el loop infinito que causaba que la página se cayera. Ahora usa `useCallback` para evitar re-renders innecesarios.

---

## 📝 PASO ÚNICO: Habilitar Realtime en Supabase

### Opción 1: Desde el Dashboard (Más Fácil)

1. Ve a https://supabase.com
2. Abre tu proyecto
3. Ve a **Database** → **Replication** (en el menú lateral)
4. Busca la tabla `solicitudes_cupos`
5. **Activa el toggle** que dice "Enable Realtime"
6. Debería ponerse en verde ✅

### Opción 2: Con SQL

1. Ve a **SQL Editor** en Supabase
2. Copia y pega este comando:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE solicitudes_cupos;
```

3. Click en "Run"
4. Deberías ver: "Success. No rows returned"

---

## ✅ Verificar que funciona

### 1. Abrir la consola del navegador (F12)

### 2. En el Hospital:
- Ve a "Solicitud de Cupos"
- Deberías ver en la consola algo como:
  ```
  Realtime: SUBSCRIBED
  ```

### 3. En el Portal:
- Crea una nueva solicitud
- En el hospital deberías ver:
  ```
  🔄 Cambio detectado en solicitudes: {eventType: 'INSERT', ...}
  ```

### 4. Aprobar una solicitud:
- En el hospital, aprueba una solicitud
- En el portal deberías ver:
  ```
  🔄 Solicitud actualizada: {eventType: 'UPDATE', ...}
  ```

---

## 🐛 Si sigue sin funcionar

### Error: "Realtime is not enabled"

Ejecuta este SQL en Supabase:

```sql
-- Verificar si está habilitado
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'solicitudes_cupos';

-- Si no devuelve nada, ejecuta:
ALTER PUBLICATION supabase_realtime ADD TABLE solicitudes_cupos;
```

### La página se sigue cayendo

1. Recarga ambos proyectos (Ctrl+C y `npm run dev` de nuevo)
2. Limpia el cache del navegador (Ctrl+Shift+Delete)
3. Verifica que no haya errores en la consola

---

## 🎉 ¡Listo!

Una vez habilitado Realtime en Supabase, todo debería funcionar automáticamente.

**Prueba:**
1. Portal: Crea solicitud
2. Hospital: Ve la notificación verde automáticamente
3. Hospital: Aprueba la solicitud
4. Portal: Ve el cambio de estado automáticamente

---

¿Habilitaste Realtime en Supabase? Avísame si funciona o si hay algún error.
