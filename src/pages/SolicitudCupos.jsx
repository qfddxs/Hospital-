import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import Loader from '../components/Loader';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import './Dashboard.css';
import {
  BuildingOffice2Icon,
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { useNivelFormacion } from '../context/NivelFormacionContext';

const SolicitudCupos = () => {
  const { nivelFormacion } = useNivelFormacion();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const { toasts, removeToast, success, error, warning } = useToast();

  const fetchSolicitudes = useCallback(async () => {
    try {
      setLoading(true);
      
      // Obtener solicitudes con información del centro formador
      const { data, error } = await supabase
        .from('solicitudes_cupos')
        .select(`
          *,
          centro_formador:centros_formadores(
            nombre,
            codigo,
            nivel_formacion,
            contacto_nombre,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filtrar por nivel de formación
      const solicitudesFiltradas = data.filter(
        sol => sol.centro_formador?.nivel_formacion === nivelFormacion
      );

      setSolicitudes(solicitudesFiltradas);
    } catch (err) {
      console.error('Error cargando solicitudes:', err);
    } finally {
      setLoading(false);
    }
  }, [nivelFormacion]);

  useEffect(() => {
    fetchSolicitudes();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('solicitudes_cupos_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'solicitudes_cupos'
        },
        (payload) => {
          // Recargar solicitudes cuando hay cambios
          fetchSolicitudes();
        }
      )
      .subscribe();

    // Cleanup: desuscribirse al desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSolicitudes]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aprobada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazada':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <ClockIcon className="w-5 h-5" />;
      case 'aprobada':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'rechazada':
        return <XCircleIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    // Agregar 'T00:00:00' para forzar interpretación local
    const fechaLocal = fecha.includes('T') ? new Date(fecha) : new Date(fecha + 'T00:00:00');
    return fechaLocal.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAprobar = async (id) => {
    try {
      // Obtener la solicitud para saber cuántos cupos y de qué centro
      const solicitud = solicitudes.find(s => s.id === id);
      if (!solicitud) {
        error('No se encontró la solicitud');
        return;
      }

      // Validar cupos disponibles usando la función SQL
      const { data: validacion, error: validacionError } = await supabase
        .rpc('validar_cupos_disponibles', {
          p_centro_id: solicitud.centro_formador_id,
          p_cupos_solicitados: solicitud.numero_cupos
        });

      if (validacionError) throw validacionError;

      // Verificar si hay cupos suficientes
      if (!validacion.valido) {
        warning(
          `⚠️ No hay suficientes cupos disponibles\n\n` +
          `Centro: ${validacion.centro_nombre}\n` +
          `Disponibles: ${validacion.capacidad_disponible}\n` +
          `Solicitados: ${validacion.cupos_solicitados}\n` +
          `Faltan: ${validacion.cupos_faltantes} cupos`
        );
        return;
      }

      // Aprobar solicitud (el trigger se encarga del descuento automático)
      const { error: updateError } = await supabase
        .from('solicitudes_cupos')
        .update({ estado: 'aprobada' })
        .eq('id', id);

      if (updateError) throw updateError;

      // Obtener capacidad actualizada para mostrar en el mensaje
      const { data: centroActualizado } = await supabase
        .from('centros_formadores')
        .select('capacidad_disponible')
        .eq('id', solicitud.centro_formador_id)
        .single();

      fetchSolicitudes();
      success(
        `✅ Solicitud aprobada exitosamente\n\n` +
        `${solicitud.numero_cupos} cupos asignados a ${solicitud.centro_formador?.nombre}\n` +
        `Cupos disponibles ahora: ${centroActualizado?.capacidad_disponible || 0}`
      );
    } catch (err) {
      console.error('Error:', err);
      error('❌ Error al aprobar solicitud: ' + err.message);
    }
  };

  const handleRechazar = async (id) => {
    const motivo = prompt('Ingresa el motivo del rechazo:');
    if (!motivo) return;

    try {
      const solicitud = solicitudes.find(s => s.id === id);
      
      const { error: rechazarError } = await supabase
        .from('solicitudes_cupos')
        .update({ 
          estado: 'rechazada',
          motivo_rechazo: motivo
        })
        .eq('id', id);

      if (rechazarError) throw rechazarError;
      
      fetchSolicitudes();
      warning(`⚠️ Solicitud de ${solicitud?.centro_formador?.nombre} rechazada`);
    } catch (err) {
      console.error('Error:', err);
      error('❌ Error al rechazar solicitud: ' + err.message);
    }
  };

  const solicitudesFiltradas = solicitudes.filter(solicitud => {
    if (filtroEstado === 'todas') return true;
    return solicitud.estado === filtroEstado;
  });

  const estadisticas = {
    total: solicitudes.length,
    pendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
    aprobadas: solicitudes.filter(s => s.estado === 'aprobada').length,
    rechazadas: solicitudes.filter(s => s.estado === 'rechazada').length
  };

  if (loading) {
    return <Loader message="Cargando solicitudes..." />;
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6">
        {/* Header */}
        <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                Solicitud de Cupos - {nivelFormacion === 'pregrado' ? 'Pregrado' : 'Postgrado'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                Gestiona las solicitudes de cupos clínicos de los centros formadores
                <span className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400">
                  <span className="w-2 h-2 bg-sky-500 dark:bg-sky-400 rounded-full animate-pulse"></span>
                  Actualización en tiempo real
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
              <AcademicCapIcon className="w-8 h-8" />
            </div>
          </div>
        </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card-medical" style={{ cursor: 'default' }}>
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="icon-badge-medical">
              <BuildingOffice2Icon style={{ width: '2rem', height: '2rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
                Total Solicitudes
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: '0.25rem 0 0 0' }}>
                {estadisticas.total}
              </p>
            </div>
          </div>
        </div>

        <div className="summary-item-pending" style={{ cursor: 'default', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="icon-badge-yellow">
              <ClockIcon style={{ width: '2rem', height: '2rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#92400e', margin: 0 }}>
                Pendientes
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#b45309', margin: '0.25rem 0 0 0' }}>
                {estadisticas.pendientes}
              </p>
            </div>
          </div>
        </div>

        <div className="summary-item-approved" style={{ cursor: 'default', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="icon-badge-health">
              <CheckCircleIcon style={{ width: '2rem', height: '2rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#064e3b', margin: 0 }}>
                Aprobadas
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0d9488', margin: '0.25rem 0 0 0' }}>
                {estadisticas.aprobadas}
              </p>
            </div>
          </div>
        </div>

        <div className="summary-item-rejected" style={{ cursor: 'default', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="icon-badge-red">
              <XCircleIcon style={{ width: '2rem', height: '2rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#7f1d1d', margin: 0 }}>
                Rechazadas
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626', margin: '0.25rem 0 0 0' }}>
                {estadisticas.rechazadas}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-sky-100 dark:border-gray-700 p-6 transition-colors">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-sky-500 dark:text-sky-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por estado:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'todas', label: 'Todas', count: estadisticas.total },
              { key: 'pendiente', label: 'Pendientes', count: estadisticas.pendientes },
              { key: 'aprobada', label: 'Aprobadas', count: estadisticas.aprobadas },
              { key: 'rechazada', label: 'Rechazadas', count: estadisticas.rechazadas }
            ].map(filtro => (
              <button
                key={filtro.key}
                onClick={() => setFiltroEstado(filtro.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filtroEstado === filtro.key
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filtro.label} ({filtro.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Solicitudes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        {solicitudesFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <BuildingOffice2Icon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No hay solicitudes {filtroEstado !== 'todas' ? filtroEstado + 's' : ''}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filtroEstado === 'todas' 
                ? 'Aún no hay solicitudes de cupos de centros formadores'
                : 'Cambia el filtro para ver otras solicitudes'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {solicitudesFiltradas.map((solicitud) => (
              <div key={solicitud.id} className="p-6 hover:bg-gradient-to-r hover:from-sky-50/50 hover:to-mint-50/50 dark:hover:bg-gray-700/50 transition-all duration-200 border-l-4 border-transparent hover:border-sky-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div style={{ 
                        width: '3rem', 
                        height: '3rem', 
                        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(20, 184, 166, 0.15) 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(14, 165, 233, 0.2)'
                      }}>
                        <BuildingOffice2Icon style={{ width: '1.5rem', height: '1.5rem', color: '#0ea5e9' }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {solicitud.centro_formador?.nombre}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{solicitud.centro_formador?.codigo}</span>
                          {solicitud.centro_formador?.contacto_nombre && <> • {solicitud.centro_formador?.contacto_nombre}</>}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${
                        getEstadoColor(solicitud.estado)
                      }`}>
                        {getEstadoIcon(solicitud.estado)}
                        {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                      </span>
                    </div>

                    {/* Detalles */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(167, 139, 250, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(167, 139, 250, 0.2)'
                      }}>
                        <AcademicCapIcon style={{ width: '1rem', height: '1rem', color: '#a78bfa', flexShrink: 0 }} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          <strong style={{ color: '#a78bfa' }}>Especialidad:</strong> {solicitud.especialidad}
                        </span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(20, 184, 166, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(20, 184, 166, 0.2)'
                      }}>
                        <UserGroupIcon style={{ width: '1rem', height: '1rem', color: '#14b8a6', flexShrink: 0 }} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          <strong style={{ color: '#14b8a6' }}>Cupos:</strong> {solicitud.numero_cupos}
                        </span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(14, 165, 233, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(14, 165, 233, 0.2)'
                      }}>
                        <CalendarDaysIcon style={{ width: '1rem', height: '1rem', color: '#0ea5e9', flexShrink: 0 }} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          <strong style={{ color: '#0ea5e9' }}>Período:</strong> {formatearFecha(solicitud.fecha_inicio)} - {formatearFecha(solicitud.fecha_termino)}
                        </span>
                      </div>
                    </div>

                    {/* Comentarios */}
                    {solicitud.comentarios && (
                      <div className="mb-3 p-3 bg-gradient-to-r from-sky-50 to-mint-50 dark:from-sky-900/20 dark:to-mint-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Comentarios:</strong> {solicitud.comentarios}
                        </p>
                      </div>
                    )}

                    {/* Motivo de rechazo */}
                    {solicitud.motivo_rechazo && (
                      <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-300">
                          <strong>Motivo de rechazo:</strong> {solicitud.motivo_rechazo}
                        </p>
                      </div>
                    )}

                    {/* Información adicional */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Solicitado el {formatearFecha(solicitud.created_at)}</span>
                      {solicitud.centro_formador?.contacto_nombre && <span>Por: {solicitud.centro_formador.contacto_nombre}</span>}
                    </div>
                  </div>

                  {/* Acciones */}
                  {solicitud.estado === 'pendiente' && (
                    <div className="ml-6 flex flex-col gap-2">
                      <button
                        onClick={() => handleAprobar(solicitud.id)}
                        className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm font-medium"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleRechazar(solicitud.id)}
                        className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors text-sm font-medium"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default SolicitudCupos;
