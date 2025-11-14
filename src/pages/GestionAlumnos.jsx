import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Table from '../components/UI/Table';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';

const GestionAlumnos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [centrosFormadores, setCentrosFormadores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCarrera, setFiltroCarrera] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalState, setModalState] = useState({ type: null, data: null });
  const [formData, setFormData] = useState({
    rut: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    centro_formador_id: '',
    carrera: '',
    nivel: '',
  });
  const [formError, setFormError] = useState('');

  // Estados para rotaciones
  const [rotaciones, setRotaciones] = useState([]);
  const [serviciosClinicos, setServiciosClinicos] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [rotacionFormData, setRotacionFormData] = useState({
    alumno_id: '',
    servicio_id: '',
    tutor_id: '',
    fecha_inicio: '',
    fecha_termino: '',
    horas_semanales: 40,
    observaciones: '',
    estado: 'activa'
  });

  const isModalOpen = modalState.type !== null;
  const closeModal = () => {
    setModalState({ type: null, data: null });
    setFormError('');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Obtener centros formadores
      const { data: centros, error: centrosError } = await supabase
        .from('centros_formadores')
        .select('id, nombre')
        .eq('activo', true)
        .order('nombre');

      if (centrosError) throw centrosError;
      setCentrosFormadores(centros || []);

      // Obtener alumnos con centro formador
      const { data: alumnosData, error: alumnosError } = await supabase
        .from('alumnos')
        .select(`
          *,
          centro_formador:centros_formadores(id, nombre)
        `)
        .order('apellidos');

      if (alumnosError) throw alumnosError;
      setAlumnos(alumnosData || []);

      // Obtener rotaciones con servicios y tutores
      const { data: rotacionesData, error: rotacionesError } = await supabase
        .from('rotaciones')
        .select(`
          *,
          servicio:servicios_clinicos(id, nombre),
          tutor:tutores(id, nombres, apellidos)
        `)
        .order('fecha_inicio', { ascending: false });

      if (!rotacionesError) {
        setRotaciones(rotacionesData || []);
      }

      // Obtener servicios clínicos
      const { data: serviciosData, error: serviciosError } = await supabase
        .from('servicios_clinicos')
        .select('*')
        .eq('activo', true)
        .order('nombre');

      if (serviciosError) {
        console.error('Error cargando servicios:', serviciosError);
      } else {
        console.log('Servicios cargados:', serviciosData);
        setServiciosClinicos(serviciosData || []);
      }

      // Obtener tutores
      const { data: tutoresData, error: tutoresError } = await supabase
        .from('tutores')
        .select('*')
        .eq('activo', true)
        .order('apellidos');

      if (tutoresError) {
        console.error('Error cargando tutores:', tutoresError);
      } else {
        console.log('Tutores cargados:', tutoresData);
        setTutores(tutoresData || []);
      }
    } catch (err) {
      setError('No se pudieron cargar los alumnos.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'RUT', accessor: 'rut' },
    {
      header: 'Nombre Completo',
      render: (row) => `${row.nombres} ${row.apellidos}`
    },
    { header: 'Carrera', accessor: 'carrera' },
    { header: 'Nivel', accessor: 'nivel' },
    {
      header: 'Centro Formador',
      render: (row) => row.centro_formador?.nombre || '-'
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (row) => <span className="text-xs text-gray-700 dark:text-gray-300">{row.email || '-'}</span>
    },
    {
      header: 'Estado',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${row.activo ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
          }`}>
          {row.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      header: 'Rotación Actual',
      render: (row) => {
        const rotacionesAlumno = getRotacionesAlumno(row.id);
        const rotacionActiva = rotacionesAlumno.find(r => r.estado === 'activa');
        return (
          <div className="flex items-center gap-2">
            {rotacionActiva ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                  {rotacionActiva.servicio?.nombre || 'Servicio no especificado'}
                </span>
                <button 
                  onClick={() => handleRotacionClick(row)} 
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                  title="Cambiar rotación"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleRotacionClick(row)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 dark:bg-purple-700 text-white text-xs font-medium rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors shadow-sm"
              >
                <CalendarDaysIcon className="w-4 h-4" />
                Asignar Rotación
              </button>
            )}
          </div>
        );
      }
    },
    {
      header: 'Acciones',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleViewClick(row)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="Ver Detalles">
            <EyeIcon className="w-4 h-4" />
          </button>
          <button onClick={() => handleEditClick(row)} className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors" title="Editar">
            <PencilIcon className="w-4 h-4" />
          </button>
          <button onClick={() => handleDeleteClick(row)} className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Eliminar">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const datosFiltrados = alumnos.filter(alumno => {
    const nombreCompleto = `${alumno.nombres} ${alumno.apellidos}`.toLowerCase();
    const cumpleBusqueda = nombreCompleto.includes(busqueda.toLowerCase()) ||
      alumno.rut.includes(busqueda);
    const cumpleCarrera = filtroCarrera === 'todos' || alumno.carrera === filtroCarrera;
    return cumpleBusqueda && cumpleCarrera;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const dataToSend = {
      rut: formData.rut,
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      email: formData.email || null,
      telefono: formData.telefono || null,
      centro_formador_id: formData.centro_formador_id || null,
      carrera: formData.carrera,
      nivel: formData.nivel || null,
      activo: true
    };

    try {
      if (modalState.type === 'add') {
        const { data, error } = await supabase
          .from('alumnos')
          .insert([dataToSend])
          .select(`
            *,
            centro_formador:centros_formadores(id, nombre)
          `);

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('No se recibieron datos');

        setAlumnos(prev => [...prev, data[0]]);
      } else if (modalState.type === 'edit') {
        const { data, error } = await supabase
          .from('alumnos')
          .update(dataToSend)
          .eq('id', modalState.data.id)
          .select(`
            *,
            centro_formador:centros_formadores(id, nombre)
          `);

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('No se recibieron datos');

        setAlumnos(prev => prev.map(a => a.id === modalState.data.id ? data[0] : a));
      }
      closeModal();
    } catch (err) {
      setFormError(err.message || 'Error al guardar alumno');
      console.error('Error:', err);
    }
  };

  const confirmDelete = async () => {
    if (modalState.type !== 'delete' || !modalState.data) return;

    try {
      const { error } = await supabase
        .from('alumnos')
        .delete()
        .eq('id', modalState.data.id);

      if (error) throw error;

      setAlumnos(prev => prev.filter(a => a.id !== modalState.data.id));
      closeModal();
    } catch (err) {
      setFormError('No se pudo eliminar el alumno');
      console.error('Error:', err);
    }
  };

  const handleAddClick = () => {
    setFormData({
      rut: '',
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      centro_formador_id: '',
      carrera: '',
      nivel: '',
    });
    setModalState({ type: 'add', data: null });
  };

  const handleEditClick = (alumno) => {
    setFormData({
      rut: alumno.rut,
      nombres: alumno.nombres,
      apellidos: alumno.apellidos,
      email: alumno.email || '',
      telefono: alumno.telefono || '',
      centro_formador_id: alumno.centro_formador_id || '',
      carrera: alumno.carrera,
      nivel: alumno.nivel || '',
    });
    setModalState({ type: 'edit', data: alumno });
  };

  const handleViewClick = (alumno) => {
    setModalState({ type: 'view', data: alumno });
  };

  const handleDeleteClick = (alumno) => {
    setModalState({ type: 'delete', data: alumno });
  };

  const handleRotacionClick = (alumno = null) => {
    setRotacionFormData({
      alumno_id: alumno?.id || '',
      servicio_id: '',
      tutor_id: '',
      fecha_inicio: '',
      fecha_termino: '',
      horas_semanales: 40,
      observaciones: '',
      estado: 'activa'
    });
    setModalState({ type: 'rotacion', data: alumno });
  };

  const handleRotacionMasivaClick = () => {
    setRotacionFormData({
      alumno_id: '',
      servicio_id: '',
      tutor_id: '',
      fecha_inicio: '',
      fecha_termino: '',
      horas_semanales: 40,
      observaciones: '',
      estado: 'activa'
    });
    setModalState({ type: 'rotacion', data: null });
  };

  const handleRotacionInputChange = (e) => {
    const { name, value } = e.target;
    setRotacionFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRotacionSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      const { data, error } = await supabase
        .from('rotaciones')
        .insert([rotacionFormData])
        .select();

      if (error) throw error;

      setRotaciones(prev => [...prev, data[0]]);
      closeModal();
      alert('Rotación asignada exitosamente');
    } catch (err) {
      setFormError(err.message || 'Error al asignar rotación');
      console.error('Error:', err);
    }
  };

  const getRotacionesAlumno = (alumnoId) => {
    return rotaciones.filter(r => r.alumno_id === alumnoId);
  };

  if (loading) return <p className="text-gray-600 dark:text-gray-400">Cargando alumnos...</p>;
  if (error) return <p className="text-red-500 dark:text-red-400">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestión de Alumnos</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Administración de estudiantes en rotación</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            onClick={handleRotacionMasivaClick}
            className="flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700"
          >
            <CalendarDaysIcon className="w-5 h-5" />
            Asignar Rotaciones
          </Button>
          <Button variant="primary" onClick={handleAddClick} className="flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Agregar Alumno
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-colors">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Alumnos</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{alumnos.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-colors">
          <p className="text-sm text-gray-600 dark:text-gray-400">Alumnos Activos</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {alumnos.filter(a => a.activo).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-colors">
          <p className="text-sm text-gray-600 dark:text-gray-400">En Rotación</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {alumnos.filter(a => {
              const rotacionesAlumno = getRotacionesAlumno(a.id);
              return rotacionesAlumno.find(r => r.estado === 'activa');
            }).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-colors">
          <p className="text-sm text-gray-600 dark:text-gray-400">Sin Rotación</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {alumnos.filter(a => {
              const rotacionesAlumno = getRotacionesAlumno(a.id);
              return !rotacionesAlumno.find(r => r.estado === 'activa') && a.activo;
            }).length}
          </p>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-colors">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre o RUT..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Carrera:</label>
            <select
              value={filtroCarrera}
              onChange={(e) => setFiltroCarrera(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
            >
              <option value="todos">Todas</option>
              <option value="Medicina">Medicina</option>
              <option value="Enfermería">Enfermería</option>
              <option value="Kinesiología">Kinesiología</option>
              <option value="Obstetricia">Obstetricia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <Table columns={columns} data={datosFiltrados} />

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={
            modalState.type === 'add' ? 'Agregar Nuevo Alumno' :
              modalState.type === 'edit' ? 'Editar Alumno' :
                modalState.type === 'view' ? 'Detalles del Alumno' :
                  modalState.type === 'rotacion' ? 'Asignar Rotación Clínica' :
                    'Confirmar Eliminación'
          }
        >
          {modalState.type === 'view' ? (
            <div className="space-y-3 text-sm">
              <p><strong>RUT:</strong> {modalState.data.rut}</p>
              <p><strong>Nombres:</strong> {modalState.data.nombres}</p>
              <p><strong>Apellidos:</strong> {modalState.data.apellidos}</p>
              <p><strong>Email:</strong> {modalState.data.email || '-'}</p>
              <p><strong>Teléfono:</strong> {modalState.data.telefono || '-'}</p>
              <p><strong>Centro Formador:</strong> {modalState.data.centro_formador?.nombre || '-'}</p>
              <p><strong>Carrera:</strong> {modalState.data.carrera}</p>
              <p><strong>Nivel:</strong> {modalState.data.nivel || '-'}</p>
              <p><strong>Estado:</strong> {modalState.data.activo ? 'Activo' : 'Inactivo'}</p>
              <div className="flex justify-end pt-4">
                <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
              </div>
            </div>
          ) : modalState.type === 'rotacion' ? (
            <div>
              {/* Información del alumno o selector */}
              {modalState.data ? (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>Alumno:</strong> {modalState.data.nombres} {modalState.data.apellidos}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Carrera:</strong> {modalState.data.carrera}
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  <label htmlFor="alumno_select" className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Alumno *
                  </label>
                  <select
                    id="alumno_select"
                    value={rotacionFormData.alumno_id}
                    onChange={(e) => {
                      const alumnoId = e.target.value;
                      setRotacionFormData(prev => ({ ...prev, alumno_id: alumnoId }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    <option value="">Seleccione un alumno...</option>
                    {alumnos
                      .filter(a => a.activo)
                      .sort((a, b) => a.apellidos.localeCompare(b.apellidos))
                      .map(alumno => {
                        const rotacionesAlumno = getRotacionesAlumno(alumno.id);
                        const tieneRotacionActiva = rotacionesAlumno.find(r => r.estado === 'activa');
                        return (
                          <option key={alumno.id} value={alumno.id}>
                            {alumno.apellidos}, {alumno.nombres} - {alumno.carrera}
                            {tieneRotacionActiva ? ' (Ya tiene rotación activa)' : ''}
                          </option>
                        );
                      })}
                  </select>
                </div>
              )}

              {/* Mostrar rotaciones existentes del alumno seleccionado */}
              {(modalState.data?.id || rotacionFormData.alumno_id) && 
               getRotacionesAlumno(modalState.data?.id || rotacionFormData.alumno_id).length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">Rotaciones Anteriores:</h4>
                  <div className="space-y-2">
                    {getRotacionesAlumno(modalState.data?.id || rotacionFormData.alumno_id).map(rot => (
                      <div key={rot.id} className="text-xs bg-gray-50 p-2 rounded">
                        <span className={`font-medium ${rot.estado === 'activa' ? 'text-green-600' : 'text-gray-600'}`}>
                          {rot.servicio?.nombre || 'Servicio no especificado'}
                        </span>
                        {rot.tutor && ` - ${rot.tutor.nombres} ${rot.tutor.apellidos}`}
                        {' - '}
                        {new Date(rot.fecha_inicio).toLocaleDateString()} a {new Date(rot.fecha_termino).toLocaleDateString()}
                        {' '}
                        <span className={`px-2 py-1 rounded text-xs ${rot.estado === 'activa' ? 'bg-green-100 text-green-800' :
                            rot.estado === 'completada' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {rot.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleRotacionSubmit} className="space-y-4">
                {formError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{formError}</div>}

                <div>
                  <label htmlFor="servicio_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Servicio Clínico *
                  </label>
                  <select
                    id="servicio_id"
                    name="servicio_id"
                    value={rotacionFormData.servicio_id}
                    onChange={handleRotacionInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Seleccione un servicio...</option>
                    {serviciosClinicos.map(servicio => (
                      <option key={servicio.id} value={servicio.id}>
                        {servicio.nombre}
                      </option>
                    ))}
                  </select>
                  {serviciosClinicos.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No hay servicios clínicos disponibles. Ejecuta el script crear-servicios-tutores.sql</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Inicio *
                    </label>
                    <input
                      type="date"
                      id="fecha_inicio"
                      name="fecha_inicio"
                      value={rotacionFormData.fecha_inicio}
                      onChange={handleRotacionInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="fecha_termino" className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Término *
                    </label>
                    <input
                      type="date"
                      id="fecha_termino"
                      name="fecha_termino"
                      value={rotacionFormData.fecha_termino}
                      onChange={handleRotacionInputChange}
                      required
                      min={rotacionFormData.fecha_inicio}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="tutor_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Tutor Responsable
                  </label>
                  <select
                    id="tutor_id"
                    name="tutor_id"
                    value={rotacionFormData.tutor_id}
                    onChange={handleRotacionInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Seleccione un tutor...</option>
                    {tutores.map(tutor => (
                      <option key={tutor.id} value={tutor.id}>
                        {tutor.nombres} {tutor.apellidos}
                      </option>
                    ))}
                  </select>
                  {tutores.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No hay tutores disponibles. Ejecuta el script crear-servicios-tutores.sql</p>
                  )}
                </div>

                <div>
                  <label htmlFor="horas_semanales" className="block text-sm font-medium text-gray-700 mb-1">
                    Horas Semanales
                  </label>
                  <input
                    type="number"
                    id="horas_semanales"
                    name="horas_semanales"
                    value={rotacionFormData.horas_semanales}
                    onChange={handleRotacionInputChange}
                    min="1"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    value={rotacionFormData.observaciones}
                    onChange={handleRotacionInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Información adicional sobre la rotación..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
                  <Button type="submit" variant="primary">Asignar Rotación</Button>
                </div>
              </form>
            </div>
          ) : modalState.type === 'delete' ? (
            <div>
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mr-4" />
                <div>
                  <p className="font-semibold">¿Estás seguro de eliminar este alumno?</p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>{modalState.data.nombres} {modalState.data.apellidos}</strong> ({modalState.data.rut})
                  </p>
                  <p className="text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
                </div>
              </div>
              {formError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{formError}</div>}
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
                <Button type="button" variant="primary" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Eliminar</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{formError}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-1">RUT *</label>
                  <input
                    type="text"
                    id="rut"
                    name="rut"
                    value={formData.rut}
                    onChange={handleInputChange}
                    required
                    disabled={modalState.type === 'edit'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="12345678-9"
                  />
                </div>
                <div>
                  <label htmlFor="centro_formador_id" className="block text-sm font-medium text-gray-700 mb-1">Centro Formador</label>
                  <select
                    id="centro_formador_id"
                    name="centro_formador_id"
                    value={formData.centro_formador_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Seleccione...</option>
                    {centrosFormadores.map(centro => (
                      <option key={centro.id} value={centro.id}>{centro.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
                  <input
                    type="text"
                    id="nombres"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Juan Carlos"
                  />
                </div>
                <div>
                  <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    id="apellidos"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Pérez González"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="alumno@universidad.cl"
                  />
                </div>
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="carrera" className="block text-sm font-medium text-gray-700 mb-1">Carrera *</label>
                  <select
                    id="carrera"
                    name="carrera"
                    value={formData.carrera}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Medicina">Medicina</option>
                    <option value="Enfermería">Enfermería</option>
                    <option value="Kinesiología">Kinesiología</option>
                    <option value="Obstetricia">Obstetricia</option>
                    <option value="Nutrición">Nutrición</option>
                    <option value="Tecnología Médica">Tecnología Médica</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
                  <input
                    type="text"
                    id="nivel"
                    name="nivel"
                    value={formData.nivel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="4to año, Internado, etc."
                  />
                </div>
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

export default GestionAlumnos;
