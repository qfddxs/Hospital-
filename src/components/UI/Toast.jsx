import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Toast = ({ show, onClose, message, type = 'success', duration = 3000 }) => {
  const icons = {
    success: { icon: CheckCircleIcon, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-800' },
    error: { icon: XCircleIcon, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800' },
    info: { icon: InformationCircleIcon, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' }
  };

  const { icon: Icon, color, bg, border } = icons[type] || icons.success;

  // Auto-cerrar después de la duración especificada
  if (show && duration > 0) {
    setTimeout(() => {
      onClose();
    }, duration);
  }

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none max-w-md">
      <Transition
        show={show}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className={`pointer-events-auto w-full rounded-lg shadow-xl border ${bg} ${border}`}>
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
                  {message}
                </p>
              </div>
              <div className="flex-shrink-0">
                <button
                  type="button"
                  className="inline-flex rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none transition-colors"
                  onClick={onClose}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default Toast;
