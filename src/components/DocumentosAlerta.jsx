import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { obtenerDocumentosProximosVencer } from '../services/documentosService';

const DocumentosAlerta = () => {
  const [documentosVencer, setDocumentosVencer] = useState([]);
  const [mostrar, setMostrar] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDocumentosVencer();
  }, []);

  const cargarDocumentosVencer = async () => {
    try {
      setLoading(true);
      const { data, error } = await obtenerDocumentosProximosVencer(30);
      if (!error && data) {
        setDocumentosVencer(data);
      }
    } catch (err) {
      console.error('Error al cargar documentos próximos a vencer:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !mostrar || documentosVencer.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 mb-6 rounded-r-lg transition-colors">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 dark:text-yellow-500" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            Documentos próximos a vencer
          </h3>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
            <p className="mb-2">
              Hay {documentosVencer.length} documento(s) que vencerán en los próximos 30 días:
            </p>
            <ul className="list-disc list-inside space-y-1">
              {documentosVencer.slice(0, 5).map((doc) => (
                <li key={doc.id}>
                  <strong>{doc.titulo}</strong> - Vence el{' '}
                  {new Date(doc.fecha_vencimiento).toLocaleDateString('es-CL')}
                </li>
              ))}
              {documentosVencer.length > 5 && (
                <li className="text-yellow-600 dark:text-yellow-500">
                  ... y {documentosVencer.length - 5} más
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => setMostrar(false)}
            className="inline-flex text-yellow-400 dark:text-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentosAlerta;
