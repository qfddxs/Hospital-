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
      {/* Header mejorado */}
      <header className="bg-white/70 dark:bg-gray-800/80 backdrop-blur-lg border-b border-teal-200/60 dark:border-gray-700/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <ClipboardDocumentListIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Portal de Rotaciones
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {user?.nombre} {user?.apellido}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all hover:scale-105"
              >
                {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all hover:scale-105"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards - Diseño profesional hospitalario */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total */}
          <div className="group relative bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-teal-200 dark:border-gray-700/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/20 rounded-xl">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/20 px-3 py-1 rounded-full">Total</span>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">{stats.total}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Solicitudes</p>
            </div>
          </div>

          {/* Pendientes */}
          <div className="group relative bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-yellow-200 dark:border-gray-700/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                  <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 rounded-full">Pendientes</span>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">{stats.pendientes}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">En revisión</p>
            </div>
          </div>

          {/* Aprobadas */}
          <div className="group relative bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-green-200 dark:border-gray-700/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full">Aprobadas</span>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">{stats.aprobadas}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Confirmadas</p>
            </div>
          </div>

          {/* Rechazadas */}
          <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">Rechazadas</span>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">{stats.rechazadas}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Denegadas</p>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda - Diseño mejorado */}
        <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border border-teal-200 dark:border-gray-700/50 mb-6 shadow-md">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar por especialidad o centro formador..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-teal-200 dark:border-gray-600 bg-white/80 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition-all placeholder:text-gray-500"
              />
            </div>

            <div className="flex items-center gap-3 bg-teal-50 dark:bg-gray-700/50 px-4 py-2 rounded-xl border border-teal-200 dark:border-transparent">
              <FunnelIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="bg-transparent border-none text-gray-900 dark:text-white font-medium focus:ring-0 cursor-pointer"
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
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-16 border border-teal-100/50 dark:border-gray-700/50 text-center shadow-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ClipboardDocumentListIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No se encontraron solicitudes</h3>
              <p className="text-gray-500 dark:text-gray-400">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            solicitudesFiltradas.map((solicitud) => (
              <div
                key={solicitud.id}
                className="group bg-white/85 dark:bg-gray-800/85 backdrop-blur-md rounded-2xl p-6 border border-teal-100 dark:border-gray-700 hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/solicitud/${solicitud.id}`)}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl">
                        <ClipboardDocumentListIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200">
                        {solicitud.especialidad}
                      </h3>
                      {getEstadoBadge(solicitud.estado)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-14">
                      {solicitud.centro_formador?.nombre || 'Centro Formador'}
                    </p>
                  </div>
                  <button className="p-3 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all duration-200">
                    <EyeIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3 p-3 bg-blue-50/80 dark:bg-gray-700/50 rounded-xl">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <CalendarDaysIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Fecha Inicio</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {formatearFecha(solicitud.fecha_inicio)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50/80 dark:bg-gray-700/50 rounded-xl">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <CalendarDaysIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Fecha Término</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {formatearFecha(solicitud.fecha_termino)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-teal-50/80 dark:bg-gray-700/50 rounded-xl">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                      <UserGroupIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Estudiantes</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
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
