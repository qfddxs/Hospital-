import React, { useState, useEffect } from 'react';
import Table from '../components/UI/Table';
import Button from '../components/UI/Button';
import apiClient from '../../api.js'; // Importa tu cliente axios configurado
import Modal from '../components/UI/Modal'; // Componente para el formulario emergente
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const GestionAlumnos = () => {
  const [estudiantesData, setEstudiantesData] = useState([]); // Renombrado para evitar conflicto con el mock original
  const [busqueda, setBusqueda] = useState('');
  const [filtroPrograma, setFiltroPrograma] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Estados para manejar los modales (agregar, editar, ver, eliminar) ---
  const [modalState, setModalState] = useState({ type: null, data: null }); // type: 'add', 'edit', 'view'
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    programa: 'Medicina General', // Valor por defecto
  });
  const [formError, setFormError] = useState('');

  const isModalOpen = modalState.type !== null;
  const closeModal = () => setModalState({ type: null, data: null });

  const fetchEstudiantes = async () => {
    try {
      setLoading(true);
      // Usa apiClient.get(). El interceptor se encargará de añadir el token.
      const response = await apiClient.get('estudiantes/'); // Endpoint relativo a la baseURL
      setEstudiantesData(response.data);
    } catch (err) {
      // Si hay un error (ej. 401 después de que el refresh token falló),
      // el interceptor ya habrá redirigido al login.
      setError('No se pudieron cargar los estudiantes. Por favor, intente recargar la página o inicie sesión de nuevo.');
      console.error('Error al obtener estudiantes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  const columns = [
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'RUT', accessor: 'rut' }, // Añadido el campo RUT
    { header: 'Programa', accessor: 'programa' },
    { header: 'Rotación Actual', accessor: 'rotacionActual' },
    { header: 'Centro Formador', accessor: 'centro_formador_nombre' }, // Asumiendo que la API devuelve 'centro_formador_nombre'
    { 
      header: 'Asistencia', 
      render: (row) => {
        const color = row.asistencia >= 90 ? 'text-green-600' : row.asistencia >= 80 ? 'text-yellow-600' : 'text-red-600';
        return <span className={`font-semibold ${color}`}>{row.asistencia}%</span>;
      }
    }, // Mantener el renderizado de asistencia
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
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); handleViewClick(row); }} className="p-1 text-blue-600 hover:text-blue-800" title="Ver Detalles">
            <EyeIcon className="w-5 h-5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleEditClick(row); }} className="p-1 text-gray-600 hover:text-gray-800" title="Editar" >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(row); }} className="p-1 text-red-600 hover:text-red-800" title="Eliminar">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];

  const datosFiltrados = estudiantesData.filter(estudiante => {
    const cumpleBusqueda = estudiante.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const cumplePrograma = filtroPrograma === 'todos' || estudiante.programa === filtroPrograma;
    return cumpleBusqueda && cumplePrograma;
  });

  // --- Función para validar el formato del RUT chileno ---
  const validarRut = (rut) => {
    if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rut)) return false;
    let tmp = rut.split('-');
    let digv = tmp[1];
    let T = tmp[0];
    if (digv === 'K') digv = 'k';

    let M = 0, S = 1;
    for (; T; T = Math.floor(T / 10)) {
      S = (S + T % 10 * (9 - M++ % 6)) % 11;
    }
    return S ? S - 1 + '' === digv : 'k' === digv;
  };

  // --- Función para formatear el RUT mientras se escribe (opcional pero recomendado) ---
  const formatearRut = (rut) => {
    rut = rut.replace(/[^0-9kK]/g, '');
    if (rut.length > 1) {
      const body = rut.slice(0, -1);
      const dv = rut.slice(-1);
      return `${body}-${dv}`;
    }
    return rut;
  };

  // --- Lógica para manejar el formulario de agregar estudiante ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    if (name === 'rut') {
      const rutFormateado = formatearRut(value);
      setFormData(prevState => ({ ...prevState, rut: rutFormateado }));
    }
  };

  const handleAgregarEstudiante = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nombre || !formData.rut || !formData.programa) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }

    if (!validarRut(formData.rut)) {
      setFormError('El formato del RUT no es válido. Use el formato 12345678-9.');
      return;
    }

    try {
      if (modalState.type === 'add') {
        // --- Lógica para AGREGAR ---
        const response = await apiClient.post('estudiantes/', formData);
        setEstudiantesData(prev => [...prev, response.data]);
      } else if (modalState.type === 'edit') {
        // --- Lógica para EDITAR ---
        const response = await apiClient.put(`estudiantes/${modalState.data.id}/`, formData);
        setEstudiantesData(prev => prev.map(est => est.id === modalState.data.id ? response.data : est));
      }

      closeModal(); // Cierra el modal en caso de éxito

    } catch (err) {
      const errorData = err.response?.data;
      if (errorData) {
        const errorMessages = Object.entries(errorData).map(([field, messages]) => 
          `${field.charAt(0).toUpperCase() + field.slice(1)}: ${messages.join(', ')}`
        );
        setFormError(errorMessages.join(' '));
      } else {
        setFormError('Error al agregar el estudiante. Verifique los datos e intente de nuevo.');
      }
      console.error('Error al agregar estudiante:', errorData || err.message);
    }
  };

  // --- Handlers para los botones de la tabla ---
  const handleAddClick = () => {
    setFormError('');
    setFormData({
      nombre: '',
      rut: '',
      programa: 'Medicina General',
    });
    setModalState({ type: 'add', data: null });
  };

  const handleEditClick = (estudiante) => {
    setFormError('');
    setFormData(estudiante); // Carga los datos del estudiante en el formulario
    setModalState({ type: 'edit', data: estudiante });
  };

  const handleViewClick = (estudiante) => {
    setModalState({ type: 'view', data: estudiante });
  };

  const handleDeleteClick = (estudiante) => {
    setModalState({ type: 'delete', data: estudiante });
  };

  const confirmDelete = async () => {
    if (modalState.type !== 'delete' || !modalState.data) return;

    try {
      await apiClient.delete(`estudiantes/${modalState.data.id}/`);
      setEstudiantesData(prev => prev.filter(est => est.id !== modalState.data.id));
      closeModal();
    } catch (err) {
      console.error('Error al eliminar estudiante:', err);
      setFormError('No se pudo eliminar al estudiante. Intente de nuevo.');
    }
  };

  if (loading) return <p>Cargando estudiantes...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Alumnos</h2>
          <p className="text-gray-600 mt-1">Administración de estudiantes en rotación</p>
        </div>
        <Button variant="primary" onClick={handleAddClick} className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Agregar Estudiante
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Estudiantes</p>
          <p className="text-2xl font-bold text-gray-800">{estudiantesData.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Estudiantes Activos</p>
          <p className="text-2xl font-bold text-green-600">
            {estudiantesData.filter(e => e.estado === 'activo').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Asistencia Promedio</p>
          <p className="text-2xl font-bold text-gray-800">
            {estudiantesData.length > 0 ? Math.round(estudiantesData.reduce((sum, e) => sum + e.asistencia, 0) / estudiantesData.length) : 0}%
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">En Alerta</p>
          <p className="text-2xl font-bold text-red-600">
            {estudiantesData.filter(e => e.asistencia < 80).length}
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

      {/* Modal para Agregar Estudiante */}
      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          title={
            modalState.type === 'add' ? 'Agregar Nuevo Estudiante' :
            modalState.type === 'edit' ? 'Editar Estudiante' :
            modalState.type === 'view' ? 'Detalles del Estudiante' :
            'Confirmar Eliminación'
          }
        >
          {modalState.type === 'view' ? (
            // --- Contenido para VISTA ---
            <div className="space-y-3 text-sm">
              <p><strong>Nombre:</strong> {modalState.data.nombre}</p>
              <p><strong>RUT:</strong> {modalState.data.rut}</p>
              <p><strong>Programa:</strong> {modalState.data.programa}</p>
              <p><strong>Centro Formador:</strong> {modalState.data.centro_formador_nombre || 'No asignado'}</p>
              <p><strong>Rotación Actual:</strong> {modalState.data.rotacionActual || 'No asignada'}</p>
              <p><strong>Asistencia:</strong> {modalState.data.asistencia}%</p>
              <p><strong>Estado:</strong> <span className="capitalize">{modalState.data.estado}</span></p>
              <div className="flex justify-end pt-4">
                <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
              </div>
            </div>
          ) : modalState.type === 'delete' ? (
            // --- Contenido para ELIMINAR ---
            <div>
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mr-4" />
                <div>
                  <p className="font-semibold">¿Estás seguro de que quieres eliminar a este estudiante?</p>
                  <p className="text-sm text-gray-600 mt-1"><strong>{modalState.data.nombre}</strong> ({modalState.data.rut})</p>
                  <p className="text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
                <Button type="button" variant="primary" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Eliminar</Button>
              </div>
            </div>
          ) : (
            // --- Contenido para AGREGAR y EDITAR ---
            <form onSubmit={handleAgregarEstudiante} className="space-y-4">
              {formError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                  {formError}
                </div>
              )}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input
                  type="text" name="nombre" id="nombre"
                  value={formData.nombre} onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <label htmlFor="rut" className="block text-sm font-medium text-gray-700">RUT</label>
                <input
                  type="text" name="rut" id="rut"
                  value={formData.rut} onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Ej: 12345678-9"
                  disabled={modalState.type === 'edit'} // No permitir editar el RUT
                />
              </div>
              <div>
                <label htmlFor="programa" className="block text-sm font-medium text-gray-700">Programa</label>
                <select
                  name="programa" id="programa"
                  value={formData.programa} onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                >
                  <option>Medicina General</option>
                  <option>Medicina Familiar</option>
                  <option>Especialidad Pediatría</option>
                  <option>Enfermería</option>
                  <option>Otra</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
                <Button type="submit" variant="primary">Guardar Cambios</Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default GestionAlumnos;
