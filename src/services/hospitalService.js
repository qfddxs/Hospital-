import { supabase } from '../supabaseClient'

// Ejemplo de servicios para tu sistema de hospital

// ============ SERVICIOS CLÍNICOS ============
export const serviciosClinicosService = {
  // Obtener todos los servicios
  getAll: async () => {
    const { data, error } = await supabase
      .from('servicios_clinicos')
      .select('*')
    return { data, error }
  },

  // Crear servicio
  create: async (servicio) => {
    const { data, error } = await supabase
      .from('servicios_clinicos')
      .insert([servicio])
      .select()
    return { data, error }
  },

  // Actualizar servicio
  update: async (id, servicio) => {
    const { data, error } = await supabase
      .from('servicios_clinicos')
      .update(servicio)
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Eliminar servicio
  delete: async (id) => {
    const { data, error } = await supabase
      .from('servicios_clinicos')
      .delete()
      .eq('id', id)
    return { data, error }
  }
}

// ============ ALUMNOS ============
export const alumnosService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('alumnos')
      .select('*')
    return { data, error }
  },

  create: async (alumno) => {
    const { data, error } = await supabase
      .from('alumnos')
      .insert([alumno])
      .select()
    return { data, error }
  },

  update: async (id, alumno) => {
    const { data, error } = await supabase
      .from('alumnos')
      .update(alumno)
      .eq('id', id)
      .select()
    return { data, error }
  },

  delete: async (id) => {
    const { data, error } = await supabase
      .from('alumnos')
      .delete()
      .eq('id', id)
    return { data, error }
  }
}

// ============ ROTACIONES ============
export const rotacionesService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('rotaciones')
      .select(`
        *,
        alumnos(*),
        servicios_clinicos(*),
        tutores(*)
      `)
    return { data, error }
  },

  create: async (rotacion) => {
    const { data, error } = await supabase
      .from('rotaciones')
      .insert([rotacion])
      .select()
    return { data, error }
  },

  update: async (id, rotacion) => {
    const { data, error } = await supabase
      .from('rotaciones')
      .update(rotacion)
      .eq('id', id)
      .select()
    return { data, error }
  },

  delete: async (id) => {
    const { data, error } = await supabase
      .from('rotaciones')
      .delete()
      .eq('id', id)
    return { data, error }
  }
}

// ============ TUTORES ============
export const tutoresService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('tutores')
      .select('*')
    return { data, error }
  },

  create: async (tutor) => {
    const { data, error } = await supabase
      .from('tutores')
      .insert([tutor])
      .select()
    return { data, error }
  },

  update: async (id, tutor) => {
    const { data, error } = await supabase
      .from('tutores')
      .update(tutor)
      .eq('id', id)
      .select()
    return { data, error }
  },

  delete: async (id) => {
    const { data, error } = await supabase
      .from('tutores')
      .delete()
      .eq('id', id)
    return { data, error }
  }
}

// ============ ASISTENCIAS ============
export const asistenciasService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('asistencias')
      .select(`
        *,
        alumnos(*),
        tutores(*),
        rotaciones(*)
      `)
    return { data, error }
  },

  create: async (asistencia) => {
    const { data, error } = await supabase
      .from('asistencias')
      .insert([asistencia])
      .select()
    return { data, error }
  },

  // Registrar asistencia del día
  registrarAsistencia: async (rotacionId, tipo, presente) => {
    const { data, error } = await supabase
      .from('asistencias')
      .insert([{
        rotacion_id: rotacionId,
        tipo: tipo, // 'alumno' o 'tutor'
        fecha: new Date().toISOString().split('T')[0],
        presente: presente
      }])
      .select()
    return { data, error }
  }
}

// ============ RETRIBUCIONES ============
export const retribucionesService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('retribuciones')
      .select('*')
    return { data, error }
  },

  // Calcular retribuciones del mes
  calcularMensual: async (mes, anio) => {
    const { data, error } = await supabase
      .rpc('calcular_retribuciones', { mes, anio })
    return { data, error }
  },

  create: async (retribucion) => {
    const { data, error } = await supabase
      .from('retribuciones')
      .insert([retribucion])
      .select()
    return { data, error }
  }
}

// ============ DOCUMENTOS ============
export const documentosService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
    return { data, error }
  },

  create: async (documento) => {
    const { data, error } = await supabase
      .from('documentos')
      .insert([documento])
      .select()
    return { data, error }
  },

  // Subir archivo
  uploadFile: async (file, path) => {
    const { data, error } = await supabase.storage
      .from('documentos')
      .upload(path, file)
    return { data, error }
  },

  // Obtener URL pública del archivo
  getPublicUrl: (path) => {
    const { data } = supabase.storage
      .from('documentos')
      .getPublicUrl(path)
    return data.publicUrl
  }
}
