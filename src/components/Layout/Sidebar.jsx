import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon as HomeOutline,
  CalendarIcon as CalendarOutline,
  UserGroupIcon as UserGroupOutline,
  DocumentTextIcon as DocumentTextOutline,
  ChartBarIcon as ChartBarOutline,
  DocumentDuplicateIcon as DocumentDuplicateOutline,
  ChevronDoubleLeftIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

import {
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  CalendarIcon
} from '@heroicons/react/24/solid';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();

  const menuItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: HomeOutline,
      iconSolid: HomeIcon,
      description: 'Panel principal del sistema'
    },
    { 
      path: '/dashboard/capacidad-formadora', 
      label: 'Capacidad Formadora', 
      icon: UserGroupOutline,
      iconSolid: UserGroupIcon,
      description: 'Gestión de centros formadores'
    },
    { 
      path: '/dashboard/solicitud-cupos', 
      label: 'Solicitud de Cupos', 
      icon: DocumentTextOutline,
      iconSolid: DocumentTextIcon,
      description: 'Solicitudes y gestión de cupos'
    },
    { 
      path: '/dashboard/gestion-alumnos', 
      label: 'Gestión de Alumnos', 
      icon: UserGroupOutline,
      iconSolid: UserGroupIcon,
      description: 'Administración de estudiantes'
    },
    { 
      path: '/dashboard/control-asistencia', 
      label: 'Control de Asistencia', 
      icon: CalendarOutline,
      iconSolid: CalendarIcon,
      description: 'Registro y control de asistencia'
    },
    { 
      path: '/dashboard/retribuciones', 
      label: 'Retribuciones', 
      icon: ChartBarOutline,
      iconSolid: ChartBarIcon,
      description: 'Reportes y retribuciones'
    },
    { 
      path: '/dashboard/gestion-documental', 
      label: 'Gestión Documental', 
      icon: DocumentDuplicateOutline,
      iconSolid: DocumentDuplicateIcon,
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
      
      <aside className={`fixed lg:sticky top-0 h-screen inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        {/* Header */}
        <div className={`flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 relative ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-teal-500 dark:bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                HR
            </div>
            <div className={`transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">Hospital Regional</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Dr. Franco Ravera Zunino</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="absolute top-4 right-0 translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400 transition-all z-10 hidden lg:block"
            title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <ChevronDoubleLeftIcon className={`w-4 h-4 transition-transform duration-300 ${isCollapsed && 'rotate-180'}`} />
          </button>
          <button onClick={toggleSidebar} className="lg:hidden p-1 text-gray-600 dark:text-gray-300">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              const IconComponent = isActive ? item.iconSolid : item.icon;
              
              return (
                <li key={item.path} className="relative">
                  <Link
                    to={item.path}
                    className={`flex items-center h-12 rounded-lg transition-all duration-200 group ${
                      isCollapsed ? 'justify-center' : 'px-3 gap-3'
                    } ${
                      isActive
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                    title={isCollapsed ? item.label : ''}
                  >
                    <IconComponent className="w-6 h-6 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    <span 
                      className={`text-sm whitespace-nowrap transition-all duration-300 ${
                        isCollapsed 
                          ? 'opacity-0 -translate-x-3 w-0' 
                          : 'opacity-100 translate-x-0'
                      }`}
                      // El retraso se aplica solo al expandir para el efecto escalonado
                      style={{ transitionDelay: isCollapsed ? '0ms' : `${index * 30}ms` }}
                    >
                      {item.label}
                    </span>
                  </Link>
                  
                  {/* Tooltip para estado colapsado */}
                  {isCollapsed && hoveredItem === item.path && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap pointer-events-none">
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-xs text-gray-300 dark:text-gray-400">{item.description}</p>
                      {/* Flecha del tooltip */}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-800 dark:bg-gray-700 rotate-45"></div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
