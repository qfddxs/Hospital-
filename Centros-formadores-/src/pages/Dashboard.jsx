import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/UI/ThemeToggle';
import {
  BuildingOffice2Icon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const PortalDashboard = () => {
  const navigate = useNavigate();
  const [centroInfo, setCentroInfo] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudesRotacion, setSolicitudesRotacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Efecto separado para realtime (solo cuando hay cambios en la BD)
  useEffect(() => {
    if (!centroInfo?.centro_formador_id) return;

    // Suscripción a cambios en tiempo real para solicitudes de cupos
    const channelCupos = supabase
      .channel('solicitudes_cupos_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar todos los eventos (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'solicitudes_cupos'
        },
        (payload) => {
          fetchDataSilent();
        }
      )
      .subscribe();

    // Suscripción a cambios en tiempo real para solicitudes de rotación
    const channelRotacion = supabase
      .channel('solicitudes_rotacion_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar todos los eventos (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'solicitudes_rotacion'
        },
        (payload) => {
          fetchDataSilent();
        }
      )
      .subscribe();

    // Cleanup: desuscribirse al desmontar
    return () => {
      supabase.removeChannel(channelCupos);
      supabase.removeChannel(channelRotacion);
    };
  }, [centroInfo?.centro_formador_id]);

  const fetchData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate('/login');
        return;
      }

      // Obtener información del centro
      const { data: centroData, error: centroError } = await supabase
        .from('usuarios_centros')
        .select('*, centro_formador:centros_formadores(*)')
        .eq('user_id', user.id)
        .maybeSingle();

      if (centroError) {
        throw centroError;
      }

      if (!centroData) {
        alert('No se encontró tu centro formador. Por favor contacta al administrador.');
        navigate('/login');
        return;
      }
      setCentroInfo(centroData);

      // Obtener solicitudes de cupos del centro
      const { data: solicitudesData, error: solicitudesError } = await supabase
        .from('solicitudes_cupos')
        .select('*')
        .eq('centro_formador_id', centroData.centro_formador_id)
        .order('created_at', { ascending: false });

      if (solicitudesError) {
        // Error silencioso
      }

      // Obtener solicitudes de rotación del centro
      const { data: solicitudesRotacionData, error: solicitudesRotacionError } = await supabase
        .from('solicitudes_rotacion')
        .select('*')
        .eq('centro_formador_id', centroData.centro_formador_id)
        .order('created_at', { ascending: false });

      if (solicitudesRotacionError) {
        // Error silencioso
      }

      setSolicitudes(solicitudesData || []);
      setSolicitudesRotacion(solicitudesRotacionData || []);
    } catch (err) {
      // Error silencioso
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar datos sin mostrar loading (para polling y realtime)
  const fetchDataSilent = async () => {
    try {
      if (!centroInfo?.centro_formador_id) return;

      // Obtener solicitudes de cupos del centro
      const { data: solicitudesData } = await supabase
        .from('solicitudes_cupos')
        .select('*')
        .eq('centro_formador_id', centroInfo.centro_formador_id)
        .order('created_at', { ascending: false });

      // Obtener solicitudes de rotación del centro
      const { data: solicitudesRotacionData } = await supabase
        .from('solicitudes_rotacion')
        .select('*')
        .eq('centro_formador_id', centroInfo.centro_formador_id)
        .order('created_at', { ascending: false });

      setSolicitudes(solicitudesData || []);
      setSolicitudesRotacion(solicitudesRotacionData || []);
      setUltimaActualizacion(new Date());
    } catch (err) {
      // Error silencioso
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Combinar todas las solicitudes con su tipo
  const todasLasSolicitudes = [
    ...solicitudes.map(s => ({ ...s, tipo: 'cupos' })),
    ...solicitudesRotacion.map(s => ({ ...s, tipo: 'rotacion' }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Variantes de animación para Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <motion.header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="bg-white dark:bg-gray-800 border-b-4 border-teal-500 shadow-sm transition-colors duration-300 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Código del Centro Formador */}
              {centroInfo?.centro_formador?.codigo && (
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-105">
                    <span className="text-white font-bold text-sm tracking-tight">
                      {centroInfo.centro_formador.codigo}
                    </span>
                  </div>
                </div>
              )}

              {/* Separador vertical */}
              {centroInfo?.centro_formador?.codigo && (
                <div className="h-10 w-px bg-gray-300 dark:bg-gray-600"></div>
              )}

              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                <BuildingOffice2Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
                  {centroInfo?.centro_formador?.nombre}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">Portal de Centros Formadores</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Indicador de actualización */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-teal-700 dark:text-teal-300 font-medium">
                  Actualizado {ultimaActualizacion.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              
              {/* Botón de tema */}
              <ThemeToggle />
              
              {/* Botón Salir */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="font-medium">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Principal (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bienvenida */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-6 shadow-lg">
              <h2 className="text-3xl font-bold text-white mb-1">
                Bienvenido(a) al Portal
                {centroInfo?.centro_formador?.contacto_nombre && (
                  <span className="text-teal-100">
                    , {centroInfo.centro_formador.contacto_nombre}
                  </span>
                )}
              </h2>
              <p className="text-teal-50">
                Aquí tienes un resumen de la actividad de tu centro.
              </p>
            </motion.div>

            {/* Actividad Reciente */}
            {todasLasSolicitudes.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300"
              >
                <div className="bg-gradient-to-r from-teal-500 to-emerald-600 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">Actividad Reciente</h3>
                </div>
                <div className="p-6 space-y-3">
                  {todasLasSolicitudes.slice(0, 10).map(solicitud => (
                    <div key={`${solicitud.tipo}-${solicitud.id}`} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-teal-50 dark:from-gray-700/50 dark:to-teal-900/20 rounded-lg hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-600">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            solicitud.tipo === 'cupos' 
                              ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300'
                              : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                          }`}>
                            {solicitud.tipo === 'cupos' ? 'Solicitud de Cupos' : 'Solicitud de Rotación'}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white transition-colors">
                          {solicitud.especialidad}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                          {solicitud.tipo === 'cupos' 
                            ? `${solicitud.numero_cupos} cupos` 
                            : `${new Date(solicitud.fecha_inicio).toLocaleDateString('es-CL')} - ${new Date(solicitud.fecha_termino).toLocaleDateString('es-CL')}`
                          } • {new Date(solicitud.created_at).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors shadow-sm ${
                        solicitud.estado === 'pendiente' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                        solicitud.estado === 'aprobada' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }`}>
                        {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Solicitudes Pendientes y Rechazadas */}
            <div className="space-y-6">
              {/* Solicitudes Pendientes */}
              {solicitudes.filter(s => s.estado === 'pendiente').length > 0 && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-yellow-200 dark:border-yellow-700/50 p-6 transition-colors duration-300"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <ClockIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                      Solicitudes Pendientes ({solicitudes.filter(s => s.estado === 'pendiente').length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {solicitudes.filter(s => s.estado === 'pendiente').slice(0, 5).map(solicitud => (
                      <div key={solicitud.id} className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors duration-300 border border-yellow-200 dark:border-yellow-700/30">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white transition-colors">{solicitud.especialidad}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                            {solicitud.numero_cupos} cupos - {new Date(solicitud.created_at).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 transition-colors">
                          Pendiente
                        </span>
                      </div>
                    ))}
                  </div>
                  {solicitudes.filter(s => s.estado === 'pendiente').length > 5 && (
                    <button
                      onClick={() => navigate('/solicitudes')}
                      className="mt-4 w-full text-center text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 font-medium transition-colors"
                    >
                      Ver todas las pendientes ({solicitudes.filter(s => s.estado === 'pendiente').length})
                    </button>
                  )}
                </motion.div>
              )}

              {/* Solicitudes Rechazadas */}
              {solicitudes.filter(s => s.estado === 'rechazada').length > 0 && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-red-200 dark:border-red-700/50 p-6 transition-colors duration-300"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                      Solicitudes Rechazadas ({solicitudes.filter(s => s.estado === 'rechazada').length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {solicitudes.filter(s => s.estado === 'rechazada').slice(0, 5).map(solicitud => (
                      <div key={solicitud.id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors duration-300 border border-red-200 dark:border-red-700/30">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white transition-colors">{solicitud.especialidad}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                            {solicitud.numero_cupos} cupos - {new Date(solicitud.created_at).toLocaleDateString('es-CL')}
                          </p>
                          {solicitud.motivo_rechazo && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1 italic">
                              Motivo: {solicitud.motivo_rechazo}
                            </p>
                          )}
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 transition-colors">
                          Rechazada
                        </span>
                      </div>
                    ))}
                  </div>
                  {solicitudes.filter(s => s.estado === 'rechazada').length > 5 && (
                    <button
                      onClick={() => navigate('/solicitudes')}
                      className="mt-4 w-full text-center text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
                    >
                      Ver todas las rechazadas ({solicitudes.filter(s => s.estado === 'rechazada').length})
                    </button>
                  )}
                </motion.div>
              )}


            </div>
          </div>

          {/* Barra Lateral (1/3) */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Acciones Rápidas</h3>
              </div>
              <motion.div className="p-4 space-y-2" variants={containerVariants} initial="hidden" animate="visible">
                {[
                  { title: 'Solicitar Cupos', desc: 'Nueva solicitud de cupos clínicos', icon: DocumentTextIcon, path: '/solicitar', gradient: 'from-teal-500 to-teal-600' },
                  { title: 'Solicitud de Rotación', desc: 'Gestiona rotaciones de estudiantes', icon: ClockIcon, path: '/solicitud-rotacion', gradient: 'from-emerald-500 to-emerald-600' },
                  { title: 'Solicitudes de Rotación', desc: 'Ver estado de rotaciones enviadas', icon: CheckCircleIcon, path: '/solicitudes-rotacion', gradient: 'from-cyan-500 to-cyan-600' },
                  { title: 'Seguimiento Estudiantes', desc: 'Asistencia y observaciones en tiempo real', icon: BuildingOffice2Icon, path: '/seguimiento-estudiantes', gradient: 'from-green-500 to-green-600' },
                  { title: 'Gestión Documental', desc: 'Sube certificados y documentos', icon: DocumentTextIcon, path: '/gestion-documental', gradient: 'from-blue-500 to-blue-600' },
                  { title: 'Mis Solicitudes', desc: 'Revisa el estado de tus solicitudes', icon: CheckCircleIcon, path: '/solicitudes', gradient: 'from-amber-500 to-amber-600' },
                ].map((action) => (
                  <motion.div
                    key={action.title}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 dark:hover:from-teal-900/20 dark:hover:to-emerald-900/20 cursor-pointer transition-all border border-transparent hover:border-teal-200 dark:hover:border-teal-700 hover:shadow-md"
                    onClick={() => navigate(action.path)}
                  >
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${action.gradient} shadow-sm`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{action.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{action.desc}</p>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:translate-x-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-all" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default PortalDashboard;
