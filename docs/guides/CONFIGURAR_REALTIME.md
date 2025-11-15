# ⚡ Configurar Actualización en Tiempo Real

## 📋 Resumen

Ahora las solicitudes de cupos se actualizan automáticamente en tiempo real:
- ✅ Cuando un centro formador crea una solicitud → El hospital la ve inmediatamente
- ✅ Cuando el hospital aprueba/rechaza → El portal se actualiza automáticamente

---

## PASO 1: Habilitar Realtime en Supabase

### 1.1 Ir a Supabase Dashboard
1. Ve a https://supabase.com
2. Abre tu proyecto
3. Ve a "Database" → "Replication"

### 1.2 Habilitar Realtime para la tabla
1. Busca la tabla `solicitudes_cupos`
2. Click en el toggle para habilitar "Realtime"
3. Debería aparecer en verde

**O ejecuta este SQL:**

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE solicitudes_cupos;
```

---

## PASO 2: Probar en Local

### 2.1 Abrir ambos proyectos

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

### 2.2 Probar el flujo completo

1. **En el Portal (localhost:5174):**
   - Haz login como centro formador
   - Ve a "Solicitar Cupos"
   - Crea una nueva solicitud
   - Click en "Enviar Solicitud"

2. **En el Hospital (localhost:5173):**
   - Ve a "Solicitud de Cupos"
   - ✨ **La nueva solicitud aparece automáticamente**
   - Verás una notificación verde: "¡Nueva solicitud recibida!"

3. **Aprobar/Rechazar:**
   - En el hospital, aprueba o rechaza la solicitud
   - Ve al portal
   - ✨ **El estado se actualiza automáticamente**

---

## 🎯 Características Implementadas

### En el Hospital:
- ✅ Actualización automática de solicitudes
- ✅ Notificación visual cuando llega una nueva solicitud
- ✅ Indicador "Actualización en tiempo real" con punto verde pulsante
- ✅ No necesita recargar la página

### En el Portal:
- ✅ Actualización automática del estado de solicitudes
- ✅ Ve inmediatamente cuando el hospital aprueba/rechaza
- ✅ No necesita recargar la página

---

## 🔧 Cómo Funciona

### Supabase Realtime:
```javascript
// Se suscribe a cambios en la tabla
const channel = supabase
  .channel('solicitudes_cupos_changes')
  .on('postgres_changes', {
    event: '*', // INSERT, UPDATE, DELETE
    schema: 'public',
    table: 'solicitudes_cupos'
  }, (payload) => {
    // Cuando hay un cambio, recarga los datos
    fetchSolicitudes();
  })
  .subscribe();
```

### Eventos que escucha:
- **INSERT**: Nueva solicitud creada
- **UPDATE**: Solicitud aprobada/rechazada
- **DELETE**: Solicitud eliminada

---

## 🐛 Troubleshooting

### No se actualiza automáticamente

**1. Verificar que Realtime está habilitado:**
```sql
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'solicitudes_cupos';
```

Debería devolver una fila. Si no, ejecuta:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE solicitudes_cupos;
```

**2. Verificar en la consola del navegador:**
- Abre DevTools (F12)
- Ve a la pestaña "Console"
- Deberías ver: `🔄 Cambio detectado en solicitudes:`

**3. Verificar conexión:**
- Supabase Realtime requiere WebSockets
- Verifica que tu firewall no bloquee WebSockets

### Error: "Realtime is not enabled"

Ejecuta en Supabase SQL Editor:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE solicitudes_cupos;
```

---

## 📊 Monitoreo

### Ver conexiones activas:
En Supabase Dashboard → Database → Replication → "Active connections"

### Ver logs en tiempo real:
En la consola del navegador verás:
```
🔄 Cambio detectado en solicitudes: {eventType: 'INSERT', ...}
```

---

## ✅ Checklist

- [ ] Realtime habilitado en Supabase
- [ ] Hospital muestra notificación de nueva solicitud
- [ ] Portal se actualiza cuando se aprueba/rechaza
- [ ] Indicador "tiempo real" visible en el hospital
- [ ] No hay errores en la consola

---

## 🎉 ¡Listo!

Ahora tienes un sistema completamente en tiempo real. Los cambios se propagan instantáneamente entre el hospital y los centros formadores.

---

¿Funciona correctamente? Avísame si necesitas ajustar algo.
