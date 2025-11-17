import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import HeaderCentroFormador from '../components/UI/HeaderCentroFormador';
import Button from '../components/UI/Button';
import {
  DocumentTextIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const DocumentosEstudiantes = () => {
  const navigate = useNavigate();
  const [centroInfo, setCentroInfo] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modalSubir, setModalSubir] = useState(false);
  const [documentoASubir, setDocumentoASubir] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [fechaExpiracion, setFechaExpiracion] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (estudianteSeleccionado) {
      fetchChecklist();
    }
  }, [estudianteSeleccionado]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Obtener información del centro
      const { data: centroData, error: centroError } = await supabase
        .from('usuarios_centros')
        .select('*, centro_formador:centros_formadores(*)')
        .eq('user_id', user.id)
        .eq('activo', true)
        .single();

      if (centroError || !centroData) {
        console.error('Error al obtener centro:', centroError);
        alert('No se pudo obtener la información del centro formador');
        navigate('/login');
        return;
      }

      setCentroInfo(centroData);

      // Obtener estudiantes del centro
      const { data: estudiantesData, error: estudiantesError } = await supabase
        .from('alumnos')
        .select('*')
        .eq('centro_formador_id', centroData.centro_formador_id)
        .eq('estado', 'en_rotacion')
        .order('primer_apellido', { ascending: true });

      if (estudiantesError) {
        console.error('Error al obtener estudiantes:', estudiantesError);
      }

      setEstudiantes(estudiantesData || []);
      
      // Seleccionar primer estudiante por defecto
      if (estudiantesData && estudiantesData.length > 0) {
        setEstudianteSeleccionado(estudiantesData[0]);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChecklist = async () => {
    if (!estudianteSeleccionado) return;

    try {
      // Usar el nuevo sistema JSONB
      const { data, error } = await supabase
        .from('alumnos')
        .select('expediente_digital')
        .eq('id', estudianteSeleccionado.id)
        .single();

      if (error) throw error;
      
      // Extraer documentos del JSONB
      const documentos = data?.expediente_digital?.documentos || [];
      setChecklist(documentos);
    } catch (err) {
      console.error('Error al cargar checklist:', err);
    }
  };

  const handleSubirClick = (item) => {
    setDocumentoASubir(item);
    setArchivo(null);
    setFechaExpiracion('');
    setModalSubir(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 10MB');
        return;
      }
      setArchivo(file);
    }
  };

  const handleSubirDocumento = async () => {
    if (!archivo || !documentoASubir) {
      alert('Debe seleccionar un archivo');
      return;
    }

    try {
      setUploading(true);

      // Subir archivo a Supabase Storage
      const fileExt = archivo.name.split('.').pop();
      const fileName = `${estudianteSeleccionado.rut}_${documentoASubir.tipo_documento}_${Date.now()}.${fileExt}`;
      const filePath = `documentos_estudiantes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, archivo);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath);

      // Calcular fecha de expiración si aplica
      let fechaExp = null;
      if (documentoASubir.dias_vigencia && fechaExpiracion) {
        fechaExp = fechaExpiracion;
      } else if (documentoASubir.dias_vigencia) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + documentoASubir.dias_vigencia);
        fechaExp = fecha.toISOString().split('T')[0];
      }

      // Insertar documento en BD
      const { data: docData, error: docError } = await supabase
        .from('documentos')
        .insert([{
          titulo: documentoASubir.documento_nombre,
          tipo: 'otro',
          categoria: 'Documentos de Estudiantes',
          archivo_url: publicUrl,
          archivo_nombre: archivo.name,
          tamaño_bytes: archivo.size,
          mime_type: archivo.type,
          alumno_id: estudianteSeleccionado.id,
          centro_formador_id: centroInfo.centro_formador_id,
          tipo_documento: documentoASubir.tipo_documento,
          es_requerido: true,
          fecha_expiracion: fechaExp,
          estado: 'vigente',
          visibilidad: 'privado'
        }])
        .select()
        .single();

      if (docError) throw docError;

      // Actualizar el campo JSONB del alumno
      const { data: alumnoData, error: alumnoError } = await supabase
        .from('alumnos')
        .select('expediente_digital')
        .eq('id', estudianteSeleccionado.id)
        .single();

      if (!alumnoError && alumnoData) {
        const expediente = alumnoData.expediente_digital || { documentos: [] };
        const documentos = expediente.documentos || [];
        
        // Buscar si ya existe el documento del mismo tipo
        const indexExistente = documentos.findIndex(d => d.tipo_documento === documentoASubir.tipo_documento);
        
        const documentoActualizado = {
          ...documentoASubir,
          estado: 'subido',
          archivo_url: publicUrl,
          archivo_nombre: archivo.name,
          fecha_subida: new Date().toISOString(),
          fecha_expiracion: fechaExp
        };

        if (indexExistente >= 0) {
          // Actualizar documento existente
          documentos[indexExistente] = documentoActualizado;
        } else {
          // Agregar nuevo documento
          documentos.push(documentoActualizado);
        }

        // Guardar expediente actualizado
        await supabase
          .from('alumnos')
          .update({
            expediente_digital: {
              ...expediente,
              documentos: documentos
            }
          })
          .eq('id', estudianteSeleccionado.id);
      }

      alert('Documento subido exitosamente. Pendiente de aprobación por el hospital.');
      setModalSubir(false);
      fetchChecklist();
    } catch (err) {
      console.error('Error al subir documento:', err);
      alert('Error al subir documento: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'aprobado':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'subido':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'rechazado':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'vencido':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'aprobado':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'subido':
        return <ClockIcon className="w-5 h-5" />;
      case 'rechazado':
        return <XCircleIcon className="w-5 h-5" />;
      case 'vencido':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      default:
        return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  const calcularProgreso = () => {
    if (checklist.length === 0) return 0;
    const aprobados = checklist.filter(item => item.estado === 'aprobado').length;
    return Math.round((aprobados / checklist.length) * 100);
  };

  // Función helper para acceder a propiedades del documento
  const getDocProp = (doc, prop) => {
    return doc?.[prop] || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 dark:border-teal-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <HeaderCentroFormador
        titulo="Documentos de Estudiantes"
        subtitulo={centroInfo?.centro_formador?.nombre}
        icono={DocumentTextIcon}
        codigoCentro={centroInfo?.centro_formador?.codigo}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Observación sobre Gestión Documental */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-semibold">Nota:</span> Esta página permite subir documentos de estudiantes. Para revisar, aprobar o rechazar documentos, utiliza el módulo de <span className="font-semibold">Gestión Documental</span> en el menú principal.
              </p>
            </div>
          </div>
        </div>

        {estudiantes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <UserGroupIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay estudiantes en rotación
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Aún no tienes estudiantes registrados en rotaciones activas
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Lista de Estudiantes */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <UserGroupIcon className="w-5 h-5" />
                  Estudiantes ({estudiantes.length})
                </h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {estudiantes.map((estudiante) => (
                    <button
                      key={estudiante.id}
                      onClick={() => setEstudianteSeleccionado(estudiante)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        estudianteSeleccionado?.id === estudiante.id
                          ? 'bg-teal-50 dark:bg-teal-900/30 border-2 border-teal-500 dark:border-teal-600'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                      }`}
                    >
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {estudiante.nombre} {estudiante.primer_apellido}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        RUT: {estudiante.rut}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Checklist de Documentos */}
            <div className="lg:col-span-3 space-y-6">
              {estudianteSeleccionado && (
                <>
                  {/* Info del Estudiante */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {estudianteSeleccionado.nombre} {estudianteSeleccionado.primer_apellido} {estudianteSeleccionado.segundo_apellido}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          RUT: {estudianteSeleccionado.rut}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                          {calcularProgreso()}%
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Completitud</p>
                      </div>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Documentos Requeridos ({checklist.filter(i => i.estado === 'aprobado').length}/{checklist.length})
                    </h3>
                    
                    <div className="space-y-4">
                      {checklist.map((item, index) => (
                        <div
                          key={item.tipo_documento || index}
                          className={`p-4 rounded-lg border-2 ${getEstadoColor(item.estado)}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getEstadoIcon(item.estado)}
                                <h4 className="font-semibold">
                                  {index + 1}. {item.nombre}
                                </h4>
                                {item.es_obligatorio && (
                                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded">
                                    Obligatorio
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-sm opacity-90 mb-2">
                                Estado: <span className="font-medium capitalize">{item.estado}</span>
                              </p>

                              {item.archivo_nombre && (
                                <p className="text-sm opacity-75">
                                  📄 {item.archivo_nombre}
                                </p>
                              )}

                              {item.fecha_expiracion && (
                                <p className="text-sm opacity-75 mt-1">
                                  {new Date(item.fecha_expiracion) < new Date() ? '❌ Vencido' : '✅ Vigente'} hasta: {new Date(item.fecha_expiracion).toLocaleDateString('es-CL')}
                                </p>
                              )}

                              {item.comentarios && (
                                <div className="mt-2 p-2 bg-white dark:bg-gray-900 rounded text-sm">
                                  <p className="font-medium">Comentarios:</p>
                                  <p className="opacity-75">{item.comentarios}</p>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                              {item.archivo_url && (
                                <button
                                  onClick={() => window.open(item.archivo_url, '_blank')}
                                  className="px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm flex items-center gap-1"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                  Ver
                                </button>
                              )}
                              
                              {(item.estado === 'pendiente' || item.estado === 'rechazado' || item.estado === 'vencido') && (
                                <button
                                  onClick={() => handleSubirClick(item)}
                                  className="px-3 py-1.5 bg-teal-500 dark:bg-teal-600 text-white rounded-lg hover:bg-teal-600 dark:hover:bg-teal-700 transition-colors text-sm flex items-center gap-1"
                                >
                                  <ArrowUpTrayIcon className="w-4 h-4" />
                                  {item.estado === 'pendiente' ? 'Subir' : 'Actualizar'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal Subir Documento */}
      {modalSubir && documentoASubir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Subir: {documentoASubir.nombre}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Archivo *
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 dark:file:bg-teal-900/30 dark:file:text-teal-300"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Formatos: PDF, JPG, PNG (Máx. 10MB)
                </p>
              </div>

              {documentoASubir.dias_vigencia && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Expiración
                  </label>
                  <input
                    type="date"
                    value={fechaExpiracion}
                    onChange={(e) => setFechaExpiracion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Vigencia sugerida: {documentoASubir.dias_vigencia} días
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalSubir(false)}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubirDocumento}
                disabled={!archivo || uploading}
                className="flex-1 px-4 py-2 bg-teal-500 dark:bg-teal-600 text-white rounded-lg hover:bg-teal-600 dark:hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Subiendo...' : 'Subir Documento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentosEstudiantes;
