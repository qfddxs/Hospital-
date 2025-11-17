import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Table from '../components/UI/Table';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Loader from '../components/Loader';
import DocumentosAlerta from '../components/DocumentosAlerta';
import DocumentoCard from '../components/DocumentoCard';
import {
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  FolderIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  TagIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  FunnelIcon,
  Squares2X2Icon,
  TableCellsIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const GestionDocumental = () => {
  const [documentos, setDocumentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [historial, setHistorial] = useState([]);

  // Helper para formatear fechas correctamente
  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const fechaLocal = fecha.includes('T') ? new Date(fecha) : new Date(fecha + 'T00:00:00');
    return fechaLocal.toLocaleDateString('es-CL');
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pestañaActiva, setPestañaActiva] = useState('institucionales'); // 'institucionales' o 'estudiantes'
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroAprobacion, setFiltroAprobacion] = useState('todos');
  const [filtroCentroFormador, setFiltroCentroFormador] = useState('todos');
  const [centrosFormadores, setCentrosFormadores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [vistaActual, setVistaActual] = useState('tabla');
  
  // Estados para modal de aprobación
  const [modalAprobar, setModalAprobar] = useState(false);
  const [documentoAprobar, setDocumentoAprobar] = useState(null);
  const [accionAprobacion, setAccionAprobacion] = useState(null);
  const [comentariosAprobacion, setComentariosAprobacion] = useState('');
  const [procesandoAprobacion, setProcesandoAprobacion] = useState(false);
  
  const [modalState, setModalState] = useState({ type: null, data: null });
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'normativa',
    categoria: 'Otros',
    version: '',
    fecha_vigencia: '',
    fecha_vencimiento: '',
    tags: '',
    visibilidad: 'publico'
  });
  const [archivo, setArchivo] = useState(null);
  const [formError, setFormError] = useState('');
  const [uploading, setUploading] = useState(false);

  const isModalOpen = modalState.type !== null;
  const closeModal = () => {
    setModalState({ type: null, data: null });
    setFormError('');
    setArchivo(null);
  };

  useEffect(() => {
    fetchDocumentos();
    fetchCategorias();
    fetchEstadisticas();
    if (pestañaActiva === 'estudiantes') {
      fetchCentrosFormadores();
    }
  }, [pestañaActiva]);

  const fetchDocumentos = async () => {
    try {
      setLoading(true);
      
      let query = supabase.from('documentos');
      
      if (pestañaActiva === 'institucionales') {
        // Documentos institucionales (sin alumno_id)
        query = query.select('*').is('alumno_id', null);
      } else {
        // Documentos de estudiantes (con alumno_id)
        query = query.select(`
          *,
          alumno:alumnos(id, nombre, primer_apellido, segundo_apellido, rut),
          centro_formador:centros_formadores(id, nombre)
        `).not('alumno_id', 'is', null);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setDocumentos(data || []);
    } catch (err) {
      setError('No se pudieron cargar los documentos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('documentos_categorias')
        .select('*')
        .eq('activo', true)
        .order('nombre');
      
      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const fetchCentrosFormadores = async () => {
    try {
      const { data, error } = await supabase
        .from('centros_formadores')
        .select('id, nombre, codigo')
        .eq('activo', true)
        .order('nombre');
      
      if (error) throw error;
      setCentrosFormadores(data || []);
    } catch (err) {
      console.error('Error al cargar centros formadores:', err);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const { data, error } = await supabase
        .rpc('obtener_estadisticas_documentos');
      
      if (error) throw error;
      if (data && data.length > 0) {
        setEstadisticas(data[0]);
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const fetchHistorial = async (documentoId) => {
    try {
      const { data, error } = await supabase
        .from('documentos_historial')
        .select('*')
        .eq('documento_id', documentoId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setHistorial(data || []);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    }
  };

  const registrarAccion = async (documentoId, accion, detalles = '') => {
    try {
      await supabase
        .from('documentos_historial')
        .insert([{
          documento_id: documentoId,
          accion,
          detalles,
          usuario_email: (await supabase.auth.getUser()).data.user?.email || 'anónimo'
        }]);
    } catch (err) {
      console.error('Error al registrar acción:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setUploading(true);

    try {
      let archivoUrl = null;
      let archivoNombre = null;
      let tamañoBytes = null;
      let mimeType = null;

      // Subir archivo a Supabase Storage (si hay archivo)
      if (archivo) {
        const fileExt = archivo.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `documentos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documentos')
          .upload(filePath, archivo);

        if (uploadError) throw uploadError;

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('documentos')
          .getPublicUrl(filePath);

        archivoUrl = publicUrl;
        archivoNombre = archivo.name;
        tamañoBytes = archivo.size;
        mimeType = archivo.type;
      }

      // Procesar tags
      const tagsArray = formData.tags 
        ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
        : [];

      // Guardar documento en BD
      const dataToSend = {
        titulo: formData.titulo,
        descripcion: formData.descripcion || null,
        tipo: formData.tipo,
        categoria: formData.categoria,
        archivo_url: archivoUrl,
        archivo_nombre: archivoNombre,
        tamaño_bytes: tamañoBytes,
        mime_type: mimeType,
        version: formData.version || null,
        fecha_vigencia: formData.fecha_vigencia || null,
        fecha_vencimiento: formData.fecha_vencimiento || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        visibilidad: formData.visibilidad,
        estado: 'vigente'
      };

      const { data, error } = await supabase
        .from('documentos')
        .insert([dataToSend])
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No se recibieron datos');

      setDocumentos(prev => [data[0], ...prev]);
      await registrarAccion(data[0].id, 'creado', `Documento "${formData.titulo}" creado`);
      fetchEstadisticas();
      closeModal();
      alert('Documento subido exitosamente');
    } catch (err) {
      setFormError(err.message || 'Error al subir documento');
      console.error('Error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;

    try {
      // Eliminar archivo de Storage si existe
      if (doc.archivo_url) {
        const filePath = doc.archivo_url.split('/').pop();
        await supabase.storage
          .from('documentos')
          .remove([`documentos/${filePath}`]);
      }

      // Eliminar registro de BD
      // NOTA: El trigger BEFORE DELETE registrará automáticamente en el historial
      const { error } = await supabase
        .from('documentos')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;

      setDocumentos(prev => prev.filter(d => d.id !== doc.id));
      fetchEstadisticas();
      alert('Documento eliminado');
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
      console.error('Error:', err);
    }
  };

  const handleDownload = async (doc) => {
    if (doc.archivo_url) {
      window.open(doc.archivo_url, '_blank');
      await registrarAccion(doc.id, 'descargado', `Documento "${doc.titulo}" descargado`);
    } else {
      alert('Este documento no tiene archivo adjunto');
    }
  };

  const handleDuplicate = async (doc) => {
    if (!confirm('¿Deseas crear una copia de este documento?')) return;

    try {
      const nuevaVersion = doc.version ? `${parseFloat(doc.version) + 0.1}` : '1.1';
      
      const dataToSend = {
        titulo: `${doc.titulo} (Copia)`,
        descripcion: doc.descripcion,
        tipo: doc.tipo,
        categoria: doc.categoria,
        archivo_url: doc.archivo_url,
        archivo_nombre: doc.archivo_nombre,
        tamaño_bytes: doc.tamaño_bytes,
        mime_type: doc.mime_type,
        version: nuevaVersion,
        tags: doc.tags,
        visibilidad: doc.visibilidad,
        documento_padre_id: doc.id,
        es_version: true,
        estado: 'vigente'
      };

      const { data, error } = await supabase
        .from('documentos')
        .insert([dataToSend])
        .select();

      if (error) throw error;
      
      setDocumentos(prev => [data[0], ...prev]);
      await registrarAccion(data[0].id, 'creado', `Versión ${nuevaVersion} creada desde documento original`);
      fetchEstadisticas();
      alert('Documento duplicado exitosamente');
    } catch (err) {
      alert('Error al duplicar: ' + err.message);
      console.error('Error:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Funciones de aprobación para documentos de estudiantes
  const handleAprobarClick = (doc) => {
    setDocumentoAprobar(doc);
    setAccionAprobacion('aprobar');
    setComentariosAprobacion('');
    setModalAprobar(true);
  };

  const handleRechazarClick = (doc) => {
    setDocumentoAprobar(doc);
    setAccionAprobacion('rechazar');
    setComentariosAprobacion('');
    setModalAprobar(true);
  };

  const handleProcesarAprobacion = async () => {
    if (accionAprobacion === 'rechazar' && !comentariosAprobacion.trim()) {
      alert('Debe proporcionar un motivo de rechazo');
      return;
    }

    try {
      setProcesandoAprobacion(true);
      const { data: { user } } = await supabase.auth.getUser();

      await supabase
        .from('documentos')
        .update({
          aprobado: accionAprobacion === 'aprobar',
          aprobado_por: user?.id,
          fecha_aprobacion: new Date().toISOString(),
          comentarios_aprobacion: comentariosAprobacion.trim() || null
        })
        .eq('id', documentoAprobar.id);

      await registrarAccion(
        documentoAprobar.id, 
        accionAprobacion === 'aprobar' ? 'aprobado' : 'rechazado',
        comentariosAprobacion.trim() || `Documento ${accionAprobacion === 'aprobar' ? 'aprobado' : 'rechazado'}`
      );

      alert(`Documento ${accionAprobacion === 'aprobar' ? 'aprobado' : 'rechazado'} exitosamente`);
      setModalAprobar(false);
      fetchDocumentos();
    } catch (err) {
      alert('Error al procesar: ' + err.message);
    } finally {
      setProcesandoAprobacion(false);
    }
  };

  const handleAddClick = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      tipo: 'normativa',
      categoria: 'Otros',
      version: '',
      fecha_vigencia: '',
      fecha_vencimiento: '',
      tags: '',
      visibilidad: 'publico'
    });
    setArchivo(null);
    setModalState({ type: 'add', data: null });
  };

  const handleViewClick = async (doc) => {
    setModalState({ type: 'view', data: doc });
    await fetchHistorial(doc.id);
    await registrarAccion(doc.id, 'visto', `Documento "${doc.titulo}" visualizado`);
  };

  const getIconByType = (tipo) => {
    switch (tipo) {
      case 'convenio':
        return <DocumentTextIcon className="w-5 h-5 text-blue-600" />;
      case 'protocolo':
        return <ClipboardDocumentListIcon className="w-5 h-5 text-teal-600" />;
      case 'normativa':
        return <ChartBarIcon className="w-5 h-5 text-green-600" />;
      default:
        return <FolderIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  // Columnas para documentos institucionales
  const columnsInstitucionales = [
    { 
      header: 'Documento', 
      render: (row) => (
        <div className="flex items-center gap-2">
          {getIconByType(row.tipo)}
          <div>
            <p className="font-medium">{row.titulo}</p>
            <div className="flex items-center gap-2 mt-1">
              {row.version && <span className="text-xs text-gray-500">v{row.version}</span>}
              {row.es_version && <span className="text-xs bg-purple-100 text-purple-700 px-1 rounded">Versión</span>}
              {row.categoria && <span className="text-xs text-gray-500">• {row.categoria}</span>}
            </div>
          </div>
        </div>
      )
    },
    { 
      header: 'Estado', 
      render: (row) => {
        const estadoColors = {
          vigente: 'bg-green-100 text-green-700',
          vencido: 'bg-red-100 text-red-700',
          archivado: 'bg-gray-100 text-gray-700'
        };
        return (
          <span className={`px-2 py-1 rounded text-xs capitalize ${estadoColors[row.estado] || 'bg-gray-100 text-gray-700'}`}>
            {row.estado || 'vigente'}
          </span>
        );
      }
    },
    { 
      header: 'Tamaño', 
      render: (row) => formatFileSize(row.tamaño_bytes)
    },
    { 
      header: 'Fecha Subida', 
      render: (row) => formatearFecha(row.created_at)
    },
    { 
      header: 'Tags', 
      render: (row) => row.tags && row.tags.length > 0 ? (
        <div className="flex gap-1 flex-wrap">
          {row.tags.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
          {row.tags.length > 2 && <span className="text-xs text-gray-500">+{row.tags.length - 2}</span>}
        </div>
      ) : '-'
    },
    { 
      header: 'Acciones', 
      render: (row) => (
        <div className="flex gap-1">
          <button 
            onClick={() => handleViewClick(row)}
            className="p-1 text-blue-600 hover:text-blue-800" 
            title="Ver detalles"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          {row.archivo_url && (
            <button 
              onClick={() => handleDownload(row)}
              className="p-1 text-teal-600 hover:text-teal-800" 
              title="Descargar"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={() => handleDuplicate(row)}
            className="p-1 text-purple-600 hover:text-purple-800" 
            title="Duplicar/Nueva versión"
          >
            <DocumentDuplicateIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleDelete(row)}
            className="p-1 text-red-600 hover:text-red-800" 
            title="Eliminar"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];

  // Columnas para documentos de estudiantes
  const columnsEstudiantes = [
    {
      header: 'Estudiante',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {row.alumno?.nombre} {row.alumno?.primer_apellido} {row.alumno?.segundo_apellido || ''}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            RUT: {row.alumno?.rut || '-'}
          </p>
        </div>
      )
    },
    {
      header: 'Centro Formador',
      render: (row) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.centro_formador?.nombre || '-'}
        </span>
      )
    },
    {
      header: 'Documento',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{row.titulo}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            📄 {row.archivo_nombre || 'Sin archivo'}
          </p>
        </div>
      )
    },
    {
      header: 'Tipo',
      render: (row) => (
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
          {row.tipo_documento || row.tipo}
        </span>
      )
    },
    {
      header: 'Estado Aprobación',
      render: (row) => {
        if (row.aprobado === null) {
          return (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              Pendiente
            </span>
          );
        } else if (row.aprobado === true) {
          return (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs flex items-center gap-1">
              <CheckCircleIcon className="w-3 h-3" />
              Aprobado
            </span>
          );
        } else {
          return (
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs flex items-center gap-1">
              <XCircleIcon className="w-3 h-3" />
              Rechazado
            </span>
          );
        }
      }
    },
    {
      header: 'Fecha',
      render: (row) => (
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {formatearFecha(row.created_at)}
          </p>
          {row.fecha_expiracion && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Vence: {formatearFecha(row.fecha_expiracion)}
            </p>
          )}
        </div>
      )
    },
    {
      header: 'Acciones',
      render: (row) => (
        <div className="flex space-x-2">
          {row.archivo_url && (
            <button
              onClick={() => handleViewClick(row)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
              title="Ver documento"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          )}
          {row.aprobado === null && (
            <>
              <button
                onClick={() => handleAprobarClick(row)}
                className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                title="Aprobar"
              >
                <CheckCircleIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleRechazarClick(row)}
                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                title="Rechazar"
              >
                <XCircleIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  const datosFiltrados = documentos.filter(doc => {
    const cumpleTipo = filtroTipo === 'todos' || doc.tipo === filtroTipo;
    const cumpleCategoria = filtroCategoria === 'todos' || doc.categoria === filtroCategoria;
    const cumpleEstado = filtroEstado === 'todos' || doc.estado === filtroEstado;
    
    // Filtro de aprobación solo para documentos de estudiantes
    let cumpleAprobacion = true;
    if (pestañaActiva === 'estudiantes' && filtroAprobacion !== 'todos') {
      if (filtroAprobacion === 'pendiente') {
        cumpleAprobacion = doc.aprobado === null;
      } else if (filtroAprobacion === 'aprobado') {
        cumpleAprobacion = doc.aprobado === true;
      } else if (filtroAprobacion === 'rechazado') {
        cumpleAprobacion = doc.aprobado === false;
      }
    }

    // Filtro de centro formador solo para documentos de estudiantes
    let cumpleCentroFormador = true;
    if (pestañaActiva === 'estudiantes' && filtroCentroFormador !== 'todos') {
      cumpleCentroFormador = doc.centro_formador_id === filtroCentroFormador;
    }
    
    const cumpleBusqueda = 
      doc.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      (doc.descripcion && doc.descripcion.toLowerCase().includes(busqueda.toLowerCase())) ||
      (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(busqueda.toLowerCase())));
    
    return cumpleTipo && cumpleCategoria && cumpleEstado && cumpleAprobacion && cumpleCentroFormador && cumpleBusqueda;
  });

  if (loading) return <Loader message="Cargando documentos..." />;
  if (error) return <p className="text-red-500 dark:text-red-400">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Alertas de documentos próximos a vencer */}
      <DocumentosAlerta />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestión Documental</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {pestañaActiva === 'institucionales' 
              ? 'Administra documentos normativos y protocolos institucionales'
              : 'Revisa y aprueba documentos de estudiantes'
            }
          </p>
        </div>
        <div className="flex gap-2">
          {/* Toggle Vista */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setVistaActual('tabla')}
              className={`p-2 rounded ${vistaActual === 'tabla' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
              title="Vista de tabla"
            >
              <TableCellsIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setVistaActual('tarjetas')}
              className={`p-2 rounded ${vistaActual === 'tarjetas' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
              title="Vista de tarjetas"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
          </div>
          <Button variant="primary" onClick={handleAddClick} className="flex items-center gap-2">
            <ArrowUpTrayIcon className="w-5 h-5" />
            Subir Documento
          </Button>
        </div>
      </div>

      {/* Pestañas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setPestañaActiva('institucionales')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              pestañaActiva === 'institucionales'
                ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <DocumentTextIcon className="w-5 h-5" />
              <span>Documentos Institucionales</span>
            </div>
          </button>
          <button
            onClick={() => setPestañaActiva('estudiantes')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              pestañaActiva === 'estudiantes'
                ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <DocumentTextIcon className="w-5 h-5" />
              <span>Documentos de Estudiantes</span>
            </div>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-colors">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Documentos</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {estadisticas?.total_documentos || documentos.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-colors">
          <p className="text-sm text-gray-600 dark:text-gray-400">Vigentes</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {estadisticas?.documentos_vigentes || documentos.filter(d => d.estado === 'vigente').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-colors">
          <p className="text-sm text-gray-600 dark:text-gray-400">Por Vencer</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {estadisticas?.documentos_por_vencer || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-colors">
          <p className="text-sm text-gray-600 dark:text-gray-400">Vencidos</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {estadisticas?.documentos_vencidos || documentos.filter(d => d.estado === 'vencido').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-colors">
          <p className="text-sm text-gray-600 dark:text-gray-400">Tamaño Total</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {estadisticas?.tamaño_total_mb ? `${estadisticas.tamaño_total_mb} MB` : '-'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-colors">
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por título, descripción o tags..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg pl-10 pr-4 py-2"
              />
            </div>
            <Button 
              variant="secondary" 
              onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
              className="flex items-center gap-2"
            >
              <FunnelIcon className="w-5 h-5" />
              Filtros
            </Button>
          </div>

          {mostrarFiltrosAvanzados && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Tipo:</label>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="normativa">Normativa</option>
                  <option value="protocolo">Protocolo</option>
                  <option value="convenio">Convenio</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Categoría:</label>
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="todos">Todas las categorías</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Estado:</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="vigente">Vigente</option>
                  <option value="vencido">Vencido</option>
                  <option value="archivado">Archivado</option>
                </select>
              </div>
              {pestañaActiva === 'estudiantes' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Centro Formador:</label>
                    <select
                      value={filtroCentroFormador}
                      onChange={(e) => setFiltroCentroFormador(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="todos">Todos los centros</option>
                      {centrosFormadores.map(centro => (
                        <option key={centro.id} value={centro.id}>
                          {centro.nombre} {centro.codigo ? `(${centro.codigo})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Estado Aprobación:</label>
                    <select
                      value={filtroAprobacion}
                      onChange={(e) => setFiltroAprobacion(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="todos">Todos</option>
                      <option value="pendiente">Pendientes</option>
                      <option value="aprobado">Aprobados</option>
                      <option value="rechazado">Rechazados</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contenido - Vista de Tabla o Tarjetas */}
      {vistaActual === 'tabla' ? (
        <Table 
          columns={pestañaActiva === 'institucionales' ? columnsInstitucionales : columnsEstudiantes} 
          data={datosFiltrados} 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {datosFiltrados.length > 0 ? (
            datosFiltrados.map((doc) => (
              <DocumentoCard
                key={doc.id}
                documento={doc}
                onView={handleViewClick}
                onDownload={handleDownload}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              No se encontraron documentos
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={modalState.type === 'add' ? 'Subir Nuevo Documento' : 'Detalles del Documento'}
        >
          {modalState.type === 'view' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-medium mb-1">Título</p>
                  <p>{modalState.data.titulo}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Tipo</p>
                  <p className="capitalize">{modalState.data.tipo}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Categoría</p>
                  <p>{modalState.data.categoria || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Estado</p>
                  <span className={`px-2 py-1 rounded text-xs capitalize ${
                    modalState.data.estado === 'vigente' ? 'bg-green-100 text-green-700' :
                    modalState.data.estado === 'vencido' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {modalState.data.estado || 'vigente'}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 font-medium mb-1">Descripción</p>
                  <p>{modalState.data.descripcion || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Versión</p>
                  <p>{modalState.data.version || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Visibilidad</p>
                  <p className="capitalize">{modalState.data.visibilidad || 'público'}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Fecha Vigencia</p>
                  <p>{formatearFecha(modalState.data.fecha_vigencia)}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Fecha Vencimiento</p>
                  <p>{formatearFecha(modalState.data.fecha_vencimiento)}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Archivo</p>
                  <p>{modalState.data.archivo_nombre || 'Sin archivo'}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Tamaño</p>
                  <p>{formatFileSize(modalState.data.tamaño_bytes)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 font-medium mb-1">Tags</p>
                  {modalState.data.tags && modalState.data.tags.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {modalState.data.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : '-'}
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Fecha Subida</p>
                  <p>{formatearFecha(modalState.data.created_at)}</p>
                </div>
              </div>

              {/* Historial */}
              {historial.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-gray-700 font-medium mb-2 flex items-center gap-2">
                    <ClockIcon className="w-5 h-5" />
                    Historial de Actividad
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {historial.map((item) => (
                      <div key={item.id} className="text-sm bg-gray-50 p-2 rounded">
                        <div className="flex justify-between">
                          <span className="font-medium capitalize">{item.accion}</span>
                          <span className="text-gray-500 text-xs">
                            {new Date(item.created_at).toLocaleString('es-CL')}
                          </span>
                        </div>
                        {item.detalles && <p className="text-gray-600 text-xs mt-1">{item.detalles}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                {modalState.data.archivo_url && (
                  <Button variant="primary" onClick={() => handleDownload(modalState.data)}>
                    <ArrowDownTrayIcon className="w-5 h-5 inline mr-1" />
                    Descargar
                  </Button>
                )}
                <Button variant="secondary" onClick={() => handleDuplicate(modalState.data)}>
                  <DocumentDuplicateIcon className="w-5 h-5 inline mr-1" />
                  Duplicar
                </Button>
                <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{formError}</div>}
              
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Nombre del documento"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="normativa">Normativa</option>
                    <option value="protocolo">Protocolo</option>
                    <option value="convenio">Convenio</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">Versión</label>
                  <input
                    type="text"
                    id="version"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="1.0"
                  />
                </div>
                <div>
                  <label htmlFor="visibilidad" className="block text-sm font-medium text-gray-700 mb-1">Visibilidad</label>
                  <select
                    id="visibilidad"
                    name="visibilidad"
                    value={formData.visibilidad}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="publico">Público</option>
                    <option value="privado">Privado</option>
                    <option value="restringido">Restringido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fecha_vigencia" className="block text-sm font-medium text-gray-700 mb-1">Fecha Vigencia</label>
                  <input
                    type="date"
                    id="fecha_vigencia"
                    name="fecha_vigencia"
                    value={formData.fecha_vigencia}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="fecha_vencimiento" className="block text-sm font-medium text-gray-700 mb-1">Fecha Vencimiento</label>
                  <input
                    type="date"
                    id="fecha_vencimiento"
                    name="fecha_vencimiento"
                    value={formData.fecha_vencimiento}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags <span className="text-gray-500 text-xs">(separados por comas)</span>
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  placeholder="urgente, importante, revisión"
                />
              </div>

              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Descripción del documento..."
                />
              </div>

              <div>
                <label htmlFor="archivo" className="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
                <input
                  type="file"
                  id="archivo"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
                {archivo && (
                  <div className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                    <p><strong>Archivo:</strong> {archivo.name}</p>
                    <p><strong>Tamaño:</strong> {formatFileSize(archivo.size)}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
                <Button type="submit" variant="primary" disabled={uploading}>
                  {uploading ? 'Subiendo...' : 'Subir Documento'}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* Modal de Aprobación/Rechazo */}
      {modalAprobar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {accionAprobacion === 'aprobar' ? 'Aprobar Documento' : 'Rechazar Documento'}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span className="font-medium">Documento:</span> {documentoAprobar?.titulo}
              </p>
              {documentoAprobar?.alumno && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Estudiante:</span> {documentoAprobar.alumno.nombre} {documentoAprobar.alumno.primer_apellido}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {accionAprobacion === 'rechazar' ? 'Motivo del rechazo *' : 'Comentarios (opcional)'}
              </label>
              <textarea
                value={comentariosAprobacion}
                onChange={(e) => setComentariosAprobacion(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
                placeholder={accionAprobacion === 'rechazar' ? 'Explica el motivo del rechazo...' : 'Agrega comentarios adicionales...'}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalAprobar(false)}
                disabled={procesandoAprobacion}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleProcesarAprobacion}
                disabled={procesandoAprobacion}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  accionAprobacion === 'aprobar'
                    ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
                    : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                }`}
              >
                {procesandoAprobacion ? 'Procesando...' : (accionAprobacion === 'aprobar' ? 'Aprobar' : 'Rechazar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionDocumental;
