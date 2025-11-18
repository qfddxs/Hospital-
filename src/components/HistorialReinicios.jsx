import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ClockIcon, UserIcon, ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Loader from './Loader';

const HistorialReinicios = ({ nivelFormacion }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistorial();
  }, [nivelFormacion]);

  const fetchHistorial = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('historial_reinicio_cupos')
        .select('*')
        .order('fecha_reinicio', { ascending: false })
        .limit(20);

      if (nivelFormacion && nivelFormacion !== 'ambos') {
        query = query.eq('nivel_formacion', nivelFormacion);
      }

      const { data, error } = await query;

      if (error) throw error;

      setHistorial(data || []);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError('No se pudo cargar el historial de reinicios.');
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
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
          Historial de Reinicios
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {historial.length} registro{historial.length !== 1 ? 's' : ''}
        </span>
      </div>

      {historial.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <ClockIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No hay reinicios registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {historial.map((registro) => (
            <div
              key={registro.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-lg">
                    <ClockIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatFecha(registro.fecha_reinicio)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Nivel: <span className="font-medium capitalize">{registro.nivel_formacion || 'todos'}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Centros</p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-200">
                    {registro.centros_afectados}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-1">Cupos Liberados</p>
                  <p className="text-xl font-bold text-green-900 dark:text-green-200">
                    {registro.cupos_liberados}
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Solicitudes</p>
                  <p className="text-xl font-bold text-amber-900 dark:text-amber-200">
                    {registro.solicitudes_afectadas}
                  </p>
                </div>
              </div>

              {registro.observaciones && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 flex items-start gap-2">
                  <DocumentTextIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    {registro.observaciones}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistorialReinicios;
