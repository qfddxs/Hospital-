import {
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  FolderIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  TagIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const DocumentoCard = ({ documento, onView, onDownload, onDuplicate, onDelete }) => {
  const getIconByType = (tipo) => {
    switch (tipo) {
      case 'convenio':
        return <DocumentTextIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />;
      case 'protocolo':
        return <ClipboardDocumentListIcon className="w-8 h-8 text-teal-600 dark:text-teal-400" />;
      case 'normativa':
        return <ChartBarIcon className="w-8 h-8 text-green-600 dark:text-green-400" />;
      default:
        return <FolderIcon className="w-8 h-8 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'vigente':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'vencido':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'archivado':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {getIconByType(documento.tipo)}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">
              {documento.titulo}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {documento.version && (
                <span className="text-xs text-gray-500 dark:text-gray-400">v{documento.version}</span>
              )}
              {documento.es_version && (
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">
                  Versión
                </span>
              )}
            </div>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs capitalize ${getEstadoColor(documento.estado)}`}>
          {documento.estado || 'vigente'}
        </span>
      </div>

      {/* Descripción */}
      {documento.descripcion && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {documento.descripcion}
        </p>
      )}

      {/* Metadata */}
      <div className="space-y-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <FolderIcon className="w-4 h-4" />
          <span>{documento.categoria || 'Sin categoría'}</span>
        </div>
        {documento.fecha_vigencia && (
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span>Vigencia: {new Date(documento.fecha_vigencia).toLocaleDateString('es-CL')}</span>
          </div>
        )}
        {documento.tamaño_bytes && (
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4" />
            <span>{formatFileSize(documento.tamaño_bytes)}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {documento.tags && documento.tags.length > 0 && (
        <div className="flex items-center gap-1 mb-3 flex-wrap">
          <TagIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          {documento.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
          {documento.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">+{documento.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onView(documento)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
          title="Ver detalles"
        >
          <EyeIcon className="w-4 h-4" />
          Ver
        </button>
        {documento.archivo_url && (
          <button
            onClick={() => onDownload(documento)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded transition-colors"
            title="Descargar"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Descargar
          </button>
        )}
        <button
          onClick={() => onDuplicate(documento)}
          className="flex items-center justify-center px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
          title="Duplicar"
        >
          <DocumentDuplicateIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(documento)}
          className="flex items-center justify-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          title="Eliminar"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DocumentoCard;
