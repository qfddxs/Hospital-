import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const SessionContext = createContext()

export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession debe usarse dentro de SessionProvider')
  }
  return context
}

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserData(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchUserData(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('usuarios_portal_rotaciones')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      // Si hay error o no existe el usuario, simplemente no establecer datos
      if (error || !data) {
        setUser(null)
        setLoading(false)
        return
      }

      // Si el usuario está inactivo, no establecer datos
      if (!data.activo) {
        setUser(null)
        setLoading(false)
        return
      }

      setUser(data)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      // 1. Autenticar con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) return { data, error }

      // 2. Verificar que el usuario esté en usuarios_portal_rotaciones
      const { data: userData } = await supabase
        .from('usuarios_portal_rotaciones')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle()

      // Si no está en la tabla, cerrar sesión y retornar error
      if (!userData) {
        await supabase.auth.signOut()
        return {
          data: null,
          error: {
            message: 'Credenciales incorrectas o usuario no autorizado'
          }
        }
      }

      // Si está inactivo, cerrar sesión y retornar error
      if (!userData.activo) {
        await supabase.auth.signOut()
        return {
          data: null,
          error: {
            message: 'Credenciales incorrectas o usuario no autorizado'
          }
        }
      }

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setSession(null)
      setUser(null)
    }
    return { error }
  }

  const value = {
    session,
    user,
    loading,
    signIn,
    signOut
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}
