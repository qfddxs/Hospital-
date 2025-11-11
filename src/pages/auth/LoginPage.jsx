import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../../assets/Logo.png';
import logoCircular from '../../assets/logoCircular.png';
import { useSession } from '../../context/SessionContext';
import { supabase } from '../../supabaseClient';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, session } = useSession();

  useEffect(() => {
    // Mostrar error si viene del Dashboard bloqueado
    if (location.state?.error) {
      setError(location.state.error);
    }
    
    const checkSessionAndRedirect = async () => {
      if (session) {
        // Verificar si es un centro formador antes de redirigir
        const { data: centroData } = await supabase
          .from('usuarios_centros')
          .select('rol')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (centroData && centroData.rol === 'centro_formador') {
          // No redirigir, es un centro formador
          return;
        }
        
        // Es personal del hospital, redirigir al dashboard
        navigate('/dashboard');
      }
    };
    
    checkSessionAndRedirect();
  }, [session, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await signIn(email, password);

    if (error) {
      setLoading(false);
      setError('Email o contraseña incorrectos. Por favor, intente de nuevo.');
      console.error('Error de autenticación:', error);
      return;
    }

    // Verificar si es un centro formador
    try {
      const { data: centroData } = await supabase
        .from('usuarios_centros')
        .select('rol')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (centroData && centroData.rol === 'centro_formador') {
        // Es un centro formador, NO puede acceder al sistema del hospital
        await supabase.auth.signOut();
        setLoading(false);
        setError('Acceso denegado. Esta cuenta es de un Centro Formador. Ingresa en: /portal-formadora/login');
        return;
      }
    } catch (err) {
      console.error('Error verificando rol:', err);
    }

    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sección izquierda - Formulario */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center px-8">
        <div className="w-full max-w-md">
          {/* Logo y título */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <img
                src={Logo}
                alt="Hospital"
                className="h-24 mx-auto object-contain"
              />
            </div>
            <p className="text-gray-600">Sistema de Gestión de Capacidad Formadora</p>
          </div>

          {/* Formulario */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Campo Email/RUT */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="usuario@hospital.cl"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Campo Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    ) : (
                      <>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Opciones */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Recordarme</span>
              </label>
              <a href="#" className="text-gray-600 hover:text-teal-600">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Iniciando sesión...' : 'Login'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600">
            
          </div>
        </div>
      </div>

      {/* Sección derecha - Ilustración */}
      <div className="flex-1 bg-gradient-to-br from-teal-50 to-blue-50 flex flex-col justify-center items-center px-8 relative overflow-hidden">
        {/* Contenido central */}
        <div className="text-center z-10">
          <h1 className="text-4xl font-bold text-teal-700 mb-2">
            Hospital Regional Rancagua
          </h1>
          <p className="text-lg text-gray-600 mb-16">Servicio de Gestión</p>

          {/* Círculo con logo e iconos */}
          <div className="relative w-80 h-80 mx-auto">
            {/* Círculo central */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl p-2 border-4 border-teal-500">
                <img
                  src={logoCircular}
                  alt="HRR"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Iconos médicos alrededor */}
            <div className="absolute inset-0 animate-spin-slow">
              {/* Estetoscopio */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 14.5v-1.5c0-2.21-1.79-4-4-4s-4 1.79-4 4v1.5c0 2.21 1.79 4 4 4s4-1.79 4-4zm-6 0v-1.5c0-1.1.9-2 2-2s2 .9 2 2v1.5c0 1.1-.9 2-2 2s-2-.9-2-2z" />
                </svg>
              </div>

              {/* Corazón */}
              <div className="absolute top-12 right-8 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>

              {/* Cruz médica */}
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </div>

              {/* Jeringa */}
              <div className="absolute bottom-12 right-8 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-2v2h-2V3h-2v2h-2V3H9v2H7V3H5v18h14V3zm-7 14H7v-2h5v2zm3-4H7v-2h8v2zm0-4H7V7h8v2z" />
                </svg>
              </div>

              {/* Portapapeles */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
                </svg>
              </div>

              {/* Ambulancia */}
              <div className="absolute bottom-12 left-8 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z" />
                </svg>
              </div>

              {/* Píldora */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.22 11.29l7.07-7.07c.78-.78 2.05-.78 2.83 0l4.95 4.95c.78.78.78 2.05 0 2.83l-7.07 7.07c-.78.78-2.05.78-2.83 0L4.22 14.12c-.78-.78-.78-2.05 0-2.83z" />
                </svg>
              </div>

              {/* Microscopio */}
              <div className="absolute top-12 left-8 w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.5 12c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Decoración de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-teal-500 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-500 rounded-full"></div>
          <div className="absolute top-1/2 right-10 w-16 h-16 bg-green-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
