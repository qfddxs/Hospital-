import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const Toast = ({ message, type = 'success', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const types = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-200',
      icon: CheckCircleIcon,
      iconColor: 'text-green-600 dark:text-green-400'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: XCircleIcon,
      iconColor: 'text-red-600 dark:text-red-400'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: InformationCircleIcon,
      iconColor: 'text-blue-600 dark:text-blue-400'
    }
  };

  const config = types[type] || types.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`${config.bg} ${config.border} border backdrop-blur-sm rounded-xl shadow-lg p-4 flex items-start gap-3 min-w-[320px] max-w-md`}
    >
      <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-0.5`} />
      <p className={`${config.text} flex-1 text-sm font-medium`}>{message}</p>
      <button
        onClick={onClose}
        className={`${config.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

// Contenedor de toasts
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
