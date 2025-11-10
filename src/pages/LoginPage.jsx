import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.png';
import logoCircular from '../assets/logoCircular.png';
import apiClient from '../../api.js'; // Importa tu cliente axios configurado

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [username, setUsername] = useState(''); // Usaremos el RUT como username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos

    try {
      // Usa apiClient para la petición de login.
      // El endpoint es solo 'token/' porque la baseURL ya está en apiClient.
      const response = await apiClient.post('token/', {
        username: username, // Django espera 'username'
        password: password,
      });

      // Guarda los tokens en localStorage
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      navigate('/dashboard');
    } catch (err) {
      setError('RUT o contraseña incorrectos. Por favor, intente de nuevo.');
      console.error('Error de autenticación:', err);
    }
  };

  return (
    <div className="min-h-screen flex login-container">
      {/* Sección izquierda - Formulario de login */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center px-8 relative">
        {/* Línea superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-teal-700"></div>
        
        {/* Contenido principal */}
        <div className="w-full max-w-md">
          {/* Logo y título */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <img 
                src={Logo} 
                alt="Hospital Dr. Franco Ravera Zunino" 
                className="h-20 mx-auto object-contain"
              />
            </div>
            <p className="text-lg text-gray-600">Sistema de Gestión de Capacidad Formadora</p>
          </div>

          {/* Formulario */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Campo de RUT */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                RUT
              </label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                placeholder="12.345.678-9"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Campo de contraseña */}
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
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Recordarme</span>
              </label>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-teal-600"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón de login */}
            <button
              type="submit"
              className="w-full login-button text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 bg-teal-600 hover:bg-teal-700"
            >
              Login
            </button>          
          </form>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-8 text-sm text-gray-600">
          <span>Developed by: </span>
          <span className="font-semibold">
            <span className="text-teal-700">Gnza</span>
          </span>
        </div>

        {/* Ilustración de fondo */}
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
          <svg viewBox="0 0 1200 60" className="w-full h-full">
            <path
              d="M0,40 Q200,20 400,30 T800,25 T1200,35 L1200,60 L0,60 Z"
              fill="#E5E7EB"
            />
            <circle cx="100" cy="20" r="3" fill="#9CA3AF" />
            <rect x="200" y="15" width="4" height="8" fill="#9CA3AF" />
            <polygon points="300,25 305,15 310,25" fill="#9CA3AF" />
            <rect x="400" y="12" width="6" height="12" fill="#9CA3AF" />
            <circle cx="500" cy="18" r="2" fill="#9CA3AF" />
            <rect x="600" y="10" width="3" height="10" fill="#9CA3AF" />
            <polygon points="700,20 705,10 710,20" fill="#9CA3AF" />
            <rect x="800" y="8" width="5" height="14" fill="#9CA3AF" />
            <circle cx="900" cy="16" r="2.5" fill="#9CA3AF" />
            <rect x="1000" y="6" width="4" height="12" fill="#9CA3AF" />
            <polygon points="1100,22 1105,12 1110,22" fill="#9CA3AF" />
          </svg>
        </div>
      </div>

      {/* Sección derecha - Ilustración */}
      <div className="flex-1 bg-blue-50 flex flex-col justify-center items-center px-8 relative">
        {/* Línea superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-teal-700"></div>

        {/* Contenido central */}
        <div className="text-center">
          {/* Título central */}
          <div className="mb-16">
            <h1 className="text-4xl font-bold text-teal-700 mb-2">Hospital Regional Rancagua</h1>
            <p className="text-lg text-gray-600">Servicio de Gestión</p>
          </div>

          {/* Círculo de iconos médicos */}
          <div className="relative w-80 h-80 mx-auto floating-icons">
            {/* Círculo central con logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg p-2">
                <img 
                  src={logoCircular} 
                  alt="Hospital Dr. Franco Ravera Zunino" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Iconos médicos alrededor del círculo */}
            <div className="absolute inset-0">
              {/* Estetoscopio (arriba) */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <svg className="w-8 h-8 text-teal-600 medical-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>

              {/* Bolsa de suero (arriba derecha) */}
              <div className="absolute top-12 right-8">
                <svg className="w-8 h-8 text-teal-600 medical-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>

              {/* Monitor de latidos (derecha) */}
              <div className="absolute top-24 right-4">
                <svg className="w-8 h-8 text-teal-600 medical-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>

              {/* Jeringa (abajo derecha) */}
              <div className="absolute bottom-24 right-8">
                <svg className="w-8 h-8 text-teal-600 medical-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>
                </svg>
              </div>

              {/* Botiquín (abajo) */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <svg className="w-8 h-8 text-teal-600 medical-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>

              {/* Vaso de precipitados (abajo izquierda) */}
              <div className="absolute bottom-12 left-8">
                <svg className="w-8 h-8 text-teal-600 medical-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>

              {/* Silla de ruedas (izquierda) */}
              <div className="absolute top-24 left-4">
                <svg className="w-8 h-8 text-teal-600 medical-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>

              {/* Portapapeles (arriba izquierda) */}
              <div className="absolute top-12 left-8">
                <svg className="w-8 h-8 text-teal-600 medical-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
              </div>

              {/* Píldora (izquierda) */}
              <div className="absolute top-16 left-2">
                <svg className="w-8 h-8 text-teal-600 medical-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>

              {/* Microscopio (abajo izquierda) */}
              <div className="absolute bottom-16 left-2">
                <svg className="w-8 h-8 text-teal-600 medical-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.5 12c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                </svg>
              </div>

              {/* Ambulancia (derecha) */}
              <div className="absolute top-16 right-2">
                <svg className="w-8 h-8 text-teal-600 medical-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H14V9.5h5.5z"/>
                </svg>
              </div>

              {/* Cama de hospital (abajo derecha) */}
              <div className="absolute bottom-8 right-2">
                <svg className="w-8 h-8 text-teal-600 medical-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 10.78V8c0-1.65-1.35-3-3-3H6C4.35 5 3 6.35 3 8v2.78c-.61.55-1 1.34-1 2.22v6h2v-2h16v2h2v-6c0-.88-.39-1.67-1-2.22zM14 8v2h-4V8h4zM6 8v2H4V8c0-.55.45-1 1-1s1 .45 1 1zm14 0c0-.55.45-1 1-1s1 .45 1 1v2h-2V8z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Ilustración de fondo */}
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
          <svg viewBox="0 0 1200 60" className="w-full h-full">
            <path
              d="M0,40 Q200,20 400,30 T800,25 T1200,35 L1200,60 L0,60 Z"
              fill="#E5E7EB"
            />
            <circle cx="100" cy="20" r="3" fill="#9CA3AF" />
            <rect x="200" y="15" width="4" height="8" fill="#9CA3AF" />
            <polygon points="300,25 305,15 310,25" fill="#9CA3AF" />
            <rect x="400" y="12" width="6" height="12" fill="#9CA3AF" />
            <circle cx="500" cy="18" r="2" fill="#9CA3AF" />
            <rect x="600" y="10" width="3" height="10" fill="#9CA3AF" />
            <polygon points="700,20 705,10 710,20" fill="#9CA3AF" />
            <rect x="800" y="8" width="5" height="14" fill="#9CA3AF" />
            <circle cx="900" cy="16" r="2.5" fill="#9CA3AF" />
            <rect x="1000" y="6" width="4" height="12" fill="#9CA3AF" />
            <polygon points="1100,22 1105,12 1110,22" fill="#9CA3AF" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
