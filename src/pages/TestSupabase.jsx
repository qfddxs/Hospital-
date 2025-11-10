import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function TestSupabase() {
  const [servicios, setServicios] = useState([])
  const [alumnos, setAlumnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      
      // Obtener servicios clínicos
      const { data: serviciosData, error: serviciosError } = await supabase
        .from('servicios_clinicos')
        .select('*')
        .order('nombre')

      if (serviciosError) throw serviciosError
      setServicios(serviciosData || [])

      // Obtener alumnos
      const { data: alumnosData, error: alumnosError } = await supabase
        .from('alumnos')
        .select(`
          *,
          centro_formador:centros_formadores(nombre)
        `)
        .order('apellidos')

      if (alumnosError) throw alumnosError
      setAlumnos(alumnosData || [])

      setError(null)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const agregarServicio = async () => {
    const nuevoServicio = {
      nombre: 'Servicio de Prueba',
      codigo: 'TEST-' + Date.now(),
      capacidad_maxima: 5,
      descripcion: 'Servicio creado desde React'
    }

    const { data, error } = await supabase
      .from('servicios_clinicos')
      .insert([nuevoServicio])
      .select()

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('Servicio creado exitosamente!')
      cargarDatos()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando datos de Supabase...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">🎉 Conexión con Supabase Exitosa!</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Servicios Clínicos */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Servicios Clínicos</h2>
          <button
            onClick={agregarServicio}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Agregar Servicio de Prueba
          </button>
        </div>
        
        {servicios.length === 0 ? (
          <p className="text-gray-500">No hay servicios registrados</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicios.map((servicio) => (
              <div key={servicio.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                <h3 className="font-bold text-lg">{servicio.nombre}</h3>
                <p className="text-sm text-gray-600">Código: {servicio.codigo}</p>
                <p className="text-sm mt-2">{servicio.descripcion}</p>
                <div className="mt-3 flex justify-between text-sm">
                  <span>Capacidad: {servicio.capacidad_actual}/{servicio.capacidad_maxima}</span>
                  <span className={servicio.activo ? 'text-green-600' : 'text-red-600'}>
                    {servicio.activo ? '✓ Activo' : '✗ Inactivo'}
                  </span>
                </div>
                {servicio.jefe_servicio && (
                  <p className="text-sm text-gray-600 mt-2">Jefe: {servicio.jefe_servicio}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alumnos */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Alumnos</h2>
        
        {alumnos.length === 0 ? (
          <p className="text-gray-500">No hay alumnos registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">RUT</th>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">Centro Formador</th>
                  <th className="px-4 py-2 text-left">Carrera</th>
                  <th className="px-4 py-2 text-left">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((alumno) => (
                  <tr key={alumno.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{alumno.rut}</td>
                    <td className="px-4 py-2">{alumno.nombres} {alumno.apellidos}</td>
                    <td className="px-4 py-2">{alumno.centro_formador?.nombre || 'N/A'}</td>
                    <td className="px-4 py-2">{alumno.carrera}</td>
                    <td className="px-4 py-2">{alumno.nivel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">📊 Estadísticas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{servicios.length}</div>
            <div className="text-sm text-gray-600">Servicios</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{alumnos.length}</div>
            <div className="text-sm text-gray-600">Alumnos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {servicios.reduce((sum, s) => sum + s.capacidad_actual, 0)}
            </div>
            <div className="text-sm text-gray-600">En Rotación</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {servicios.reduce((sum, s) => sum + s.capacidad_maxima, 0)}
            </div>
            <div className="text-sm text-gray-600">Capacidad Total</div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-600">
        <p>✅ Supabase está funcionando correctamente</p>
        <p className="text-sm mt-2">Puedes empezar a construir tu aplicación</p>
      </div>
    </div>
  )
}

export default TestSupabase
