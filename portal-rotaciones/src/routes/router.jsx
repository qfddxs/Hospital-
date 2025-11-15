import { Routes, Route, Navigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { supabase } from '../supabaseClient'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import SolicitudDetalle from '../pages/SolicitudDetalle'

const ProtectedRoute = ({ children }) => {
  const { session, user, loading } = useSession()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay sesión O no hay usuario autorizado, redirigir a login
  if (!session || !user) {
    return <Navigate to="/login" replace />
  }

  // Si hay sesión Y está en usuarios_portal_rotaciones, permitir acceso
  return children
}

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/solicitud/:id"
        element={
          <ProtectedRoute>
            <SolicitudDetalle />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRouter
