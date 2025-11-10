import React, { useState, useEffect } from 'react';
import Table from '../components/UI/Table';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import apiClient from '../../api.js';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const CapacidadFormadora = () => {
  const [centrosData, setCentrosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filtroEspecialidad, setFiltroEspecialidad] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // --- Estados para el modal ---
  const [modalState, setModalState] = useState({ type: null, data: null });
  const [formData, setFormData] = useState({
    nombre: '',
    especialidades: '', // Usaremos un string separado por comas
    capacidadTotal: 0,
    ubicacion: '',
  });
  const [formError, setFormError] = useState('');

  const isModalOpen = modalState.type !== null;
  const closeModal = () => {
    setModalState({ type: null, data: null });
    setFormError('');
  };

  const columns = [
    { header: 'Centro Formador', accessor: 'nombre' },
    { 
      header: 'Especialidades', 
      render: (row) => (
        <span className="text-xs">{row.especialidades.join(', ')}</span>
      ),
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
    { header: 'Ubicación', accessor: 'ubicacion' },
    {
      header: 'Acciones',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleViewClick(row)} className="p-1 text-blue-600 hover:text-blue-800" title="Ver Detalles">
            <EyeIcon className="w-5 h-5" />
          </button>
          <button onClick={() => handleEditClick(row)} className="p-1 text-gray-600 hover:text-gray-800" title="Editar">
            <PencilIcon className="w-5 h-5" />
          </button>
          <button onClick={() => handleDeleteClick(row)} className="p-1 text-red-600 hover:text-red-800" title="Eliminar">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const fetchCentros = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('centros-formadores/');
        setCentrosData(response.data);
      } catch (err) {
        setError('No se pudieron cargar los centros formadores.');
        console.error('Error al obtener centros formadores:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCentros();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Prepara los datos para enviar, convirtiendo especialidades en un array
    const dataToSend = {
      ...formData,
      especialidades: formData.especialidades.split(',').map(e => e.trim()).filter(e => e),
      capacidadTotal: parseInt(formData.capacidadTotal, 10) || 0,
    };

    try {
      if (modalState.type === 'add') {
        const response = await apiClient.post('centros-formadores/', dataToSend);
        setCentrosData(prev => [...prev, response.data]);
      } else if (modalState.type === 'edit') {
        const response = await apiClient.put(`centros-formadores/${modalState.data.id}/`, dataToSend);
        setCentrosData(prev => prev.map(c => c.id === modalState.data.id ? response.data : c));
      }
      closeModal();
    } catch (err) {
      const errorData = err.response?.data;
      const errorMessages = errorData ? Object.entries(errorData).map(([field, messages]) => `${field}: ${messages.join(', ')}`).join(' ') : 'Ocurrió un error.';
      setFormError(errorMessages);
      console.error('Error al guardar centro:', errorData || err.message);
    }
  };

  const confirmDelete = async () => {
    if (modalState.type !== 'delete' || !modalState.data) return;
    try {
      await apiClient.delete(`centros-formadores/${modalState.data.id}/`);
      setCentrosData(prev => prev.filter(c => c.id !== modalState.data.id));
      closeModal();
    } catch (err) {
      setFormError('No se pudo eliminar el centro. Intente de nuevo.');
      console.error('Error al eliminar centro:', err);
    }
  };

  const handleAddClick = () => {
    setFormData({ nombre: '', especialidades: '', capacidadTotal: 0, ubicacion: '' });
    setModalState({ type: 'add', data: null });
  };

  const handleEditClick = (centro) => {
    setFormData({ ...centro, especialidades: centro.especialidades.join(', ') });
    setModalState({ type: 'edit', data: centro });
  };

  const handleViewClick = (centro) => {
    setModalState({ type: 'view', data: centro });
  };

  const handleDeleteClick = (centro) => {
    setModalState({ type: 'delete', data: centro });
  };

  const datosFiltrados = centrosData.filter(centro => {
    const cumpleFiltroEstado = filtroEstado === 'todos' || centro.estado === filtroEstado;
    return cumpleFiltroEstado;
  });

  if (loading) return <p>Cargando centros formadores...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Capacidad Formadora</h2>
          <p className="text-gray-600 mt-1">Gestión de centros formadores y sus capacidades</p>
        </div>
        <Button variant="primary" onClick={handleAddClick}>
          + Agregar Centro Formador
        </Button>
      </div>

      {/* Filtros y Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Centros Activos</p>
          <p className="text-2xl font-bold text-gray-800">{centrosData.filter(c => c.estado === 'activo').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Capacidad Total</p>
          <p className="text-2xl font-bold text-gray-800">{centrosData.reduce((sum, c) => sum + c.capacidadTotal, 0)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Cupos Disponibles</p>
          <p className="text-2xl font-bold text-green-600">{centrosData.reduce((sum, c) => sum + c.capacidadDisponible, 0)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Tasa de Ocupación</p>
          <p className="text-2xl font-bold text-gray-800">
            {centrosData.length > 0 ? Math.round((1 - centrosData.reduce((sum, c) => sum + c.capacidadDisponible, 0) / 
            centrosData.reduce((sum, c) => sum + c.capacidadTotal, 0)) * 100) : 0}%
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

      {/* Modal para todas las acciones */}
      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          title={
            modalState.type === 'add' ? 'Agregar Centro Formador' :
            modalState.type === 'edit' ? 'Editar Centro Formador' :
            modalState.type === 'view' ? 'Detalles del Centro' :
            'Confirmar Eliminación'
          }
        >
          {modalState.type === 'view' ? (
            <div className="space-y-3 text-sm">
              <p><strong>Nombre:</strong> {modalState.data.nombre}</p>
              <p><strong>Ubicación:</strong> {modalState.data.ubicacion}</p>
              <p><strong>Especialidades:</strong> {modalState.data.especialidades.join(', ')}</p>
              <p><strong>Capacidad Total:</strong> {modalState.data.capacidadTotal}</p>
              <p><strong>Capacidad Disponible:</strong> {modalState.data.capacidadDisponible}</p>
              <p><strong>Estado:</strong> <span className="capitalize">{modalState.data.estado}</span></p>
              <div className="flex justify-end pt-4">
                <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
              </div>
            </div>
          ) : modalState.type === 'delete' ? (
            <div>
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mr-4" />
                <div>
                  <p className="font-semibold">¿Estás seguro de que quieres eliminar este centro?</p>
                  <p className="text-sm text-gray-600 mt-1"><strong>{modalState.data.nombre}</strong></p>
                  <p className="text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
                <Button type="button" variant="primary" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Eliminar</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">{formError}</div>}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre del Centro</label>
                <input type="text" name="nombre" id="nombre" value={formData.nombre} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" required />
              </div>
              <div>
                <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700">Ubicación</label>
                <input type="text" name="ubicacion" id="ubicacion" value={formData.ubicacion} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
              </div>
              <div>
                <label htmlFor="especialidades" className="block text-sm font-medium text-gray-700">Especialidades (separadas por coma)</label>
                <input type="text" name="especialidades" id="especialidades" value={formData.especialidades} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
              </div>
              <div>
                <label htmlFor="capacidadTotal" className="block text-sm font-medium text-gray-700">Capacidad Total</label>
                <input type="number" name="capacidadTotal" id="capacidadTotal" value={formData.capacidadTotal} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" min="0" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
                <Button type="submit" variant="primary">Guardar</Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default CapacidadFormadora;
