import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard'},
    { path: '/capacidad-formadora', label: 'Capacidad Formadora'},
    { path: '/solicitud-cupos', label: 'Solicitud de Cupos'},
    { path: '/gestion-alumnos', label: 'Gestión de Alumnos'},
    { path: '/control-asistencia', label: 'Control de Asistencia'},
    { path: '/retribuciones', label: 'Retribuciones y Reportes'},
    { path: '/gestion-documental', label: 'Gestión Documental'},
    { path: '/reportes-estrategicos', label: 'Reportes Estratégicos'}
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      {/* Logo/Branding */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            HR
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Hospital Regional</p>
            <p className="text-xs text-gray-500">Dr. Franco Ravera Zunino</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-teal-50 text-teal-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

