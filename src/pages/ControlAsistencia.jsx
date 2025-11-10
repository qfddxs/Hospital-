import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Table from '../components/UI/Table';
import Button from '../components/UI/Button';
import { CheckIcon, XMarkIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const ControlAsistencia = () => {
  const [rotaciones, setRotaciones] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fechaSeleccionada]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Obtener rotaciones activas con datos de alumno, servicio y tutor
      const { data: rotacionesData, error: rotacionesError } = await supabase
        .from('rotaciones')
        .select(`
          *,
          alumno:alumnos(id, rut, nombres, apellidos, carrera, centro_formador:centros_formadores(nombre)),
          servicio:servicios_clinicos(id, nombre),
          tutor:tutores(id, nombres, apellidos)
        `)
        .eq('estado', 'en_curso')
        .lte('fecha_inicio', fechaSeleccionada)
        .gte('fecha_termino', fechaSeleccionada);
      
      if (rotacionesError) throw rotacionesError;
      setRotaciones(rotacionesData || []);

      // Obtener asistencias del día seleccionado
      const { data: asistenciasData, error: asistenciasError } = await supabase
        .from('asistencias')
        .select('*')
        .eq('fecha', fechaSeleccionada);
      
      if (asistenciasError) throw asistenciasError;

      // Convertir a objeto para fácil acceso
      const asistenciasMap = {};
      asistenciasData?.forEach(a => {
        asistenciasMap[`${a.rotacion_id}-${a.tipo}`] = a;
      });
      setAsistencias(asistenciasMap);

    } catch (err) {
      setError('No se pudieron cargar los datos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAsistenciaChange = (rotacionId, tipo, presente) => {
    const key = `${rotacionId}-${tipo}`;
    setAsistencias(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        rotacion_id: rotacionId,
        tipo,
        fecha: fechaSeleccionada,
        presente,
      }
    }));
  };

  const handleObservacionChange = (rotacionId, tipo, observaciones) => {
    const key = `${rotacionId}-${tipo}`;
    setAsistencias(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        rotacion_id: rotacionId,
        tipo,
        fecha: fechaSeleccionada,
        observaciones,
      }
    }));
  };

  const guardarAsistencias = async () => {
    try {
      setGuardando(true);
      
      const asistenciasArray = Object.values(asistencias).filter(a => a.rotacion_id);
      
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
      fetchData(); // Recargar datos
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
      const keyAlumno = `${rot.id}-alumno`;
      
      nuevasAsistencias[keyAlumno] = {
        ...nuevasAsistencias[keyAlumno],
        rotacion_id: rot.id,
        tipo: 'alumno',
        fecha: fechaSeleccionada,
        presente: true,
      };
    });
    setAsistencias(nuevasAsistencias);
  };

  const columns = [
    { 
      header: 'Alumno', 
      render: (row) => (
        <div>
          <p className="font-medium">{row.alumno?.nombres} {row.alumno?.apellidos}</p>
          <p className="text-xs text-gray-500">{row.alumno?.rut}</p>
        </div>
      )
    },
    { 
      header: 'Carrera', 
      render: (row) => row.alumno?.carrera || '-'
    },
    { 
      header: 'Servicio', 
      render: (row) => row.servicio?.nombre || '-'
    },
    { 
      header: 'Tutor', 
      render: (row) => row.tutor ? `${row.tutor.nombres} ${row.tutor.apellidos}` : '-'
    },
    { 
      header: 'Asistencia', 
      render: (row) => {
        const key = `${row.id}-alumno`;
        const presente = asistencias[key]?.presente ?? false;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAsistenciaChange(row.id, 'alumno', true)}
              className={`px-4 py-2 rounded ${presente ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
              title="Presente"
            >
              <CheckIcon className="w-4 h-4 inline mr-1" />
              Presente
            </button>
            <button
              onClick={() => handleAsistenciaChange(row.id, 'alumno', false)}
              className={`px-4 py-2 rounded ${!presente && asistencias[key] ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
              title="Ausente"
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
        const keyAlumno = `${row.id}-alumno`;
        return (
          <input 
            type="text" 
            value={asistencias[keyAlumno]?.observaciones || ''}
            onChange={(e) => handleObservacionChange(row.id, 'alumno', e.target.value)}
            placeholder="Agregar observación..."
            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
          />
        );
      }
    }
  ];

  // Calcular estadísticas
  const totalRotaciones = rotaciones.length;
  const alumnosPresentes = Object.values(asistencias).filter(a => a.tipo === 'alumno' && a.presente).length;
  const alumnosAusentes = Object.values(asistencias).filter(a => a.tipo === 'alumno' && a.presente === false).length;
  const porcentajeAsistencia = totalRotaciones > 0 ? Math.round((alumnosPresentes / totalRotaciones) * 100) : 0;

  if (loading) return <p>Cargando asistencias...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Control de Asistencia</h2>
          <p className="text-gray-600 mt-1">Registro y seguimiento de asistencia diaria</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={marcarTodosPresentes}
            className="flex items-center gap-2"
          >
            <CheckIcon className="w-5 h-5" />
            Marcar Todos Presentes
          </Button>
          <Button 
            variant="primary" 
            onClick={guardarAsistencias}
            disabled={guardando}
            className="flex items-center gap-2"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            {guardando ? 'Guardando...' : 'Guardar Asistencia'}
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Alumnos</p>
          <p className="text-2xl font-bold text-gray-800">{totalRotaciones}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Presentes</p>
          <p className="text-2xl font-bold text-green-600">{alumnosPresentes}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Ausentes</p>
          <p className="text-2xl font-bold text-red-600">{alumnosAusentes}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">% Asistencia</p>
          <p className="text-2xl font-bold text-blue-600">{porcentajeAsistencia}%</p>
        </div>
      </div>

      {/* Selector de Fecha */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Fecha:</label>
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="text-sm text-gray-600">
            {rotaciones.length === 0 ? (
              <span className="text-orange-600">No hay rotaciones activas para esta fecha</span>
            ) : (
              <span>{rotaciones.length} rotaciones activas</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Asistencia */}
      {rotaciones.length > 0 ? (
        <Table columns={columns} data={rotaciones} />
      ) : (
        <div className="bg-white rounded-lg p-12 text-center shadow-sm">
          <p className="text-gray-500 text-lg">No hay rotaciones activas para la fecha seleccionada</p>
          <p className="text-gray-400 text-sm mt-2">Selecciona otra fecha o verifica que haya rotaciones en curso</p>
        </div>
      )}
    </div>
  );
};

export default ControlAsistencia;
