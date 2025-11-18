# Sistema de Reinicio de Cupos - Fase 1

## 📋 Descripción General

Sistema híbrido que permite reiniciar los cupos de los centros formadores de manera manual mediante un botón en la interfaz. Esta es la **Fase 1** de un sistema que eventualmente será automatizado.

## 🎯 Funcionalidades

### 1. Botón de Reinicio Manual
- Ubicado en la página de **Capacidad Formadora**
- Color distintivo (amarillo/amber) para destacar su importancia
- Requiere confirmación antes de ejecutar

### 2. Modal de Confirmación
Muestra estadísticas en tiempo real antes de reiniciar:
- **Centros Activos**: Cantidad de centros que serán afectados
- **Cupos Totales**: Capacidad total del sistema
- **Cupos Disponibles**: Cupos actualmente libres
- **Cupos en Uso**: Cupos ocupados por solicitudes aprobadas
- **Solicitudes Activas**: Solicitudes que cambiarán a "finalizada"

### 3. Proceso de Reinicio
Al confirmar, el sistema:
1. Restaura `capacidad_disponible = capacidad_total` en todos los centros
2. Cambia el estado de solicitudes `aprobada` y `en_proceso` a `finalizada`
3. Registra la acción en `historial_reinicio_cupos` con:
   - Fecha y hora exacta
   - Usuario que ejecutó el reinicio
   - Estadísticas del reinicio
   - Nivel de formación afectado

### 4. Historial Automático
Cada reinicio queda registrado con:
- ID único del reinicio
- Fecha y hora
- Usuario responsable
- Centros afectados
- Cupos liberados
- Solicitudes finalizadas
- Nivel de formación (pregrado/postgrado/ambos)
- Observaciones

## 🗄️ Base de Datos

### Tabla: `historial_reinicio_cupos`

```sql
CREATE TABLE historial_reinicio_cupos (
  id UUID PRIMARY KEY,
  fecha_reinicio TIMESTAMPTZ NOT NULL,
  usuario_id UUID REFERENCES auth.users(id),
  centros_afectados INTEGER,
  cupos_liberados INTEGER,
  solicitudes_afectadas INTEGER,
  nivel_formacion VARCHAR(20),
  observaciones TEXT,
  created_at TIMESTAMPTZ
);
```

### Funciones SQL

#### `obtener_estadisticas_pre_reinicio(p_nivel_formacion)`
Obtiene estadísticas antes de reiniciar:
```sql
SELECT obtener_estadisticas_pre_reinicio('pregrado');
```

Retorna:
```json
{
  "total_centros": 15,
  "cupos_totales": 450,
  "cupos_disponibles": 120,
  "cupos_en_uso": 330,
  "solicitudes_activas": 42,
  "nivel_formacion": "pregrado"
}
```

#### `reiniciar_cupos_manual(p_nivel_formacion, p_usuario_id, p_observaciones)`
Ejecuta el reinicio de cupos:
```sql
SELECT reiniciar_cupos_manual(
  'pregrado', 
  auth.uid(), 
  'Reinicio de fin de semestre'
);
```

Retorna:
```json
{
  "success": true,
  "historial_id": "uuid-del-registro",
  "centros_afectados": 15,
  "cupos_liberados": 330,
  "solicitudes_afectadas": 42,
  "nivel_formacion": "pregrado",
  "fecha_reinicio": "2025-11-18T10:30:00Z"
}
```

## 🔒 Seguridad

### Políticas RLS
- ✅ Usuarios autenticados pueden **ver** el historial
- ❌ Solo la función `SECURITY DEFINER` puede **insertar** registros
- Esto previene manipulación manual del historial

### Validaciones
- Requiere confirmación explícita del usuario
- Muestra advertencias claras sobre el impacto
- Registra quién ejecutó cada reinicio

## 📊 Uso en la Interfaz

### Paso 1: Acceder al Botón
1. Ir a **Capacidad Formadora**
2. Hacer clic en el botón **"Reiniciar Cupos"** (color amarillo)

### Paso 2: Revisar Estadísticas
El modal muestra:
- Cuántos centros serán afectados
- Cuántos cupos se liberarán
- Cuántas solicitudes se finalizarán
- Nivel de formación actual

### Paso 3: Confirmar
- Hacer clic en **"Confirmar Reinicio"**
- El sistema procesa el reinicio
- Muestra mensaje de éxito con estadísticas

### Paso 4: Verificar
- Los cupos disponibles se actualizan inmediatamente
- Las solicitudes cambian a estado "finalizada"
- El historial queda registrado

## 🔄 Filtrado por Nivel de Formación

El reinicio respeta el filtro de nivel de formación activo:
- Si estás en **Pregrado**: solo reinicia centros de pregrado
- Si estás en **Postgrado**: solo reinicia centros de postgrado
- Si estás en **Ambos**: reinicia todos los centros

## 📝 Consultas Útiles

### Ver historial de reinicios
```sql
SELECT 
  fecha_reinicio,
  centros_afectados,
  cupos_liberados,
  solicitudes_afectadas,
  nivel_formacion,
  observaciones
FROM historial_reinicio_cupos
ORDER BY fecha_reinicio DESC
LIMIT 10;
```

### Ver último reinicio
```sql
SELECT * 
FROM historial_reinicio_cupos 
ORDER BY fecha_reinicio DESC 
LIMIT 1;
```

### Estadísticas de reinicios por mes
```sql
SELECT 
  DATE_TRUNC('month', fecha_reinicio) as mes,
  COUNT(*) as total_reinicios,
  SUM(cupos_liberados) as total_cupos_liberados,
  SUM(solicitudes_afectadas) as total_solicitudes
FROM historial_reinicio_cupos
GROUP BY mes
ORDER BY mes DESC;
```

## 🚀 Próximas Fases

### Fase 2: Programación Automática
- Configurar fecha y hora específica para reinicio automático
- Notificaciones previas a usuarios
- Confirmación automática en fecha programada

### Fase 3: Reinicio Recurrente
- Configurar reinicio periódico (mensual, semestral, anual)
- Reglas de negocio personalizables
- Dashboard de próximos reinicios

## ⚠️ Consideraciones Importantes

1. **Irreversible**: Una vez ejecutado, no se puede deshacer
2. **Impacto Global**: Afecta a todos los centros del nivel seleccionado
3. **Solicitudes Finalizadas**: Las solicitudes aprobadas pasan a "finalizada"
4. **Historial Permanente**: Cada reinicio queda registrado para auditoría
5. **Tiempo Real**: Los cambios se reflejan inmediatamente en la interfaz

## 🐛 Troubleshooting

### Error: "No se pudieron cargar las estadísticas"
- Verificar que las funciones SQL estén creadas
- Ejecutar: `sql/scripts/sistema_reinicio_cupos_fase1.sql`

### Error: "No se pudo reiniciar los cupos"
- Verificar permisos de la función `reiniciar_cupos_manual`
- Verificar que el usuario esté autenticado

### Los cupos no se actualizan
- Verificar que la tabla `centros_formadores` tenga las columnas correctas
- Ejecutar: `sql/scripts/limpiar_columnas_duplicadas.sql`

## 📚 Archivos Relacionados

- `sql/scripts/sistema_reinicio_cupos_fase1.sql` - Script de creación
- `sql/scripts/limpiar_columnas_duplicadas.sql` - Limpieza de columnas
- `src/pages/CapacidadFormadora.jsx` - Interfaz de usuario
- `docs/guides/SISTEMA-REINICIO-CUPOS-FASE1.md` - Esta documentación
