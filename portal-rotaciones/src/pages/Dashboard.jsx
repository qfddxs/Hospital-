import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useSession } from '../context/SessionContext'
import { useTheme } from '../context/ThemeContext'
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  CalendarDaysIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, signOut } = useSession()
  const { isDark, toggleTheme } = useTheme()
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas') // todas, pendiente, aprobada, rechazada
  const [busqueda, setBusqueda] = useState('')

  // Helper para formatear fechas correctamente
  const formatearFecha = (fecha) => {
    if (!fecha) return '-'
    const fechaLocal = fecha.includes('T') ? new Date(fecha) : new Date(fecha + 'T00:00:00')
    return fechaLocal.toLocaleDateString('es-CL')
  }

  useEffect(() => {
    fetchSolicitudes()

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('solicitudes_rotacion_dashboard')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'solicitudes_rotacion'
        },
        (payload) => {
          console.log('🔔 Cambio detectado en solicitudes:', payload)
          // Recargar solicitudes cuando hay cambios
          fetchSolicitudes()
        }
      )
      .subscribe()

    // Cleanup: desuscribirse al desmontar
    return () => {
      console.log('🧹 Limpiando realtime de Dashboard')
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchSolicitudes = async () => {
    try {
      // Primero intentar consulta simple
      const { data: simpleData, error: simpleError } = await supabase
        .from('solicitudes_rotacion')
        .select('*')
        .order('created_at', { ascending: false })

      if (simpleError) throw simpleError

      // Si funciona, intentar con relaciones
      if (simpleData && simpleData.length > 0) {
        const { data: fullData, error: fullError } = await supabase
          .from('solicitudes_rotacion')
          .select(`
            *,
            centro_formador:centros_formadores(
              id,
              nombre
            ),
            estudiantes:estudiantes_rotacion(count)
          `)
          .order('created_at', { ascending: false })

        if (fullError) {
          setSolicitudes(simpleData)
        } else {
          setSolicitudes(fullData || [])
        }
      } else {
        setSolicitudes(simpleData || [])
      }
    } catch (error) {
      alert('Error al cargar solicitudes. Verifica tu conexión y permisos.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-300',
        icon: ClockIcon
      },
      aprobada: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
        icon: CheckCircleIcon
      },
      rechazada: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-300',
        icon: XCircleIcon
      }
    }

    const badge = badges[estado] || badges.pendiente
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4" />
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    )
  }

  const solicitudesFiltradas = solicitudes.filter(sol => {
    const matchFiltro = filtro === 'todas' || sol.estado === filtro
    const matchBusqueda = busqueda === '' || 
      sol.especialidad.toLowerCase().includes(busqueda.toLowerCase()) ||
      sol.centro_formador?.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return matchFiltro && matchBusqueda
  })

  const stats = {
    total: solicitudes.length,
    pendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
    aprobadas: solicitudes.filter(s => s.estado === 'aprobada').length,
    rechazadas: solicitudes.filter(s => s.estado === 'rechazada').length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando solicitudes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo base con gradiente suave - Colores hospitalarios */}
      <div className="fixed inset-0 bg-gradient-to-br from-teal-100 via-cyan-100 to-blue-100 dark:from-gray-900 dark:via-teal-950 dark:to-cyan-950"></div>
      
      {/* Efectos de blur con gradientes - Modo claro */}
      <div className="fixed inset-0 dark:hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-300/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-300/40 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-200/25 rounded-full blur-[150px]"></div>
      </div>
      
      {/* Efectos de blur con gradientes - Modo oscuro */}
      <div className="fixed inset-0 hidden dark:block">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]"></div>
      </div>
      
      {/* Contenido con z-index superior */}
      <div className="relative z-10">
      {/* Header mejorado profesional */}
      <header className="portal-header bg-white/85 dark:bg-gray-800/90 backdrop-blur-xl border-b-2 border-teal-200/60 dark:border-teal-700/40 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 dark:from-teal-600 dark:via-cyan-600 dark:to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-500/40 ring-4 ring-teal-100 dark:ring-teal-900/30">
                <ClipboardDocumentListIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 dark:from-teal-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Portal de Rotaciones
                </h1>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
                  {user?.nombre} {user?.apellido}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="action-button p-3 text-gray-600 dark:text-gray-400 hover:bg-gradient-to-br hover:from-teal-50 hover:to-cyan-50 dark:hover:from-gray-700 dark:hover:to-gray-600 rounded-xl transition-all hover:scale-110 shadow-sm hover:shadow-md border border-transparent hover:border-teal-200 dark:hover:border-teal-700"
              >
                {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>
              <button
                onClick={handleLogout}
                className="action-button flex items-center gap-2 px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-600 rounded-xl transition-all hover:scale-105 shadow-sm hover:shadow-md border border-transparent hover:border-red-200 dark:hover:border-red-700 font-semibold"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards - Diseño profesional hospitalario mejorado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 fade-in-up">
          {/* Total */}
          <div className="stat-card-portal group relative bg-white/85 dark:bg-gray-800/85 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-teal-200/60 dark:border-teal-700/40 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/30 to-cyan-400/30 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg shadow-teal-500/30">
                  <ClipboardDocumentListIcon className="w-7 h-7 text-white" />
                </div>
                <span className="badge-portal text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/30 px-3 py-1.5 rounded-full border border-teal-300 dark:border-teal-700">Total</span>
              </div>
              <p className="text-5xl font-extrabold bg-gradient-to-br from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">{stats.total}</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Solicitudes</p>
            </div>
          </div>

          {/* Pendientes */}
          <div className="stat-card-portal group relative bg-white/85 dark:bg-gray-800/85 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-yellow-200/60 dark:border-yellow-700/40 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg shadow-yellow-500/30">
                  <ClockIcon className="w-7 h-7 text-white" />
                </div>
                <span className="badge-portal text-xs font-bold text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full border border-yellow-300 dark:border-yellow-700">Pendientes</span>
              </div>
              <p className="text-5xl font-extrabold bg-gradient-to-br from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent mb-2">{stats.pendientes}</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En revisión</p>
            </div>
          </div>

          {/* Aprobadas */}
          <div className="stat-card-portal group relative bg-white/85 dark:bg-gray-800/85 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-green-200/60 dark:border-green-700/40 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/30 to-emerald-400/30 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg shadow-green-500/30">
                  <CheckCircleIcon className="w-7 h-7 text-white" />
                </div>
                <span className="badge-portal text-xs font-bold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full border border-green-300 dark:border-green-700">Aprobadas</span>
              </div>
              <p className="text-5xl font-extrabold bg-gradient-to-br from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent mb-2">{stats.aprobadas}</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confirmadas</p>
            </div>
          </div>

          {/* Rechazadas */}
          <div className="stat-card-portal group relative bg-white/85 dark:bg-gray-800/85 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-red-200/60 dark:border-red-700/40 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/30 to-pink-400/30 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3.5 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg shadow-red-500/30">
                  <XCircleIcon className="w-7 h-7 text-white" />
                </div>
                <span className="badge-portal text-xs font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-full border border-red-300 dark:border-red-700">Rechazadas</span>
              </div>
              <p className="text-5xl font-extrabold bg-gradient-to-br from-red-600 to-pink-600 dark:from-red-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">{stats.rechazadas}</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Denegadas</p>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda - Diseño mejorado */}
        <div className="glass-card rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-500 dark:group-focus-within:text-teal-400 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Buscar por especialidad o centro formador..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-teal-200/60 dark:border-gray-600 bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-400 dark:focus:border-teal-500 transition-all placeholder:text-gray-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-gray-700/70 dark:to-gray-700/50 px-5 py-2 rounded-xl border-2 border-teal-200/60 dark:border-teal-700/40 shadow-sm">
              <FunnelIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="bg-transparent border-none text-gray-900 dark:text-white font-semibold focus:ring-0 cursor-pointer pr-8"
              >
                <option value="todas">Todas</option>
                <option value="pendiente">Pendientes</option>
                <option value="aprobada">Aprobadas</option>
                <option value="rechazada">Rechazadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de solicitudes - Diseño mejorado */}
        <div className="space-y-4">
          {solicitudesFiltradas.length === 0 ? (
            <div className="glass-card rounded-2xl p-20 text-center shadow-lg">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-500 dark:from-teal-600 dark:to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-500/30">
                <ClipboardDocumentListIcon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No se encontraron solicitudes</h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            solicitudesFiltradas.map((solicitud) => (
              <div
                key={solicitud.id}
                className="solicitud-card group glass-card rounded-2xl p-6 hover:shadow-2xl hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/solicitud/${solicitud.id}`)}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
                        <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200">
                        {solicitud.especialidad}
                      </h3>
                      {getEstadoBadge(solicitud.estado)}
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-14">
                      {solicitud.centro_formador?.nombre || 'Centro Formador'}
                    </p>
                  </div>
                  <button className="action-button p-3 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
                    <EyeIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="info-box-portal flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-700/60 dark:to-gray-700/40 rounded-xl border border-blue-200/50 dark:border-blue-700/30">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md">
                      <CalendarDaysIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Fecha Inicio</p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {formatearFecha(solicitud.fecha_inicio)}
                      </p>
                    </div>
                  </div>
                  <div className="info-box-portal flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700/60 dark:to-gray-700/40 rounded-xl border border-purple-200/50 dark:border-purple-700/30">
                    <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
                      <CalendarDaysIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Fecha Término</p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {formatearFecha(solicitud.fecha_termino)}
                      </p>
                    </div>
                  </div>
                  <div className="info-box-portal flex items-center gap-3 p-4 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-gray-700/60 dark:to-gray-700/40 rounded-xl border border-teal-200/50 dark:border-teal-700/30">
                    <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg shadow-md">
                      <UserGroupIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Estudiantes</p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {solicitud.estudiantes?.[0]?.count || 0} alumnos
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      </div>
    </div>
  )
}

export default Dashboard
