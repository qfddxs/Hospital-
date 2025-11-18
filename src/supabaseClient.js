import { createClient } from '@supabase/supabase-js'

// Reemplaza estos valores con los de tu proyecto Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Configurar Supabase para usar sessionStorage
// Esto hace que la sesión se cierre automáticamente al cerrar la pestaña/navegador
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.sessionStorage, // Usar sessionStorage en lugar de localStorage
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
