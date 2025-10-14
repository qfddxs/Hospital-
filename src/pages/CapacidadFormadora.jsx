import { useState } from 'react';
import Table from '../components/UI/Table';
import Button from '../components/UI/Button';
import { centrosFormadores } from '../data/mockData';

const CapacidadFormadora = () => {
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const columns = [
    { header: 'Centro Formador', accessor: 'nombre' },
    { 
      header: 'Especialidades', 
      render: (row) => (
        <span className="text-xs">{row.especialidades.join(', ')}</span>
      )
    },
    { 
      header: 'Capacidad Total', 
      accessor: 'capacidadTotal',
      render: (row) => <span className="font-semibold">{row.capacidadTotal}</span>
    },
    { 
      header: 'Disponible', 
      render: (row) => (
        <span className={row.capacidadDisponible > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
          {row.capacidadDisponible}
        </span>
      )
    },
    { 
      header: 'Estado', 
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.estado === 'activo' ? 'Activo' : 'Completo'}
        </span>
      )
    },
    { header: 'Ubicación', accessor: 'ubicacion' }
  ];

  const datosFiltrados = centrosFormadores.filter(centro => {
    const cumpleFiltroEstado = filtroEstado === 'todos' || centro.estado === filtroEstado;
    return cumpleFiltroEstado;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Capacidad Formadora</h2>
          <p className="text-gray-600 mt-1">Gestión de centros formadores y sus capacidades</p>
        </div>
        <Button variant="primary">
          + Agregar Centro Formador
        </Button>
      </div>

      {/* Filtros y Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Centros Activos</p>
          <p className="text-2xl font-bold text-gray-800">{centrosFormadores.filter(c => c.estado === 'activo').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Capacidad Total</p>
          <p className="text-2xl font-bold text-gray-800">{centrosFormadores.reduce((sum, c) => sum + c.capacidadTotal, 0)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Cupos Disponibles</p>
          <p className="text-2xl font-bold text-green-600">{centrosFormadores.reduce((sum, c) => sum + c.capacidadDisponible, 0)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Tasa de Ocupación</p>
          <p className="text-2xl font-bold text-gray-800">
            {Math.round((1 - centrosFormadores.reduce((sum, c) => sum + c.capacidadDisponible, 0) / 
            centrosFormadores.reduce((sum, c) => sum + c.capacidadTotal, 0)) * 100)}%
          </p>
        </div>
      </div>

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
              <option value="todos">Todos</option>
              <option value="activo">Activo</option>
              <option value="completo">Completo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Centros */}
      <Table columns={columns} data={datosFiltrados} />
    </div>
  );
};

export default CapacidadFormadora;

