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
  DocumentTextIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useNivelFormacion } from '../context/NivelFormacionContext';
import './Dashboard.css';

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
          const { data: centroData } = await supabase
            .from('usuarios_centros')
            .select('rol')
            .eq('user_id', user.id)
            .maybeSingle();

          if (centroData && centroData.rol === 'centro_formador') {
            await supabase.auth.signOut();
            navigate('/login', { 
              state: { error: 'Acceso denegado. Esta cuenta es de un Centro Formador.' }
            });
            return;
          }
        }
        
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

      const { data: centros } = await supabase
        .from('centros_formadores')
        .select('*')
        .eq('nivel_formacion', nivelFormacion)
        .eq('activo', true);

      const { data: solicitudes } = await supabase
        .from('solicitudes_cupos')
        .select(`
          *,
          centro_formador:centros_formadores(nombre, nivel_formacion)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      const solicitudesFiltradas = solicitudes?.filter(
        s => s.centro_formador?.nivel_formacion === nivelFormacion
      ) || [];

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

  if (checking || loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: 'transparent'
      }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center' }}
        >
          <div className="spinner-health"></div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ marginTop: '1.5rem', fontSize: '1.125rem', fontWeight: '500', color: '#0ea5e9' }}
          >
            {checking ? 'Verificando acceso...' : 'Cargando datos...'}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }
  
  return (
    <div style={{ padding: '0' }}>
      {/* Header limpio */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-header"
        style={{ marginBottom: '2rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Dashboard de {nivelFormacion === 'pregrado' ? 'Pregrado' : 'Postgrado'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Bienvenido. Gestiona y monitorea la actividad del sistema en tiempo real.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
            <ChartBarIcon className="w-8 h-8" />
          </div>
        </div>
      </motion.div>

      {/* Contenido principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Columna principal */}
          <div style={{ gridColumn: 'span 2' }}>
            {/* Tarjetas de estadísticas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="stat-card-medical"
              >
                <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div className="icon-badge-medical">
                    <BuildingOffice2Icon style={{ width: '2.5rem', height: '2.5rem', color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
                      Centros Formadores
                    </p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', margin: '0.25rem 0 0 0' }}>
                      {estadisticas.centrosFormadores}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="stat-card-health"
              >
                <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div className="icon-badge-medical">
                    <UserGroupIcon style={{ width: '2.5rem', height: '2.5rem', color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
                      Total Cupos Aprobados
                    </p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', margin: '0.25rem 0 0 0' }}>
                      {estadisticas.totalCupos}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Actividad Reciente */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="activity-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="section-title-bar"></div>
                  Actividad Reciente
                </h3>
                <Link to="/dashboard/solicitud-cupos" className="link-health" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                  Ver todo <ArrowRightIcon style={{ width: '1rem', height: '1rem' }} />
                </Link>
              </div>
              {actividadReciente.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <DocumentTextIcon style={{ width: '3rem', height: '3rem', color: '#d1d5db', margin: '0 auto' }} />
                  <p style={{ marginTop: '1rem', color: '#6b7280' }}>No hay actividad reciente para mostrar.</p>
                </div>
              ) : (
                <div>
                  {actividadReciente.map((actividad, index) => {
                    const iconClass = actividad.tipo === 'solicitud' ? 'activity-icon-pending' : 
                                     actividad.tipo === 'aprobacion' ? 'activity-icon-approved' : 'activity-icon-rejected';
                    const IconComponent = actividad.tipo === 'solicitud' ? DocumentTextIcon :
                                         actividad.tipo === 'aprobacion' ? CheckCircleIcon : XCircleIcon;
                    const iconColor = actividad.tipo === 'solicitud' ? '#fbbf24' :
                                     actividad.tipo === 'aprobacion' ? '#14b8a6' : '#ef4444';
                    
                    return (
                      <div key={actividad.id} style={{ 
                        padding: '1rem 0', 
                        borderBottom: index < actividadReciente.length - 1 ? '1px solid #e5e7eb' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <div className={iconClass}>
                          <IconComponent style={{ width: '1.25rem', height: '1.25rem', color: iconColor }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', margin: 0 }}>
                            {actividad.titulo}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                            {actividad.descripcion}
                          </p>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>hace poco</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Columna lateral */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="summary-card"
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="section-title-bar"></div>
                Resumen de Solicitudes
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <motion.div whileHover={{ scale: 1.03 }} className="summary-item-pending">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="icon-badge-yellow">
                        <ClockIcon style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                      </div>
                      <span style={{ fontWeight: '600', color: '#92400e' }}>Pendientes</span>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#b45309' }}>
                      {estadisticas.solicitudesPendientes}
                    </span>
                  </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} className="summary-item-approved">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="icon-badge-health">
                        <CheckCircleIcon style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                      </div>
                      <span style={{ fontWeight: '600', color: '#064e3b' }}>Aprobadas</span>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0d9488' }}>
                      {estadisticas.solicitudesAprobadas}
                    </span>
                  </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} className="summary-item-rejected">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="icon-badge-red">
                        <XCircleIcon style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                      </div>
                      <span style={{ fontWeight: '600', color: '#7f1d1d' }}>Rechazadas</span>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                      {estadisticas.solicitudesRechazadas}
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
