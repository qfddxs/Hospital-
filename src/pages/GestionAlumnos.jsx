import { useState } from 'react';
import Table from '../components/UI/Table';
import Button from '../components/UI/Button';
import { estudiantes } from '../data/mockData';

const GestionAlumnos = () => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroPrograma, setFiltroPrograma] = useState('todos');

  const columns = [
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Programa', accessor: 'programa' },
    { header: 'Rotación Actual', accessor: 'rotacionActual' },
    { header: 'Centro Formador', accessor: 'centroFormador' },
    { 
      header: 'Asistencia', 
      render: (row) => {
        const color = row.asistencia >= 90 ? 'text-green-600' : row.asistencia >= 80 ? 'text-yellow-600' : 'text-red-600';
        return <span className={`font-semibold ${color}`}>{row.asistencia}%</span>;
      }
    },
    { 
      header: 'Estado', 
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row.estado === 'activo' ? 'Activo' : 'Alerta'}
        </span>
      )
    },
    { 
      header: 'Acciones', 
      render: () => (
        <div className="flex gap-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm">Ver</button>
          <button className="text-gray-600 hover:text-gray-800 text-sm">Editar</button>
        </div>
      )
    }
  ];

  const datosFiltrados = estudiantes.filter(estudiante => {
    const cumpleBusqueda = estudiante.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const cumplePrograma = filtroPrograma === 'todos' || estudiante.programa === filtroPrograma;
    return cumpleBusqueda && cumplePrograma;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Alumnos</h2>
          <p className="text-gray-600 mt-1">Administración de estudiantes en rotación</p>
        </div>
        <Button variant="primary">
          + Agregar Estudiante
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Estudiantes</p>
          <p className="text-2xl font-bold text-gray-800">{estudiantes.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Estudiantes Activos</p>
          <p className="text-2xl font-bold text-green-600">
            {estudiantes.filter(e => e.estado === 'activo').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Asistencia Promedio</p>
          <p className="text-2xl font-bold text-gray-800">
            {Math.round(estudiantes.reduce((sum, e) => sum + e.asistencia, 0) / estudiantes.length)}%
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">En Alerta</p>
          <p className="text-2xl font-bold text-red-600">
            {estudiantes.filter(e => e.asistencia < 80).length}
          </p>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar estudiante por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Programa:</label>
            <select
              value={filtroPrograma}
              onChange={(e) => setFiltroPrograma(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="todos">Todos</option>
              <option value="Medicina General">Medicina General</option>
              <option value="Medicina Familiar">Medicina Familiar</option>
              <option value="Especialidad Pediatría">Especialidad Pediatría</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Estudiantes */}
      <Table columns={columns} data={datosFiltrados} />
    </div>
  );
};

export default GestionAlumnos;

