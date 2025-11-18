import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Table from '../components/UI/Table';
import Button from '../components/UI/Button';
import Loader from '../components/Loader';
import { ToastContainer } from '../components/Toast';
import { useNivelFormacion } from '../context/NivelFormacionContext';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/datepicker-custom.css';
import '../styles/select-custom.css';
import '../pages/Dashboard.css';
import { 
  CheckIcon, 
  XMarkIcon, 
  DocumentArrowDownIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const ControlAsistencia = () => {
  const { nivelFormacion } = useNivelFormacion();
  const [rotaciones, setRotaciones] = useState([]);
  const [rotacionesFiltradas, setRotacionesFiltradas] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  
  // Estados para filtros
  const [centrosFormadores, setCentrosFormadores] = useState([]);
  const [centroSeleccionado, setCentroSeleccionado] = useState('todos');
  
  // Estados para modal de observación obligatoria
  const [modalObservacion, setModalObservacion] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [observacionObligatoria, setObservacionObligatoria] = useState('');
  
  // Estados para toast
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    fetchData();
    fetchCentrosFormadores();

    // Suscribirse a cambios en tiempo real en rotaciones
    const rotacionesChannel = supabase
      .channel('rotaciones_asistencia_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rotaciones'
        },
        (payload) => {
          fetchData();
        }
      )
      .subscribe();

    // Suscribirse a cambios en asistencias
    const asistenciasChannel = supabase
      .channel('asistencias_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'asistencias'
        },
        (payload) => {
          if (payload.new?.fecha === fechaSeleccionada || payload.old?.fecha === fechaSeleccionada) {
            fetchData();
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(rotacionesChannel);
      supabase.removeChannel(asistenciasChannel);
    };
  }, [fechaSeleccionada, nivelFormacion]);

  // Filtrar rotaciones por centro formador
  useEffect(() => {
    if (centroSeleccionado === 'todos') {
      setRotacionesFiltradas(rotaciones);
    } else {
      setRotacionesFiltradas(
        rotaciones.filter(r => r.alumno.centro_formador?.nombre === centroSeleccionado)
      );
    }
  }, [rotaciones, centroSeleccionado]);

  const fetchCentrosFormadores = async () => {
    try {
      let query = supabase
        .from('centros_formadores')
        .select('nombre, nivel_formacion');

      // Filtrar por nivel de formación
      if (nivelFormacion) {
        query = query.or(`nivel_formacion.eq.${nivelFormacion},nivel_formacion.eq.ambos`);
      }

      const { data, error } = await query.order('nombre');
      
      if (error) throw error;
      
      const centros = data.map(c => c.nombre);
      setCentrosFormadores(centros);
    } catch (err) {
      console.error('Error al cargar centros formadores:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Obtener alumnos en rotación con sus datos
      // Primero intentar con estado 'en_rotacion', si no hay resultados, obtener todos
      let { data: alumnosData, error: alumnosError } = await supabase
        .from('alumnos')
        .select(`
          *,
          centro_formador:centros_formadores(nombre, nivel_formacion),
          rotaciones!alumno_id(
            id,
            fecha_inicio,
            fecha_termino,
            estado,
            servicio:servicios_clinicos(id, nombre)
          )
        `)
        .eq('estado', 'en_rotacion');

      // Si no hay alumnos con estado 'en_rotacion', intentar obtener todos los alumnos
      if (!alumnosData || alumnosData.length === 0) {
        const result = await supabase
          .from('alumnos')
          .select(`
            *,
            centro_formador:centros_formadores(nombre, nivel_formacion),
            rotaciones!alumno_id(
              id,
              fecha_inicio,
              fecha_termino,
              estado,
              servicio:servicios_clinicos(id, nombre)
            )
          `);
        alumnosData = result.data;
        alumnosError = result.error;
      }

      if (alumnosError) {
        console.error('Error en alumnos:', alumnosError);
        throw alumnosError;
      }

      // Filtrar y mapear alumnos que tienen rotaciones activas en la fecha seleccionada
      const rotacionesMapeadas = (alumnosData || [])
        .filter(est => {
          // Verificar si tiene rotación activa
          if (!est.rotaciones || est.rotaciones.length === 0) {
            return false;
          }
          
          const rotacion = est.rotaciones[0];
          const fechaInicio = new Date(rotacion.fecha_inicio);
          const fechaTermino = new Date(rotacion.fecha_termino);
          const fechaActual = new Date(fechaSeleccionada);
          
          // Aceptar rotaciones con estado 'activa' o sin estado definido
          const estadoValido = !rotacion.estado || rotacion.estado === 'activa' || rotacion.estado === 'en_curso';
          const dentroRango = fechaActual >= fechaInicio && fechaActual <= fechaTermino;
          
          // Filtrar por nivel de formación del centro formador
          const nivelCentro = est.centro_formador?.nivel_formacion;
          const nivelValido = nivelCentro === nivelFormacion || nivelCentro === 'ambos';
          
          return estadoValido && dentroRango && nivelValido;
        })
        .map(alumno => {
          const rotacion = alumno.rotaciones[0];
          
          return {
            id: rotacion.id,
            estudiante_id: alumno.id,
            fecha_inicio: rotacion.fecha_inicio,
            fecha_termino: rotacion.fecha_termino,
            estado: rotacion.estado,
            alumno: {
              id: alumno.id,
              rut: alumno.rut,
              nombres: `${alumno.primer_apellido || ''} ${alumno.segundo_apellido || ''}`.trim(),
              apellidos: `${alumno.nombre || ''}`.trim(),
              carrera: alumno.carrera,
              centro_formador: alumno.centro_formador
            },
            servicio: rotacion.servicio,
            // Tutor es el contacto del centro formador
            tutor: {
              nombre: alumno.contacto_nombre,
              email: alumno.contacto_email
            }
          };
        });

      setRotaciones(rotacionesMapeadas);

      // Obtener asistencias del día seleccionado
      const { data: asistenciasData, error: asistenciasError } = await supabase
        .from('asistencias')
        .select('*')
        .eq('fecha', fechaSeleccionada);
      
      if (asistenciasError) throw asistenciasError;

      // Convertir a objeto para fácil acceso
      const asistenciasMap = {};
      asistenciasData?.forEach(a => {
        asistenciasMap[a.rotacion_id] = a;
      });
      setAsistencias(asistenciasMap);

    } catch (err) {
      setError('No se pudieron cargar los datos: ' + err.message);
      console.error('Error completo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAsistenciaChange = (rotacionId, alumnoId, estado, observacion = null) => {
    // Si es "justificado", abrir modal para observación obligatoria
    if (estado === 'justificado') {
      setAlumnoSeleccionado({ rotacionId, alumnoId });
      setModalObservacion(true);
      return;
    }
    
    // Para otros estados, guardar normalmente
    setAsistencias(prev => ({
      ...prev,
      [rotacionId]: {
        ...prev[rotacionId],
        rotacion_id: rotacionId,
        alumno_id: alumnoId,
        fecha: fechaSeleccionada,
        tipo: 'alumno',
        estado: estado,
        presente: estado === 'presente' || estado === 'tarde', // Mantener compatibilidad
        observaciones: observacion || prev[rotacionId]?.observaciones,
      }
    }));
  };
  
  const addToast = (message, type = 'success', duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Funciones de navegación de fecha
  const cambiarDia = (dias) => {
    const fecha = new Date(fechaSeleccionada);
    fecha.setDate(fecha.getDate() + dias);
    setFechaSeleccionada(fecha.toISOString().split('T')[0]);
  };

  const irHoy = () => {
    setFechaSeleccionada(new Date().toISOString().split('T')[0]);
  };

  const guardarAsistenciaJustificada = () => {
    if (!observacionObligatoria.trim()) {
      addToast('Debe proporcionar una justificación para la ausencia', 'warning');
      return;
    }
    
    const { rotacionId, alumnoId } = alumnoSeleccionado;
    setAsistencias(prev => ({
      ...prev,
      [rotacionId]: {
        ...prev[rotacionId],
        rotacion_id: rotacionId,
        alumno_id: alumnoId,
        fecha: fechaSeleccionada,
        tipo: 'alumno',
        estado: 'justificado',
        presente: false,
        observaciones: observacionObligatoria,
      }
    }));
    
    setModalObservacion(false);
    setObservacionObligatoria('');
    setAlumnoSeleccionado(null);
  };

  const handleObservacionChange = (rotacionId, observaciones) => {
    setAsistencias(prev => ({
      ...prev,
      [rotacionId]: {
        ...prev[rotacionId],
        rotacion_id: rotacionId,
        fecha: fechaSeleccionada,
        observaciones,
      }
    }));
  };

  const guardarAsistencias = async () => {
    try {
      setGuardando(true);
      
      const asistenciasArray = Object.values(asistencias)
        .filter(a => a.rotacion_id && a.estado)
        .map(a => {
          // Preparar objeto sin el campo id para que la BD lo genere automáticamente
          const asistenciaData = {
            rotacion_id: a.rotacion_id,
            alumno_id: a.alumno_id,
            fecha: a.fecha,
            tipo: a.tipo || 'alumno',
            estado: a.estado,
            presente: a.estado === 'presente' || a.estado === 'tarde'
          };
          
          // Solo incluir observaciones si existen
          if (a.observaciones && a.observaciones.trim()) {
            asistenciaData.observaciones = a.observaciones.trim();
          }
          
          return asistenciaData;
        });
      
      if (asistenciasArray.length === 0) {
        addToast('No hay cambios para guardar', 'info');
        return;
      }

      // Upsert (insert o update) de asistencias
      const { error } = await supabase
        .from('asistencias')
        .upsert(asistenciasArray, {
          onConflict: 'rotacion_id,fecha,tipo'
        });

      if (error) throw error;

      addToast('Asistencias guardadas exitosamente', 'success');
      await fetchData();
    } catch (err) {
      addToast('Error al guardar asistencias: ' + err.message, 'error');
      console.error('Error:', err);
    } finally {
      setGuardando(false);
    }
  };

  const marcarTodosPresentes = () => {
    const nuevasAsistencias = { ...asistencias };
    rotacionesFiltradas.forEach(rot => {
      nuevasAsistencias[rot.id] = {
        ...nuevasAsistencias[rot.id],
        rotacion_id: rot.id,
        alumno_id: rot.alumno.id,
        fecha: fechaSeleccionada,
        tipo: 'alumno',
        estado: 'presente',
        presente: true,
      };
    });
    setAsistencias(nuevasAsistencias);
  };

  // Calcular estadísticas - solo contar asistencias de rotaciones filtradas
  const totalRotaciones = rotacionesFiltradas.length;
  const rotacionesIds = new Set(rotacionesFiltradas.map(r => String(r.id)));
  
  // Filtrar solo asistencias que corresponden a rotaciones filtradas del día
  const asistenciasValidas = Object.entries(asistencias)
    .filter(([rotacionId]) => rotacionesIds.has(String(rotacionId)))
    .map(([_, asistencia]) => asistencia);
  
  const presentes = asistenciasValidas.filter(a => a.estado === 'presente').length;
  const tarde = asistenciasValidas.filter(a => a.estado === 'tarde').length;
  const ausentes = asistenciasValidas.filter(a => a.estado === 'ausente').length;
  const justificados = asistenciasValidas.filter(a => a.estado === 'justificado').length;
  const sinRegistro = totalRotaciones - presentes - tarde - ausentes - justificados;
  const porcentajeAsistencia = totalRotaciones > 0 ? Math.round(((presentes + tarde) / totalRotaciones) * 100) : 0;

  const columns = [
    { 
      header: 'Alumno', 
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {row.alumno?.nombres} {row.alumno?.apellidos}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.alumno?.rut}</p>
        </div>
      )
    },
    { 
      header: 'Carrera', 
      render: (row) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">{row.alumno?.carrera || '-'}</span>
      )
    },
    { 
      header: 'Servicio', 
      render: (row) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">{row.servicio?.nombre || row.servicio_clinico || '-'}</span>
      )
    },
    { 
      header: 'Tutor', 
      render: (row) => (
        <div className="text-sm">
          <p className="text-gray-700 dark:text-gray-300">{row.tutor?.nombre || '-'}</p>
          {row.tutor?.email && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{row.tutor.email}</p>
          )}
        </div>
      )
    },
    { 
      header: 'Asistencia', 
      render: (row) => {
        const asistencia = asistencias[row.id];
        const estado = asistencia?.estado;
        
        return (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleAsistenciaChange(row.id, row.estudiante_id, 'presente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                estado === 'presente'
                  ? 'bg-green-500 dark:bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Presente"
            >
              <CheckIcon className="w-4 h-4 inline mr-1" />
              Presente
            </button>
            <button
              onClick={() => handleAsistenciaChange(row.id, row.estudiante_id, 'tarde')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                estado === 'tarde'
                  ? 'bg-orange-500 dark:bg-orange-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Presente pero tarde"
            >
              <ClockIcon className="w-4 h-4 inline mr-1" />
              Tarde
            </button>
            <button
              onClick={() => handleAsistenciaChange(row.id, row.estudiante_id, 'ausente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                estado === 'ausente'
                  ? 'bg-red-500 dark:bg-red-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Ausente"
            >
              <XMarkIcon className="w-4 h-4 inline mr-1" />
              Ausente
            </button>
            <button
              onClick={() => handleAsistenciaChange(row.id, row.estudiante_id, 'justificado')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                estado === 'justificado'
                  ? 'bg-yellow-500 dark:bg-yellow-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Ausencia justificada"
            >
              <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
              Justificado
            </button>
          </div>
        );
      }
    },
    { 
      header: 'Observaciones', 
      render: (row) => {
        const asistencia = asistencias[row.id];
        return (
          <input 
            type="text" 
            value={asistencia?.observaciones || ''}
            onChange={(e) => handleObservacionChange(row.id, e.target.value)}
            placeholder="Agregar observación..."
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        );
      }
    }
  ];

  if (loading) {
    return <Loader message="Cargando asistencias..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
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
              Control de Asistencia - {nivelFormacion === 'pregrado' ? 'Pregrado' : 'Postgrado'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              Registro diario de asistencia de alumnos en rotación de {nivelFormacion}
              <span className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400">
                <span className="w-2 h-2 bg-sky-500 dark:bg-sky-400 rounded-full animate-pulse"></span>
                Actualización en tiempo real
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={marcarTodosPresentes}
              disabled={rotacionesFiltradas.length === 0}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckIcon className="w-5 h-5" />
              Marcar Todos Presentes
            </button>
            <button 
              onClick={guardarAsistencias}
              disabled={guardando || rotacionesFiltradas.length === 0}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              {guardando ? 'Guardando...' : 'Guardar Asistencia'}
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card-medical" style={{ cursor: 'default' }}>
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="icon-badge-medical">
              <UserGroupIcon style={{ width: '2rem', height: '2rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
                Total Alumnos
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: '0.25rem 0 0 0' }}>
                {totalRotaciones}
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
                Presentes
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0d9488', margin: '0.25rem 0 0 0' }}>
                {presentes}
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
                Ausentes
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626', margin: '0.25rem 0 0 0' }}>
                {ausentes}
              </p>
            </div>
          </div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.65) 0%, rgba(139, 92, 246, 0.65) 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 16px rgba(167, 139, 250, 0.2)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'default'
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '128px', height: '128px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%', marginRight: '-64px', marginTop: '-64px' }}></div>
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="icon-badge-medical">
              <CheckCircleIcon style={{ width: '2rem', height: '2rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
                % Asistencia
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: '0.25rem 0 0 0' }}>
                {porcentajeAsistencia}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Fecha con Navegación */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border-2 border-sky-100 dark:border-gray-700 transition-colors">
        <div className="flex gap-4 items-center justify-between flex-wrap">
          <div className="flex items-center gap-4">
            <CalendarIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            
            {/* Botones de navegación */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => cambiarDia(-1)}
                className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                title="Día anterior"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              
              <button
                onClick={irHoy}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm min-w-[60px]"
                title="Ir a hoy"
              >
                {fechaSeleccionada === new Date().toISOString().split('T')[0] 
                  ? 'Hoy' 
                  : fechaSeleccionada.split('-')[2]}
              </button>
              
              <button
                onClick={() => cambiarDia(1)}
                className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                title="Día siguiente"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            {/* DatePicker personalizado */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha:</label>
              <DatePicker
                selected={new Date(fechaSeleccionada + 'T00:00:00')}
                onChange={(date) => setFechaSeleccionada(date.toISOString().split('T')[0])}
                dateFormat="dd-MM-yyyy"
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                calendarClassName="custom-datepicker"
                showPopperArrow={false}
              />
            </div>

            {/* Filtro por Centro Formador */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Centro:</label>
              <Select
                value={{ value: centroSeleccionado, label: centroSeleccionado === 'todos' ? 'Todos los centros' : centroSeleccionado }}
                onChange={(option) => setCentroSeleccionado(option.value)}
                options={[
                  { value: 'todos', label: 'Todos los centros' },
                  ...centrosFormadores.map(centro => ({ value: centro, label: centro }))
                ]}
                menuPlacement="auto"
                menuPosition="fixed"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minWidth: '250px',
                    borderRadius: '0.5rem',
                    borderColor: state.isFocused ? '#0d9488' : '#d1d5db',
                    boxShadow: state.isFocused ? '0 0 0 2px rgba(13, 148, 136, 0.2)' : 'none',
                    '&:hover': {
                      borderColor: '#0d9488'
                    },
                    backgroundColor: 'white',
                    padding: '2px'
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    zIndex: 9999
                  }),
                  menuList: (base) => ({
                    ...base,
                    padding: '4px',
                    maxHeight: '300px'
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? '#0d9488' : state.isFocused ? '#ccfbf1' : 'white',
                    color: state.isSelected ? 'white' : '#1f2937',
                    padding: '10px 12px',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontWeight: state.isSelected ? '600' : '400',
                    '&:active': {
                      backgroundColor: '#0f766e'
                    }
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: '#1f2937'
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: '#9ca3af'
                  }),
                  dropdownIndicator: (base) => ({
                    ...base,
                    color: '#6b7280',
                    '&:hover': {
                      color: '#0d9488'
                    }
                  })
                }}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          </div>

          {/* Información de rotaciones */}
          <div className="text-sm">
            {rotaciones.length === 0 ? (
              <span className="text-orange-600 dark:text-orange-400 font-medium">
                ⚠️ No hay rotaciones activas para esta fecha
              </span>
            ) : (
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-blue-600 dark:text-blue-400">{rotacionesFiltradas.length}</span> 
                {centroSeleccionado !== 'todos' && <span> de {rotaciones.length}</span>} rotaciones activas
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Asistencia */}
      {rotacionesFiltradas.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors">
          <Table columns={columns} data={rotacionesFiltradas} />
        </div>
      ) : rotaciones.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-sm transition-colors">
          <CalendarIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No hay rotaciones para el centro seleccionado</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Selecciona <strong>Todos los centros</strong> o elige otro centro formador
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-sm transition-colors">
          <CalendarIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No hay rotaciones activas para la fecha seleccionada</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Selecciona otra fecha o asigna rotaciones desde <strong>Gestión de Alumnos</strong>
          </p>
        </div>
      )}

      {/* Modal de Observación Obligatoria */}
      {modalObservacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Justificación de Ausencia
              </h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Debe proporcionar una justificación para registrar la ausencia como justificada. 
              Esta información quedará registrada en el sistema.
            </p>
            
            <textarea
              value={observacionObligatoria}
              onChange={(e) => setObservacionObligatoria(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              rows="4"
              placeholder="Ej: Certificado médico presentado por enfermedad..."
              required
            />
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setModalObservacion(false);
                  setObservacionObligatoria('');
                  setAlumnoSeleccionado(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarAsistenciaJustificada}
                disabled={!observacionObligatoria.trim()}
                className="flex-1 px-4 py-2 bg-yellow-500 dark:bg-yellow-600 text-white rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar Justificación
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default ControlAsistencia;
