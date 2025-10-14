import { useState } from 'react';
import Table from '../components/UI/Table';
import Button from '../components/UI/Button';
import { solicitudesCupos } from '../data/mockData';

const SolicitudCupos = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todas');

  const columns = [
    { header: 'Centro Formador', accessor: 'centroFormador' },
    { header: 'Especialidad', accessor: 'especialidad' },
    { 
      header: 'N° Cupos', 
      accessor: 'numeroCupos',
      render: (row) => <span className="font-semibold">{row.numeroCupos}</span>
    },
    { header: 'Fecha Solicitud', accessor: 'fechaSolicitud' },
    { header: 'Solicitante', accessor: 'solicitante' },
    { 
      header: 'Estado', 
      render: (row) => {
        const estados = {
          pendiente: 'bg-yellow-100 text-yellow-800',
          aprobada: 'bg-green-100 text-green-800',
          rechazada: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${estados[row.estado]}`}>
            {row.estado.charAt(0).toUpperCase() + row.estado.slice(1)}
          </span>
        );
      }
    }
  ];

  const datosFiltrados = filtroEstado === 'todas' 
    ? solicitudesCupos 
    : solicitudesCupos.filter(s => s.estado === filtroEstado);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Solicitud de Cupos</h2>
          <p className="text-gray-600 mt-1">Gestión de solicitudes de cupos clínicos</p>
        </div>
        <Button variant="primary" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
          + Nueva Solicitud
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Solicitudes</p>
          <p className="text-2xl font-bold text-gray-800">{solicitudesCupos.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">
            {solicitudesCupos.filter(s => s.estado === 'pendiente').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Aprobadas</p>
          <p className="text-2xl font-bold text-green-600">
            {solicitudesCupos.filter(s => s.estado === 'aprobada').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Rechazadas</p>
          <p className="text-2xl font-bold text-red-600">
            {solicitudesCupos.filter(s => s.estado === 'rechazada').length}
          </p>
        </div>
      </div>

      {/* Formulario Nueva Solicitud */}
      {mostrarFormulario && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Nueva Solicitud de Cupos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Centro Formador</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Especialidad</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número de Cupos</label>
              <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
              <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Comentarios</label>
              <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows="3"></textarea>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setMostrarFormulario(false)}>
              Cancelar
            </Button>
            <Button variant="primary">
              Enviar Solicitud
            </Button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Estado:</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="todas">Todas</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Solicitudes */}
      <Table columns={columns} data={datosFiltrados} />
    </div>
  );
};

export default SolicitudCupos;

