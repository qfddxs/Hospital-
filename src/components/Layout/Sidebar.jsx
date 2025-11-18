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
      
      <aside 
        className={`fixed lg:sticky top-0 h-screen inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '2px 0 20px rgba(14, 165, 233, 0.08)',
          borderRight: '1px solid rgba(14, 165, 233, 0.1)'
        }}
      >
        <style>{`
          .dark aside {
            background: linear-gradient(180deg, #1f2937 0%, #111827 100%) !important;
            box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3) !important;
            border-right: 1px solid rgba(75, 85, 99, 0.3) !important;
          }
        `}</style>
        {/* Header */}
        <div className={`flex items-center h-20 px-5 border-b border-sky-100 dark:border-gray-700 flex-shrink-0 relative ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`} style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.03) 0%, rgba(20, 184, 166, 0.03) 100%)' }}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div style={{
              width: '2.75rem',
              height: '2.75rem',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem',
              flexShrink: 0,
              boxShadow: '0 8px 16px rgba(14, 165, 233, 0.25)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
                HR
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'flex-1 opacity-100'}`}>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">Hospital Regional</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Dr. Franco Ravera Zunino</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="absolute top-6 right-0 translate-x-1/2 bg-white dark:bg-gray-800 border-2 border-sky-200 dark:border-gray-600 rounded-full p-2 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-gray-700 hover:border-sky-400 transition-all z-10 hidden lg:block shadow-lg"
            title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <ChevronDoubleLeftIcon className={`w-4 h-4 transition-transform duration-300 ${isCollapsed && 'rotate-180'}`} />
          </button>
          <button onClick={toggleSidebar} className="lg:hidden p-1 text-gray-600 dark:text-gray-300">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              const IconComponent = isActive ? item.iconSolid : item.icon;
              
              return (
                <li key={item.path} className="relative">
                  <Link
                    to={item.path}
                    className={`flex items-center h-12 rounded-xl transition-all duration-200 group relative ${
                      isCollapsed ? 'justify-center px-2' : 'px-4 gap-3'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500 to-mint-500 text-white font-semibold shadow-lg shadow-sky-500/30'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-sky-50 hover:to-mint-50 dark:hover:from-sky-900/20 dark:hover:to-mint-900/20 hover:text-sky-700 dark:hover:text-sky-300'
                    }`}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                    title={isCollapsed ? item.label : ''}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                    )}
                    <IconComponent className={`w-5 h-5 flex-shrink-0 transition-all duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span 
                      className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                        isCollapsed 
                          ? 'opacity-0 -translate-x-3 w-0' 
                          : 'opacity-100 translate-x-0'
                      }`}
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
