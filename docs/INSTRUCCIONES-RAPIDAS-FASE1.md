# 🚀 Instrucciones Rápidas - Fase 1: Sistema de Reinicio de Cupos

## ⚡ Instalación en 3 Pasos

### 1️⃣ Limpiar Columnas Duplicadas
```sql
-- Copiar y pegar en Supabase SQL Editor
-- Archivo: sql/scripts/limpiar_columnas_duplicadas.sql
```

**¿Qué hace?**
- Elimina columnas obsoletas: `cupos_totales`, `cupos_disponibles`, `cupos_en_uso`
- Migra datos a: `capacidad_total`, `capacidad_disponible`

### 2️⃣ Instalar Sistema de Reinicio
```sql
-- Copiar y pegar en Supabase SQL Editor
-- Archivo: sql/scripts/sistema_reinicio_cupos_fase1.sql
```

**¿Qué hace?**
- Crea tabla `historial_reinicio_cupos`
- Crea funciones SQL necesarias
- Configura políticas de seguridad

### 3️⃣ Verificar Instalación (Opcional)
```sql
-- Copiar y pegar en Supabase SQL Editor
-- Archivo: sql/scripts/verificar_sistema_reinicio.sql
```

**¿Qué hace?**
- Verifica que todo esté instalado correctamente
- Muestra estado del sistema

## 🎯 Uso en la Interfaz

### Paso 1: Ir a Capacidad Formadora
- Navegar a la página de **Capacidad Formadora**

### Paso 2: Hacer clic en "Reiniciar Cupos"
- Botón amarillo en la esquina superior derecha

### Paso 3: Revisar Estadísticas
El modal muestra:
- ✅ Centros activos
- ✅ Cupos totales
- ✅ Cupos disponibles
- ✅ Cupos en uso
- ✅ Solicitudes que serán finalizadas

### Paso 4: Confirmar
- Hacer clic en **"Confirmar Reinicio"**
- Esperar mensaje de éxito
- ¡Listo! Los cupos están reiniciados

## 📊 ¿Qué Hace el Reinicio?

1. **Restaura cupos**: `capacidad_disponible = capacidad_total`
2. **Finaliza solicitudes**: Cambia estado de `aprobada` → `finalizada`
3. **Registra historial**: Guarda quién, cuándo y qué se reinició

## 🔍 Verificar que Funcionó

### Opción 1: Ver en la Interfaz
- Los cupos disponibles deben ser iguales a los cupos totales
- Las solicitudes aprobadas deben estar en estado "finalizada"

### Opción 2: Consultar Historial
```sql
SELECT * FROM historial_reinicio_cupos 
ORDER BY fecha_reinicio DESC 
LIMIT 1;
```

## 📁 Archivos Importantes

### Scripts SQL (Ejecutar en orden)
1. `sql/scripts/limpiar_columnas_duplicadas.sql`
2. `sql/scripts/sistema_reinicio_cupos_fase1.sql`
3. `sql/scripts/verificar_sistema_reinicio.sql` (opcional)

### Código Frontend (Ya implementado)
- `src/pages/CapacidadFormadora.jsx` - Botón y modal
- `src/components/HistorialReinicios.jsx` - Ver historial (opcional)

### Documentación
- `docs/guides/SISTEMA-REINICIO-CUPOS-FASE1.md` - Guía completa
- `docs/cambios/IMPLEMENTACION-FASE1-REINICIO-CUPOS.md` - Resumen de cambios
- `sql/scripts/README.md` - Instrucciones detalladas

## ⚠️ Importante

- ✅ El reinicio es **irreversible**
- ✅ Afecta a **todos los centros** del nivel seleccionado
- ✅ Las solicitudes aprobadas pasan a **"finalizada"**
- ✅ Queda **registrado en historial** para auditoría

## 🆘 Problemas Comunes

### Error: "No se pudieron cargar las estadísticas"
**Solución**: Ejecutar `sistema_reinicio_cupos_fase1.sql`

### Error: "column does not exist"
**Solución**: Ejecutar primero `limpiar_columnas_duplicadas.sql`

### Los cupos no se actualizan
**Solución**: Verificar que las funciones SQL estén creadas correctamente

## ✅ Checklist Final

- [ ] Ejecuté `limpiar_columnas_duplicadas.sql`
- [ ] Ejecuté `sistema_reinicio_cupos_fase1.sql`
- [ ] Verifiqué con `verificar_sistema_reinicio.sql`
- [ ] Probé el botón "Reiniciar Cupos" en la interfaz
- [ ] Vi las estadísticas en el modal
- [ ] Confirmé el reinicio
- [ ] Los cupos se actualizaron correctamente
- [ ] El historial se registró

## 🎉 ¡Listo!

Si completaste todos los pasos, el sistema está funcionando correctamente.

**Próximo paso**: Implementar Fase 2 (Programación Automática)

---

**Documentación completa**: `docs/guides/SISTEMA-REINICIO-CUPOS-FASE1.md`
