import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Button from '../components/UI/Button';
import { 
  BuildingOffice2Icon, 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  MapPinIcon,
  AcademicCapIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const RegistroCoordinador = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [yaRegistrado, setYaRegistrado] = useState(false);
  const [centroExistente, setCentroExistente] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Datos del coordinador
    nombre_completo: '',
    email: '',
    
    // Datos de la universidad
    nombre_universidad: '',
    codigo: '',
    direccion: '',
    telefono: '',
    email_universidad: '',
    nivel_formacion: 'ambos',
    especialidades: '',
  });

  useEffect(() => {
    checkRegistro();
  }, []);

  const checkRegistro = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Verificar si ya está registrado
      const { data: usuarioCentro, error: errorCheck } = await supabase
        .from('usuarios_centros')
        .select('*, centros_formadores(*)')
        .eq('user_id', user.id)
        .single();

      if (usuarioCentro && usuarioCentro.centro_formador_id) {
        setYaRegistrado(true);
        setCentroExistente(usuarioCentro.centros_formadores);
      }

      // Pre-llenar email del usuario
      setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }));

    } catch (err) {
      console.error('Error al verificar registro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // 1. Crear el centro formador (universidad)
      const especialidadesArray = formData.especialidades
        .split(',')
        .map(e => e.trim())
        .filter(e => e);

      const { data: centro, error: errorCentro } = await supabase
        .from('centros_formadores')
        .insert([{
          nombre: formData.nombre_universidad,
          codigo: formData.codigo || `UNIV-${Date.now()}`,
          direccion: formData.direccion,
          telefono: formData.telefono,
          email: formData.email_universidad,
          contacto_nombre: formData.nombre_completo,
          contacto_cargo: 'Coordinador',
          nivel_formacion: formData.nivel_formacion,
          especialidades: especialidadesArray,
          capacidad_total: 0,
          capacidad_disponible: 0,
          activo: true
        }])
        .select()
        .single();

      if (errorCentro) throw errorCentro;

      // 2. Vincular el usuario con el centro formador
      const { error: errorUsuario } = await supabase
        .from('usuarios_centros')
        .insert([{
          user_id: user.id,
          centro_formador_id: centro.id,
          rol: 'coordinador',
          nombre_completo: formData.nombre_completo,
          email: formData.email,
          activo: true
        }]);

      if (errorUsuario) throw errorUsuario;

      setSuccess(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/solicitudes-cupo');
      }, 2000);

    } catch (err) {
      console.error('Error al registrar:', err);
      setError(err.message || 'Error al registrar. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (yaRegistrado && centroExistente) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <CheckCircleIcon className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Ya estás registrado
          </h2>
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <BuildingOffice2Icon className="w-5 h-5 text-teal-600" />
              {centroExistente.nombre}
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              {centroExistente.codigo && (
                <p><strong>Código:</strong> {centroExistente.codigo}</p>
              )}
              {centroExistente.direccion && (
                <p className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  {centroExistente.direccion}
                </p>
              )}
              {centroExistente.email && (
                <p className="flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  {centroExistente.email}
                </p>
              )}
              {centroExistente.telefono && (
                <p className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4" />
                  {centroExistente.telefono}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            <Button onClick={() => navigate('/solicitudes-cupo')}>
              Ir a Solicitudes de Cupo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Registro Exitoso!
          </h2>
          <p className="text-gray-600 mb-4">
            Tu universidad ha sido registrada correctamente.
          </p>
          <p className="text-sm text-gray-500">
            Redirigiendo a solicitudes de cupo...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Registro de Coordinador Universitario
        </h2>
        <p className="text-gray-600 mb-8">
          Registra tu universidad para poder solicitar cupos de campos clínicos
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Datos del Coordinador */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-teal-600" />
              Datos del Coordinador
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Datos de la Universidad */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BuildingOffice2Icon className="w-6 h-6 text-teal-600" />
              Datos de la Universidad
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Universidad *
                  </label>
                  <input
                    type="text"
                    name="nombre_universidad"
                    value={formData.nombre_universidad}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Ej: Universidad de Chile"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código (opcional)
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Ej: UCH"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Dirección de la universidad"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Institucional
                  </label>
                  <input
                    type="email"
                    name="email_universidad"
                    value={formData.email_universidad}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="contacto@universidad.cl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <AcademicCapIcon className="w-4 h-4" />
                  Nivel de Formación *
                </label>
                <select
                  name="nivel_formacion"
                  value={formData.nivel_formacion}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  required
                >
                  <option value="pregrado">Solo Pregrado</option>
                  <option value="postgrado">Solo Postgrado</option>
                  <option value="ambos">Pregrado y Postgrado</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Selecciona los niveles de formación que ofrece tu universidad
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialidades / Carreras
                </label>
                <input
                  type="text"
                  name="especialidades"
                  value={formData.especialidades}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Ej: Medicina, Enfermería, Kinesiología (separadas por coma)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa las carreras o especialidades separadas por comas
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar Universidad'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroCoordinador;
