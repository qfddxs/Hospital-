# TODO: Sistema de Verificación Automática de Documentos Vencidos

## Problema Actual

El sistema tiene la capacidad de detectar documentos vencidos mediante:
- Campo `fecha_expiracion` en tabla `documentos`
- Función SQL `verificar_documentos_vencidos()` que actualiza estados
- Vistas que calculan vencimiento en tiempo real

**Pero:** La función debe ejecutarse manualmente o programarse.

## Opciones de Implementación

### Opción A: Trigger Programado en Base de Datos (Recomendado para Producción)

**Requisitos:**
- Supabase Plan Pro (para extensión `pg_cron`)
- O PostgreSQL con `pg_cron` instalado

**Implementación:**
```sql
-- 1. Habilitar extensión pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Programar ejecución diaria a las 00:00
SELECT cron.schedule(
  'verificar-documentos-vencidos',
  '0 0 * * *',  -- Todos los días a medianoche
  $$ SELECT verificar_documentos_vencidos(); $$
);

-- 3. Ver trabajos programados
SELECT * FROM cron.job;

-- 4. Eliminar trabajo (si es necesario)
SELECT cron.unschedule('verificar-documentos-vencidos');
```

**Ventajas:**
- ✅ Totalmente automático
- ✅ No depende del frontend
- ✅ Eficiente y confiable
- ✅ Se ejecuta aunque nadie use el sistema

**Desventajas:**
- ❌ Requiere plan Pro de Supabase
- ❌ Configuración más compleja

---

### Opción B: Edge Function de Supabase

**Implementación:**

1. Crear archivo `supabase/functions/verificar-vencimientos/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Ejecutar función de verificación
    const { error } = await supabaseClient.rpc('verificar_documentos_vencidos')

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, message: 'Documentos verificados' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

2. Desplegar función:
```bash
supabase functions deploy verificar-vencimientos
```

3. Programar con servicio externo (GitHub Actions, cron-job.org, etc.)

**Ventajas:**
- ✅ No requiere plan Pro
- ✅ Flexible y escalable
- ✅ Puede incluir lógica adicional (notificaciones, etc.)

**Desventajas:**
- ❌ Requiere servicio externo para programación
- ❌ Más complejo de configurar

---

### Opción C: Verificación en Frontend al Cargar Documentos

**Implementación:**

Agregar en `src/pages/GestionDocumental.jsx`:

```javascript
const fetchDocumentos = async () => {
  try {
    setLoading(true);
    
    // Ejecutar verificación de vencimientos antes de cargar
    await supabase.rpc('verificar_documentos_vencidos');
    
    let query = supabase.from('documentos');
    
    if (pestañaActiva === 'institucionales') {
      query = query.select('*').is('alumno_id', null);
    } else {
      query = query.select(`
        *,
        alumno:alumnos(id, nombre, primer_apellido, segundo_apellido, rut),
        centro_formador:centros_formadores(id, nombre)
      `).not('alumno_id', 'is', null);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    setDocumentos(data || []);
  } catch (err) {
    setError('No se pudieron cargar los documentos');
    console.error('Error:', err);
  } finally {
    setLoading(false);
  }
};
```

**Ventajas:**
- ✅ Fácil de implementar
- ✅ No requiere configuración adicional
- ✅ Funciona en cualquier plan de Supabase

**Desventajas:**
- ❌ Solo se ejecuta cuando alguien accede a la página
- ❌ Puede haber retraso en detección de vencimientos
- ❌ Múltiples ejecuciones si varios usuarios acceden

---

### Opción D: Cálculo en Tiempo Real (Sin actualizar BD)

**Implementación:**

Modificar las columnas para calcular el estado al renderizar:

```javascript
{
  header: 'Estado',
  render: (row) => {
    let estado = row.estado;
    let colorClass = 'bg-gray-100 text-gray-700';
    
    // Verificar vencimiento en tiempo real
    if (row.fecha_expiracion) {
      const fechaExp = new Date(row.fecha_expiracion);
      const hoy = new Date();
      
      if (fechaExp < hoy) {
        estado = 'vencido';
        colorClass = 'bg-red-100 text-red-700';
      } else if (fechaExp <= new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000)) {
        estado = 'por vencer';
        colorClass = 'bg-yellow-100 text-yellow-700';
      } else {
        estado = 'vigente';
        colorClass = 'bg-green-100 text-green-700';
      }
    }
    
    return (
      <span className={`px-2 py-1 rounded text-xs capitalize ${colorClass}`}>
        {estado}
      </span>
    );
  }
}
```

**Ventajas:**
- ✅ Siempre actualizado en tiempo real
- ✅ No requiere ejecución de funciones
- ✅ Muy fácil de implementar

**Desventajas:**
- ❌ No actualiza el campo `estado` en la BD
- ❌ Filtros por estado pueden no funcionar correctamente
- ❌ Reportes y estadísticas pueden ser inconsistentes

---

## Recomendación

**Para desarrollo/testing:** Opción C o D
**Para producción:** Opción A (si tienes plan Pro) o Opción B

## Implementación Adicional Sugerida

### Sistema de Notificaciones

Cuando se detecten documentos vencidos o por vencer, enviar notificaciones:

```sql
-- Función mejorada con notificaciones
CREATE OR REPLACE FUNCTION verificar_documentos_vencidos()
RETURNS TABLE(
  documentos_vencidos INTEGER,
  documentos_por_vencer INTEGER
) AS $$
DECLARE
  vencidos INTEGER;
  por_vencer INTEGER;
BEGIN
  -- Actualizar documentos vencidos
  UPDATE documentos_checklist dc
  SET estado = 'vencido'
  FROM documentos d
  WHERE dc.documento_id = d.id
    AND d.fecha_expiracion < CURRENT_DATE
    AND dc.estado NOT IN ('vencido', 'rechazado');
  
  GET DIAGNOSTICS vencidos = ROW_COUNT;
  
  -- Contar documentos por vencer (próximos 30 días)
  SELECT COUNT(*) INTO por_vencer
  FROM documentos d
  WHERE d.fecha_expiracion BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    AND d.estado != 'vencido';
  
  RETURN QUERY SELECT vencidos, por_vencer;
END;
$$ LANGUAGE plpgsql;
```

### Dashboard de Alertas

Crear componente para mostrar alertas de vencimiento en el dashboard principal.

---

## Checklist de Implementación

- [ ] Decidir qué opción implementar
- [ ] Configurar función/trigger según opción elegida
- [ ] Probar con documentos de prueba
- [ ] Implementar notificaciones (opcional)
- [ ] Crear dashboard de alertas (opcional)
- [ ] Documentar para el equipo
- [ ] Monitorear en producción

---

## Notas Importantes

1. **Zona horaria:** Asegurarse de que las fechas se comparen en la zona horaria correcta (Chile: UTC-3/-4)
2. **Performance:** La función `verificar_documentos_vencidos()` debe ser eficiente para no afectar rendimiento
3. **Logs:** Considerar agregar logging para auditoría
4. **Testing:** Probar con diferentes escenarios de fechas

---

## Fecha de Creación
Noviembre 16, 2025

## Estado
⏳ Pendiente de implementación
