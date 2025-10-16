import StatCard from '../components/UI/StatCard';
import AlertBox from '../components/UI/AlertBox';
import ActivityItem from '../components/UI/ActivityItem';
import DateCard from '../components/UI/DateCard';
import {
  UserGroupIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { estadisticasGenerales, alertas, actividadReciente, proximasFechas } from '../data/mockData';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard - Pregrado</h2>
        <p className="text-gray-600 mt-1">Resumen general del sistema de gestión de campos clínicos</p>
        <p className="text-sm text-gray-500 mt-2">
          Última actualización: {new Date().toLocaleString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Cupos Totales"
          value={estadisticasGenerales.cuposTotales.valor}
          change={estadisticasGenerales.cuposTotales.cambio}
          icon={<UserGroupIcon className="w-7 h-7 text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Estudiantes Activos"
          value={estadisticasGenerales.estudiantesActivos.valor}
          change={estadisticasGenerales.estudiantesActivos.cambio}
          icon={<AcademicCapIcon className="w-7 h-7 text-green-600" />}
          iconBg="bg-green-100"
        />
        <StatCard
          title="Rotaciones en Curso"
          value={estadisticasGenerales.rotacionesEnCurso.valor}
          change={estadisticasGenerales.rotacionesEnCurso.cambio}
          icon={<CalendarDaysIcon className="w-7 h-7 text-purple-600" />}
          iconBg="bg-purple-100"
        />
        <StatCard
          title="Solicitudes Pendientes"
          value={estadisticasGenerales.solicitudesPendientes.valor}
          change={estadisticasGenerales.solicitudesPendientes.cambio}
          icon={<ClipboardDocumentListIcon className="w-7 h-7 text-orange-600" />}
          iconBg="bg-orange-100"
        />
      </div>

      {/* Alertas y Notificaciones */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center mb-4">
          <span className="text-orange-500 text-xl mr-2">⚠️</span>
          <h3 className="text-lg font-semibold text-gray-800">Alertas y Notificaciones</h3>
        </div>
        <div>
          {alertas.map(alerta => (
            <AlertBox key={alerta.id} tipo={alerta.tipo} mensaje={alerta.mensaje} />
          ))}
        </div>
      </div>

      {/* Actividad Reciente y Próximas Fechas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad Reciente */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h3>
          <div className="space-y-2">
            {actividadReciente.map(actividad => (
              <ActivityItem
                key={actividad.id}
                titulo={actividad.titulo}
                descripcion={actividad.descripcion}
                tipo={actividad.tipo}
              />
            ))}
          </div>
        </div>

        {/* Próximas Fechas Importantes */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Próximas Fechas Importantes</h3>
          <div>
            {proximasFechas.map(fecha => (
              <DateCard
                key={fecha.id}
                titulo={fecha.titulo}
                fecha={fecha.fecha}
                tipo={fecha.tipo}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

