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
        .single()

      if (error) throw error
      setUser(data)
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
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
