# 🚀 Sistema de Descuento Automático de Cupos

## ⚡ Instalación Rápida

### 1️⃣ Ejecutar Script SQL
```sql
-- Copiar y pegar en Supabase SQL Editor
-- Archivo: sql/scripts/sistema_descuento_cupos_automatico.sql
```

**¿Qué hace?**
- Crea tabla `historial_movimientos_cupos`
- Crea trigger `sincronizar_cupos_solicitud()`
- Crea función `validar_cupos_disponibles()`
- Configura políticas RLS
- Crea índices para rendimiento

### 2️⃣ Verificar Instalación
```sql
-- Copiar y pegar en Supabase SQL Editor
-- Archivo: sql/scripts/verificar_sistema_descuento.sql
```

**¿Qué verifica?**
- Tabla creada correctamente
- Trigger activo
- Funciones disponibles
- Políticas RLS configuradas
- Integridad de datos

### 3️⃣ Probar en la Interfaz
1. Ir a **Solicitud de Cupos**
2. Aprobar una solicitud pendiente
3. Ver que los cupos se descuentan automáticamente
4. Rechazar la solicitud
5. Ver que los cupos se devuelven automáticamente

## 🎯 ¿Cómo Funciona?

### Escenario 1: Aprobar Solicitud
```
1. Centro solicita 10 cupos
   └─> Estado: "pendiente"
   └─> Cupos del centro: NO cambian

2. Hospital aprueba solicitud
   └─> Frontend: UPDATE estado = 'aprobada'
   └─> Trigger automático:
       ├─> Valida cupos disponibles
       ├─> Descuenta: capacidad_disponible -= 10
       └─> Registra en historial

3. Resultado
   └─> Solicitud aprobada
   └─> Cupos descontados automáticamente
   └─> Historial registrado
```

### Escenario 2: Rechazar Solicitud Aprobada
```
1. Solicitud está aprobada (cupos ya descontados)

2. Hospital rechaza solicitud
   └─> Frontend: UPDATE estado = 'rechazada'
   └─> Trigger automático:
       ├─> Devuelve: capacidad_disponible += 10
       └─> Registra en historial

3. Resultado
   └─> Solicitud rechazada
   └─> Cupos devueltos automáticamente
   └─> Historial registrado
```

## 📊 Ventajas del Sistema

### ✅ Automático
- No requiere código manual en frontend
- El trigger se encarga de todo
- Funciona incluso desde SQL directo

### ✅ Consistente
- Garantiza integridad de datos
- Transacciones atómicas (todo o nada)
- Sin estados inconsistentes

### ✅ Auditable
- Historial completo de movimientos
- Registro de quién, cuándo, cuánto, por qué
- Consultas para análisis

### ✅ Robusto
- Maneja todos los casos:
  - Aprobar solicitud nueva
  - Rechazar solicitud aprobada
  - Eliminar solicitud aprobada
  - Cambiar número de cupos
  - Revertir aprobación

## 💻 Código Frontend Simplificado

### Antes (Manual)
```javascript
// ❌ Código antiguo - requiere lógica manual
const aprobar = async (id) => {
  // 1. Obtener solicitud
  // 2. Obtener centro
  // 3. Validar cupos
  // 4. Actualizar solicitud
  // 5. Actualizar centro
  // 6. Manejar errores
};
```

### Después (Automático)
```javascript
// ✅ Código nuevo - el trigger hace todo
const aprobar = async (id) => {
  await supabase
    .from('solicitudes_cupos')
    .update({ estado: 'aprobada' })
    .eq('id', id);
  // ¡Listo! El trigger descuenta automáticamente
};
```

## 📁 Archivos Importantes

### Scripts SQL
- `sql/scripts/sistema_descuento_cupos_automatico.sql` - Instalación
- `sql/scripts/verificar_sistema_descuento.sql` - Verificación

### Frontend
- `src/pages/SolicitudCupos.jsx` - Gestión de solicitudes (actualizado)
- `src/components/HistorialMovimientosCupos.jsx` - Ver historial

### Documentación
- `docs/guides/SISTEMA-DESCUENTO-AUTOMATICO-CUPOS.md` - Guía completa
- `INSTRUCCIONES-SISTEMA-DESCUENTO-AUTOMATICO.md` - Este archivo

## 🔍 Consultas Útiles

### Ver historial de un centro
```sql
SELECT * FROM historial_movimientos_cupos
WHERE centro_formador_id = 'uuid-del-centro'
ORDER BY created_at DESC;
```

### Resumen de movimientos
```sql
SELECT 
  tipo_movimiento,
  COUNT(*) as cantidad,
  SUM(cupos_afectados) as total_cupos
FROM historial_movimientos_cupos
GROUP BY tipo_movimiento;
```

### Validar cupos antes de aprobar
```sql
SELECT validar_cupos_disponibles(
  'uuid-del-centro',
  10 -- cupos solicitados
);
```

## ⚠️ Importante

### El Sistema Automático:
- ✅ Descuenta cupos al aprobar
- ✅ Devuelve cupos al rechazar
- ✅ Devuelve cupos al eliminar
- ✅ Ajusta cupos al modificar
- ✅ Registra todo en historial
- ✅ Valida disponibilidad
- ✅ Lanza errores si no hay cupos

### NO Necesitas:
- ❌ Código manual de descuento
- ❌ Validaciones en frontend
- ❌ Actualizar centro manualmente
- ❌ Registrar historial manualmente

## 🆘 Problemas Comunes

### Error: "No hay suficientes cupos disponibles"
**Solución**: El centro no tiene cupos. Verificar capacidad_disponible

### Error: "relation does not exist"
**Solución**: Ejecutar script de instalación

### Los cupos no se descuentan
**Solución**: Verificar que el trigger esté activo

## ✅ Checklist de Instalación

- [ ] Ejecuté `sistema_descuento_cupos_automatico.sql`
- [ ] Ejecuté `verificar_sistema_descuento.sql`
- [ ] Tabla `historial_movimientos_cupos` existe
- [ ] Trigger `trigger_sincronizar_cupos` activo
- [ ] Función `validar_cupos_disponibles` funciona
- [ ] Probé aprobar una solicitud
- [ ] Los cupos se descontaron automáticamente
- [ ] Probé rechazar una solicitud aprobada
- [ ] Los cupos se devolvieron automáticamente
- [ ] El historial se registra correctamente

## 🎉 ¡Listo!

Si completaste todos los pasos, el sistema está funcionando correctamente.

**Próximo paso**: Integrar con sistema de reinicio de cupos (Fase 1)

---

**Documentación completa**: `docs/guides/SISTEMA-DESCUENTO-AUTOMATICO-CUPOS.md`
