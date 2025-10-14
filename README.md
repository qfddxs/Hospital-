# Sistema Integral de Gestión de Campos Clínicos

Sistema web para la gestión de campos clínicos del Hospital Regional Dr. Franco Ravera Zunino.

## Características

- **Dashboard**: Resumen general con métricas clave, alertas y actividad reciente
- **Capacidad Formadora**: Gestión de centros formadores y sus capacidades
- **Solicitud de Cupos**: Administración de solicitudes de cupos clínicos
- **Gestión de Alumnos**: Control de estudiantes en rotación
- **Control de Asistencia**: Registro y seguimiento de asistencia diaria
- **Retribuciones y Reportes**: Gestión de pagos a centros formadores
- **Gestión Documental**: Sistema de archivos y documentos
- **Reportes Estratégicos**: Indicadores y métricas del sistema

## Tecnologías

- **React 19** - Framework de UI
- **Vite** - Build tool
- **React Router DOM** - Navegación
- **Tailwind CSS 4** - Estilos
- **JavaScript/ES6+**

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

## Estructura del Proyecto

```
src/
├── components/
│   ├── Layout/         # Componentes de estructura (Header, Sidebar, MainLayout)
│   └── UI/             # Componentes reutilizables (Button, Table, StatCard, etc.)
├── pages/              # Páginas principales del sistema
├── data/               # Datos mock para desarrollo
├── App.jsx             # Configuración de rutas
├── main.jsx            # Punto de entrada
└── index.css           # Estilos globales
```

## Datos Mock

El sistema actualmente utiliza datos simulados (`src/data/mockData.js`) que incluyen:
- Estadísticas generales
- Centros formadores
- Estudiantes
- Solicitudes de cupos
- Registros de asistencia
- Retribuciones
- Documentos
- Indicadores estratégicos

## Desarrollo

Para agregar nuevas funcionalidades:

1. Crear los componentes necesarios en `src/components/`
2. Agregar nuevas páginas en `src/pages/`
3. Configurar las rutas en `src/App.jsx`
4. Actualizar los datos mock en `src/data/mockData.js`

## Estado del Proyecto

✅ Interfaz completa implementada
✅ Todas las secciones navegables
✅ Datos mock configurados
✅ Diseño responsive con Tailwind CSS
⏳ Pendiente: Integración con backend real
⏳ Pendiente: Autenticación de usuarios
⏳ Pendiente: Exportación real de reportes

## Licencia

Proyecto privado - Hospital Regional
