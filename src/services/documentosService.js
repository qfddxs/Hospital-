import { supabase } from '../supabaseClient';

/**
 * Servicio para gestión de documentos
 */

// Obtener todos los documentos con filtros
export const obtenerDocumentos = async (filtros = {}) => {
  try {
    let query = supabase
      .from('documentos')
      .select('*')
      .order('created_at', { ascending: false });

    if (filtros.tipo && filtros.tipo !== 'todos') {
      query = query.eq('tipo', filtros.tipo);
    }

    if (filtros.categoria && filtros.categoria !== 'todos') {
      query = query.eq('categoria', filtros.categoria);
    }

    if (filtros.estado && filtros.estado !== 'todos') {
      query = query.eq('estado', filtros.estado);
    }

    if (filtros.busqueda) {
      query = query.or(`titulo.ilike.%${filtros.busqueda}%,descripcion.ilike.%${filtros.busqueda}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Obtener un documento por ID
export const obtenerDocumentoPorId = async (id) => {
  try {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Crear nuevo documento
export const crearDocumento = async (documentoData, archivo = null) => {
  try {
    let archivoUrl = null;
    let archivoNombre = null;
    let tamañoBytes = null;
    let mimeType = null;

    // Subir archivo si existe
    if (archivo) {
      const fileExt = archivo.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `documentos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, archivo);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath);

      archivoUrl = publicUrl;
      archivoNombre = archivo.name;
      tamañoBytes = archivo.size;
      mimeType = archivo.type;
    }

    const dataToInsert = {
      ...documentoData,
      archivo_url: archivoUrl,
      archivo_nombre: archivoNombre,
      tamaño_bytes: tamañoBytes,
      mime_type: mimeType,
      estado: 'vigente'
    };

    const { data, error } = await supabase
      .from('documentos')
      .insert([dataToInsert])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Actualizar documento
export const actualizarDocumento = async (id, documentoData) => {
  try {
    const { data, error } = await supabase
      .from('documentos')
      .update(documentoData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Eliminar documento
export const eliminarDocumento = async (id, archivoUrl = null) => {
  try {
    // Eliminar archivo de storage si existe
    if (archivoUrl) {
      const filePath = archivoUrl.split('/').slice(-2).join('/');
      await supabase.storage
        .from('documentos')
        .remove([filePath]);
    }

    const { error } = await supabase
      .from('documentos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Duplicar documento (crear nueva versión)
export const duplicarDocumento = async (documentoId) => {
  try {
    const { data: original, error: fetchError } = await obtenerDocumentoPorId(documentoId);
    if (fetchError) throw fetchError;

    const nuevaVersion = original.version 
      ? `${parseFloat(original.version) + 0.1}` 
      : '1.1';

    const dataToInsert = {
      titulo: `${original.titulo} (Copia)`,
      descripcion: original.descripcion,
      tipo: original.tipo,
      categoria: original.categoria,
      archivo_url: original.archivo_url,
      archivo_nombre: original.archivo_nombre,
      tamaño_bytes: original.tamaño_bytes,
      mime_type: original.mime_type,
      version: nuevaVersion,
      tags: original.tags,
      visibilidad: original.visibilidad,
      documento_padre_id: original.id,
      es_version: true,
      estado: 'vigente'
    };

    const { data, error } = await supabase
      .from('documentos')
      .insert([dataToInsert])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Obtener categorías
export const obtenerCategorias = async () => {
  try {
    const { data, error } = await supabase
      .from('documentos_categorias')
      .select('*')
      .eq('activo', true)
      .order('nombre');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Obtener estadísticas
export const obtenerEstadisticas = async () => {
  try {
    const { data, error } = await supabase
      .rpc('obtener_estadisticas_documentos');

    if (error) throw error;
    return { data: data && data.length > 0 ? data[0] : null, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Obtener historial de un documento
export const obtenerHistorial = async (documentoId) => {
  try {
    const { data, error } = await supabase
      .from('documentos_historial')
      .select('*')
      .eq('documento_id', documentoId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Registrar acción en historial
export const registrarAccion = async (documentoId, accion, detalles = '') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('documentos_historial')
      .insert([{
        documento_id: documentoId,
        accion,
        detalles,
        usuario_email: user?.email || 'anónimo',
        usuario_nombre: user?.user_metadata?.nombre_completo || 'Usuario'
      }]);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Actualizar estados de documentos vencidos
export const actualizarEstadosVencidos = async () => {
  try {
    const { error } = await supabase.rpc('actualizar_estado_documentos');
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Obtener documentos próximos a vencer
export const obtenerDocumentosProximosVencer = async (dias = 30) => {
  try {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .not('fecha_vencimiento', 'is', null)
      .gte('fecha_vencimiento', new Date().toISOString())
      .lte('fecha_vencimiento', fechaLimite.toISOString())
      .eq('estado', 'vigente')
      .order('fecha_vencimiento');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Buscar documentos por tags
export const buscarPorTags = async (tags) => {
  try {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .contains('tags', tags)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Obtener versiones de un documento
export const obtenerVersiones = async (documentoPadreId) => {
  try {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('documento_padre_id', documentoPadreId)
      .eq('es_version', true)
      .order('version', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export default {
  obtenerDocumentos,
  obtenerDocumentoPorId,
  crearDocumento,
  actualizarDocumento,
  eliminarDocumento,
  duplicarDocumento,
  obtenerCategorias,
  obtenerEstadisticas,
  obtenerHistorial,
  registrarAccion,
  actualizarEstadosVencidos,
  obtenerDocumentosProximosVencer,
  buscarPorTags,
  obtenerVersiones
};
