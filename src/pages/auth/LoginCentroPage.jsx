import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useSession } from '../../context/SessionContext';
import Logo from '../../assets/Logo.png';

const LoginCentroPage = () => {
  const navigate = useNavigate();
  const { signIn, session } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      // Si ya está autenticado, verificar si es centro formador
      checkUserRole();
    }
  }, [session]);

  const checkUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios_centros')
        .select('rol, centro_formador_id')
        .eq('user_id', session.user.id)
        .eq('activo', true)
        .single();

      if (!error && data?.rol === 'centro_formador') {
        navigate('/portal-centro');
      } else {
        // No es centro formador, cerrar sesión
        await supabase.auth.signOut();
        setError('Este usuario no es un centro formador');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await signIn(email, password);

    if (error) {
      setLoading(false);
      setError('Email o contraseña incorrectos');
      console.error('Error de autenticación:', error);
      return;
    }

    // Verificar que sea un centro formador
    try {
      const { data: userData, error: userError } = await supabase
        .from('usuarios_centros')
        .select('rol, centro_formador_id')
        .eq('user_id', data.user.id)
        .eq('activo', true)
        .single();

      setLoading(false);

      if (userError || !userData) {
        await supabase.auth.signOut();
        setError('Este usuario no está registrado como centro formador');
        return;
      }

      if (userData.rol !== 'centro_formador') {
        await supabase.auth.signOut();
        setError('Este usuario no tiene permisos de centro formador');
        return;
      }

      // Todo correcto, redirigir al portal
      navigate('/portal-centro');
    } catch (err) {
      setLoading(false);
      await supabase.auth.signOut();
      setError('Error al verificar permisos');
      console.error('Error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <img 
            src={Logo} 
            alt="Hospital" 
            className="h-20 mx-auto object-contain mb-4"
          />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Portal Centro Formador
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inicia sesión para gestionar tus solicitudes
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="correo@universidad.cl"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <div className="space-y-3 text-center text-sm">
            <div>
              <Link
                to="/registro-centro"
                className="font-semibold text-teal-600 hover:text-teal-700"
              >
                ¿No tienes cuenta? Regístrate aquí
              </Link>
            </div>
            <div className="pt-4 border-t">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-800"
              >
                ¿Eres personal del hospital? Ingresa aquí
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginCentroPage;
