import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { BellIcon, XMarkIcon, AcademicCapIcon, CurrencyDollarIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificaciones } from '../context/NotificacionesContext';

const NotificacionesSolicitudes = () => {
  const { notificaciones, nuevasNotificaciones, agregarNotificacion, marcarComoLeida, marcarTodasLeidas, eliminarNotificacion } = useNotificaciones();
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const panelRef = useRef(null);

  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setMostrarPanel(false);
      }
    };

    if (mostrarPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarPanel]);

  useEffect(() => {
    // Suscribirse a cambios en solicitudes_cupos
    const channel = supabase
      .channel('notificaciones_solicitudes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'solicitudes_cupos'
        },
        async (payload) => {
          // Obtener información completa de la solicitud
          const { data: solicitud } = await supabase
            .from('solicitudes_cupos')
            .select(`
              *,
              centro_formador:centros_formadores(
                nombre,
                nivel_formacion
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (solicitud) {
            const nuevaNotificacion = {
              tipo: 'solicitud',
              titulo: `Nueva Solicitud de ${solicitud.centro_formador.nivel_formacion === 'pregrado' ? 'Pregrado' : 'Postgrado'}`,
              mensaje: `${solicitud.centro_formador.nombre} solicita ${solicitud.numero_cupos} cupos para ${solicitud.especialidad}`,
              nivel: solicitud.centro_formador.nivel_formacion,
              icono: 'solicitud'
            };

            agregarNotificacion(nuevaNotificacion);

            // Mostrar notificación toast
            mostrarToast(nuevaNotificacion);

            // Reproducir sonido (opcional)
            reproducirSonido();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const mostrarToast = (notificacion) => {
    // Crear elemento de notificación toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 z-50 animate-slide-in';
    toast.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-l-4 ${
        notificacion.nivel === 'pregrado' 
          ? 'border-blue-500' 
          : 'border-purple-500'
      } p-4 max-w-md">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0">
            <div class="${
              notificacion.nivel === 'pregrado' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-purple-100 text-purple-600'
            } rounded-full p-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900 dark:text-white">${notificacion.titulo}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${notificacion.mensaje}</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(toast);

    // Eliminar después de 5 segundos
    setTimeout(() => {
      toast.classList.add('animate-slide-out');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  };

  const reproducirSonido = () => {
    // Crear un sonido de notificación simple
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const getIconoNotificacion = (notif) => {
    switch (notif.tipo) {
      case 'retribucion_calculada':
        return CurrencyDollarIcon;
      case 'retribucion_eliminada':
        return TrashIcon;
      case 'solicitud':
      default:
        return AcademicCapIcon;
    }
  };

  const getColorNotificacion = (notif) => {
    switch (notif.tipo) {
      case 'retribucion_calculada':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'retribucion_eliminada':
        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'solicitud':
      default:
        return notif.nivel === 'pregrado'
          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
          : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    }
  };

  return (
    <>
      {/* Botón de notificaciones */}
      <div className="relative" ref={panelRef}>
        <button
          onClick={() => setMostrarPanel(!mostrarPanel)}
          className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <BellIcon className="w-6 h-6" />
          {nuevasNotificaciones > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {nuevasNotificaciones > 9 ? '9+' : nuevasNotificaciones}
            </motion.span>
          )}
        </button>

        {/* Panel de notificaciones */}
        <AnimatePresence>
          {mostrarPanel && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Notificaciones
                  {nuevasNotificaciones > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({nuevasNotificaciones} nuevas)
                    </span>
                  )}
                </h3>
                {notificaciones.length > 0 && (
                  <button
                    onClick={marcarTodasLeidas}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>

              {/* Lista de notificaciones */}
              <div className="max-h-96 overflow-y-auto">
                {notificaciones.length === 0 ? (
                  <div className="p-8 text-center">
                    <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay notificaciones
                    </p>
                  </div>
                ) : (
                  notificaciones.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                        !notif.leida ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}
                      onClick={() => marcarComoLeida(notif.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 rounded-full p-2 ${getColorNotificacion(notif)}`}>
                          {(() => {
                            const Icon = getIconoNotificacion(notif);
                            return <Icon className="w-5 h-5" />;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {notif.titulo}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                eliminarNotificacion(notif.id);
                              }}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notif.mensaje}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {notif.timestamp.toLocaleTimeString('es-CL', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Estilos para animaciones */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slide-out {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-slide-out {
          animation: slide-out 0.3s ease-in;
        }
      `}</style>
    </>
  );
};

export default NotificacionesSolicitudes;
