import { useState } from 'react';
import Table from '../components/UI/Table';
import Button from '../components/UI/Button';
import { documentos } from '../data/mockData';
import {
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  FolderIcon,
  ArrowUpTrayIcon,
  FolderOpenIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const GestionDocumental = () => {
  const [mostrarSubida, setMostrarSubida] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');

  const columns = [
    { 
      header: 'Nombre', 
      render: (row) => (
        <div className="flex items-center gap-2">
          <span>
            {row.tipo === 'convenio' ? (
              <DocumentTextIcon className="w-5 h-5 text-blue-600" />
            ) : row.tipo === 'reglamento' ? (
              <ClipboardDocumentListIcon className="w-5 h-5 text-teal-600" />
            ) : row.tipo === 'evaluacion' ? (
              <ChartBarIcon className="w-5 h-5 text-green-600" />
            ) : (
              <FolderIcon className="w-5 h-5 text-gray-600" />
            )}
          </span>
          <span className="font-medium">{row.nombre}</span>
        </div>
      )
    },
    { header: 'Categoría', accessor: 'categoria' },
    { header: 'Fecha Subida', accessor: 'fechaSubida' },
    { header: 'Tamaño', accessor: 'tamaño' },
    { 
      header: 'Acciones', 
      render: () => (
        <div className="flex gap-3">
          <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
            <EyeIcon className="w-4 h-4" /> Ver
          </button>
          <button className="flex items-center gap-1 text-teal-600 hover:text-teal-800 text-sm">
            <ArrowDownTrayIcon className="w-4 h-4" /> Descargar
          </button>
          <button className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm">
            <TrashIcon className="w-4 h-4" /> Eliminar
          </button>
        </div>
      )
    }
  ];

  const categorias = [...new Set(documentos.map(d => d.categoria))];
  
  const datosFiltrados = filtroCategoria === 'todas' 
    ? documentos 
    : documentos.filter(d => d.categoria === filtroCategoria);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión Documental</h2>
          <p className="text-gray-600 mt-1">Administración de documentos y archivos del sistema</p>
        </div>
        <Button variant="primary" onClick={() => setMostrarSubida(!mostrarSubida)} className="flex items-center gap-2">
          <ArrowUpTrayIcon className="w-5 h-5 text-white" />
          <span>Subir Documento</span>
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Documentos</p>
          <p className="text-2xl font-bold text-gray-800">{documentos.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Convenios</p>
          <p className="text-2xl font-bold text-blue-600">
            {documentos.filter(d => d.tipo === 'convenio').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Evaluaciones</p>
          <p className="text-2xl font-bold text-green-600">
            {documentos.filter(d => d.tipo === 'evaluacion').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Categorías</p>
          <p className="text-2xl font-bold text-gray-800">{categorias.length}</p>
        </div>
      </div>

      {/* Formulario de Subida */}
      {mostrarSubida && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Subir Nuevo Documento</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Archivo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FolderOpenIcon className="w-10 h-10 text-gray-500 mx-auto" />
                <p className="mt-2 text-sm text-gray-600">Arrastra archivos aquí o haz clic para seleccionar</p>
                <input type="file" className="hidden" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>Convenios</option>
                  <option>Normativa</option>
                  <option>Evaluaciones</option>
                  <option>Asistencia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>Convenio</option>
                  <option>Reglamento</option>
                  <option>Evaluación</option>
                  <option>Asistencia</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (opcional)</label>
              <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows="3"></textarea>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setMostrarSubida(false)}>
              Cancelar
            </Button>
            <Button variant="primary">
              Subir Documento
            </Button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Categoría:</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="todas">Todas</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar documento..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Documentos */}
      <Table columns={columns} data={datosFiltrados} />
    </div>
  );
};

export default GestionDocumental;

