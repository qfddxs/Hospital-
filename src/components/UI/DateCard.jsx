import { ArrowPathIcon, AcademicCapIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const DateCard = ({ titulo, fecha, tipo }) => {
  const colores = {
    rotacion: 'border-l-yellow-500 bg-yellow-50',
    academico: 'border-l-blue-500 bg-blue-50',
    evaluacion: 'border-l-green-500 bg-green-50'
  };

  const iconos = {
    rotacion: <ArrowPathIcon className="w-6 h-6 text-yellow-600" />,
    academico: <AcademicCapIcon className="w-6 h-6 text-blue-600" />,
    evaluacion: <PencilSquareIcon className="w-6 h-6 text-green-600" />
  };

  return (
    <div className={`${colores[tipo]} border-l-4 p-4 rounded-lg mb-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span>{iconos[tipo]}</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{titulo}</p>
            <p className="text-xs text-gray-600 mt-1">{fecha}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateCard;

