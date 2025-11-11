# Implementación de Filtro Pregrado/Postgrado

## 📋 Resumen

Se ha implementado un sistema de filtrado por nivel de formación (Pregrado/Postgrado) que afecta a todo el sistema, especialmente a la gestión de Capacidad Formadora.

## 🎯 Funcionalidades

### Switch en el Header
- Botones de alternancia entre Pregrado y Postgrado
- El estado se guarda en localStorage
- Afecta a todas las páginas del sistema

### Filtrado en Capacidad Formadora
- Los centros formadores se filtran automáticamente según el nivel seleccionado
- Cada centro tiene un campo `nivel_formacion` que puede ser:
  - `pregrado` - Solo aparece en vista de pregrado
  - `postgrado` - Solo aparece en vista de postgrado
  - `ambos` - Aparece en ambas vistas

## 🗄️ Cambios en Base de Datos

### Nuevo Campo
```sql
ALTER TABLE centros_formadores
ADD COLUMN nivel_formacion VARCHAR(20) DEFAULT 'pregrado'
CHECK (nivel_formacion IN ('pregrado', 'postgrado', 'ambos'));
```

### Script de Migración
Ejecutar: `supabase/add-nivel-formacion.sql`

Este script:
1. Agrega el campo `nivel_formacion`
2. Actualiza los centros existentes según la imagen de referencia
3. Crea índice para optimizar búsquedas

## 📁 Archivos Creados/Modificados

### Nuevos Archivos
1. **`src/context/NivelFormacionContext.jsx`**
   - Contexto global para manejar el nivel de formación
   - Guarda el estado en localStorage
   - Proporciona funciones para cambiar el nivel

2. **`supabase/add-nivel-formacion.sql`**
   - Script de migración para agregar el campo
   - Actualiza centros existentes

3. **`docs/guides/IMPLEMENTACION_PREGRADO_POSTGRADO.md`**
   - Esta documentación

### Archivos Modificados
1. **`src/main.jsx`**
   - Agregado `NivelFormacionProvider`

2. **`src/components/Layout/Header.jsx`**
   - Agregado switch Pregrado/Postgrado
   - Conectado al contexto

3. **`src/pages/Dashboard.jsx`**
   - Muestra el nivel actual en el título

4. **`src/pages/CapacidadFormadora.jsx`**
   - Filtra centros por nivel de formación
   - Agrega campo nivel_formacion en formularios
   - Actualiza queries a Supabase

## 🚀 Uso

### Para Usuarios
1. En el header, hacer clic en "Pregrado" o "Postgrado"
2. El sistema filtrará automáticamente los centros formadores
3. La selección se mantiene al navegar entre páginas

### Para Desarrolladores

#### Usar el contexto en un componente:
```jsx
import { useNivelFormacion } from '../context/NivelFormacionContext';

function MiComponente() {
  const { nivelFormacion, setNivelFormacion, toggleNivel } = useNivelFormacion();
  
  // nivelFormacion: 'pregrado' o 'postgrado'
  // setNivelFormacion(nivel): cambiar el nivel
  // toggleNivel(): alternar entre pregrado y postgrado
  
  return (
    <div>
      Nivel actual: {nivelFormacion}
    </div>
  );
}
```

#### Filtrar datos por nivel:
```jsx
// En Supabase
const { data } = await supabase
  .from('centros_formadores')
  .select('*')
  .or(`nivel_formacion.eq.${nivelFormacion},nivel_formacion.eq.ambos`);
```

## 📊 Centros por Nivel

### PREGRADO

1. **Instituto Profesional INACAP**
   - Técnico de Nivel Superior en Enfermería
   - Enfermería (Universidad Tecnológica de Chile INACAP)

2. **Universidad Bernardo O'Higgins**
   - Enfermería, Fonoaudiología, Kinesiología, Nutrición
   - Obstetricia, Química y Farmacia, Tecnología Médica, Terapia Ocupacional

3. **Universidad de Talca**
   - Kinesiología, Nutrición, Tecnología Médica

4. **Universidad Diego Portales (UDP)**
   - Enfermería, Medicina, Obstetricia, Odontología, Tecnología Médica

5. **Instituto Profesional IPCHILE**
   - Técnico de Nivel Superior en Enfermería

6. **Universidad Católica del Maule (UCM)**
   - Enfermería, Nutrición

7. **Universidad de Tarapacá**
   - Obstetricia, Tecnología Médica

8. **Universidad San Sebastián**
   - Enfermería, Medicina, Nutrición, Obstetricia
   - Odontología, Química y Farmacia, Tecnología Médica

9. **Instituto Profesional Santo Tomás**
   - Técnico de Nivel Superior en Enfermería
   - Enfermería, Podología

10. **Universidad de O'Higgins**
    - Enfermería, Nutrición, Kinesiología
    - Medicina, Tecnología Médica, Terapia Ocupacional

11. **Universidad de Valparaíso**
    - Obstetricia, Odontología, Tecnología Médica

12. **Universidad Andrés Bello**
    - Obstetricia

### POSTGRADO

1. **Universidad Andrés Bello (UNAB)**
   - Postgrado: Odontología

2. **Universidad de O'Higgins**
   - Postgrado: Medicina

3. **Universidad del Desarrollo (UDD)**
   - Postgrado: Odontología

4. **Universidad Católica del Maule (UCM)**
   - Postgrado: Enfermería en Cuidados Críticos

5. **Universidad de Santiago de Chile (USACH)**
   - Postgrado: Medicina

6. **Universidad Diego Portales (UDP)**
   - Postgrado: Medicina

## 🔄 Migración de Datos Existentes

Si ya tienes centros formadores en la base de datos:

1. Ejecuta el script de migración:
```bash
psql -f supabase/add-nivel-formacion.sql
```

2. Verifica que los centros se hayan actualizado correctamente:
```sql
SELECT nombre, nivel_formacion FROM centros_formadores ORDER BY nivel_formacion, nombre;
```

3. Ajusta manualmente si es necesario:
```sql
UPDATE centros_formadores 
SET nivel_formacion = 'postgrado' 
WHERE nombre ILIKE '%Post Grado%';
```

## 🎨 Interfaz

### Header
- Switch con dos botones: "Pregrado" y "Postgrado"
- El botón activo tiene fondo teal
- Transiciones suaves al cambiar

### Capacidad Formadora
- Filtrado automático al cambiar el nivel
- Campo "Nivel de Formación" en formularios de agregar/editar
- Opciones: Pregrado, Postgrado, Ambos

## 📝 Notas Importantes

1. **Persistencia**: El nivel seleccionado se guarda en localStorage y persiste entre sesiones

2. **Filtrado Automático**: Al cambiar el nivel, se recargan automáticamente los datos

3. **Centros "Ambos"**: Los centros marcados como "ambos" aparecen en ambas vistas

4. **Importación Masiva**: Al importar centros desde CSV, se asigna el nivel actual por defecto

5. **Compatibilidad**: Los centros sin nivel_formacion se tratan como "pregrado" por defecto

## 🐛 Solución de Problemas

### Los centros no se filtran
- Verifica que el campo `nivel_formacion` exista en la tabla
- Ejecuta el script de migración
- Verifica que los centros tengan un valor válido

### El switch no funciona
- Verifica que el `NivelFormacionProvider` esté en `main.jsx`
- Revisa la consola del navegador por errores
- Limpia el localStorage si es necesario

### Centros duplicados
- Verifica que no haya centros con el mismo nombre pero diferentes niveles
- Usa el campo `codigo` para diferenciarlos

## 🔮 Futuras Mejoras

- [ ] Agregar filtro por nivel en más páginas (Alumnos, Rotaciones, etc.)
- [ ] Estadísticas separadas por nivel en el Dashboard
- [ ] Reportes específicos por nivel de formación
- [ ] Configuración de permisos por nivel

---

**Fecha de implementación:** Noviembre 2025  
**Versión:** 1.0
