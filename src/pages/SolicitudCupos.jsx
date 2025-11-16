import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import Loader from '../components/Loader';
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
        alert('No se encontró la solicitud');
        return;
      }

      // Obtener el centro formador actual
      const { data: centroData, error: centroError } = await supabase
        .from('centros_formadores')
        .select('capacidad_total, capacidad_disponible')
        .eq('id', solicitud.centro_formador_id)
        .single();

      if (centroError) throw centroError;

      // Verificar que hay cupos disponibles
      if (centroData.capacidad_disponible < solicitud.numero_cupos) {
        alert(`No hay suficientes cupos disponibles. Disponibles: ${centroData.capacidad_disponible}, Solicitados: ${solicitud.numero_cupos}`);
        return;
      }

      // Actualizar la solicitud a aprobada
      const { error: updateError } = await supabase
        .from('solicitudes_cupos')
        .update({ 
          estado: 'aprobada'
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Actualizar la capacidad disponible del centro
      const nuevaCapacidadDisponible = centroData.capacidad_disponible - solicitud.numero_cupos;
      const { error: capacidadError } = await supabase
        .from('centros_formadores')
        .update({ 
          capacidad_disponible: nuevaCapacidadDisponible
        })
        .eq('id', solicitud.centro_formador_id);

      if (capacidadError) throw capacidadError;

      fetchSolicitudes();
      alert(`Solicitud aprobada exitosamente. Cupos disponibles actualizados: ${nuevaCapacidadDisponible}`);
    } catch (err) {
      console.error('Error:', err);
      alert('Error al aprobar solicitud: ' + err.message);
    }
  };

  const handleRechazar = async (id) => {
    const motivo = prompt('Ingresa el motivo del rechazo:');
    if (!motivo) return;

    try {
      const { error } = await supabase
        .from('solicitudes_cupos')
        .update({ 
          estado: 'rechazada',
          motivo_rechazo: motivo
        })
        .eq('id', id);

      if (error) throw error;
      
      fetchSolicitudes();
      alert('Solicitud rechazada');
    } catch (err) {
      console.error('Error:', err);
      alert('Error al rechazar solicitud: ' + err.message);
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Solicitud de Cupos - {nivelFormacion === 'pregrado' ? 'Pregrado' : 'Postgrado'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestiona las solicitudes de cupos clínicos de los centros formadores
          <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <span className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></span>
            Actualización en tiempo real
          </span>
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Solicitudes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{estadisticas.total}</p>
            </div>
            <BuildingOffice2Icon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{estadisticas.pendientes}</p>
            </div>
            <ClockIcon className="w-12 h-12 text-yellow-400 dark:text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Aprobadas</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{estadisticas.aprobadas}</p>
            </div>
            <CheckCircleIcon className="w-12 h-12 text-green-400 dark:text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rechazadas</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{estadisticas.rechazadas}</p>
            </div>
            <XCircleIcon className="w-12 h-12 text-red-400 dark:text-red-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por estado:</span>
          </div>
          <div className="flex gap-2">
            {[
              { key: 'todas', label: 'Todas', count: estadisticas.total },
              { key: 'pendiente', label: 'Pendientes', count: estadisticas.pendientes },
              { key: 'aprobada', label: 'Aprobadas', count: estadisticas.aprobadas },
              { key: 'rechazada', label: 'Rechazadas', count: estadisticas.rechazadas }
            ].map(filtro => (
              <button
                key={filtro.key}
                onClick={() => setFiltroEstado(filtro.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroEstado === filtro.key
                    ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-700'
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
              <div key={solicitud.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                        <BuildingOffice2Icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {solicitud.centro_formador?.nombre}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {solicitud.centro_formador?.codigo} • {solicitud.centro_formador?.contacto_nombre}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                        getEstadoColor(solicitud.estado)
                      }`}>
                        {getEstadoIcon(solicitud.estado)}
                        {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                      </span>
                    </div>

                    {/* Detalles */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <AcademicCapIcon className="w-4 h-4" />
                        <span><strong>Especialidad:</strong> {solicitud.especialidad}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <UserGroupIcon className="w-4 h-4" />
                        <span><strong>Cupos:</strong> {solicitud.numero_cupos}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span><strong>Período:</strong> {formatearFecha(solicitud.fecha_inicio)} - {formatearFecha(solicitud.fecha_termino)}</span>
                      </div>
                    </div>

                    {/* Comentarios */}
                    {solicitud.comentarios && (
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
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
  );
};

export default SolicitudCupos;
