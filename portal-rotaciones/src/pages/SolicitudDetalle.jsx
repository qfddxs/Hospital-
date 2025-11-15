import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useSession } from '../context/SessionContext'
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'

const SolicitudDetalle = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSession()
  const [solicitud, setSolicitud] = useState(null)
  const [estudiantes, setEstudiantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [editando, setEditando] = useState(null)
  const [mostrarRechazo, setMostrarRechazo] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')

  useEffect(() => {
    fetchSolicitud()
  }, [id])

  const fetchSolicitud = async () => {
    try {
      const { data: solicitudData, error: solicitudError } = await supabase
        .from('solicitudes_rotacion')
        .select(`
          *,
          centro_formador:centros_formadores(*)
        `)
        .eq('id', id)
        .single()

      if (solicitudError) throw solicitudError

      const { data: estudiantesData, error: estudiantesError } = await supabase
        .from('estudiantes_rotacion')
        .select('*')
        .eq('solicitud_rotacion_id', id)
        .order('primer_apellido', { ascending: true })

      if (estudiantesError) throw estudiantesError

      setSolicitud(solicitudData)
      setEstudiantes(estudiantesData || [])
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar la solicitud')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleAprobar = async () => {
    if (!confirm(`¿Aprobar esta solicitud con ${estudiantes.length} estudiantes?`)) return

    setProcesando(true)
    try {
      // 1. Actualizar estado de solicitud
      const { error: updateError } = await supabase
        .from('solicitudes_rotacion')
        .update({
          estado: 'aprobada',
          fecha_respuesta: new Date().toISOString(),
          respondido_por: user.id
        })
        .eq('id', id)

      if (updateError) throw updateError

      // 2. Crear rotaciones automáticamente para cada estudiante
      const rotacionesPromises = estudiantes.map(async (est) => {
        // Buscar o crear el servicio clínico
        let servicioId = null;
        if (est.campo_clinico_solicitado) {
          const { data: servicio } = await supabase
            .from('servicios_clinicos')
            .select('id')
            .ilike('nombre', est.campo_clinico_solicitado)
            .single();
          
          if (servicio) {
            servicioId = servicio.id;
          } else {
            // Crear el servicio si no existe
            const { data: nuevoServicio } = await supabase
              .from('servicios_clinicos')
              .insert({ nombre: est.campo_clinico_solicitado, activo: true })
              .select('id')
              .single();
            servicioId = nuevoServicio?.id;
          }
        }

        // Crear la rotación
        return supabase
          .from('rotaciones')
          .insert({
            estudiante_rotacion_id: est.id,
            servicio_clinico_id: servicioId,
            fecha_inicio: est.fecha_inicio || solicitud.fecha_inicio,
            fecha_termino: est.fecha_termino || solicitud.fecha_termino,
            horario_desde: est.horario_desde,
            horario_hasta: est.horario_hasta,
            estado: 'activa',
            observaciones: est.observaciones
          });
      });

      await Promise.all(rotacionesPromises);

      // 3. Crear alumnos en el hospital (con todas las columnas de estudiantes_rotacion)
      const alumnosData = estudiantes.map(est => ({
        solicitud_rotacion_id: id,
        centro_formador_id: solicitud.centro_formador_id,
        rut: est.rut,
        numero: est.numero,
        primer_apellido: est.primer_apellido,
        segundo_apellido: est.segundo_apellido,
        nombre: est.nombre,
        telefono: est.telefono,
        correo_electronico: est.correo_electronico,
        nombre_contacto_emergencia: est.nombre_contacto_emergencia,
        telefono_contacto_emergencia: est.telefono_contacto_emergencia,
        lugar_residencia: est.lugar_residencia,
        carrera: est.carrera,
        nivel_que_cursa: est.nivel_que_cursa,
        tipo_practica: est.tipo_practica,
        campo_clinico_solicitado: est.campo_clinico_solicitado,
        fecha_inicio: est.fecha_inicio,
        fecha_termino: est.fecha_termino,
        numero_semanas_practica: est.numero_semanas_practica,
        horario_desde: est.horario_desde,
        horario_hasta: est.horario_hasta,
        cuarto_turno: est.cuarto_turno,
        nombre_docente_cargo: est.nombre_docente_cargo,
        telefono_docente_cargo: est.telefono_docente_cargo,
        numero_registro_estudiante: est.numero_registro_estudiante,
        inmunizacion_al_dia: est.inmunizacion_al_dia,
        numero_visitas: est.numero_visitas,
        fecha_supervision: est.fecha_supervision,
        observaciones: est.observaciones,
        fecha_inicio_rotacion: solicitud.fecha_inicio,
        fecha_termino_rotacion: solicitud.fecha_termino,
        estado: 'en_rotacion',
        activo: true
      }))

      const { error: alumnosError } = await supabase
        .from('alumnos')
        .insert(alumnosData)

      if (alumnosError) throw alumnosError

      alert('✅ Solicitud aprobada exitosamente')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error al aprobar:', error)
      alert('Error al aprobar la solicitud: ' + error.message)
    } finally {
      setProcesando(false)
    }
  }

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      alert('Debes ingresar un motivo de rechazo')
      return
    }

    if (!confirm(`¿Rechazar esta solicitud? Se eliminarán ${estudiantes.length} estudiantes de la base de datos.`)) {
      return
    }

    setProcesando(true)
    try {
      // 1. Eliminar estudiantes de la solicitud
      const { error: deleteError } = await supabase
        .from('estudiantes_rotacion')
        .delete()
        .eq('solicitud_rotacion_id', id)

      if (deleteError) throw deleteError

      // 2. Actualizar estado de la solicitud
      const { error: updateError } = await supabase
        .from('solicitudes_rotacion')
        .update({
          estado: 'rechazada',
          fecha_respuesta: new Date().toISOString(),
          respondido_por: user.id,
          motivo_rechazo: motivoRechazo
        })
        .eq('id', id)

      if (updateError) throw updateError

      alert(`Solicitud rechazada. Se eliminaron ${estudiantes.length} estudiantes.`)
      navigate('/dashboard')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al rechazar la solicitud: ' + error.message)
    } finally {
      setProcesando(false)
    }
  }

  const handleEditarEstudiante = async (estudianteId, campo, valor) => {
    try {
      const { error } = await supabase
        .from('estudiantes_rotacion')
        .update({ [campo]: valor })
        .eq('id', estudianteId)

      if (error) throw error

      setEstudiantes(prev =>
        prev.map(est => est.id === estudianteId ? { ...est, [campo]: valor } : est)
      )
    } catch (error) {
      console.error('Error al editar:', error)
      alert('Error al actualizar estudiante')
    }
  }

  const handleEliminarEstudiante = async (estudianteId) => {
    if (!confirm('¿Eliminar este estudiante de la solicitud?')) return

    try {
      const { error } = await supabase
        .from('estudiantes_rotacion')
        .delete()
        .eq('id', estudianteId)

      if (error) throw error

      setEstudiantes(prev => prev.filter(est => est.id !== estudianteId))
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar estudiante')
    }
  }

  const descargarExcel = () => {
    if (solicitud?.archivo_excel_url) {
      window.open(solicitud.archivo_excel_url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  const esPendiente = solicitud?.estado === 'pendiente'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver al Dashboard
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {solicitud?.especialidad}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {solicitud?.centro_formador?.nombre}
              </p>
            </div>

            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              solicitud?.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
              solicitud?.estado === 'aprobada' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {solicitud?.estado?.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información de la solicitud */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Información de la Rotación
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-500">Centro Formador</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {solicitud?.centro_formador?.nombre}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {solicitud?.centro_formador?.tipo} • {solicitud?.centro_formador?.ciudad}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-500">Especialidad</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {solicitud?.especialidad}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-500">Fecha de Inicio</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(solicitud?.fecha_inicio).toLocaleDateString('es-CL')}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-500">Fecha de Término</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(solicitud?.fecha_termino).toLocaleDateString('es-CL')}
              </p>
            </div>

            {solicitud?.comentarios && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-500">Comentarios</p>
                <p className="text-gray-900 dark:text-white">{solicitud.comentarios}</p>
              </div>
            )}

            {solicitud?.archivo_excel_url && (
              <div className="md:col-span-2">
                <button
                  onClick={descargarExcel}
                  className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  Descargar Excel Original
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lista de estudiantes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Estudiantes ({estudiantes.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">RUT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Apellidos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Correo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Teléfono</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Carrera</th>
                  {esPendiente && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {estudiantes.map((estudiante) => (
                  <tr key={estudiante.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">
                      {editando === estudiante.id ? (
                        <input
                          type="text"
                          defaultValue={estudiante.rut}
                          onBlur={(e) => handleEditarEstudiante(estudiante.id, 'rut', e.target.value)}
                          className="w-full px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500"
                          disabled={!esPendiente}
                        />
                      ) : (
                        estudiante.rut
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {editando === estudiante.id ? (
                        <input
                          type="text"
                          defaultValue={estudiante.nombre}
                          onBlur={(e) => handleEditarEstudiante(estudiante.id, 'nombre', e.target.value)}
                          className="w-full px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500"
                          disabled={!esPendiente}
                        />
                      ) : (
                        estudiante.nombre
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {`${estudiante.primer_apellido || ''} ${estudiante.segundo_apellido || ''}`.trim() || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {estudiante.correo_electronico || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {estudiante.telefono || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {estudiante.carrera || '-'}
                    </td>
                    {esPendiente && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditando(editando === estudiante.id ? null : estudiante.id)}
                            className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEliminarEstudiante(estudiante.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Acciones */}
        {esPendiente && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Acciones
            </h2>

            {!mostrarRechazo ? (
              <div className="flex gap-4">
                <button
                  onClick={handleAprobar}
                  disabled={procesando || estudiantes.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  {procesando ? 'Procesando...' : 'Aprobar Solicitud'}
                </button>

                <button
                  onClick={() => setMostrarRechazo(true)}
                  disabled={procesando}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <XCircleIcon className="w-5 h-5" />
                  Rechazar Solicitud
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Motivo del Rechazo
                  </label>
                  <textarea
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent resize-none"
                    placeholder="Explica el motivo del rechazo..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleRechazar}
                    disabled={procesando || !motivoRechazo.trim()}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {procesando ? 'Procesando...' : 'Confirmar Rechazo'}
                  </button>

                  <button
                    onClick={() => {
                      setMostrarRechazo(false)
                      setMotivoRechazo('')
                    }}
                    disabled={procesando}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default SolicitudDetalle
