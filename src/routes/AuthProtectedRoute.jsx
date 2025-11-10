import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '../context/SessionContext'

const AuthProtectedRoute = () => {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default AuthProtectedRoute
