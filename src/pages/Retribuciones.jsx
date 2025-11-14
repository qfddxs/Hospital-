import { WrenchScrewdriverIcon, ClockIcon } from '@heroicons/react/24/outline';

const Retribuciones = () => {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center max-w-md">
        {/* Icono */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <WrenchScrewdriverIcon className="w-24 h-24 text-gray-300 dark:text-gray-600" />
            <ClockIcon className="w-12 h-12 text-yellow-500 dark:text-yellow-400 absolute -bottom-2 -right-2" />
          </div>
        </div>

        {/* Título */}
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          Módulo en Construcción
        </h2>

        {/* Descripción */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          El módulo de <strong>Retribuciones y Reportes</strong> está actualmente en desarrollo.
        </p>

        {/* Características próximamente */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-6 text-left transition-colors">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Próximamente:</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Gestión de pagos a centros formadores</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Reportes financieros detallados</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Historial de retribuciones</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Exportación de documentos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>Gráficos y estadísticas</span>
            </li>
          </ul>
        </div>

        {/* Mensaje adicional */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          Mientras tanto, puedes utilizar los demás módulos del sistema.
        </p>
      </div>
    </div>
  );
};

export default Retribuciones;
