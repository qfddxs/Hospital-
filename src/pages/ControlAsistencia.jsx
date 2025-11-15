import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Table from '../components/UI/Table';
import Button from '../components/UI/Button';
import { 
  CheckIcon, 
  XMarkIcon, 
  DocumentArrowDownIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const ControlAsistencia = () => {
  const [rotaciones, setRotaciones] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    fetchData();

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
          console.log('🔔 Cambio detectado en rotaciones:', payload);
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
          console.log('🔔 Cambio detectado en asistencias:', payload);
          if (payload.new?.fecha === fechaSeleccionada || payload.old?.fecha === fechaSeleccionada) {
            fetchData();
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      console.log('🧹 Limpiando realtime de Control de Asistencia');
      supabase.removeChannel(rotacionesChannel);
      supabase.removeChannel(asistenciasChannel);
    };
  }, [fechaSeleccionada]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Obtener estudiantes en rotación con sus datos
      const { data: estudiantesData, error: estudiantesError } = await supabase
        .from('estudiantes_rotacion')
        .select(`
          *,
          solicitud:solicitudes_rotacion(
            id,
            especialidad,
            fecha_inicio,
            fecha_termino,
            estado,
            centro_formador:centros_formadores(nombre)
          ),
          rotacion:rotaciones(
            id,
            fecha_inicio,
            fecha_termino,
            estado,
            servicio:servicios_clinicos(id, nombre),
            tutor:tutores(id, nombres, apellidos)
          )
        `)
        .eq('solicitud.estado', 'aprobada');

      if (estudiantesError) {
        console.error('Error en estudiantes:', estudiantesError);
        throw estudiantesError;
      }

      // Filtrar y mapear estudiantes que tienen rotaciones activas en la fecha seleccionada
      const rotacionesMapeadas = (estudiantesData || [])
        .filter(est => {
          // Verificar si tiene rotación activa
          if (!est.rotacion || est.rotacion.length === 0) return false;
          
          const rotacion = est.rotacion[0];
          const fechaInicio = new Date(rotacion.fecha_inicio);
          const fechaTermino = new Date(rotacion.fecha_termino);
          const fechaActual = new Date(fechaSeleccionada);
          
          return rotacion.estado === 'activa' && 
                 fechaActual >= fechaInicio && 
                 fechaActual <= fechaTermino;
        })
        .map(est => {
          const rotacion = est.rotacion[0];
          return {
            id: rotacion.id,
            estudiante_id: est.id,
            fecha_inicio: rotacion.fecha_inicio,
            fecha_termino: rotacion.fecha_termino,
            estado: rotacion.estado,
            alumno: {
              id: est.id,
              rut: est.rut,
              nombres: `${est.primer_nombre || ''} ${est.segundo_nombre || ''}`.trim(),
              apellidos: `${est.primer_apellido || ''} ${est.segundo_apellido || ''}`.trim(),
              carrera: est.carrera,
              centro_formador: est.solicitud?.centro_formador
            },
            servicio: rotacion.servicio,
            tutor: rotacion.tutor
          };
        });

      console.log('✅ Rotaciones activas encontradas:', rotacionesMapeadas.length);
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

  const handleAsistenciaChange = (rotacionId, presente) => {
    setAsistencias(prev => ({
      ...prev,
      [rotacionId]: {
        ...prev[rotacionId],
        rotacion_id: rotacionId,
        fecha: fechaSeleccionada,
        tipo: 'alumno',
        presente,
      }
    }));
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
      
      const asistenciasArray = Object.values(asistencias).filter(a => a.rotacion_id && a.presente !== undefined);
      
      if (asistenciasArray.length === 0) {
        alert('No hay cambios para guardar');
        return;
      }

      // Upsert (insert o update) de asistencias
      const { error } = await supabase
        .from('asistencias')
        .upsert(asistenciasArray, {
          onConflict: 'rotacion_id,fecha,tipo'
        });

      if (error) throw error;

      alert('Asistencias guardadas exitosamente');
      await fetchData();
    } catch (err) {
      alert('Error al guardar asistencias: ' + err.message);
      console.error('Error:', err);
    } finally {
      setGuardando(false);
    }
  };

  const marcarTodosPresentes = () => {
    const nuevasAsistencias = { ...asistencias };
    rotaciones.forEach(rot => {
      nuevasAsistencias[rot.id] = {
        ...nuevasAsistencias[rot.id],
        rotacion_id: rot.id,
        fecha: fechaSeleccionada,
        tipo: 'alumno',
        presente: true,
      };
    });
    setAsistencias(nuevasAsistencias);
  };

  // Calcular estadísticas
  const totalRotaciones = rotaciones.length;
  const presentes = Object.values(asistencias).filter(a => a.presente === true).length;
  const ausentes = Object.values(asistencias).filter(a => a.presente === false).length;
  const sinRegistro = totalRotaciones - presentes - ausentes;
  const porcentajeAsistencia = totalRotaciones > 0 ? Math.round((presentes / totalRotaciones) * 100) : 0;

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
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.tutor ? `${row.tutor.nombres} ${row.tutor.apellidos}` : row.tutor_responsable || '-'}
        </span>
      )
    },
    { 
      header: 'Asistencia', 
      render: (row) => {
        const asistencia = asistencias[row.id];
        const presente = asistencia?.presente;
        
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAsistenciaChange(row.id, true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                presente === true
                  ? 'bg-green-500 dark:bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <CheckIcon className="w-4 h-4 inline mr-1" />
              Presente
            </button>
            <button
              onClick={() => handleAsistenciaChange(row.id, false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                presente === false
                  ? 'bg-red-500 dark:bg-red-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <XMarkIcon className="w-4 h-4 inline mr-1" />
              Ausente
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando asistencias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Control de Asistencia</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Registro diario de asistencia de alumnos en rotación
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <span className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></span>
              Actualización en tiempo real
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={marcarTodosPresentes}
            className="flex items-center gap-2"
            disabled={rotaciones.length === 0}
          >
            <CheckIcon className="w-5 h-5" />
            Marcar Todos Presentes
          </Button>
          <Button 
            variant="primary" 
            onClick={guardarAsistencias}
            disabled={guardando || rotaciones.length === 0}
            className="flex items-center gap-2"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            {guardando ? 'Guardando...' : 'Guardar Asistencia'}
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-blue-500 dark:border-blue-400 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Alumnos</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{totalRotaciones}</p>
            </div>
            <UserGroupIcon className="w-10 h-10 text-blue-500 dark:text-blue-400 opacity-50" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-green-500 dark:border-green-400 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Presentes</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{presentes}</p>
            </div>
            <CheckCircleIcon className="w-10 h-10 text-green-500 dark:text-green-400 opacity-50" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-red-500 dark:border-red-400 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ausentes</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{ausentes}</p>
            </div>
            <XCircleIcon className="w-10 h-10 text-red-500 dark:text-red-400 opacity-50" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-purple-500 dark:border-purple-400 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">% Asistencia</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{porcentajeAsistencia}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Fecha */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-colors">
        <div className="flex gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <CalendarIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Fecha:</label>
              <input
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div className="text-sm">
              {rotaciones.length === 0 ? (
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  ⚠️ No hay rotaciones activas para esta fecha
                </span>
              ) : (
                <span className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{rotaciones.length}</span> rotaciones activas
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Asistencia */}
      {rotaciones.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors">
          <Table columns={columns} data={rotaciones} />
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
    </div>
  );
};

export default ControlAsistencia;
