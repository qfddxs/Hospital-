const AlertBox = ({ tipo, mensaje }) => {
  const tipoStyles = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconos = {
    warning: '⚠️',
    error: '❗',
    info: 'ℹ️'
  };

  return (
    <div className={`${tipoStyles[tipo]} border-l-4 p-4 rounded-lg mb-3`}>
      <div className="flex items-start">
        <span className="mr-3 text-lg">{iconos[tipo]}</span>
        <p className="text-sm font-medium">{mensaje}</p>
      </div>
    </div>
  );
};

export default AlertBox;

