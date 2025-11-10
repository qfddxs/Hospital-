import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Página no encontrada</p>
        <Link
          to="/dashboard"
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
