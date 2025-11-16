# 🔔 Sistema de Notificaciones en Tiempo Real

## ✅ Implementado

He creado un sistema completo de notificaciones para el hospital que detecta nuevas solicitudes de cupos en tiempo real.

## 🎯 Características

### 1. **Notificaciones en Tiempo Real**
- Detecta automáticamente cuando llega una nueva solicitud
- Usa Supabase Realtime para actualizaciones instantáneas
- No requiere recargar la página

### 2. **Diferenciación por Nivel**
- **Pregrado**: Badge azul 🔵
- **Postgrado**: Badge morado 🟣

### 3. **Toast Notifications**
- Aparecen automáticamente en la esquina superior derecha
- Se muestran por 5 segundos
- Animación suave de entrada y salida

### 4. **Panel de Notificaciones**
- Icono de campana en el header
- Badge con contador de notificaciones nuevas
- Panel desplegable con historial
- Marcar como leídas individualmente o todas

### 5. **Sonido de Notificación**
- Sonido sutil cuando llega una nueva solicitud
- Generado con Web Audio API

## 📊 Información Mostrada

Cada notificación incluye:
- **Título**: "Nueva Solicitud de Pregrado/Postgrado"
- **Centro Formador**: Nombre de la institución
- **Detalles**: Número de cupos y especialidad
- **Hora**: Timestamp de la solicitud
- **Estado**: Leída/No leída

## 🎨 Diseño

### Colores por Nivel:
- **Pregrado**: 
  - Border: `border-blue-500`
  - Background: `bg-blue-100`
  - Text: `text-blue-600`

- **Postgrado**:
  - Border: `border-purple-500`
  - Background: `bg-purple-100`
  - Text: `text-purple-600`

### Animaciones:
- Entrada: Slide desde la derecha
- Salida: Slide hacia la derecha
- Panel: Fade + Scale
- Badge: Scale bounce

## 🔧 Componentes

### `NotificacionesSolicitudes.jsx`
- Componente principal de notificaciones
- Maneja suscripción a Realtime
- Gestiona estado de notificaciones
- Renderiza panel y toasts

### `Header.jsx`
- Integra el componente de notificaciones
- Posicionado entre tabs y theme toggle

## 📝 Uso

### Para el Usuario:
1. **Ver notificaciones**: Click en el icono de campana
2. **Marcar como leída**: Click en la notificación
3. **Eliminar**: Click en la X
4. **Marcar todas**: Click en "Marcar todas como leídas"

### Flujo Completo:
1. Centro formador envía solicitud
2. Hospital recibe notificación instantánea
3. Toast aparece automáticamente
4. Sonido de alerta
5. Badge muestra contador
6. Usuario puede revisar en el panel

## 🎯 Ventajas

✅ **Tiempo Real**: Sin necesidad de recargar
✅ **Visual**: Diferenciación clara por nivel
✅ **No Intrusivo**: Toasts desaparecen automáticamente
✅ **Historial**: Panel con todas las notificaciones
✅ **Accesible**: Sonido + visual
✅ **Responsive**: Funciona en móvil y desktop

## 🔄 Próximas Mejoras (Opcionales)

- Filtrar notificaciones por nivel (pregrado/postgrado)
- Persistir notificaciones en localStorage
- Agregar más tipos de notificaciones (aprobadas, rechazadas)
- Configuración de sonido on/off
- Notificaciones push del navegador
