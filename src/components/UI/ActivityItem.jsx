const ActivityItem = ({ titulo, descripcion, tipo }) => {
  const iconoBg = {
    solicitud: 'bg-blue-100 text-blue-600',
    asistencia: 'bg-green-100 text-green-600',
    documento: 'bg-purple-100 text-purple-600'
  };

  const iconos = {
    solicitud: '📄',
    asistencia: '✓',
    documento: '📁'
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`${iconoBg[tipo]} w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0`}>
        {iconos[tipo]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{titulo}</p>
        <p className="text-xs text-gray-500 mt-1">{descripcion}</p>
      </div>
    </div>
  );
};

export default ActivityItem;

