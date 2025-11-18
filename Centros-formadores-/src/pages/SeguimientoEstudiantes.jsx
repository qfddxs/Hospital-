import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import HeaderCentroFormador from '../components/UI/HeaderCentroFormador';
import Button from '../components/UI/Button';
import { esFeriado, esDomingo, esSabado } from '../utils/feriadosChile';
import {
  AcademicCapIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserGroupIcon,
  ChartBarIcon,
  BellAlertIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const SeguimientoEstudiantes = () => {
  const navigate = useNavigate();
  const [centroInfo, setCentroInfo] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [observaciones, setObservaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesActual, setMesActual] = useState(new Date());
  const [estadisticas, setEstadisticas] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [observacionesAbiertas, setObservacionesAbiertas] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (estudianteSeleccionado) {
      fetchAsistencias();
      fetchObservaciones();
      calcularEstadisticas();
    }
  }, [estudianteSeleccionado, mesActual]);

  // Realtime para asistencias
  useEffect(() => {
    if (!estudianteSeleccionado) return;

    const asistenciasChannel = supabase
      .channel('asistencias_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'asistencias',
          filter: `alumno_id=eq.${estudianteSeleccionado.id}`
        },
        (payload) => {
          console.log('🔔 Cambio en asistencias:', payload);
          fetchAsistencias();
          calcularEstadisticas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(asistenciasChannel);
    };
  }, [estudianteSeleccionado, mesActual]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Obtener información del centro desde usuarios_centros
      const { data: centroData, error: centroError } = await supabase
        .from('usuarios_centros')
        .select('*, centro_formador:centros_formadores(*)')
        .eq('user_id', user.id)
        .eq('activo', true)
        .single();

      if (centroError || !centroData) {
        console.error('Error al obtener centro formador:', centroError);
        alert('No se pudo obtener la información del centro formador. Por favor, contacta al administrador.');
        navigate('/login');
        return;
      }

      setCentroInfo(centroData);

      // Obtener estudiantes (alumnos) del centro - FILTRADO POR CENTRO
      const { data: estudiantesData, error: estudiantesError } = await supabase
        .from('alumnos')
        .select(`
          *,
          centro_formador:centros_formadores(nombre),
          rotaciones!alumno_id(
            id,
            fecha_inicio,
            fecha_termino,
            estado,
            servicio:servicios_clinicos(nombre)
          )
        `)
        .eq('centro_formador_id', centroData.centro_formador_id)
        .eq('estado', 'en_rotacion')
        .order('primer_apellido', { ascending: true });

      if (estudiantesError) {
        console.error('Error al obtener estudiantes:', estudiantesError);
      }

      console.log(`📚 Estudiantes filtrados para ${centroData.centro_formador?.nombre}:`, estudiantesData?.length || 0);
      setEstudiantes(estudiantesData || []);
      
      // Seleccionar el primer estudiante por defecto
      if (estudiantesData && estudiantesData.length > 0) {
        setEstudianteSeleccionado(estudiantesData[0]);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAsistencias = async () => {
    if (!estudianteSeleccionado) return;

    const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);

    const { data } = await supabase
      .from('asistencias')
      .select('*')
      .eq('alumno_id', estudianteSeleccionado.id)
      .gte('fecha', primerDia.toISOString().split('T')[0])
      .lte('fecha', ultimoDia.toISOString().split('T')[0]);

    setAsistencias(data || []);
  };

  const fetchObservaciones = async () => {
    if (!estudianteSeleccionado) return;

    // Obtener observaciones desde la tabla asistencias
    const { data } = await supabase
      .from('asistencias')
      .select('fecha, observaciones, estado')
      .eq('alumno_id', estudianteSeleccionado.id)
      .not('observaciones', 'is', null)
      .order('fecha', { ascending: false })
      .limit(10);

    setObservaciones(data || []);
  };

  const calcularEstadisticas = async () => {
    if (!estudianteSeleccionado) return;

    const { data: todasAsistencias } = await supabase
      .from('asistencia_estudiantes')
      .select('estado')
      .eq('estudiante_rotacion_id', estudianteSeleccionado.id);

    if (todasAsistencias) {
      const total = todasAsistencias.length;
      const presentes = todasAsistencias.filter(a => a.estado === 'presente').length;
      const ausentes = todasAsistencias.filter(a => a.estado === 'ausente').length;
      const justificados = todasAsistencias.filter(a => a.estado === 'justificado').length;
      const tardes = todasAsistencias.filter(a => a.estado === 'tarde').length;

      setEstadisticas({
        total,
        presentes,
        ausentes,
        justificados,
        tardes,
        porcentaje: total > 0 ? ((presentes + tardes) / total * 100).toFixed(1) : 0
      });
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'presente':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'ausente':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'justificado':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'tarde':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'presente':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'ausente':
        return <XCircleIcon className="w-4 h-4" />;
      case 'justificado':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'tarde':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTipoObservacionColor = (tipo) => {
    switch (tipo) {
      case 'positiva':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300';
      case 'negativa':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300';
      case 'alerta':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300';
    }
  };

  const handleDiaClick = (fecha, asistencia) => {
    const observacionesDia = observaciones.filter(obs => obs.fecha === fecha.toISOString().split('T')[0]);
    setDiaSeleccionado({
      fecha,
      asistencia,
      observaciones: observacionesDia,
      feriado: esFeriado(fecha),
      esDomingo: esDomingo(fecha),
      esSabado: esSabado(fecha)
    });
    setModalDetalle(true);
  };

  const renderCalendario = () => {
    const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();

    const dias = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(<div key={`empty-${i}`} className="h-24"></div>);
    }

    // Días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(mesActual.getFullYear(), mesActual.getMonth(), dia);
      const fechaStr = fecha.toISOString().split('T')[0];
      const asistencia = asistencias.find(a => a.fecha === fechaStr);
      const observacionesDia = observaciones.filter(obs => obs.fecha === fechaStr);
      const tieneObservaciones = observacionesDia.length > 0;
      const domingo = esDomingo(fecha);
      const sabado = esSabado(fecha);
      const feriado = esFeriado(fecha);
      const esHoy = new Date().toDateString() === fecha.toDateString();

      dias.push(
        <button
          key={dia}
          onClick={() => handleDiaClick(fecha, asistencia)}
          className={`h-24 border border-gray-200 dark:border-gray-700 p-2 transition-all hover:shadow-md hover:scale-105 relative ${
            domingo || feriado ? 'bg-gray-50 dark:bg-gray-800' : 
            sabado ? 'bg-blue-50 dark:bg-blue-900/10' : 
            'bg-white dark:bg-gray-900'
          } ${esHoy ? 'ring-2 ring-teal-500' : ''} cursor-pointer`}
        >
          {/* Indicador de asistencia - Esquina superior izquierda */}
          {asistencia && !domingo && (
            <div className={`absolute top-1 left-1 w-3 h-3 rounded-full ${
              asistencia.estado === 'presente' ? 'bg-green-500 dark:bg-green-400' :
              asistencia.estado === 'ausente' ? 'bg-red-400 dark:bg-red-500' :
              asistencia.estado === 'justificado' ? 'bg-yellow-500 dark:bg-yellow-400' :
              asistencia.estado === 'tarde' ? 'bg-orange-500 dark:bg-orange-400' :
              'bg-gray-400'
            }`} title={`Estado: ${asistencia.estado}`}></div>
          )}
          
          {/* Indicador de observaciones - Esquina superior derecha */}
          {tieneObservaciones && (
            <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full" title="Tiene observaciones"></div>
          )}
          
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center mt-2">
              <span className={`text-sm font-medium ${
                esHoy ? 'text-teal-600 dark:text-teal-400' : 
                feriado ? 'text-red-600 dark:text-red-400' :
                'text-gray-700 dark:text-gray-300'
              }`}>
                {dia}
              </span>
            </div>
            
            {feriado && (
              <div className="mt-1 text-[10px] text-red-600 dark:text-red-400 font-medium truncate text-center">
                {feriado}
              </div>
            )}
            
            {asistencia && !domingo && (
              <div className={`mt-auto px-1.5 py-0.5 rounded text-[10px] font-medium border ${getEstadoColor(asistencia.estado)} flex items-center justify-center gap-1`}>
                {getEstadoIcon(asistencia.estado)}
                <span className="truncate capitalize">{asistencia.estado}</span>
              </div>
            )}
            
            {sabado && !feriado && (
              <div className="mt-auto text-[9px] text-blue-600 dark:text-blue-400 font-medium text-center">
                Sábado
              </div>
            )}
          </div>
        </button>
      );
    }

    return dias;
  };

  const cambiarMes = (direccion) => {
    const nuevoMes = new Date(mesActual);
    nuevoMes.setMonth(mesActual.getMonth() + direccion);
    setMesActual(nuevoMes);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 dark:border-teal-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <HeaderCentroFormador
        titulo="Seguimiento de Estudiantes"
        subtitulo={centroInfo?.centro_formador?.nombre}
        icono={AcademicCapIcon}
        codigoCentro={centroInfo?.centro_formador?.codigo}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {estudiantes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <UserGroupIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay estudiantes en práctica
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Aún no tienes estudiantes registrados en rotaciones activas
            </p>
            <Button variant="primary" onClick={() => navigate('/solicitud-rotacion')}>
              Crear Solicitud de Rotación
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Lista de Estudiantes */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <UserGroupIcon className="w-5 h-5" />
                    Estudiantes ({estudiantes.length})
                  </h3>
                </div>
                <div className="p-4">
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {estudiantes.map((estudiante) => (
                    <button
                      key={estudiante.id}
                      onClick={() => setEstudianteSeleccionado(estudiante)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        estudianteSeleccionado?.id === estudiante.id
                          ? 'bg-teal-50 dark:bg-teal-900/30 border-2 border-teal-500 dark:border-teal-600'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                      }`}
                    >
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {estudiante.nombre} {estudiante.primer_apellido}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {estudiante.carrera || estudiante.solicitud_rotacion?.especialidad}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        RUT: {estudiante.rut}
                      </p>
                    </button>
                  ))}
                </div>
                </div>
              </div>
            </div>

            {/* Contenido Principal */}
            <div className="lg:col-span-3 space-y-6">
              {estudianteSeleccionado && (
                <>
                  {/* Información del Estudiante */}
                  <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl shadow-lg p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {estudianteSeleccionado.nombre} {estudianteSeleccionado.primer_apellido} {estudianteSeleccionado.segundo_apellido}
                        </h2>
                        <p className="text-teal-100 mt-1">
                          {estudianteSeleccionado.carrera || estudianteSeleccionado.solicitud_rotacion?.especialidad}
                        </p>
                        <div className="flex gap-4 mt-3 text-sm text-teal-100">
                          <span>RUT: {estudianteSeleccionado.rut}</span>
                          {estudianteSeleccionado.correo_electronico && <span>• {estudianteSeleccionado.correo_electronico}</span>}
                          {estudianteSeleccionado.telefono && <span>• {estudianteSeleccionado.telefono}</span>}
                        </div>
                      </div>
                      {estadisticas && (
                        <div className="text-right bg-white/20 backdrop-blur-sm rounded-lg p-4">
                          <div className="text-3xl font-bold text-white">
                            {estadisticas.porcentaje}%
                          </div>
                          <p className="text-sm text-teal-100">Asistencia</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estadísticas */}
                  {estadisticas && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 border-teal-500 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{estadisticas.total}</p>
                          </div>
                          <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                            <ChartBarIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 border-emerald-500 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Presentes</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{estadisticas.presentes}</p>
                          </div>
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <CheckCircleIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 border-red-500 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Ausentes</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{estadisticas.ausentes}</p>
                          </div>
                          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 border-amber-500 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Justificados</p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{estadisticas.justificados}</p>
                          </div>
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 border-orange-500 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Tardes</p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{estadisticas.tardes}</p>
                          </div>
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <ClockIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Calendario */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <CalendarDaysIcon className="w-5 h-5" />
                        Calendario de Asistencia
                      </h3>
                      
                      <div className="flex items-center gap-3">
                        {/* Selector rápido de mes */}
                        <div className="flex items-center gap-2">
                          <select
                            value={mesActual.getMonth()}
                            onChange={(e) => {
                              const nuevoMes = new Date(mesActual);
                              nuevoMes.setMonth(parseInt(e.target.value));
                              setMesActual(nuevoMes);
                            }}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          >
                            {[
                              'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                            ].map((mes, index) => (
                              <option key={index} value={index}>{mes}</option>
                            ))}
                          </select>
                          
                          <select
                            value={mesActual.getFullYear()}
                            onChange={(e) => {
                              const nuevoMes = new Date(mesActual);
                              nuevoMes.setFullYear(parseInt(e.target.value));
                              setMesActual(nuevoMes);
                            }}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          >
                            {[2024, 2025, 2026].map((año) => (
                              <option key={año} value={año}>{año}</option>
                            ))}
                          </select>
                        </div>

                        {/* Botón Hoy */}
                        <button
                          onClick={() => setMesActual(new Date())}
                          className="px-3 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/50 rounded-lg text-sm font-medium transition-colors"
                        >
                          Hoy
                        </button>

                        {/* Navegación con flechas */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => cambiarMes(-1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Mes anterior"
                          >
                            <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => cambiarMes(1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Mes siguiente"
                          >
                            <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Días de la semana */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia) => (
                        <div key={dia} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2">
                          {dia}
                        </div>
                      ))}
                    </div>

                    {/* Calendario */}
                    <div className="grid grid-cols-7 gap-2">
                      {renderCalendario()}
                    </div>

                    {/* Leyenda */}
                    <div className="mt-6 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border ${getEstadoColor('presente')}`}></div>
                        <span className="text-gray-600 dark:text-gray-400">Presente</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border ${getEstadoColor('ausente')}`}></div>
                        <span className="text-gray-600 dark:text-gray-400">Ausente</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border ${getEstadoColor('justificado')}`}></div>
                        <span className="text-gray-600 dark:text-gray-400">Justificado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border ${getEstadoColor('tarde')}`}></div>
                        <span className="text-gray-600 dark:text-gray-400">Tarde</span>
                      </div>
                    </div>
                  </div>

                  {/* Observaciones Recientes - Acordeón */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setObservacionesAbiertas(!observacionesAbiertas)}
                      className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <BellAlertIcon className="w-5 h-5" />
                        Observaciones Recientes ({observaciones.length})
                      </h3>
                      {observacionesAbiertas ? (
                        <ChevronUpIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                    
                    {observacionesAbiertas && (
                      <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                        {observaciones.length === 0 ? (
                          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                            No hay observaciones registradas
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {observaciones.map((obs) => (
                              <div
                                key={obs.id}
                                className={`p-4 rounded-lg border ${getTipoObservacionColor(obs.tipo)}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium mb-1">{obs.titulo}</h4>
                                    <p className="text-sm opacity-90">{obs.descripcion}</p>
                                  </div>
                                  <span className="text-xs opacity-75 ml-4">
                                    {formatearFecha(obs.fecha)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal de Detalle del Día */}
      {modalDetalle && diaSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {diaSeleccionado.fecha.toLocaleDateString('es-CL', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h2>
                  {diaSeleccionado.feriado && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-2">
                      <BellAlertIcon className="w-4 h-4" />
                      Feriado: {diaSeleccionado.feriado}
                    </p>
                  )}
                  {diaSeleccionado.esDomingo && !diaSeleccionado.feriado && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Domingo (día no laboral)
                    </p>
                  )}
                  {diaSeleccionado.esSabado && !diaSeleccionado.feriado && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Sábado (día laboral en salud)
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setModalDetalle(false)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información de Asistencia */}
              {diaSeleccionado.asistencia ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Registro de Asistencia
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Estado */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32">
                        Estado:
                      </span>
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${
                        getEstadoColor(diaSeleccionado.asistencia.estado)
                      }`}>
                        {getEstadoIcon(diaSeleccionado.asistencia.estado)}
                        {diaSeleccionado.asistencia.estado.charAt(0).toUpperCase() + diaSeleccionado.asistencia.estado.slice(1)}
                      </span>
                    </div>

                    {/* Horarios */}
                    {diaSeleccionado.asistencia.hora_entrada && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32">
                          Hora de entrada:
                        </span>
                        <span className="text-gray-900 dark:text-white font-mono">
                          {diaSeleccionado.asistencia.hora_entrada}
                        </span>
                        {diaSeleccionado.asistencia.estado === 'tarde' && (
                          <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">
                            Llegó tarde
                          </span>
                        )}
                      </div>
                    )}

                    {diaSeleccionado.asistencia.hora_salida && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32">
                          Hora de salida:
                        </span>
                        <span className="text-gray-900 dark:text-white font-mono">
                          {diaSeleccionado.asistencia.hora_salida}
                        </span>
                      </div>
                    )}

                    {/* Observaciones del día */}
                    {diaSeleccionado.asistencia.observaciones && (
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                          Observaciones del registro:
                        </span>
                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm">
                          {diaSeleccionado.asistencia.observaciones}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {diaSeleccionado.esDomingo || diaSeleccionado.feriado
                      ? 'Día no laboral'
                      : diaSeleccionado.esSabado
                      ? 'Sábado laboral - No hay registro de asistencia'
                      : 'No hay registro de asistencia para este día'}
                  </p>
                </div>
              )}

              {/* Observaciones del día */}
              {diaSeleccionado.observaciones && diaSeleccionado.observaciones.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BellAlertIcon className="w-5 h-5" />
                    Observaciones del día ({diaSeleccionado.observaciones.length})
                  </h3>
                  <div className="space-y-3">
                    {diaSeleccionado.observaciones.map((obs) => (
                      <div
                        key={obs.id}
                        className={`p-4 rounded-lg border ${getTipoObservacionColor(obs.tipo)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{obs.titulo}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            obs.tipo === 'positiva' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                            obs.tipo === 'negativa' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                            obs.tipo === 'alerta' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                            'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          }`}>
                            {obs.tipo}
                          </span>
                        </div>
                        <p className="text-sm opacity-90">{obs.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <Button
                variant="secondary"
                onClick={() => setModalDetalle(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeguimientoEstudiantes;
