import { useState } from 'react';
import Table from '../components/UI/Table';
import Button from '../components/UI/Button';
import { retribuciones } from '../data/mockData';
import { DocumentArrowDownIcon, EyeIcon, BanknotesIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const Retribuciones = () => {
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const columns = [
    { header: 'Centro Formador', accessor: 'centroFormador' },
    { header: 'Período', accessor: 'periodo' },
    { 
      header: 'N° Estudiantes', 
      accessor: 'numeroEstudiantes',
      render: (row) => <span className="font-semibold">{row.numeroEstudiantes}</span>
    },
    { 
      header: 'Monto', 
      render: (row) => (
        <span className="font-semibold text-gray-800">
          ${row.monto.toLocaleString()}
        </span>
      )
    },
    { 
      header: 'Estado', 
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.estado === 'pagado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
        </span>
      )
    },
    { 
      header: 'Fecha Pago', 
      render: (row) => row.fechaPago || '-'
    },
    { 
      header: 'Acciones', 
      render: (row) => (
        <div className="flex gap-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm">Ver Detalle</button>
          {row.estado === 'pendiente' && (
            <button className="text-teal-600 hover:text-teal-800 text-sm">Procesar Pago</button>
          )}
        </div>
      )
    }
  ];

  const datosFiltrados = retribuciones.filter(retribucion => {
    const cumpleEstado = filtroEstado === 'todos' || retribucion.estado === filtroEstado;
    return cumpleEstado;
  });

  const totalPagado = retribuciones.filter(r => r.estado === 'pagado').reduce((sum, r) => sum + r.monto, 0);
  const totalPendiente = retribuciones.filter(r => r.estado === 'pendiente').reduce((sum, r) => sum + r.monto, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Retribuciones y Reportes</h2>
          <p className="text-gray-600 mt-1">Gestión de pagos a centros formadores</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex items-center gap-2">
          <DocumentArrowDownIcon className="w-5 h-5 text-black" />
          <span>Exportar Reporte</span>
        </Button>
          <Button variant="primary">
            + Nueva Retribución
          </Button>
        </div>
      </div>

      {/* Estadísticas Financieras */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Retribuciones</p>
          <p className="text-2xl font-bold text-gray-800">
            ${(totalPagado + totalPendiente).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Pagado</p>
          <p className="text-2xl font-bold text-green-600">
            ${totalPagado.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Pendiente</p>
          <p className="text-2xl font-bold text-yellow-600">
            ${totalPendiente.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Centros Formadores</p>
          <p className="text-2xl font-bold text-gray-800">
            {new Set(retribuciones.map(r => r.centroFormador)).size}
          </p>
        </div>
      </div>

      {/* Gráfico de Resumen (placeholder) */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Retribuciones por Período</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center text-gray-500">
            <ChartBarIcon className="w-10 h-10 mx-auto text-gray-500" />
            <p className="mt-2">Gráfico de retribuciones por período</p>
            <p className="text-sm mt-1">(Visualización de datos históricos)</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Período:</label>
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="todos">Todos</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Estado:</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="todos">Todos</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Retribuciones */}
      <Table columns={columns} data={datosFiltrados} />
    </div>
  );
};

export default Retribuciones;

