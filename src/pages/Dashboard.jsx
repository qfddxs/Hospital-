import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import StatCard from '../components/UI/StatCard';
import ActivityItem from '../components/UI/ActivityItem';
import {
  UserGroupIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useNivelFormacion } from '../context/NivelFormacionContext';

const Dashboard = () => {
  const { nivelFormacion } = useNivelFormacion();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    centrosFormadores: 0,
    solicitudesPendientes: 0,
    solicitudesAprobadas: 0,
    solicitudesRechazadas: 0,
    totalCupos: 0
  });
  const [actividadReciente, setActividadReciente] = useState([]);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Verificar si es un centro formador
          const { data: centroData } = await supabase
            .from('usuarios_centros')
            .select('rol')
            .eq('user_id', user.id)
            .maybeSingle();

          if (centroData && centroData.rol === 'centro_formador') {
            // Es un centro formador, NO puede acceder al dashboard del hospital
            await supabase.auth.signOut();
            navigate('/login', { 
              state: { error: 'Acceso denegado. Esta cuenta es de un Centro Formador.' }
            });
            return;
          }
        }
        
        // Si llegamos aquí, el usuario está autorizado
        setIsAuthorized(true);
        fetchDashboardData();
      } catch (err) {
        console.error('Error verificando rol:', err);
        setIsAuthorized(true);
        fetchDashboardData();
      } finally {
        setChecking(false);
      }
    };

    checkUserRole();
  }, [navigate, nivelFormacion]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Obtener centros formadores por nivel
      const { data: centros } = await supabase
        .from('centros_formadores')
        .select('*')
        .eq('nivel_formacion', nivelFormacion)
        .eq('activo', true);

      // Obtener solicitudes por nivel
      const { data: solicitudes } = await supabase
        .from('solicitudes_cupos')
        .select(`
          *,
          centro_formador:centros_formadores(nombre, nivel_formacion)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Filtrar solicitudes por nivel
      const solicitudesFiltradas = solicitudes?.filter(
        s => s.centro_formador?.nivel_formacion === nivelFormacion
      ) || [];

      // Calcular estadísticas
      const stats = {
        centrosFormadores: centros?.length || 0,
        solicitudesPendientes: solicitudesFiltradas.filter(s => s.estado === 'pendiente').length,
        solicitudesAprobadas: solicitudesFiltradas.filter(s => s.estado === 'aprobada').length,
        solicitudesRechazadas: solicitudesFiltradas.filter(s => s.estado === 'rechazada').length,
        totalCupos: solicitudesFiltradas
          .filter(s => s.estado === 'aprobada')
          .reduce((sum, s) => sum + s.numero_cupos, 0)
      };

      setEstadisticas(stats);

      // Crear actividad reciente desde solicitudes
      const actividad = solicitudesFiltradas.slice(0, 5).map(sol => ({
        id: sol.id,
        titulo: `${sol.estado === 'pendiente' ? 'Nueva solicitud' : sol.estado === 'aprobada' ? 'Solicitud aprobada' : 'Solicitud rechazada'}`,
        descripcion: `${sol.centro_formador?.nombre} - ${sol.especialidad} (${sol.numero_cupos} cupos)`,
        tipo: sol.estado === 'pendiente' ? 'solicitud' : sol.estado === 'aprobada' ? 'aprobacion' : 'rechazo'
      }));

      setActividadReciente(actividad);

    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras verifica
  if (checking || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{checking ? 'Verificando acceso...' : 'Cargando datos...'}</p>
        </div>
      </div>
    );
  }

  // Si no está autorizado, no mostrar nada (ya se redirigió)
  if (!isAuthorized) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Dashboard - {nivelFormacion === 'pregrado' ? 'Pregrado' : 'Postgrado'}
        </h2>
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
          title="Centros Formadores"
          value={estadisticas.centrosFormadores}
          change="+0%"
          icon={<BuildingOffice2Icon className="w-7 h-7 text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Cupos Aprobados"
          value={estadisticas.totalCupos}
          change="+0%"
          icon={<UserGroupIcon className="w-7 h-7 text-green-600" />}
          iconBg="bg-green-100"
        />
        <StatCard
          title="Solicitudes Aprobadas"
          value={estadisticas.solicitudesAprobadas}
          change="+0%"
          icon={<CheckCircleIcon className="w-7 h-7 text-green-600" />}
          iconBg="bg-green-100"
        />
        <StatCard
          title="Solicitudes Pendientes"
          value={estadisticas.solicitudesPendientes}
          change="+0%"
          icon={<ClockIcon className="w-7 h-7 text-yellow-600" />}
          iconBg="bg-yellow-100"
        />
      </div>

      {/* Resumen de Solicitudes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">{estadisticas.solicitudesPendientes}</p>
            </div>
            <ClockIcon className="w-12 h-12 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Aprobadas</p>
              <p className="text-3xl font-bold text-green-600">{estadisticas.solicitudesAprobadas}</p>
            </div>
            <CheckCircleIcon className="w-12 h-12 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rechazadas</p>
              <p className="text-3xl font-bold text-red-600">{estadisticas.solicitudesRechazadas}</p>
            </div>
            <XCircleIcon className="w-12 h-12 text-red-400" />
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h3>
        {actividadReciente.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay actividad reciente</p>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Dashboard;

