import { useState } from 'react';
import Table from '../components/UI/Table';
import Button from '../components/UI/Button';
import { estudiantes, registrosAsistencia } from '../data/mockData';
import { ArchiveBoxArrowDownIcon, UserIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const ControlAsistencia = () => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [vistaActual, setVistaActual] = useState('estudiantes'); // 'estudiantes' o 'rotaciones'

  const columns = [
    { 
      header: 'Estudiante', 
      render: (row) => (
        <div>
          <p className="font-medium">{row.nombre}</p>
          <p className="text-xs text-gray-500">{row.programa}</p>
        </div>
      )
    },
    { header: 'Rotación', accessor: 'rotacionActual' },
    { header: 'Centro Formador', accessor: 'centroFormador' },
    { 
      header: 'Asistencia Histórica', 
      render: (row) => {
        const color = row.asistencia >= 90 ? 'text-green-600' : row.asistencia >= 80 ? 'text-yellow-600' : 'text-red-600';
        return <span className={`font-semibold ${color}`}>{row.asistencia}%</span>;
      }
    },
    { 
      header: 'Estado Hoy', 
      render: (row) => {
        const registro = registrosAsistencia.find(r => r.estudianteId === row.id);
        return (
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              defaultChecked={registro?.presente} 
              className="w-5 h-5 text-teal-500"
            />
            <span className="text-sm">{registro?.presente ? 'Presente' : 'Ausente'}</span>
          </div>
        );
      }
    },
    { 
      header: 'Observaciones', 
      render: (row) => {
        const registro = registrosAsistencia.find(r => r.estudianteId === row.id);
        return (
          <input 
            type="text" 
            defaultValue={registro?.observaciones}
            placeholder="Agregar observación..."
            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
          />
        );
      }
    }
  ];

  // Estudiantes con baja asistencia
  const estudiantesAlerta = estudiantes.filter(e => e.asistencia < 80);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Control de Asistencia</h2>
          <p className="text-gray-600 mt-1">Registro y seguimiento de asistencia diaria</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <ArchiveBoxArrowDownIcon className="w-5 h-5 text-white" />
          <span>Guardar Asistencia</span>
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Asistencia Promedio</p>
          <p className="text-2xl font-bold text-gray-800">
            {Math.round(estudiantes.reduce((sum, e) => sum + e.asistencia, 0) / estudiantes.length)}%
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Presentes Hoy</p>
          <p className="text-2xl font-bold text-green-600">
            {registrosAsistencia.filter(r => r.presente).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Ausentes Hoy</p>
          <p className="text-2xl font-bold text-red-600">
            {registrosAsistencia.filter(r => !r.presente).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Estudiantes en Alerta</p>
          <p className="text-2xl font-bold text-orange-600">{estudiantesAlerta.length}</p>
        </div>
      </div>

      {/* Alerta de Estudiantes con Baja Asistencia */}
      {estudiantesAlerta.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start">
            <span className="text-red-500 text-xl mr-3">⚠️</span>
            <div>
              <p className="font-semibold text-red-800">Estudiantes con asistencia inferior al 80%</p>
              <ul className="mt-2 text-sm text-red-700">
                {estudiantesAlerta.map(e => (
                  <li key={e.id}>{e.nombre} - {e.asistencia}%</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Selector de Fecha y Vista */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex gap-4 items-center justify-between">
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
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setVistaActual('estudiantes')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  vistaActual === 'estudiantes'
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Por Estudiante
              </button>
              <button
                onClick={() => setVistaActual('rotaciones')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  vistaActual === 'rotaciones'
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Por Rotación
              </button>
            </div>
          </div>
          <Button variant="primary" className="flex items-center gap-2">
          <DocumentArrowDownIcon className="w-5 h-5 text-white" />
          <span>Exportar Reporte</span>
          </Button>
        </div>
      </div>

      {/* Tabla de Asistencia */}
      <Table columns={columns} data={estudiantes} />
    </div>
  );
};

export default ControlAsistencia;

