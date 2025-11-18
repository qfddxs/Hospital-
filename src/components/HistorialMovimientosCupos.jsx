import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  ClockIcon, 
  ArrowDownIcon, 
  ArrowUpIcon, 
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import Loader from './Loader';

const HistorialMovimientosCupos = ({ centroFormadorId = null, limit = 50 }) => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMovimientos();
  }, [centroFormadorId]);

  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('historial_movimientos_cupos')
        .select(`
          *,
          centro_formador:centros_formadores(nombre, codigo),
          solicitud:solicitudes_cupos(especialidad, numero_cupos)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Filtrar por centro si se especifica
      if (centroFormadorId) {
        query = query.eq('centro_formador_id', centroFormadorId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setMovimientos(data || []);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError('No se pudo cargar el historial de movimientos.');
    } finally {
      setLoading(false);
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'descuento':
        return <ArrowDownIcon className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'devolucion':
        return <ArrowUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'reinicio':
        return <ArrowPathIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'ajuste_manual':
        return <AdjustmentsHorizontalIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'descuento':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300';
      case 'devolucion':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300';
      case 'reinicio':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300';
      case 'ajuste_manual':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'descuento':
        return 'Descuento';
      case 'devolucion':
        return 'Devolución';
      case 'reinicio':
        return 'Reinicio';
      case 'ajuste_manual':
        return 'Ajuste Manual';
      default:
        return tipo;
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <Loader message="Cargando historial..." />;
  if (error) return <p className="text-red-500 dark:text-red-400">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          Historial de Movimientos de Cupos
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {movimientos.length} movimiento{movimientos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {movimientos.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
          <ClockIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No hay movimientos registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {movimientos.map((mov) => (
            <div
              key={mov.id}
              className={`border rounded-lg p-4 ${getTipoColor(mov.tipo_movimiento)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getTipoIcon(mov.tipo_movimiento)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {getTipoLabel(mov.tipo_movimiento)}
                      </span>
                      <span className="text-xs opacity-75">
                        {formatFecha(mov.created_at)}
                      </span>
                    </div>
                    {!centroFormadorId && mov.centro_formador && (
                      <div className="flex items-center gap-1 text-xs mt-1 opacity-90">
                        <BuildingOffice2Icon className="w-3 h-3" />
                        <span>{mov.centro_formador.nombre}</span>
                        {mov.centro_formador.codigo && (
                          <span className="opacity-75">({mov.centro_formador.codigo})</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {mov.tipo_movimiento === 'descuento' ? '-' : '+'}
                    {mov.cupos_afectados}
                  </div>
                  <div className="text-xs opacity-75">cupos</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                <div>
                  <span className="opacity-75">Antes:</span>
                  <span className="font-semibold ml-1">{mov.capacidad_antes}</span>
                </div>
                <div>
                  <span className="opacity-75">Después:</span>
                  <span className="font-semibold ml-1">{mov.capacidad_despues}</span>
                </div>
                {mov.estado_solicitud && (
                  <div>
                    <span className="opacity-75">Estado:</span>
                    <span className="font-semibold ml-1 capitalize">{mov.estado_solicitud}</span>
                  </div>
                )}
              </div>

              {mov.motivo && (
                <div className="text-xs opacity-90 bg-white/50 dark:bg-black/20 rounded p-2">
                  {mov.motivo}
                </div>
              )}

              {mov.solicitud && (
                <div className="text-xs opacity-75 mt-2">
                  Especialidad: {mov.solicitud.especialidad}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistorialMovimientosCupos;
