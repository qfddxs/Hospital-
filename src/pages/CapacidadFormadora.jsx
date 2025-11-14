import { useState, useEffect } from 'react';
import Table from '../components/UI/Table';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import { supabase } from '../supabaseClient';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  ExclamationTriangleIcon, 
  ArrowUpTrayIcon,
  EllipsisVerticalIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  HashtagIcon,
  MapPinIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useNivelFormacion } from '../context/NivelFormacionContext';

const CapacidadFormadora = () => {
  const { nivelFormacion } = useNivelFormacion();
  const [centrosData, setCentrosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [openDropdown, setOpenDropdown] = useState(null);

  const [modalState, setModalState] = useState({ type: null, data: null });
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    direccion: '',
    telefono: '',
    email: '',
    contacto_nombre: '',
    contacto_cargo: '',
    especialidades: '',
    capacidadTotal: 0,
    capacidadDisponible: 0,
    nivel_formacion: 'pregrado',
  });
  const [formError, setFormError] = useState('');
  const [importData, setImportData] = useState([]);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, status: '' });

  const isModalOpen = modalState.type !== null;
  const closeModal = () => {
    setModalState({ type: null, data: null });
    setFormError('');
    setImportData([]);
    setImportProgress({ current: 0, total: 0, status: '' });
  };

  const columns = [
    {
      header: (
        <div className="flex items-center gap-2">
          <HashtagIcon className="w-4 h-4" />
          <span>Código</span>
        </div>
      ),
      width: '110px',
      wrap: false,
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-mono font-semibold">
          {row.codigo || 'N/A'}
        </span>
      )
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <BuildingOffice2Icon className="w-4 h-4" />
          <span>Centro Formador</span>
        </div>
      ),
      width: '280px',
      render: (row) => (
        <div 
          className="flex flex-col cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          onClick={(e) => { e.stopPropagation(); handleViewClick(row); }}
        >
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{row.nombre}</span>
          {row.direccion && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate" title={row.direccion}>
              <MapPinIcon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{row.direccion}</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          <span>Contacto</span>
        </div>
      ),
      width: '200px',
      render: (row) => (
        <div className="flex flex-col space-y-1">
          {row.contacto_nombre ? (
            <>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={row.contacto_nombre}>
                {row.contacto_nombre}
              </span>
              {row.contacto_cargo && (
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate" title={row.contacto_cargo}>
                  {row.contacto_cargo}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-gray-400 dark:text-gray-500 italic">Sin contacto</span>
          )}
        </div>
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <EnvelopeIcon className="w-4 h-4" />
          <span>Comunicación</span>
        </div>
      ),
      width: '220px',
      render: (row) => (
        <div className="flex flex-col space-y-1.5">
          {row.email ? (
            <a 
              href={`mailto:${row.email}`} 
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline truncate flex items-center gap-1"
              title={row.email}
              onClick={(e) => e.stopPropagation()}
            >
              <EnvelopeIcon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{row.email}</span>
            </a>
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500">Sin email</span>
          )}
          {row.telefono && (
            <a 
              href={`tel:${row.telefono}`}
              className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:underline flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <PhoneIcon className="w-3 h-3 flex-shrink-0" />
              <span>{row.telefono}</span>
            </a>
          )}
        </div>
      ),
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <AcademicCapIcon className="w-4 h-4" />
          <span>Especialidades</span>
        </div>
      ),
      width: '320px',
      render: (row) => {
        const especialidades = row.especialidades || [];
        if (especialidades.length === 0) {
          return <span className="text-xs text-gray-400 dark:text-gray-500 italic">Sin especialidades</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {especialidades.slice(0, 3).map((esp, idx) => (
              <span 
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium"
                title={esp}
              >
                {esp.length > 20 ? esp.substring(0, 20) + '...' : esp}
              </span>
            ))}
            {especialidades.length > 3 && (
              <span 
                className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium"
                title={especialidades.slice(3).join(', ')}
              >
                +{especialidades.length - 3} más
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <ChartBarIcon className="w-4 h-4" />
          <span>Capacidad</span>
        </div>
      ),
      width: '140px',
      wrap: false,
      render: (row) => (
        <div className="flex flex-col items-center space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{row.capacidadTotal}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">total</span>
          </div>
          <div className={`
            inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold gap-1
            ${row.capacidadDisponible > 0 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
            }
          `}>
            {row.capacidadDisponible > 0 ? (
              <CheckCircleIcon className="w-3 h-3" />
            ) : (
              <XCircleIcon className="w-3 h-3" />
            )}
            {row.capacidadDisponible} disponibles
          </div>
        </div>
      )
    },
    {
      header: 'Estado',
      width: '110px',
      wrap: false,
      render: (row) => (
        <div className="flex justify-center">
          <span className={`
            inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold
            ${row.estado === 'activo' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 ring-1 ring-green-600/20 dark:ring-green-400/20' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 ring-1 ring-gray-600/20 dark:ring-gray-400/20'
            }
          `}>
            <span className={`w-2 h-2 rounded-full mr-1.5 ${row.estado === 'activo' ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-500 dark:bg-gray-400'}`}></span>
            {row.estado === 'activo' ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      )
    },
    {
      header: 'Acciones',
      width: '80px',
      wrap: false,
      render: (row) => (
        <div className="relative flex justify-center">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              setOpenDropdown(openDropdown === row.id ? null : row.id);
            }} 
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Más opciones"
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>
          
          {openDropdown === row.id && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setOpenDropdown(null)}
              />
              <div className="absolute right-0 top-10 z-20 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewClick(row);
                    setOpenDropdown(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                >
                  <EyeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Ver detalles
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(row);
                    setOpenDropdown(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                >
                  <PencilIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Editar
                </button>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(row);
                    setOpenDropdown(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                >
                  <TrashIcon className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    const fetchCentros = async () => {
      try {
        setLoading(true);

        // Filtrar por nivel de formación
        let query = supabase
          .from('centros_formadores')
          .select('*');

        // Filtrar por nivel: pregrado, postgrado o ambos
        if (nivelFormacion) {
          query = query.or(`nivel_formacion.eq.${nivelFormacion},nivel_formacion.eq.ambos`);
        }

        const { data, error } = await query.order('nombre');

        if (error) throw error;

        const transformedData = data.map(centro => ({
          id: centro.id,
          nombre: centro.nombre,
          codigo: centro.codigo || '',
          direccion: centro.direccion || '',
          telefono: centro.telefono || '',
          email: centro.email || '',
          contacto_nombre: centro.contacto_nombre || '',
          contacto_cargo: centro.contacto_cargo || '',
          especialidades: centro.especialidades || [],
          capacidadTotal: centro.capacidad_total || 0,
          capacidadDisponible: centro.capacidad_disponible || 0,
          estado: centro.activo ? 'activo' : 'completo',
          ubicacion: centro.direccion || '',
          nivel_formacion: centro.nivel_formacion || 'pregrado'
        }));

        setCentrosData(transformedData);
      } catch (err) {
        setError('No se pudieron cargar los centros formadores.');
        console.error('Error al obtener centros formadores:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCentros();
  }, [nivelFormacion]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const especialidadesArray = formData.especialidades
      .split(',')
      .map(e => e.trim())
      .filter(e => e);

    const dataToSend = {
      nombre: formData.nombre,
      codigo: formData.codigo,
      direccion: formData.direccion,
      telefono: formData.telefono,
      email: formData.email,
      contacto_nombre: formData.contacto_nombre,
      contacto_cargo: formData.contacto_cargo,
      capacidad_total: parseInt(formData.capacidadTotal, 10) || 0,
      capacidad_disponible: parseInt(formData.capacidadDisponible, 10) || 0,
      especialidades: especialidadesArray,
      nivel_formacion: formData.nivel_formacion || nivelFormacion,
      activo: true
    };

    try {
      if (modalState.type === 'add') {
        const { data, error } = await supabase
          .from('centros_formadores')
          .insert([dataToSend])
          .select();

        if (error) throw error;

        if (!data || data.length === 0) {
          throw new Error('No se recibieron datos del servidor. Verifica los permisos en Supabase.');
        }

        const newCentro = {
          id: data[0].id,
          nombre: data[0].nombre,
          codigo: data[0].codigo || '',
          direccion: data[0].direccion || '',
          telefono: data[0].telefono || '',
          email: data[0].email || '',
          contacto_nombre: data[0].contacto_nombre || '',
          contacto_cargo: data[0].contacto_cargo || '',
          especialidades: data[0].especialidades || [],
          capacidadTotal: data[0].capacidad_total || 0,
          capacidadDisponible: data[0].capacidad_disponible || 0,
          estado: 'activo',
          ubicacion: data[0].direccion || ''
        };
        setCentrosData(prev => [...prev, newCentro]);
      } else if (modalState.type === 'edit') {
        const { data, error } = await supabase
          .from('centros_formadores')
          .update(dataToSend)
          .eq('id', modalState.data.id)
          .select();

        if (error) throw error;

        if (!data || data.length === 0) {
          throw new Error('No se recibieron datos del servidor. Verifica los permisos en Supabase.');
        }

        const updatedCentro = {
          id: data[0].id,
          nombre: data[0].nombre,
          codigo: data[0].codigo || '',
          direccion: data[0].direccion || '',
          telefono: data[0].telefono || '',
          email: data[0].email || '',
          contacto_nombre: data[0].contacto_nombre || '',
          contacto_cargo: data[0].contacto_cargo || '',
          especialidades: data[0].especialidades || [],
          capacidadTotal: data[0].capacidad_total || 0,
          capacidadDisponible: data[0].capacidad_disponible || 0,
          estado: 'activo',
          ubicacion: data[0].direccion || ''
        };
        setCentrosData(prev => prev.map(c => c.id === modalState.data.id ? updatedCentro : c));
      }
      closeModal();
    } catch (err) {
      setFormError(err.message || 'Ocurrió un error al guardar.');
      console.error('Error al guardar centro:', err);
    }
  };

  const confirmDelete = async () => {
    if (modalState.type !== 'delete' || !modalState.data) return;
    try {
      const { error } = await supabase
        .from('centros_formadores')
        .delete()
        .eq('id', modalState.data.id);

      if (error) throw error;

      setCentrosData(prev => prev.filter(c => c.id !== modalState.data.id));
      closeModal();
    } catch (err) {
      setFormError('No se pudo eliminar el centro. Intente de nuevo.');
      console.error('Error al eliminar centro:', err);
    }
  };

  const handleAddClick = () => {
    setFormData({
      nombre: '',
      codigo: '',
      direccion: '',
      telefono: '',
      email: '',
      contacto_nombre: '',
      contacto_cargo: '',
      especialidades: '',
      capacidadTotal: 0,
      capacidadDisponible: 0,
      nivel_formacion: nivelFormacion,
    });
    setModalState({ type: 'add', data: null });
  };

  const handleEditClick = (centro) => {
    setFormData({
      nombre: centro.nombre,
      codigo: centro.codigo,
      direccion: centro.direccion,
      telefono: centro.telefono,
      email: centro.email,
      contacto_nombre: centro.contacto_nombre,
      contacto_cargo: centro.contacto_cargo,
      especialidades: centro.especialidades.join(', '),
      capacidadTotal: centro.capacidadTotal,
      capacidadDisponible: centro.capacidadDisponible,
      nivel_formacion: centro.nivel_formacion || nivelFormacion,
    });
    setModalState({ type: 'edit', data: centro });
  };

  const handleViewClick = (centro) => {
    setModalState({ type: 'view', data: centro });
  };

  const handleDeleteClick = (centro) => {
    setModalState({ type: 'delete', data: centro });
  };

  const handleImportClick = () => {
    setImportData([]);
    setImportProgress({ current: 0, total: 0, status: '' });
    setModalState({ type: 'import', data: null });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
          setFormError('El archivo debe contener al menos una fila de encabezados y una fila de datos.');
          return;
        }

        // Detect delimiter (comma or tab)
        const firstLine = lines[0];
        const delimiter = firstLine.includes('\t') ? '\t' : ',';

        // Get headers from first row
        const headers = firstLine.split(delimiter).map(h => h.trim().toLowerCase());

        // Find column indices
        const getColumnIndex = (possibleNames) => {
          for (const name of possibleNames) {
            const index = headers.findIndex(h => h.includes(name.toLowerCase()));
            if (index !== -1) return index;
          }
          return -1;
        };

        const indices = {
          nombre: getColumnIndex(['nombre del centro', 'centro formador', 'centro', 'nombre centro', 'institucion']),
          codigo: getColumnIndex(['codigo', 'código', 'cod', 'n°', 'numero', 'nro']),
          direccion: getColumnIndex(['direccion', 'dirección', 'ubicacion', 'ubicación', 'domicilio']),
          telefono: getColumnIndex(['telefono', 'teléfono', 'fono', 'tel', 'celular']),
          email: getColumnIndex(['email', 'correo', 'mail', 'correo electronico', 'correo electrónico']),
          contacto_nombre: getColumnIndex(['nombre contacto', 'nombre coordinador', 'coordinador', 'contacto']),
          contacto_cargo: getColumnIndex(['cargo contacto', 'cargo coordinador', 'cargo', 'puesto']),
          especialidades: getColumnIndex(['especialidades', 'especialidad', 'areas', 'áreas']),
          capacidad_total: getColumnIndex(['capacidad total', 'capacidad', 'cupos totales', 'total']),
          capacidad_disponible: getColumnIndex(['capacidad disponible', 'disponible', 'cupos disponibles', 'libres'])
        };

        // Skip header row
        const dataLines = lines.slice(1);

        const parsedData = dataLines.map((line, index) => {
          const columns = line.split(delimiter).map(col => col.trim());

          // Parse especialidades if present - use semicolon as separator to avoid conflict with CSV comma
          const especialidadesStr = indices.especialidades >= 0 ? columns[indices.especialidades] : '';
          const especialidadesArray = especialidadesStr ? especialidadesStr.split(/[;|]/).map(e => e.trim()).filter(e => e) : [];

          return {
            nombre: indices.nombre >= 0 ? columns[indices.nombre] : '',
            codigo: indices.codigo >= 0 ? columns[indices.codigo] : '',
            direccion: indices.direccion >= 0 ? columns[indices.direccion] : '',
            telefono: indices.telefono >= 0 ? columns[indices.telefono] : '',
            email: indices.email >= 0 ? columns[indices.email] : '',
            contacto_nombre: indices.contacto_nombre >= 0 ? columns[indices.contacto_nombre] : '',
            contacto_cargo: indices.contacto_cargo >= 0 ? columns[indices.contacto_cargo] : '',
            especialidades: especialidadesArray,
            capacidad_total: indices.capacidad_total >= 0 ? parseInt(columns[indices.capacidad_total], 10) || 0 : 0,
            capacidad_disponible: indices.capacidad_disponible >= 0 ? parseInt(columns[indices.capacidad_disponible], 10) || 0 : 0,
            status: 'pending'
          };
        }).filter(item => item.nombre); // Filter out empty rows

        if (parsedData.length === 0) {
          setFormError('No se encontraron datos válidos en el archivo. Verifica que las columnas sean correctas.');
          return;
        }

        setImportData(parsedData);
        setFormError('');
      } catch (err) {
        setFormError('Error al leer el archivo. Asegúrate de que sea un archivo CSV o TXT válido.');
        console.error('Error parsing file:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleImportConfirm = async () => {
    if (importData.length === 0) {
      setFormError('No hay datos para importar.');
      return;
    }

    setImportProgress({ current: 0, total: importData.length, status: 'importing' });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < importData.length; i++) {
      const item = importData[i];

      try {
        // Ensure capacidad values are valid numbers and disponible <= total
        const capacidadTotal = parseInt(item.capacidad_total, 10) || 0;
        const capacidadDisponible = Math.min(parseInt(item.capacidad_disponible, 10) || 0, capacidadTotal);

        const dataToInsert = {
          nombre: item.nombre,
          codigo: item.codigo || `CF-${Date.now()}-${i}`,
          direccion: item.direccion || null,
          telefono: item.telefono || null,
          email: item.email || null,
          contacto_nombre: item.contacto_nombre || null,
          contacto_cargo: item.contacto_cargo || null,
          especialidades: item.especialidades || [],
          capacidad_total: capacidadTotal,
          capacidad_disponible: capacidadDisponible,
          activo: true
        };

        const { data, error } = await supabase
          .from('centros_formadores')
          .insert([dataToInsert])
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          const newCentro = {
            id: data[0].id,
            nombre: data[0].nombre,
            codigo: data[0].codigo || '',
            direccion: data[0].direccion || '',
            telefono: data[0].telefono || '',
            email: data[0].email || '',
            contacto_nombre: data[0].contacto_nombre || '',
            contacto_cargo: data[0].contacto_cargo || '',
            especialidades: data[0].especialidades || [],
            capacidadTotal: data[0].capacidad_total || 0,
            capacidadDisponible: data[0].capacidad_disponible || 0,
            estado: 'activo',
            ubicacion: data[0].direccion || ''
          };
          setCentrosData(prev => [...prev, newCentro]);
          successCount++;
        }
      } catch (err) {
        console.error(`Error importing ${item.nombre}:`, err);
        errorCount++;
      }

      setImportProgress({ current: i + 1, total: importData.length, status: 'importing' });
    }

    setImportProgress({
      current: importData.length,
      total: importData.length,
      status: `Completado: ${successCount} exitosos, ${errorCount} errores`
    });

    setTimeout(() => {
      closeModal();
    }, 2000);
  };

  const datosFiltrados = centrosData.filter(centro => {
    const cumpleFiltroEstado = filtroEstado === 'todos' || centro.estado === filtroEstado;
    return cumpleFiltroEstado;
  });

  if (loading) return <p className="text-gray-600 dark:text-gray-400">Cargando centros formadores...</p>;
  if (error) return <p className="text-red-500 dark:text-red-400">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Capacidad Formadora</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Gestiona los centros formadores y su capacidad de cupos.
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Button variant="secondary" onClick={handleImportClick}>
            <ArrowUpTrayIcon className="w-5 h-5" />
            <span>Importar</span>
          </Button>
          <Button variant="primary" onClick={handleAddClick}>
            <span>+ Agregar Centro</span>
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-6 transition-colors">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
            <BuildingOffice2Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Centros Activos</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{centrosData.filter(c => c.estado === 'activo').length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-6 transition-colors">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
            <ChartBarIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Capacidad Total</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{centrosData.reduce((sum, c) => sum + c.capacidadTotal, 0)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-6 transition-colors">
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
            <CheckCircleIcon className="w-7 h-7 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cupos Disponibles</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{centrosData.reduce((sum, c) => sum + c.capacidadDisponible, 0)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-6 transition-colors">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl">
            <UserGroupIcon className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tasa Ocupación</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {centrosData.length > 0 && centrosData.reduce((sum, c) => sum + c.capacidadTotal, 0) > 0
                ? `${Math.round((1 - centrosData.reduce((sum, c) => sum + c.capacidadDisponible, 0) / centrosData.reduce((sum, c) => sum + c.capacidadTotal, 0)) * 100)}%`
                : '0%'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por estado:</span>
          {['todos', 'activo', 'completo'].map(estado => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === estado
                  ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Centros */}
      <Table columns={columns} data={datosFiltrados} onRowClick={handleViewClick} />

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={
            modalState.type === 'add' ? 'Agregar Centro Formador' :
              modalState.type === 'edit' ? 'Editar Centro Formador' :
                modalState.type === 'view' ? 'Detalles del Centro' :
                  modalState.type === 'import' ? 'Importar Centros Formadores desde Plantilla' :
                    'Confirmar Eliminación'
          }
        >
          {modalState.type === 'import' ? (
            <div className="space-y-4">
              {formError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">{formError}</div>}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Instrucciones:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Sube un archivo CSV (.csv) o de texto (.txt) con las columnas separadas por comas o tabulaciones</li>
                  <li>La primera fila debe contener los encabezados (el sistema los detectará automáticamente)</li>
                  <li>Columnas esperadas: <strong>Nombre del Centro</strong>, <strong>Código</strong>, <strong>Dirección</strong>, <strong>Teléfono</strong>, <strong>Email</strong>, <strong>Nombre Contacto</strong>, <strong>Cargo Contacto</strong>, <strong>Especialidades</strong>, <strong>Capacidad Total</strong>, <strong>Capacidad Disponible</strong></li>
                  <li>Puedes exportar directamente desde Excel como CSV o copiar y pegar en un archivo .txt</li>
                  <li>El sistema es flexible con los nombres de las columnas y detecta variaciones automáticamente</li>
                  <li>Las especialidades deben estar separadas por punto y coma (;) o barra vertical (|) si hay varias</li>
                </ol>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar archivo de plantilla
                </label>
                <input
                  type="file"
                  accept=".txt,.csv,.tsv"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
              </div>

              {importData.length > 0 && (
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <h4 className="font-semibold mb-3">Vista previa ({importData.length} centros)</h4>
                  <div className="space-y-2">
                    {importData.slice(0, 10).map((item, index) => (
                      <div key={index} className="text-sm bg-gray-50 p-3 rounded border border-gray-200">
                        <div className="font-medium text-gray-900">{item.nombre} {item.codigo && `(${item.codigo})`}</div>
                        <div className="text-gray-600 text-xs mt-1">
                          {item.direccion && <div>📍 {item.direccion}</div>}
                          {item.contacto_nombre && <div>👤 {item.contacto_nombre} {item.contacto_cargo && `- ${item.contacto_cargo}`}</div>}
                          {item.email && <div>✉️ {item.email}</div>}
                          {item.telefono && <div>📞 {item.telefono}</div>}
                          {item.especialidades.length > 0 && <div>🏥 {item.especialidades.join(', ')}</div>}
                          {(item.capacidad_total > 0 || item.capacidad_disponible > 0) && (
                            <div>📊 Capacidad: {item.capacidad_total} total, {item.capacidad_disponible} disponible</div>
                          )}
                        </div>
                      </div>
                    ))}
                    {importData.length > 10 && (
                      <p className="text-sm text-gray-500 italic">... y {importData.length - 10} más</p>
                    )}
                  </div>
                </div>
              )}

              {importProgress.status === 'importing' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900">
                    Importando: {importProgress.current} de {importProgress.total}
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {importProgress.status && importProgress.status !== 'importing' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-900">{importProgress.status}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleImportConfirm}
                  disabled={importData.length === 0 || importProgress.status === 'importing'}
                >
                  Importar {importData.length > 0 ? `(${importData.length})` : ''}
                </Button>
              </div>
            </div>
          ) : modalState.type === 'view' ? (
            <div className="space-y-3 text-sm">
              <p><strong>Código:</strong> {modalState.data.codigo || '-'}</p>
              <p><strong>Nombre:</strong> {modalState.data.nombre}</p>
              <p><strong>Dirección:</strong> {modalState.data.direccion || '-'}</p>
              <p><strong>Teléfono:</strong> {modalState.data.telefono || '-'}</p>
              <p><strong>Email:</strong> {modalState.data.email || '-'}</p>
              <p><strong>Contacto:</strong> {modalState.data.contacto_nombre || '-'} ({modalState.data.contacto_cargo || '-'})</p>
              <p><strong>Especialidades:</strong> {modalState.data.especialidades.join(', ') || '-'}</p>
              <p><strong>Capacidad Total:</strong> {modalState.data.capacidadTotal}</p>
              <p><strong>Capacidad Disponible:</strong> {modalState.data.capacidadDisponible}</p>
              <p><strong>Estado:</strong> <span className="capitalize">{modalState.data.estado}</span></p>
              <div className="flex justify-end pt-4">
                <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
              </div>
            </div>
          ) : modalState.type === 'delete' ? (
            <div>
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mr-4" />
                <div>
                  <p className="font-semibold">¿Estás seguro de que quieres eliminar este centro?</p>
                  <p className="text-sm text-gray-600 mt-1"><strong>{modalState.data.nombre}</strong></p>
                  <p className="text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
                <Button type="button" variant="primary" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Eliminar</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">{formError}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre del Centro *</label>
                  <input type="text" name="nombre" id="nombre" value={formData.nombre} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" required />
                </div>
                <div>
                  <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">Código</label>
                  <input type="text" name="codigo" id="codigo" value={formData.codigo} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
                </div>
              </div>

              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección</label>
                <input type="text" name="direccion" id="direccion" value={formData.direccion} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input type="tel" name="telefono" id="telefono" value={formData.telefono} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contacto_nombre" className="block text-sm font-medium text-gray-700">Nombre Contacto</label>
                  <input type="text" name="contacto_nombre" id="contacto_nombre" value={formData.contacto_nombre} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
                </div>
                <div>
                  <label htmlFor="contacto_cargo" className="block text-sm font-medium text-gray-700">Cargo Contacto</label>
                  <input type="text" name="contacto_cargo" id="contacto_cargo" value={formData.contacto_cargo} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
                </div>
              </div>

              <div>
                <label htmlFor="especialidades" className="block text-sm font-medium text-gray-700">Especialidades (separadas por coma)</label>
                <input type="text" name="especialidades" id="especialidades" value={formData.especialidades} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" placeholder="Ej: Medicina, Enfermería, Kinesiología" />
              </div>

              <div>
                <label htmlFor="nivel_formacion" className="block text-sm font-medium text-gray-700">Nivel de Formación *</label>
                <select
                  name="nivel_formacion"
                  id="nivel_formacion"
                  value={formData.nivel_formacion}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  required
                >
                  <option value="pregrado">Pregrado</option>
                  <option value="postgrado">Postgrado</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="capacidadTotal" className="block text-sm font-medium text-gray-700">Capacidad Total</label>
                  <input type="number" name="capacidadTotal" id="capacidadTotal" value={formData.capacidadTotal} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" min="0" />
                </div>
                <div>
                  <label htmlFor="capacidadDisponible" className="block text-sm font-medium text-gray-700">Capacidad Disponible</label>
                  <input type="number" name="capacidadDisponible" id="capacidadDisponible" value={formData.capacidadDisponible} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500" min="0" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
                <Button type="submit" variant="primary">Guardar</Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default CapacidadFormadora;
