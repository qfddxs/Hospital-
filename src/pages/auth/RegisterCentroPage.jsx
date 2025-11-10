import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Logo from '../../assets/Logo.png';

const RegisterCentroPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Datos del usuario
    email: '',
    password: '',
    confirmPassword: '',
    // Datos del centro
    nombreCentro: '',
    codigo: '',
    direccion: '',
    telefono: '',
    contactoNombre: '',
    contactoCargo: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // 1. Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      // 2. Registrar centro usando función de base de datos (bypass RLS)
      const { data: resultado, error: registroError } = await supabase
        .rpc('registrar_centro_formador', {
          p_nombre: formData.nombreCentro,
          p_codigo: formData.codigo,
          p_direccion: formData.direccion,
          p_telefono: formData.telefono,
          p_email: formData.email,
          p_contacto_nombre: formData.contactoNombre,
          p_contacto_cargo: formData.contactoCargo,
          p_user_id: authData.user.id
        });

      if (registroError) throw registroError;

      if (!resultado.success) {
        throw new Error(resultado.error || 'Error al registrar centro');
      }

      alert('Registro exitoso! Ahora puedes iniciar sesión.');
      navigate('/login-centro');
    } catch (err) {
      console.error('Error en registro:', err);
      setError(err.message || 'Error al registrar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <img 
            src={Logo} 
            alt="Hospital" 
            className="h-20 mx-auto object-contain mb-4"
          />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Registro Centro Formador
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Gestión de Campos Clínicos
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Datos de Acceso */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos de Acceso</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="correo@universidad.cl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Datos del Centro */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos del Centro Formador</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombreCentro" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Centro *
                </label>
                <input
                  id="nombreCentro"
                  name="nombreCentro"
                  type="text"
                  required
                  value={formData.nombreCentro}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Universidad de Chile"
                />
              </div>
              <div>
                <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
                  Código
                </label>
                <input
                  id="codigo"
                  name="codigo"
                  type="text"
                  value={formData.codigo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="UCH"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Av. Libertador Bernardo O'Higgins 1058"
                />
              </div>
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="+56 2 2978 6000"
                />
              </div>
            </div>
          </div>

          {/* Datos de Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Persona de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactoNombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  id="contactoNombre"
                  name="contactoNombre"
                  type="text"
                  value={formData.contactoNombre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label htmlFor="contactoCargo" className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo
                </label>
                <input
                  id="contactoCargo"
                  name="contactoCargo"
                  type="text"
                  value={formData.contactoCargo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Director de Docencia"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Registrando...' : 'Registrar Centro Formador'}
            </button>

            <div className="text-center space-y-2">
              <div>
                <Link
                  to="/login-centro"
                  className="text-sm font-semibold text-teal-600 hover:text-teal-700"
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </Link>
              </div>
              <div className="pt-2 border-t">
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  ¿Eres personal del hospital? Ingresa aquí
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterCentroPage;
