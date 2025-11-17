import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { supabase } from '../supabaseClient'
import { EnvelopeIcon, LockClosedIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

const Login = () => {
  const navigate = useNavigate()
  const { session, user, loading: sessionLoading } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (sessionLoading) return
    if (session && user) {
      navigate('/dashboard')
    }
  }, [session, user, sessionLoading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      if (data.session) {
        // Verificar que el usuario esté en usuarios_centros
        const { data: centroData, error: centroError } = await supabase
          .from('usuarios_centros')
          .select('centro_formador_id, activo')
          .eq('user_id', data.user.id)
          .eq('activo', true)
          .single()

        if (centroError || !centroData) {
          await supabase.auth.signOut()
          throw new Error('USUARIO_NO_AUTORIZADO')
        }

        navigate('/dashboard')
      }
    } catch (err) {
      let errorMessage = err.message || 'Error al iniciar sesión'
      
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Usuario o contraseña incorrectos'
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Debes confirmar tu correo electrónico'
      } else if (errorMessage.includes('User not found')) {
        errorMessage = 'Usuario o contraseña incorrectos'
      } else if (errorMessage.includes('USUARIO_NO_AUTORIZADO')) {
        errorMessage = 'Usuario o contraseña incorrectos'
      }
      
      setError(errorMessage)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 transition-colors">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="48" fill="#14b8a6" className="dark:fill-teal-600"/>
                <path d="M30 40 L50 25 L70 40 L70 75 L30 75 Z" fill="white"/>
                <rect x="42" y="55" width="16" height="20" fill="#14b8a6" className="dark:fill-teal-600"/>
                <rect x="35" y="45" width="10" height="8" fill="#14b8a6" className="dark:fill-teal-600"/>
                <rect x="55" y="45" width="10" height="8" fill="#14b8a6" className="dark:fill-teal-600"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Centro Formador
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Hospital Regional Rancagua
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
              Sistema de Gestión de Capacidad Formadora
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition-colors disabled:opacity-50"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={submitting}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition-colors disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <span>Iniciando sesión...</span>
              ) : (
                <>
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
