import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useSession } from '../../context/SessionContext';
import { useUserRole } from '../../context/UserRoleContext';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import Table from '../../components/UI/Table';

const PortalCentroFormador = () => {
  const navigate = useNavigate();
  const { user, signOut } = useSession();
  const { centroFormadorId, isCentroFormador, loading: roleLoading } = useUserRole();
  
  const [solicitudes, setSolicitudes] = useState([]);
  const [centroInfo, setCentroInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [modalState, setModalState] = useState({ type: null, data: null });
  const [formData, setFormData] = useState({
    especialidad: '',
    numero_cupos: 1,
    fecha_inicio: '',
    fecha_termino: '',
    solicitante: '',
    comentarios: '',
  });
  const [formError, setFormError] = useState('');

  const isModalOpen = modalState.type !== null;
  const closeModal = () => {
    setModalState({ type: null, data: null });
    setFormError('');
  };

  useEffect(() => {
    if (!roleLoading && !isCentroFormador) {
      // Si no es centro formador, redirigir al dashboard normal
      navigate('/dashboard');
    }
  }, [isCentroFormador, roleLoading, navigate]);

  useEffect(() => {
    if (centroFormadorId) {
      fetchData();
    }
  }, [centroFormadorId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Obtener información del centro
      const { data: centro, error: centroError } = await supabase
        .from('centros_formadores')
        .select('*')
        .eq('id', centroFormadorId)
        .single();
      
      if (centroError) throw centroError;
      setCentroInfo(centro);

      // Obtener solicitudes del centro
      const { data: solicitudesData, error: solicitudesError } = await supabase
        .from('solicitudes_cupos')
        .select('*')
        .eq('centro_formador_id', centroFormadorId)
        .order('fecha_solicitud', { ascending: false });
      
      if (solicitudesError) throw solicitudesError;
      setSolicitudes(solicitudesData || []);
    } catch (err) {
      setError('No se pudieron cargar los datos.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const dataToSend = {
      centro_formador_id: centroFormadorId,
      especialidad: formData.especialidad,
      numero_cupos: parseInt(formData.numero_cupos, 10),
      fecha_inicio: formData.fecha_inicio || null,
      fecha_termino: formData.fecha_termino || null,
      solicitante: formData.solicitante || user?.email,
      comentarios: formData.comentarios,
      estado: 'pendiente'
    };

    try {
      const { data, error } = await supabase
        .from('solicitudes_cupos')
        .insert([dataToSend])
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('No se pudo crear la solicitud.');
      }

      setSolicitudes(prev => [data[0], ...prev]);
      closeModal();
      alert('Solicitud enviada exitosamente');
    } catch (err) {
      setFormError(err.message || 'Ocurrió un error al guardar.');
      console.error('Error:', err);
    }
  };

  const handleAddClick = () => {
    setFormData({
      especialidad: '',
      numero_cupos: 1,
      fecha_inicio: '',
      fecha_termino: '',
      solicitante: user?.email || '',
      comentarios: '',
    });
    setModalState({ type: 'add', data: null });
  };

  const handleViewClick = (solicitud) => {
    setModalState({ type: 'view', data: solicitud });
  };

  const columns = [
    { header: 'Especialidad', accessor: 'especialidad' },
    { 
      header: 'N° Cupos', 
      accessor: 'numero_cupos',
      render: (row) => <span className="font-semibold">{row.numero_cupos}</span>
    },
    { 
      header: 'Fecha Solicitud', 
      render: (row) => new Date(row.fecha_solicitud).toLocaleDateString('es-CL')
    },
    { 
      header: 'Periodo', 
      render: (row) => (
        <div className="text-xs">
          <div>{row.fecha_inicio ? new Date(row.fecha_inicio).toLocaleDateString('es-CL') : '-'}</div>
          <div className="text-gray-500">{row.fecha_termino ? new Date(row.fecha_termino).toLocaleDateString('es-CL') : '-'}</div>
        </div>
      )
    },
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
    },
    {
      header: 'Acciones',
      render: (row) => (
        <button 
          onClick={() => handleViewClick(row)} 
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Ver detalles
        </button>
      ),
    },
  ];

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-teal-700">Portal Centro Formador</h1>
            <p className="text-gray-600">{centroInfo?.nombre}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
              <p className="text-xs text-gray-500">Centro Formador</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto p-6 space-y-6">
        {/* Información del Centro */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Información del Centro</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Código</p>
              <p className="font-semibold">{centroInfo?.codigo || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-semibold">{centroInfo?.email || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Teléfono</p>
              <p className="font-semibold">{centroInfo?.telefono || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600">Dirección</p>
              <p className="font-semibold">{centroInfo?.direccion || '-'}</p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">Total Solicitudes</p>
            <p className="text-2xl font-bold text-gray-800">{solicitudes.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">
              {solicitudes.filter(s => s.estado === 'pendiente').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">Aprobadas</p>
            <p className="text-2xl font-bold text-green-600">
              {solicitudes.filter(s => s.estado === 'aprobada').length}
            </p>
          </div>
        </div>

        {/* Mis Solicitudes */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Mis Solicitudes de Cupos</h2>
            <Button variant="primary" onClick={handleAddClick}>
              + Nueva Solicitud
            </Button>
          </div>
          
          {solicitudes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No tienes solicitudes aún</p>
              <p className="text-sm mt-2">Haz click en "Nueva Solicitud" para comenzar</p>
            </div>
          ) : (
            <Table columns={columns} data={solicitudes} />
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={modalState.type === 'add' ? 'Nueva Solicitud de Cupos' : 'Detalles de la Solicitud'}
        >
          {modalState.type === 'view' ? (
            <div className="space-y-3 text-sm">
              <p><strong>Especialidad:</strong> {modalState.data.especialidad}</p>
              <p><strong>Número de Cupos:</strong> {modalState.data.numero_cupos}</p>
              <p><strong>Fecha Solicitud:</strong> {new Date(modalState.data.fecha_solicitud).toLocaleDateString('es-CL')}</p>
              <p><strong>Fecha Inicio:</strong> {modalState.data.fecha_inicio ? new Date(modalState.data.fecha_inicio).toLocaleDateString('es-CL') : '-'}</p>
              <p><strong>Fecha Término:</strong> {modalState.data.fecha_termino ? new Date(modalState.data.fecha_termino).toLocaleDateString('es-CL') : '-'}</p>
              <p><strong>Solicitante:</strong> {modalState.data.solicitante || '-'}</p>
              <p><strong>Comentarios:</strong> {modalState.data.comentarios || '-'}</p>
              <p><strong>Estado:</strong> <span className="capitalize font-semibold">{modalState.data.estado}</span></p>
              {modalState.data.motivo_rechazo && (
                <div className="bg-red-50 border border-red-200 p-3 rounded">
                  <p className="font-semibold text-red-800">Motivo del Rechazo:</p>
                  <p className="text-red-700">{modalState.data.motivo_rechazo}</p>
                </div>
              )}
              <div className="flex justify-end pt-4">
                <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{formError}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="especialidad" className="block text-sm font-medium text-gray-700 mb-2">
                    Especialidad *
                  </label>
                  <input
                    type="text"
                    id="especialidad"
                    name="especialidad"
                    value={formData.especialidad}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Ej: Medicina Interna"
                  />
                </div>
                <div>
                  <label htmlFor="numero_cupos" className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Cupos *
                  </label>
                  <input
                    type="number"
                    id="numero_cupos"
                    name="numero_cupos"
                    value={formData.numero_cupos}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    id="fecha_inicio"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="fecha_termino" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Término
                  </label>
                  <input
                    type="date"
                    id="fecha_termino"
                    name="fecha_termino"
                    value={formData.fecha_termino}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="solicitante" className="block text-sm font-medium text-gray-700 mb-2">
                  Solicitante
                </label>
                <input
                  type="text"
                  id="solicitante"
                  name="solicitante"
                  value={formData.solicitante}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Nombre del solicitante"
                />
              </div>

              <div>
                <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 mb-2">
                  Comentarios
                </label>
                <textarea
                  id="comentarios"
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Información adicional..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
                <Button type="submit" variant="primary">Enviar Solicitud</Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default PortalCentroFormador;
