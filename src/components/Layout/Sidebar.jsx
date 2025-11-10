import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  HeartIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();

  const menuItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: HomeIcon,
      description: 'Panel principal del sistema'
    },
    { 
      path: '/dashboard/capacidad-formadora', 
      label: 'Capacidad Formadora', 
      icon: UserGroupIcon,
      description: 'Gestión de centros formadores'
    },
    { 
      path: '/dashboard/solicitud-cupos', 
      label: 'Solicitud de Cupos', 
      icon: DocumentTextIcon,
      description: 'Solicitudes y gestión de cupos'
    },
    { 
      path: '/dashboard/gestion-alumnos', 
      label: 'Gestión de Alumnos', 
      icon: UserGroupIcon,
      description: 'Administración de estudiantes'
    },
    { 
      path: '/dashboard/control-asistencia', 
      label: 'Control de Asistencia', 
      icon: CalendarIcon,
      description: 'Registro y control de asistencia'
    },
    { 
      path: '/dashboard/retribuciones', 
      label: 'Retribuciones', 
      icon: ChartBarIcon,
      description: 'Reportes y retribuciones'
    },
    { 
      path: '/dashboard/gestion-documental', 
      label: 'Gestión Documental', 
      icon: DocumentTextIcon,
      description: 'Administración de documentos'
    }
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Overlay para móvil */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      <aside className={`fixed lg:static top-0 left-0 z-50 bg-white border-r border-gray-200 min-h-screen transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                HR
              </div>
              {!isCollapsed && (
                <div>
                  <p className="text-sm font-bold text-gray-800">Hospital Regional</p>
                  <p className="text-xs text-gray-500">Dr. Franco Ravera Zunino</p>
                </div>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isCollapsed ? (
                <Bars3Icon className="w-5 h-5 text-gray-600" />
              ) : (
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const IconComponent = item.icon;
            
            return (
              <div key={item.path} className="relative">
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg mb-1 transition-colors group ${
                    isActive
                      ? 'bg-teal-50 text-teal-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm">{item.label}</span>
                  )}
                </Link>
                
                {/* Tooltip para estado colapsado */}
                {isCollapsed && hoveredItem === item.path && (
                  <div className="absolute left-full top-0 ml-2 px-3 py-2 bg-teal-600 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <div className="text-xs text-teal-100 mt-1">
                      {item.description}
                    </div>
                    {/* Flecha del tooltip */}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-teal-600 rotate-45"></div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

