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
  EyeIcon
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, signOut } = useSession()
  const { isDark, toggleTheme } = useTheme()
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas') // todas, pendiente, aprobada, rechazada
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    fetchSolicitudes()
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center">
                <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Portal de Rotaciones
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.nombre} {user?.apellido}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <ClipboardDocumentListIcon className="w-10 h-10 text-gray-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendientes}</p>
              </div>
              <ClockIcon className="w-10 h-10 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Aprobadas</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.aprobadas}</p>
              </div>
              <CheckCircleIcon className="w-10 h-10 text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rechazadas</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.rechazadas}</p>
              </div>
              <XCircleIcon className="w-10 h-10 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por especialidad o centro formador..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
              >
                <option value="todas">Todas</option>
                <option value="pendiente">Pendientes</option>
                <option value="aprobada">Aprobadas</option>
                <option value="rechazada">Rechazadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de solicitudes */}
        <div className="space-y-4">
          {solicitudesFiltradas.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
              <ClipboardDocumentListIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No se encontraron solicitudes</p>
            </div>
          ) : (
            solicitudesFiltradas.map((solicitud) => (
              <div
                key={solicitud.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/solicitud/${solicitud.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {solicitud.especialidad}
                      </h3>
                      {getEstadoBadge(solicitud.estado)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {solicitud.centro_formador?.nombre || 'Centro Formador'}
                    </p>
                  </div>
                  <button className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-500">Fecha Inicio</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(solicitud.fecha_inicio).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-500">Fecha Término</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(solicitud.fecha_termino).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-500">Estudiantes</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {solicitud.estudiantes?.[0]?.count || 0} alumnos
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
