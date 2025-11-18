import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useSession } from '../../context/SessionContext';
import { useNivelFormacion } from '../../context/NivelFormacionContext';
import ThemeToggle from '../UI/ThemeToggle';
import NotificacionesSolicitudes from '../NotificacionesSolicitudes';
import { ToastContainer } from '../Toast';

const Header = () => {
  const { nivelFormacion, setNivelFormacion } = useNivelFormacion();
  const { user, signOut } = useSession();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleLogout = async () => {
    addToast('Cerrando sesión...', 'info', 2000);
    
    // Esperar un momento para que se vea el toast
    setTimeout(async () => {
      await signOut();
      navigate('/login', { replace: true });
    }, 1500);
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-20 transition-colors duration-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Sistema Integral de Gestión de Campos Clínicos
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Tabs Pregrado/Postgrado */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setNivelFormacion('pregrado')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                nivelFormacion === 'pregrado'
                  ? 'bg-gradient-to-r from-sky-500 to-mint-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
              }`}
            >
              Pregrado
            </button>
            <button
              onClick={() => setNivelFormacion('postgrado')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                nivelFormacion === 'postgrado'
                  ? 'bg-gradient-to-r from-sky-500 to-mint-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
              }`}
            >
              Postgrado
            </button>
          </div>

          {/* Notificaciones */}
          <NotificacionesSolicitudes />

          {/* Toggle Dark Mode */}
          <ThemeToggle />

          {/* Cerrar sesión */}
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Cerrar sesión"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>

          {/* Perfil de Usuario */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {user?.user_metadata?.nombre_completo || user?.email || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sistema Hospital</p>
            </div>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
            }}>
              {(user?.user_metadata?.nombre_completo || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;

