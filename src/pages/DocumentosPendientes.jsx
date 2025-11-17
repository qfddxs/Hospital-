import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Button from '../components/UI/Button';
import Loader from '../components/Loader';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const DocumentosPendientes = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('pendiente');
  const [busqueda, setBusqueda] = useState('');
  const [modalRevisar, setModalRevisar] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [accion, setAccion] = useState(null); // 'aprobar' o 'rechazar'
  const [comentarios, setComentarios] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    fetchDocumentos();
  }, [filtroEstado]);

  const fetchDocumentos = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('vista_documentos_pendientes')
        .select('*')
        .order('fecha_subida', { ascending: false });

      // Aplicar filtro de estado
      if (filtroEstado === 'pendiente') {
        // Solo documentos sin aprobar (aprobado IS NULL)
        query = supabase
          .from('documentos')
          .select(`
            *,
            alumno:alumnos(id, nombre, primer_apellido, segundo_apellido, rut),
            centro_formador:centros_formadores(id, nombre)
          `)
          .not('alumno_id', 'is', null)
          .is('aprobado', null)
          .order('created_at', { ascending: false });
      } else if (filtroEstado === 'aprobado') {
        query = supabase
          .from('documentos')
          .select(`
            *,
            alumno:alumnos(id, nombre, primer_apellido, segundo_apellido, rut),
            centro_formador:centros_formadores(id, nombre)
          `)
          .not('alumno_id', 'is', null)
          .eq('aprobado', true)
          .order('fecha_aprobacion', { ascending: false });
      } else if (filtroEstado === 'rechazado') {
        query = supabase
          .from('documentos')
          .select(`
            *,
            alumno:alumnos(id, nombre, primer_apellido, segundo_apellido, rut),
            centro_formador:centros_formadores(id, nombre)
          `)
          .not('alumno_id', 'is', null)
          .eq('aprobado', false)
          .order('fecha_aprobacion', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setDocumentos(data || []);
    } catch (err) {
      console.error('Error al cargar documentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevisarClick = (doc, accionTipo) => {
    setDocumentoSeleccionado(doc);
    setAccion(accionTipo);
    setComentarios('');
    setModalRevisar(true);
  };

  const handleProcesarDocumento = async () => {
    if (accion === 'rechazar' && !comentarios.trim()) {
      alert('Debe proporcionar un motivo de rechazo');
      return;
    }

    try {
      setProcesando(true);

      const { data: { user } } = await supabase.auth.getUser();

      // Actualizar documento
      const { error: updateError } = await supabase
        .from('documentos')
        .update({
          aprobado: accion === 'aprobar',
          aprobado_por: user?.id,
          fecha_aprobacion: new Date().toISOString(),
          comentarios_aprobacion: comentarios.trim() || null
        })
        .eq('id', documentoSeleccionado.id);

      if (updateError) throw updateError;

      // Registrar en historial
      await supabase
        .from('documentos_historial')
        .insert([{
          documento_id: documentoSeleccionado.id,
          accion: accion === 'aprobar' ? 'aprobado' : 'rechazado',
          detalles: comentarios.trim() || `Documento ${accion === 'aprobar' ? 'aprobado' : 'rechazado'}`,
          usuario_email: user?.email || 'sistema'
        }]);

      alert(`Documento ${accion === 'aprobar' ? 'aprobado' : 'rechazado'} exitosamente`);
      setModalRevisar(false);
      fetchDocumentos();
    } catch (err) {
      console.error('Error al procesar documento:', err);
      alert('Error al procesar documento: ' + err.message);
    } finally {
      setProcesando(false);
    }
  };

  const documentosFiltrados = documentos.filter(doc => {
    const alumnoNombre = doc.alumno ? 
      `${doc.alumno.nombre} ${doc.alumno.primer_apellido} ${doc.alumno.segundo_apellido || ''}`.toLowerCase() : '';
    const centroNombre = doc.centro_formador?.nombre?.toLowerCase() || '';
    const titulo = doc.titulo?.toLowerCase() || '';
    const searchTerm = busqueda.toLowerCase();

    return alumnoNombre.includes(searchTerm) || 
           centroNombre.includes(searchTerm) || 
           titulo.includes(searchTerm);
  });

  const getEstadoBadge = (doc) => {
    if (doc.aprobado === null) {
      return (
        <span className="px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
          <ClockIcon className="w-4 h-4" />
          Pendiente
        </span>
      );
    } else if (doc.aprobado === true) {
      return (
        <span className="px-2 py-1 rounded text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 flex items-center gap-1">
          <CheckCircleIcon className="w-4 h-4" />
          Aprobado
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-1">
          <XCircleIcon className="w-4 h-4" />
          Rechazado
        </span>
      );
    }
  };

  if (loading) {
    return <Loader message="Cargando documentos..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Documentos Pendientes</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Revisión y aprobación de documentos de estudiantes
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-blue-500 dark:border-blue-400 transition-colors">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {documentos.filter(d => d.aprobado === null).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-green-500 dark:border-green-400 transition-colors">
          <p className="text-sm text-gray-600 dark:text-gray-400">Aprobados Hoy</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {documentos.filter(d => 
              d.aprobado === true && 
              d.fecha_aprobacion && 
              new Date(d.fecha_aprobacion).toDateString() === new Date().toDateString()
            ).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-red-500 dark:border-red-400 transition-colors">
          <p className="text-sm text-gray-600 dark:text-gray-400">Rechazados</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {documentos.filter(d => d.aprobado === false).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-purple-500 dark:border-purple-400 transition-colors">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {documentos.length}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por estudiante, centro o documento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg pl-10 pr-4 py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2"
            >
              <option value="pendiente">Pendientes</option>
              <option value="aprobado">Aprobados</option>
              <option value="rechazado">Rechazados</option>
              <option value="todos">Todos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Documentos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors">
        {documentosFiltrados.length === 0 ? (
          <div className="p-12 text-center">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No hay documentos para mostrar</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {documentosFiltrados.map((doc) => (
              <div key={doc.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <DocumentTextIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {doc.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {doc.alumno && `${doc.alumno.nombre} ${doc.alumno.primer_apellido} ${doc.alumno.segundo_apellido || ''}`}
                          {doc.alumno?.rut && ` (${doc.alumno.rut})`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 ml-9">
                      <span>🏫 {doc.centro_formador?.nombre || 'Sin centro'}</span>
                      <span>📄 {doc.archivo_nombre || 'Sin archivo'}</span>
                      <span>📅 {new Date(doc.created_at).toLocaleDateString('es-CL')}</span>
                      {doc.fecha_expiracion && (
                        <span>⏰ Vence: {new Date(doc.fecha_expiracion).toLocaleDateString('es-CL')}</span>
                      )}
                    </div>

                    {doc.comentarios_aprobacion && (
                      <div className="mt-2 ml-9 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                        <p className="font-medium text-gray-700 dark:text-gray-300">Comentarios:</p>
                        <p className="text-gray-600 dark:text-gray-400">{doc.comentarios_aprobacion}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {getEstadoBadge(doc)}
                    
                    <div className="flex gap-2">
                      {doc.archivo_url && (
                        <button
                          onClick={() => window.open(doc.archivo_url, '_blank')}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm flex items-center gap-1"
                        >
                          <EyeIcon className="w-4 h-4" />
                          Ver
                        </button>
                      )}
                      
                      {doc.aprobado === null && (
                        <>
                          <button
                            onClick={() => handleRevisarClick(doc, 'aprobar')}
                            className="px-3 py-1.5 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleRevisarClick(doc, 'rechazar')}
                            className="px-3 py-1.5 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors text-sm flex items-center gap-1"
                          >
                            <XCircleIcon className="w-4 h-4" />
                            Rechazar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Revisión */}
      {modalRevisar && documentoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {accion === 'aprobar' ? '✅ Aprobar Documento' : '❌ Rechazar Documento'}
            </h3>

            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {documentoSeleccionado.titulo}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {documentoSeleccionado.alumno && 
                  `${documentoSeleccionado.alumno.nombre} ${documentoSeleccionado.alumno.primer_apellido}`
                }
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comentarios {accion === 'rechazar' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                rows="4"
                placeholder={
                  accion === 'aprobar' 
                    ? 'Comentarios adicionales (opcional)...' 
                    : 'Explique el motivo del rechazo...'
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalRevisar(false)}
                disabled={procesando}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleProcesarDocumento}
                disabled={procesando || (accion === 'rechazar' && !comentarios.trim())}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  accion === 'aprobar'
                    ? 'bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700'
                    : 'bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700'
                }`}
              >
                {procesando ? 'Procesando...' : accion === 'aprobar' ? 'Aprobar' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentosPendientes;
