import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  UserGroupIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowRightIcon,
  DocumentTextIcon
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
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard de {nivelFormacion === 'pregrado' ? 'Pregrado' : 'Postgrado'}
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Bienvenido. Aquí tienes un resumen de la actividad reciente del sistema.
        </p>
      </div>

      {/* Contenido principal del Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tarjetas de estadísticas principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center gap-6">
              <div className="bg-blue-100 p-4 rounded-xl">
                <BuildingOffice2Icon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Centros Formadores</p>
                <p className="text-3xl font-bold text-gray-900">{estadisticas.centrosFormadores}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center gap-6">
              <div className="bg-green-100 p-4 rounded-xl">
                <UserGroupIcon className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Cupos Aprobados</p>
                <p className="text-3xl font-bold text-gray-900">{estadisticas.totalCupos}</p>
              </div>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Actividad Reciente</h3>
              <Link to="/dashboard/solicitud-cupos" className="text-sm font-medium text-teal-600 hover:text-teal-800 flex items-center gap-1">
                Ver todo <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            {actividadReciente.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300" />
                <p className="mt-4 text-gray-500">No hay actividad reciente para mostrar.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {actividadReciente.map(actividad => {
                  const icons = {
                    solicitud: <DocumentTextIcon className="w-5 h-5 text-yellow-600" />,
                    aprobacion: <CheckCircleIcon className="w-5 h-5 text-green-600" />,
                    rechazo: <XCircleIcon className="w-5 h-5 text-red-600" />
                  };
                  return (
                    <li key={actividad.id} className="py-4 flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        actividad.tipo === 'solicitud' ? 'bg-yellow-100' :
                        actividad.tipo === 'aprobacion' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {icons[actividad.tipo]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{actividad.titulo}</p>
                        <p className="text-sm text-gray-500">{actividad.descripcion}</p>
                      </div>
                      <span className="text-xs text-gray-400">hace poco</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Columna lateral (1/3) */}
        <div className="space-y-8">
          {/* Resumen de Solicitudes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Solicitudes</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Pendientes</span>
                </div>
                <span className="font-bold text-lg text-yellow-800">{estadisticas.solicitudesPendientes}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  <span className="font-medium text-green-800">Aprobadas</span>
                </div>
                <span className="font-bold text-lg text-green-800">{estadisticas.solicitudesAprobadas}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                  <span className="font-medium text-red-800">Rechazadas</span>
                </div>
                <span className="font-bold text-lg text-red-800">{estadisticas.solicitudesRechazadas}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default Dashboard;
