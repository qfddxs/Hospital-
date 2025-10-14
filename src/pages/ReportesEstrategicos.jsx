import Button from '../components/UI/Button';
import { indicadoresEstrategicos, estudiantes, centrosFormadores } from '../data/mockData';

const ReportesEstrategicos = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reportes Estratégicos</h2>
          <p className="text-gray-600 mt-1">Indicadores y métricas clave del sistema</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            📥 Exportar PDF
          </Button>
          <Button variant="outline">
            📊 Exportar Excel
          </Button>
        </div>
      </div>

      {/* Indicadores Clave */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-teal-100 text-sm">Tasa de Asistencia Promedio</p>
          <p className="text-4xl font-bold mt-2">{indicadoresEstrategicos.tasaAsistenciaPromedio}%</p>
          <p className="text-teal-100 text-sm mt-2">↑ 2.3% vs mes anterior</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-blue-100 text-sm">Satisfacción Estudiantes</p>
          <p className="text-4xl font-bold mt-2">{indicadoresEstrategicos.satisfaccionEstudiantes}/5</p>
          <p className="text-blue-100 text-sm mt-2">↑ 0.2 puntos vs trimestre anterior</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-green-100 text-sm">Tasa de Aprobación</p>
          <p className="text-4xl font-bold mt-2">{indicadoresEstrategicos.tasaAprobacion}%</p>
          <p className="text-green-100 text-sm mt-2">↑ 1.5% vs período anterior</p>
        </div>
      </div>

      {/* Indicadores Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Centros Activos</p>
          <p className="text-3xl font-bold text-gray-800">{indicadoresEstrategicos.centrosActivos}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Estudiantes Totales</p>
          <p className="text-3xl font-bold text-gray-800">{indicadoresEstrategicos.estudiantesTotales}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Rotaciones Completadas</p>
          <p className="text-3xl font-bold text-gray-800">{indicadoresEstrategicos.rotacionesCompletadas}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Programa */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Programa</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <span className="text-4xl">📊</span>
              <p className="mt-2">Gráfico de distribución</p>
              <p className="text-sm mt-1">Medicina General: 70%</p>
              <p className="text-sm">Especialidades: 30%</p>
            </div>
          </div>
        </div>

        {/* Tendencia de Asistencia */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendencia de Asistencia</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <span className="text-4xl">📈</span>
              <p className="mt-2">Gráfico de tendencia</p>
              <p className="text-sm mt-1">Últimos 6 meses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ranking de Centros Formadores */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ranking de Centros Formadores</h3>
        <div className="space-y-3">
          {centrosFormadores.slice(0, 5).map((centro, index) => {
            const ocupacion = ((centro.capacidadTotal - centro.capacidadDisponible) / centro.capacidadTotal) * 100;
            return (
              <div key={centro.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-200 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{centro.nombre}</p>
                    <p className="text-sm text-gray-500">{centro.ubicacion}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{Math.round(ocupacion)}% Ocupación</p>
                  <p className="text-sm text-gray-500">
                    {centro.capacidadTotal - centro.capacidadDisponible}/{centro.capacidadTotal} cupos
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen Ejecutivo */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen Ejecutivo</h3>
        <div className="prose max-w-none text-gray-700">
          <p className="mb-4">
            <strong>Período:</strong> {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
          <ul className="space-y-2">
            <li>✓ Sistema operando con {indicadoresEstrategicos.centrosActivos} centros formadores activos</li>
            <li>✓ {indicadoresEstrategicos.estudiantesTotales} estudiantes en rotaciones activas</li>
            <li>✓ Tasa de asistencia promedio del {indicadoresEstrategicos.tasaAsistenciaPromedio}%, superior al objetivo del 85%</li>
            <li>✓ Satisfacción estudiantil de {indicadoresEstrategicos.satisfaccionEstudiantes}/5, indicando buena calidad formativa</li>
            <li>✓ {indicadoresEstrategicos.rotacionesCompletadas} rotaciones completadas exitosamente en el período</li>
            <li>⚠️ {estudiantes.filter(e => e.asistencia < 80).length} estudiantes requieren seguimiento por baja asistencia</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportesEstrategicos;

