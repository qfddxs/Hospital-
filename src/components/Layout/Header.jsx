import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useSession } from '../../context/SessionContext';

const Header = () => {
  const [tipoUsuario, setTipoUsuario] = useState('pregrado');
  const { user, signOut } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800">
            Sistema Integral de Gestión de Campos Clínicos
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Tabs Pregrado/Postgrado */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setTipoUsuario('pregrado')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tipoUsuario === 'pregrado'
                  ? 'bg-teal-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Pregrado
            </button>
            <button
              onClick={() => setTipoUsuario('postgrado')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tipoUsuario === 'postgrado'
                  ? 'bg-teal-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Postgrado
            </button>
          </div>

          {/* Notificaciones */}
          <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Configuración */}
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
            <Cog6ToothIcon className="w-5 h-5" />
          </button>

          {/* Cerrar sesión */}
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Cerrar sesión"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>

          {/* Perfil de Usuario */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                {user?.user_metadata?.nombre_completo || user?.email || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500">Sistema Hospital</p>
            </div>
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
              {(user?.user_metadata?.nombre_completo || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

