import { createContext, useContext, useState } from 'react';

const NotificacionesContext = createContext();

export const useNotificaciones = () => {
  const context = useContext(NotificacionesContext);
  if (!context) {
    throw new Error('useNotificaciones debe usarse dentro de NotificacionesProvider');
  }
  return context;
};

export const NotificacionesProvider = ({ children }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [nuevasNotificaciones, setNuevasNotificaciones] = useState(0);

  const agregarNotificacion = (notificacion) => {
    const nuevaNotif = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      leida: false,
      ...notificacion
    };

    setNotificaciones(prev => [nuevaNotif, ...prev]);
    setNuevasNotificaciones(prev => prev + 1);

    return nuevaNotif;
  };

  const marcarComoLeida = (id) => {
    setNotificaciones(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, leida: true } : notif
      )
    );
    setNuevasNotificaciones(prev => Math.max(0, prev - 1));
  };

  const marcarTodasLeidas = () => {
    setNotificaciones(prev =>
      prev.map(notif => ({ ...notif, leida: true }))
    );
    setNuevasNotificaciones(0);
  };

  const eliminarNotificacion = (id) => {
    setNotificaciones(prev => {
      const notif = prev.find(n => n.id === id);
      if (notif && !notif.leida) {
        setNuevasNotificaciones(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  };

  const limpiarNotificaciones = () => {
    setNotificaciones([]);
    setNuevasNotificaciones(0);
  };

  return (
    <NotificacionesContext.Provider
      value={{
        notificaciones,
        nuevasNotificaciones,
        agregarNotificacion,
        marcarComoLeida,
        marcarTodasLeidas,
        eliminarNotificacion,
        limpiarNotificaciones
      }}
    >
      {children}
    </NotificacionesContext.Provider>
  );
};
