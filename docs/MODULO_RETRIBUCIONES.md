# 📊 Módulo de Retribuciones y Reportes

## 🎯 Descripción

Módulo completo para la gestión de retribuciones a centros formadores por el uso de campos clínicos del hospital, basado en la modalidad oficial del Hospital Regional.

## 📋 Características Implementadas

### ✅ Funcionalidades Principales

1. **Cálculo Automático de Retribuciones**
   - Basado en rotaciones completadas
   - Fórmula según documento oficial del hospital
   - Agrupación por centro formador
   - Cálculo por semestre

2. **Gestión de Pagos**
   - Estados: Pendiente, Pagada, Rechazada
   - Registro de fecha de pago
   - Historial completo de transacciones

3. **Reportes Detallados**
   - Vista detallada por retribución
   - Desglose de cada rotación
   - Exportación a CSV
   - Información completa del cálculo

4. **Estadísticas en Tiempo Real**
   - Total de retribuciones
   - Montos pendientes y pagados
   - Cantidad de pagos por estado
   - Visualización clara de métricas

5. **Filtros y Búsqueda**
   - Filtro por estado (todas, pendiente, pagada)
   - Filtro por semestre
   - Filtro por nivel de formación (pregrado/postgrado)

## 💰 Modalidad de Cálculo

Según el documento oficial del hospital:

### Fórmula de Cálculo

```
1. Cantidad de Días = (Fecha Término - Fecha Inicio) + 1

2. Cantidad de Meses = Cantidad de Días / 30

3. Valor UF:
   - Semestre 1 (enero-junio): $36.028,10 (valor al 30 de junio)
   - Semestre 2 (julio-diciembre): $36.028,10 (valor al 31 de diciembre)

4. Factor de Cobro = 4,5 UF

5. Valor por Cupo = Cantidad de Meses × Valor UF × Factor de Cobro

6. Monto Total = Cupos Diarios × Valor por Cupo
```

### Ejemplo de Cálculo

**Rotación de 26 días:**
- Cantidad de Días: 26
- Cantidad de Meses: 26/30 = 0,87
- Valor UF: $36.028,10
- Factor de Cobro: 4,5
- Valor por Cupo: 0,87 × $36.028,10 × 4,5 = $140.510
- Monto Total (1 cupo): $140.510

**Rotación de 215 días:**
- Cantidad de Días: 215
- Cantidad de Meses: 215/30 = 7,17
- Valor por Cupo: 7,17 × $36.028,10 × 4,5 = $1.161.906
- Monto Total (1 cupo): $1.161.906

## 🗄️ Estructura de Base de Datos

### Tabla: `retribuciones`

```sql
- id: UUID (PK)
- centro_formador_id: UUID (FK)
- periodo: VARCHAR(10) -- "2024-1" o "2024-2"
- fecha_calculo: TIMESTAMP
- fecha_pago: TIMESTAMP
- cantidad_rotaciones: INTEGER
- monto_total: DECIMAL(12,2)
- estado: VARCHAR(20) -- pendiente, pagada, rechazada
- detalles: JSONB -- Detalle de cada rotación
- observaciones: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Campo Adicional en `rotaciones`

```sql
- retribucion_id: UUID (FK) -- Referencia a la retribución
```

## 🚀 Instalación

### 1. Ejecutar Migración de Base de Datos

```bash
# Ejecutar el script SQL en Supabase
supabase/migrations/crear-tabla-retribuciones.sql
```

O desde el panel de Supabase:
1. Ir a SQL Editor
2. Copiar y pegar el contenido del archivo
3. Ejecutar

### 2. Verificar Permisos RLS

Asegúrate de que las políticas RLS estén habilitadas para usuarios autenticados.

## 📖 Uso del Módulo

### Calcular Retribuciones

1. Ir a **Retribuciones** en el menú lateral
2. Hacer clic en **"Calcular Retribuciones"**
3. El sistema:
   - Busca todas las rotaciones completadas sin retribución
   - Agrupa por centro formador
   - Calcula el monto según la fórmula oficial
   - Crea registros de retribución pendientes

### Ver Detalle de una Retribución

1. Hacer clic en el ícono de ojo (👁️) en la tabla
2. Se muestra:
   - Información general del pago
   - Desglose de cada rotación incluida
   - Cálculo detallado por rotación
   - Monto total

### Marcar como Pagada

1. Hacer clic en el ícono de check (✓) en retribuciones pendientes
2. Confirmar la acción
3. Se registra la fecha de pago automáticamente

### Exportar Reporte

1. Hacer clic en el ícono de descarga (⬇️)
2. Se genera un archivo CSV con:
   - Detalle de todas las rotaciones
   - Cálculos completos
   - Formato compatible con Excel

## 📊 Estadísticas Disponibles

### Panel Principal

- **Total Retribuciones**: Cantidad total de registros
- **Pendientes**: Cantidad y monto de pagos pendientes
- **Pagadas**: Cantidad y monto de pagos realizados
- **Monto Total**: Suma total de todas las retribuciones

### Filtros

- **Por Estado**: Todas, Pendiente, Pagada
- **Por Semestre**: Actual, Anterior, Todos
- **Por Nivel**: Pregrado, Postgrado (automático según contexto)

## 🎨 Interfaz

### Características de UI

- ✅ **Dark Mode Completo**: Soporte total para modo oscuro
- ✅ **Responsive**: Adaptado a todos los tamaños de pantalla
- ✅ **Iconos Intuitivos**: Heroicons para todas las acciones
- ✅ **Colores Semánticos**: 
  - Amarillo: Pendiente
  - Verde: Pagada
  - Rojo: Rechazada
  - Teal: Montos y acciones principales

### Componentes Utilizados

- `Table`: Tabla con ordenamiento y paginación
- `Modal`: Ventanas modales para detalles
- `Button`: Botones con variantes
- Estadísticas con iconos
- Filtros interactivos

## 📝 Formato de Exportación CSV

```csv
Cupos Diarios,Fecha Inicio,Fecha Término,Cantidad de Días,Cantidad de Meses,Fecha UF,Valor UF,Factor de Cobro (Uf),Valor por Cupo en $,Monto Total en $
1,02-10-2023,27-10-2023,26,0.87,09-08-2023,36028.10,4.5,140510,140510
1,20-03-2023,20-10-2023,215,7.17,09-08-2023,36028.10,4.5,1161906,1161906
```

## 🔐 Seguridad

- ✅ Row Level Security (RLS) habilitado
- ✅ Solo usuarios autenticados pueden acceder
- ✅ Políticas de lectura, escritura y actualización
- ✅ Validación de datos en frontend y backend

## 🔄 Flujo de Trabajo

```
1. Rotaciones Completadas
   ↓
2. Calcular Retribuciones (Manual)
   ↓
3. Revisión de Montos
   ↓
4. Exportar Reportes
   ↓
5. Realizar Pago
   ↓
6. Marcar como Pagada
   ↓
7. Historial Completo
```

## 📌 Notas Importantes

1. **Valores UF**: Los valores están configurados según el documento oficial. Actualizar si cambian.

2. **Factor de Cobro**: Actualmente 4,5 UF según convenio.

3. **Períodos**: Se calculan por semestre (1 o 2).

4. **Rotaciones**: Solo se incluyen rotaciones con estado "completada".

5. **Agrupación**: Las retribuciones se agrupan por centro formador y período.

## 🛠️ Mantenimiento

### Actualizar Valores UF

Editar en `src/pages/Retribuciones.jsx`:

```javascript
const VALOR_UF_SEMESTRE_1 = 36028.10; // Actualizar según fecha
const VALOR_UF_SEMESTRE_2 = 36028.10; // Actualizar según fecha
const FACTOR_COBRO_UF = 4.5; // Actualizar según convenio
```

### Agregar Nuevos Estados

1. Agregar en la base de datos
2. Actualizar el objeto `estados` en el componente
3. Agregar filtro si es necesario

## 📞 Soporte

Para dudas o problemas:
1. Revisar este documento
2. Verificar logs en consola del navegador
3. Revisar logs de Supabase
4. Contactar al equipo de desarrollo

---

**Versión**: 1.0.0  
**Fecha**: Noviembre 2024  
**Estado**: ✅ Producción
