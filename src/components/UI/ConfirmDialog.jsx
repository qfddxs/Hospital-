import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, type = 'warning', confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
  const icons = {
    warning: { icon: ExclamationTriangleIcon, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    danger: { icon: ExclamationTriangleIcon, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
    success: { icon: CheckCircleIcon, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
    info: { icon: InformationCircleIcon, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' }
  };

  const { icon: Icon, color, bg } = icons[type] || icons.warning;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 rounded-full p-3 ${bg}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <div className="flex-1">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    {cancelText}
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                      type === 'danger'
                        ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                        : type === 'success'
                        ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                        : 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600'
                    }`}
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                  >
                    {confirmText}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmDialog;
