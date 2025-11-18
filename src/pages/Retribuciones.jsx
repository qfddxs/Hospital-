import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Table from '../components/UI/Table';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Toast from '../components/UI/Toast';
import { useNotificaciones } from '../context/NotificacionesContext';
import '../pages/Dashboard.css';
import {
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  CalculatorIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';
import { useNivelFormacion } from '../context/NivelFormacionContext';

const Retribuciones = () => {
  const { nivelFormacion } = useNivelFormacion();
  const { agregarNotificacion } = useNotificaciones();
  const [retribuciones, setRetribuciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroSemestre, setFiltroSemestre] = useState('actual');
  const [modalState, setModalState] = useState({ type: null, data: null });
  const [calculando, setCalculando] = useState(false);
  const [mostrarModalidadCalculo, setMostrarModalidadCalculo] = useState(false);
  
  // Estados para diálogos y notificaciones
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'warning' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Valores UF según documento
  const VALOR_UF_SEMESTRE_1 = 36028.10; // 30 de junio
  const VALOR_UF_SEMESTRE_2 = 36028.10; // 31 de diciembre
  const FACTOR_COBRO_UF = 4.5;

  const [estadisticas, setEstadisticas] = useState({
    totalRetribuciones: 0,
    pendientes: 0,
    pagadas: 0,
    montoTotal: 0,
    montoPendiente: 0,
    montoPagado: 0
  });

  useEffect(() => {
    fetchRetribuciones();
  }, [nivelFormacion, filtroSemestre]);

  const fetchRetribuciones = async () => {
    try {
      setLoading(true);
      setError('');

      // Verificar si la tabla existe
      const { error: tableCheckError } = await supabase
        .from('retribuciones')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        if (tableCheckError.message.includes('does not exist')) {
          setError('⚠️ La tabla "retribuciones" no existe. Por favor, ejecuta el script SQL primero. Consulta INSTRUCCIONES_RETRIBUCIONES.md para más detalles.');
          setLoading(false);
          return;
        }
        throw tableCheckError;
      }

      // Obtener retribuciones con información del centro formador
      const { data, error: retError } = await supabase
        .from('retribuciones')
        .select(`
          *,
          centro_formador:centros_formadores(
            id,
            nombre,
            codigo,
            email,
            contacto_nombre,
            nivel_formacion
          )
        `)
        .order('created_at', { ascending: false });

      if (retError) throw retError;

      console.log('Retribuciones obtenidas:', data);
      console.log('Nivel de formación actual:', nivelFormacion);

      // Filtrar por nivel de formación
      const retribucionesFiltradas = data?.filter(
        ret => ret.centro_formador?.nivel_formacion === nivelFormacion || !ret.centro_formador
      ) || [];

      console.log('Retribuciones filtradas:', retribucionesFiltradas);

      setRetribuciones(retribucionesFiltradas);
      calcularEstadisticas(retribucionesFiltradas);
    } catch (err) {
      setError('Error al cargar retribuciones: ' + err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (data) => {
    // Filtrar solo retribuciones activas (no eliminadas)
    const retribucionesActivas = data.filter(r => !r.eliminado);
    
    const stats = {
      totalRetribuciones: retribucionesActivas.length,
      pendientes: retribucionesActivas.filter(r => r.estado === 'pendiente').length,
      pagadas: retribucionesActivas.filter(r => r.estado === 'pagada').length,
      montoTotal: retribucionesActivas.reduce((sum, r) => sum + (r.monto_total || 0), 0),
      montoPendiente: retribucionesActivas.filter(r => r.estado === 'pendiente').reduce((sum, r) => sum + (r.monto_total || 0), 0),
      montoPagado: retribucionesActivas.filter(r => r.estado === 'pagada').reduce((sum, r) => sum + (r.monto_total || 0), 0)
    };
    setEstadisticas(stats);
  };

  const calcularRetribucion = (rotacion) => {
    // Según documento:
    // Cantidad de Días = (Fecha Término - Fecha Inicio) + 1
    const fechaInicio = new Date(rotacion.fecha_inicio);
    const fechaTermino = new Date(rotacion.fecha_termino);
    const cantidadDias = Math.ceil((fechaTermino - fechaInicio) / (1000 * 60 * 60 * 24)) + 1;

    // Cantidad de Meses = Cantidad de días / 30
    const cantidadMeses = cantidadDias / 30;

    // Determinar valor UF según semestre
    const mes = fechaInicio.getMonth();
    const valorUF = mes < 6 ? VALOR_UF_SEMESTRE_1 : VALOR_UF_SEMESTRE_2;

    // Valor por Cupo = Cantidad de Meses × Valor UF × Factor de Cobro
    const valorPorCupo = cantidadMeses * valorUF * FACTOR_COBRO_UF;

    // Monto Total = Cupos Diarios × Valor por Cupo
    const cuposDiarios = rotacion.cupos_diarios || 1;
    const montoTotal = cuposDiarios * valorPorCupo;

    return {
      cantidadDias,
      cantidadMeses: cantidadMeses.toFixed(2),
      valorUF,
      factorCobro: FACTOR_COBRO_UF,
      valorPorCupo,
      cuposDiarios,
      montoTotal
    };
  };

  const handleCalcularRetribuciones = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Calcular Retribuciones',
      message: '¿Deseas calcular las retribuciones para el período actual?\n\nEsto generará registros de pago para todos los centros formadores con solicitudes aprobadas.',
      type: 'info',
      onConfirm: ejecutarCalculoRetribuciones
    });
  };

  const ejecutarCalculoRetribuciones = async () => {

    try {
      setCalculando(true);

      // Primero verificar si la tabla existe
      const { error: tableCheckError } = await supabase
        .from('retribuciones')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        throw new Error('La tabla "retribuciones" no existe. Por favor, ejecuta el script SQL primero: supabase/migrations/crear-tabla-retribuciones.sql');
      }

      // Obtener todas las solicitudes aprobadas con información del centro formador
      const { data: solicitudes, error: solError } = await supabase
        .from('solicitudes_cupos')
        .select(`
          *,
          centro_formador:centros_formadores(
            id,
            nombre,
            codigo,
            nivel_formacion
          )
        `)
        .eq('estado', 'aprobada');

      if (solError) {
        console.error('Error al obtener solicitudes:', solError);
        throw new Error(`Error al obtener solicitudes: ${solError.message}`);
      }

      if (!solicitudes || solicitudes.length === 0) {
        setToast({ show: true, message: 'No hay solicitudes aprobadas pendientes de retribución', type: 'info' });
        return;
      }

      // Filtrar solicitudes que tienen información completa
      const solicitudesValidas = solicitudes.filter(s => s.centro_formador);

      if (solicitudesValidas.length === 0) {
        setToast({ show: true, message: 'No se encontraron solicitudes con información completa de centro formador', type: 'info' });
        return;
      }

      // Agrupar por centro formador
      const retribucionesPorCentro = {};

      solicitudesValidas.forEach(solicitud => {
        const centroId = solicitud.centro_formador?.id;
        if (!centroId) return;

        if (!retribucionesPorCentro[centroId]) {
          retribucionesPorCentro[centroId] = {
            centro_formador_id: centroId,
            centro: solicitud.centro_formador,
            solicitudes: [],
            montoTotal: 0
          };
        }

        // Calcular retribución basada en la solicitud
        const calculo = calcularRetribucion({
          fecha_inicio: solicitud.fecha_inicio,
          fecha_termino: solicitud.fecha_termino,
          cupos_diarios: solicitud.numero_cupos
        });

        retribucionesPorCentro[centroId].solicitudes.push({
          ...solicitud,
          calculo
        });
        retribucionesPorCentro[centroId].montoTotal += calculo.montoTotal;
      });

      // Crear registros de retribución
      const retribucionesNuevas = Object.values(retribucionesPorCentro).map(grupo => ({
        centro_formador_id: grupo.centro_formador_id,
        periodo: `${new Date().getFullYear()}-${new Date().getMonth() < 6 ? '1' : '2'}`,
        fecha_calculo: new Date().toISOString(),
        cantidad_rotaciones: grupo.solicitudes.length,
        monto_total: grupo.montoTotal,
        estado: 'pendiente',
        detalles: {
          rotaciones: grupo.solicitudes.map(s => ({
            id: s.id,
            especialidad: s.especialidad,
            fecha_inicio: s.fecha_inicio,
            fecha_termino: s.fecha_termino,
            ...s.calculo
          }))
        }
      }));

      const { data: nuevasRet, error: insertError } = await supabase
        .from('retribuciones')
        .insert(retribucionesNuevas)
        .select();

      if (insertError) throw insertError;

      // Agregar notificación a la campanita
      agregarNotificacion({
        tipo: 'retribucion_calculada',
        titulo: 'Retribuciones Calculadas',
        mensaje: `Se calcularon ${nuevasRet.length} retribuciones exitosamente para el período actual`,
        icono: 'retribucion'
      });

      setToast({ show: true, message: `Se calcularon ${nuevasRet.length} retribuciones exitosamente`, type: 'success' });
      fetchRetribuciones();
    } catch (err) {
      setToast({ show: true, message: `Error al calcular retribuciones: ${err.message}`, type: 'error' });
      console.error('Error:', err);
    } finally {
      setCalculando(false);
    }
  };

  const handleMarcarPagada = (retribucion) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirmar Pago',
      message: `¿Confirmas que esta retribución ha sido pagada?\n\nCentro: ${retribucion.centro_formador?.nombre}\nMonto: ${formatMonto(retribucion.monto_total)}`,
      type: 'success',
      confirmText: 'Sí, marcar como pagada',
      onConfirm: () => ejecutarMarcarPagada(retribucion)
    });
  };

  const ejecutarMarcarPagada = async (retribucion) => {
    try {
      const { error } = await supabase
        .from('retribuciones')
        .update({
          estado: 'pagada',
          fecha_pago: new Date().toISOString()
        })
        .eq('id', retribucion.id);

      if (error) throw error;

      setToast({ show: true, message: 'Retribución marcada como pagada', type: 'success' });
      fetchRetribuciones();
    } catch (err) {
      setToast({ show: true, message: `Error: ${err.message}`, type: 'error' });
    }
  };

  const handleEliminar = (retribucion) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Retribución',
      message: `¿Estás seguro de eliminar la retribución de ${retribucion.centro_formador?.nombre}?\n\nPeríodo: ${retribucion.periodo}\nMonto: ${formatMonto(retribucion.monto_total)}\n\n⚠️ Esta acción no se puede deshacer.`,
      type: 'danger',
      confirmText: 'Sí, eliminar',
      onConfirm: () => ejecutarEliminar(retribucion)
    });
  };

  const ejecutarEliminar = async (retribucion) => {
    try {
      // Soft delete: marcar como eliminado en lugar de borrar
      const { error } = await supabase
        .from('retribuciones')
        .update({
          eliminado: true,
          fecha_eliminacion: new Date().toISOString()
        })
        .eq('id', retribucion.id);

      if (error) throw error;

      // Agregar notificación a la campanita
      agregarNotificacion({
        tipo: 'retribucion_eliminada',
        titulo: 'Retribución Eliminada',
        mensaje: `Se eliminó la retribución de ${retribucion.centro_formador?.nombre} (${retribucion.periodo})`,
        icono: 'eliminar'
      });

      setToast({ show: true, message: 'Retribución eliminada exitosamente', type: 'success' });
      fetchRetribuciones();
    } catch (err) {
      setToast({ show: true, message: `Error al eliminar: ${err.message}`, type: 'error' });
      console.error('Error:', err);
    }
  };

  const handleRestaurar = (retribucion) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Restaurar Retribución',
      message: `¿Deseas restaurar la retribución de ${retribucion.centro_formador?.nombre}?\n\nPeríodo: ${retribucion.periodo}\nMonto: ${formatMonto(retribucion.monto_total)}`,
      type: 'info',
      confirmText: 'Sí, restaurar',
      onConfirm: () => ejecutarRestaurar(retribucion)
    });
  };

  const ejecutarRestaurar = async (retribucion) => {
    try {
      const { error } = await supabase
        .from('retribuciones')
        .update({
          eliminado: false,
          fecha_eliminacion: null
        })
        .eq('id', retribucion.id);

      if (error) throw error;

      setToast({ show: true, message: 'Retribución restaurada exitosamente', type: 'success' });
      fetchRetribuciones();
    } catch (err) {
      setToast({ show: true, message: `Error al restaurar: ${err.message}`, type: 'error' });
      console.error('Error:', err);
    }
  };

  const handleVerDetalle = (retribucion) => {
    setModalState({ type: 'detalle', data: retribucion });
  };

  const handleExportarReporte = async (retribucion) => {
    // Generar reporte en formato CSV
    const detalles = retribucion.detalles?.rotaciones || [];
    
    let csv = 'Cupos Diarios,Fecha Inicio,Fecha Término,Cantidad de Días,Cantidad de Meses,Fecha UF,Valor UF,Factor de Cobro (Uf),Valor por Cupo en $,Monto Total en $\n';
    
    detalles.forEach(det => {
      csv += `${det.cuposDiarios},${det.fecha_inicio},${det.fecha_termino},${det.cantidadDias},${det.cantidadMeses},${det.valorUF},${det.valorUF},${det.factorCobro},${det.valorPorCupo.toFixed(0)},${det.montoTotal.toFixed(0)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retribucion_${retribucion.centro_formador?.nombre}_${retribucion.periodo}.csv`;
    a.click();
  };

  const formatMonto = (monto) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(monto);
  };

  const columns = [
    {
      header: 'Centro Formador',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{row.centro_formador?.nombre}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.centro_formador?.codigo}</p>
        </div>
      )
    },
    {
      header: 'Período',
      render: (row) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">{row.periodo}</span>
      )
    },
    {
      header: 'Rotaciones',
      render: (row) => (
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.cantidad_rotaciones}</span>
      )
    },
    {
      header: 'Monto Total',
      render: (row) => (
        <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
          {formatMonto(row.monto_total)}
        </span>
      )
    },
    {
      header: 'Estado',
      render: (row) => {
        const estados = {
          pendiente: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400', icon: ClockIcon },
          pagada: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', icon: CheckCircleIcon },
          rechazada: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', icon: XCircleIcon }
        };
        const estado = estados[row.estado] || estados.pendiente;
        const Icon = estado.icon;
        
        return (
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${estado.bg} ${estado.text}`}>
            <Icon className="w-4 h-4" />
            {row.estado.charAt(0).toUpperCase() + row.estado.slice(1)}
          </span>
        );
      }
    },
    {
      header: 'Fecha Cálculo',
      render: (row) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(row.fecha_calculo).toLocaleDateString('es-CL')}
        </span>
      )
    },
    {
      header: 'Acciones',
      render: (row) => (
        <div className="flex gap-1">
          {/* Botones disponibles para retribuciones eliminadas */}
          {row.eliminado ? (
            <>
              <button
                onClick={() => handleVerDetalle(row)}
                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                title="Ver detalle"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRestaurar(row)}
                className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                title="Restaurar retribución"
              >
                <ArrowUturnLeftIcon className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* Botones disponibles para retribuciones activas */
            <>
              <button
                onClick={() => handleVerDetalle(row)}
                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                title="Ver detalle"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleExportarReporte(row)}
                className="p-1.5 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded transition-colors"
                title="Exportar reporte"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
              </button>
              {row.estado === 'pendiente' && (
                <button
                  onClick={() => handleMarcarPagada(row)}
                  className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                  title="Marcar como pagada"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleEliminar(row)}
                className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Eliminar retribución"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  const retribucionesFiltradas = retribuciones.filter(ret => {
    // Filtrar por estado de eliminación
    if (filtroEstado === 'eliminadas') {
      return ret.eliminado === true;
    }
    
    // Para otros filtros, excluir las eliminadas
    if (ret.eliminado === true) return false;
    
    // Filtrar por estado
    if (filtroEstado === 'todas') return true;
    return ret.estado === filtroEstado;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 dark:border-teal-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando retribuciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">Error al cargar el módulo</h3>
              <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
              
              {error.includes('no existe') && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-700">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">📋 Pasos para solucionar:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>Ve a tu <strong>Supabase Dashboard</strong></li>
                    <li>Abre el <strong>SQL Editor</strong></li>
                    <li>Copia y pega el script de: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">supabase/migrations/crear-tabla-retribuciones.sql</code></li>
                    <li>Haz clic en <strong>"Run"</strong></li>
                    <li>Refresca esta página</li>
                  </ol>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      💡 <strong>Tip:</strong> Consulta el archivo <code>INSTRUCCIONES_RETRIBUCIONES.md</code> para instrucciones detalladas.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Retribuciones y Reportes
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gestión de pagos a centros formadores por uso de campos clínicos
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={fetchRetribuciones}
              className="flex items-center gap-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Actualizar
            </Button>
            <Button
              variant="primary"
              onClick={handleCalcularRetribuciones}
              disabled={calculando}
              className="flex items-center gap-2"
            >
              <CalculatorIcon className="w-5 h-5" />
              {calculando ? 'Calculando...' : 'Calcular Retribuciones'}
            </Button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card-medical" style={{ cursor: 'default' }}>
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="icon-badge-medical">
              <DocumentTextIcon style={{ width: '2rem', height: '2rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
                Total Retribuciones
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: '0.25rem 0 0 0' }}>
                {estadisticas.totalRetribuciones}
              </p>
            </div>
          </div>
        </div>

        <div className="summary-item-pending" style={{ cursor: 'default', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="icon-badge-yellow">
              <ClockIcon style={{ width: '2rem', height: '2rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#92400e', margin: 0 }}>
                Pendientes
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#b45309', margin: '0.25rem 0 0 0' }}>
                {estadisticas.pendientes}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#92400e', margin: '0.25rem 0 0 0' }}>
                {formatMonto(estadisticas.montoPendiente)}
              </p>
            </div>
          </div>
        </div>

        <div className="summary-item-approved" style={{ cursor: 'default', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="icon-badge-health">
              <CheckCircleIcon style={{ width: '2rem', height: '2rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#064e3b', margin: 0 }}>
                Pagadas
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0d9488', margin: '0.25rem 0 0 0' }}>
                {estadisticas.pagadas}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#064e3b', margin: '0.25rem 0 0 0' }}>
                {formatMonto(estadisticas.montoPagado)}
              </p>
            </div>
          </div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.65) 0%, rgba(139, 92, 246, 0.65) 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 16px rgba(167, 139, 250, 0.2)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'default'
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '128px', height: '128px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%', marginRight: '-64px', marginTop: '-64px' }}></div>
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="icon-badge-medical">
              <CurrencyDollarIcon style={{ width: '2rem', height: '2rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
                Monto Total
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: '0.25rem 0 0 0' }}>
                {formatMonto(estadisticas.montoTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información del cálculo - Desplegable */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors overflow-hidden">
        <button
          onClick={() => setMostrarModalidadCalculo(!mostrarModalidadCalculo)}
          className="w-full p-4 flex items-center justify-between hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <CalculatorIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-300">Modalidad de Cálculo</h3>
          </div>
          {mostrarModalidadCalculo ? (
            <ChevronUpIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          )}
        </button>
        
        {mostrarModalidadCalculo && (
          <div className="px-4 pb-4 pt-2 border-t border-blue-200 dark:border-blue-700">
            <div className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
              <p>• <strong>Valor UF:</strong> ${VALOR_UF_SEMESTRE_1.toLocaleString('es-CL')} (30 junio) / ${VALOR_UF_SEMESTRE_2.toLocaleString('es-CL')} (31 diciembre)</p>
              <p>• <strong>Factor de Cobro:</strong> {FACTOR_COBRO_UF} UF</p>
              <p>• <strong>Fórmula:</strong> Valor por Cupo = (Cantidad de Meses × Valor UF × Factor de Cobro)</p>
              <p>• <strong>Monto Total:</strong> Cupos Diarios × Valor por Cupo</p>
              
              <div className="mt-3 pt-3 border-t border-blue-300 dark:border-blue-600">
                <p className="font-semibold mb-2">Ejemplo de cálculo:</p>
                <div className="bg-white dark:bg-gray-800 rounded p-3 space-y-1 text-xs">
                  <p>1. Período: 1 marzo - 30 junio (91 días)</p>
                  <p>2. Cantidad de Meses: 91 ÷ 30 = 3.03 meses</p>
                  <p>3. Valor por Cupo: 3.03 × $36,028.10 × 4.5 = $491,063</p>
                  <p>4. Monto Total (5 cupos): 5 × $491,063 = <strong className="text-teal-600 dark:text-teal-400">$2,455,315</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por estado:</span>
          {['todas', 'pendiente', 'pagada', 'eliminadas'].map(estado => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === estado
                  ? estado === 'eliminadas'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    : 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <Table columns={columns} data={retribucionesFiltradas} />

      {/* Modal de Detalle */}
      {modalState.type === 'detalle' && modalState.data && (
        <Modal
          isOpen={true}
          onClose={() => setModalState({ type: null, data: null })}
          title={`Detalle de Retribución - ${modalState.data.centro_formador?.nombre}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Período</p>
                <p className="text-gray-900 dark:text-gray-100">{modalState.data.periodo}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Estado</p>
                <p className="text-gray-900 dark:text-gray-100 capitalize">{modalState.data.estado}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Cantidad de Rotaciones</p>
                <p className="text-gray-900 dark:text-gray-100">{modalState.data.cantidad_rotaciones}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Monto Total</p>
                <p className="text-teal-600 dark:text-teal-400 font-bold text-lg">{formatMonto(modalState.data.monto_total)}</p>
              </div>
            </div>

            {modalState.data.detalles?.rotaciones && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Detalle de Solicitudes</h4>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {modalState.data.detalles.rotaciones.map((rot, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{rot.especialidad || rot.alumno || 'Sin especificar'}</p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <p>Período: {new Date(rot.fecha_inicio).toLocaleDateString('es-CL')} - {new Date(rot.fecha_termino).toLocaleDateString('es-CL')}</p>
                        <p>Días: {rot.cantidadDias}</p>
                        <p>Meses: {rot.cantidadMeses}</p>
                        <p>Cupos: {rot.cuposDiarios}</p>
                        <p className="col-span-2 font-semibold text-teal-600 dark:text-teal-400">
                          Monto: {formatMonto(rot.montoTotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="secondary" onClick={() => setModalState({ type: null, data: null })}>
                Cerrar
              </Button>
              <Button variant="primary" onClick={() => handleExportarReporte(modalState.data)}>
                <DocumentArrowDownIcon className="w-5 h-5 inline mr-1" />
                Exportar Reporte
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
      />

      {/* Toast de Notificaciones */}
      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
};

export default Retribuciones;
