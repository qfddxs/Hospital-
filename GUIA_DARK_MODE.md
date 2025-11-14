# Guía de Implementación Dark Mode

## ✅ Configuración Completada

El dark mode ya está configurado en toda la aplicación con:

1. **Tailwind configurado** con `darkMode: 'class'`
2. **ThemeContext** creado para manejar el estado del tema
3. **ThemeToggle** componente para cambiar entre modos
4. **Estilos globales** actualizados con soporte dark mode
5. **Layout principal** (Header, Sidebar, MainLayout) con dark mode

## 🎨 Cómo Usar Dark Mode en tus Componentes

### Clases de Tailwind para Dark Mode

Usa el prefijo `dark:` para aplicar estilos en modo oscuro:

```jsx
// Ejemplo básico
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  Contenido
</div>
```

### Utilidades Disponibles

Importa las clases predefinidas desde `src/utils/darkModeClasses.js`:

```jsx
import { darkModeClasses, cn } from '../utils/darkModeClasses'

// Usar clases predefinidas
<div className={darkModeClasses.card}>
  <h2 className={darkModeClasses.textPrimary}>Título</h2>
  <p className={darkModeClasses.textSecondary}>Descripción</p>
</div>

// Combinar clases
<button className={cn(darkModeClasses.buttonPrimary, 'px-4 py-2 rounded')}>
  Botón
</button>
```

## 📋 Clases Comunes por Elemento

### Contenedores y Cards
```jsx
className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow"
```

### Texto
```jsx
// Título principal
className="text-gray-900 dark:text-gray-100"

// Texto secundario
className="text-gray-600 dark:text-gray-400"

// Texto muted
className="text-gray-500 dark:text-gray-500"
```

### Inputs
```jsx
className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-teal-500 dark:focus:border-teal-400"
```

### Botones
```jsx
// Primario
className="bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white"

// Secundario
className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"

// Peligro
className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
```

### Tablas
```jsx
// Header
className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"

// Fila
className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"

// Borde
className="border-gray-200 dark:border-gray-700"
```

### Badges
```jsx
// Normal
className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"

// Success
className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"

// Warning
className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"

// Danger
className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"

// Info
className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
```

### Modales
```jsx
// Overlay
className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70"

// Modal
className="bg-white dark:bg-gray-800 rounded-lg shadow-xl"
```

## 🔧 Acceder al Estado del Tema

Si necesitas saber si está en dark mode:

```jsx
import { useTheme } from '../context/ThemeContext'

function MiComponente() {
  const { isDarkMode, toggleDarkMode } = useTheme()
  
  return (
    <div>
      <p>Modo actual: {isDarkMode ? 'Oscuro' : 'Claro'}</p>
      <button onClick={toggleDarkMode}>Cambiar tema</button>
    </div>
  )
}
```

## 📝 Ejemplo Completo de Página

```jsx
import { darkModeClasses } from '../utils/darkModeClasses'

function MiPagina() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={darkModeClasses.card + ' p-6 rounded-lg'}>
        <h1 className={darkModeClasses.textPrimary + ' text-2xl font-bold mb-2'}>
          Título de la Página
        </h1>
        <p className={darkModeClasses.textSecondary}>
          Descripción de la página
        </p>
      </div>

      {/* Contenido */}
      <div className={darkModeClasses.card + ' p-6 rounded-lg'}>
        <h2 className={darkModeClasses.textPrimary + ' text-xl font-semibold mb-4'}>
          Sección
        </h2>
        
        {/* Tabla */}
        <table className="w-full">
          <thead className={darkModeClasses.tableHeader}>
            <tr>
              <th className="px-4 py-2">Columna 1</th>
              <th className="px-4 py-2">Columna 2</th>
            </tr>
          </thead>
          <tbody>
            <tr className={darkModeClasses.tableRow}>
              <td className="px-4 py-2">Dato 1</td>
              <td className="px-4 py-2">Dato 2</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <button className={darkModeClasses.buttonPrimary + ' px-4 py-2 rounded'}>
          Acción Principal
        </button>
        <button className={darkModeClasses.buttonSecondary + ' px-4 py-2 rounded'}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
```

## 🎯 Páginas que Necesitan Actualización

Aplica estos estilos a las siguientes páginas:

- ✅ LoginPage.jsx (Ya actualizada)
- [ ] Dashboard.jsx
- [ ] CapacidadFormadora.jsx
- [ ] ControlAsistencia.jsx
- [ ] GestionAlumnos.jsx
- [ ] GestionDocumental.jsx
- [ ] ManageStudents.jsx
- [ ] RegistroCoordinador.jsx
- [ ] Retribuciones.jsx
- [ ] SolicitudCupos.jsx
- [ ] TrainingCenterDashboard.jsx

## 💡 Tips

1. **Transiciones suaves**: Agrega `transition-colors duration-200` para transiciones suaves
2. **Consistencia**: Usa las clases predefinidas de `darkModeClasses.js` para mantener consistencia
3. **Contraste**: Asegúrate de que el texto sea legible en ambos modos
4. **Iconos**: Los iconos también deben tener variantes dark: `text-gray-500 dark:text-gray-400`
5. **Hover states**: No olvides los estados hover en dark mode

## 🚀 Cómo Probar

1. Inicia la aplicación: `npm run dev`
2. Haz clic en el botón de sol/luna en el header
3. Verifica que todos los elementos cambien correctamente
4. El estado se guarda en localStorage automáticamente
