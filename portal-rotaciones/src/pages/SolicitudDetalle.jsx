import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useSession } from '../context/SessionContext'
import { ToastContainer } from '../components/Toast'
import { useToast } from '../hooks/useToast'
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
  const { toasts, removeToast, success, error, warning, info } = useToast()
  const [solicitud, setSolicitud] = useState(null)
  const [estudiantes, setEstudiantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [editando, setEditando] = useState(null)
  const [mostrarRechazo, setMostrarRechazo] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [mostrarConfirmacionAprobar, setMostrarConfirmacionAprobar] = useState(false)
  const [estudianteAEliminar, setEstudianteAEliminar] = useState(null)

  // Helper para formatear fechas correctamente
  const formatearFecha = (fecha) => {
    if (!fecha) return '-'
    const fechaLocal = fecha.includes('T') ? new Date(fecha) : new Date(fecha + 'T00:00:00')
    return fechaLocal.toLocaleDateString('es-CL')
  }

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
    } catch (err) {
      error('Error al cargar la solicitud')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const confirmarAprobar = () => {
    setMostrarConfirmacionAprobar(true)
  }

  const handleAprobar = async () => {
    setMostrarConfirmacionAprobar(false)
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

      // 2. Crear alumnos en el hospital PRIMERO (con todas las columnas de estudiantes_rotacion)
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
        // Contacto del centro formador
        contacto_nombre: solicitud.centro_formador?.contacto_nombre || est.nombre_docente_cargo,
        contacto_email: solicitud.centro_formador?.email || est.telefono_docente_cargo,
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

      const { data: alumnosCreados, error: alumnosError } = await supabase
        .from('alumnos')
        .insert(alumnosData)
        .select('id, rut')

      if (alumnosError) throw alumnosError

      // 3. Buscar servicios clínicos únicos del Excel
      const serviciosUnicos = [...new Set(estudiantes.map(e => e.campo_clinico_solicitado).filter(Boolean))];
      
      // Buscar servicios existentes en la BD
      const { data: serviciosExistentes } = await supabase
        .from('servicios_clinicos')
        .select('id, nombre')
        .in('nombre', serviciosUnicos);

      // Crear mapa de servicios existentes (nombre -> id)
      const mapaServicios = {};
      if (serviciosExistentes) {
        serviciosExistentes.forEach(s => {
          mapaServicios[s.nombre.toLowerCase()] = s.id;
        });
      }

      // Identificar servicios que NO existen y necesitan crearse
      const serviciosACrear = serviciosUnicos.filter(
        nombre => !mapaServicios[nombre.toLowerCase()]
      );

      // Crear servicios nuevos en batch (si hay)
      if (serviciosACrear.length > 0) {
        const { data: serviciosNuevos, error: crearError } = await supabase
          .from('servicios_clinicos')
          .insert(serviciosACrear.map(nombre => ({ nombre, activo: true })))
          .select('id, nombre');

        if (!crearError && serviciosNuevos) {
          // Agregar nuevos servicios al mapa
          serviciosNuevos.forEach(s => {
            mapaServicios[s.nombre.toLowerCase()] = s.id;
          });
        }
      }

      // 4. Crear rotaciones vinculadas a los alumnos
      const rotacionesPromises = estudiantes.map(async (est) => {
        // Encontrar el alumno creado que corresponde a este estudiante
        const alumno = alumnosCreados.find(a => a.rut === est.rut)
        if (!alumno) return null

        // Buscar el servicio clínico en el mapa
        const servicioId = est.campo_clinico_solicitado 
          ? mapaServicios[est.campo_clinico_solicitado.toLowerCase()] || null
          : null;

        // Crear la rotación vinculada al alumno
        return supabase
          .from('rotaciones')
          .insert({
            alumno_id: alumno.id,
            servicio_clinico_id: servicioId,
            fecha_inicio: est.fecha_inicio || solicitud.fecha_inicio,
            fecha_termino: est.fecha_termino || solicitud.fecha_termino,
            horario_desde: est.horario_desde,
            horario_hasta: est.horario_hasta,
            estado: 'activa',
            observaciones: est.observaciones
          });
      });

      await Promise.all(rotacionesPromises.filter(p => p !== null));

      // 4. Eliminar estudiantes de estudiantes_rotacion (ya están en alumnos)
      const { data: deletedData, error: deleteEstudiantesError } = await supabase
        .from('estudiantes_rotacion')
        .delete()
        .eq('solicitud_rotacion_id', id)
        .select()

      if (deleteEstudiantesError) {
        console.error('❌ Error al eliminar estudiantes temporales:', deleteEstudiantesError)
        warning(`Los alumnos se crearon correctamente, pero hubo un error al limpiar estudiantes_rotacion: ${deleteEstudiantesError.message}`)
      } else {
        console.log(`✅ Eliminados ${deletedData?.length || 0} estudiantes de estudiantes_rotacion`)
      }

      success(`Solicitud aprobada exitosamente. ${estudiantes.length} estudiantes creados en alumnos.`)
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      error('Error al aprobar la solicitud: ' + err.message)
    } finally {
      setProcesando(false)
    }
  }

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      warning('Debes ingresar un motivo de rechazo')
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

      success(`Solicitud rechazada. Se eliminaron ${estudiantes.length} estudiantes.`)
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      error('Error al rechazar la solicitud: ' + err.message)
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
      success('Estudiante actualizado correctamente')
    } catch (err) {
      error('Error al actualizar estudiante')
    }
  }

  const confirmarEliminarEstudiante = (estudianteId) => {
    setEstudianteAEliminar(estudianteId)
  }

  const handleEliminarEstudiante = async () => {
    const estudianteId = estudianteAEliminar
    setEstudianteAEliminar(null)

    try {
      const { error } = await supabase
        .from('estudiantes_rotacion')
        .delete()
        .eq('id', estudianteId)

      if (error) throw error

      setEstudiantes(prev => prev.filter(est => est.id !== estudianteId))
      success('Estudiante eliminado correctamente')
    } catch (err) {
      error('Error al eliminar estudiante')
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
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="min-h-screen relative overflow-hidden">
        {/* Fondo con gradiente */}
        <div className="fixed inset-0 bg-gradient-to-br from-teal-100 via-cyan-100 to-blue-100 dark:from-gray-900 dark:via-teal-950 dark:to-cyan-950"></div>
      
      {/* Efectos de blur - Modo claro */}
      <div className="fixed inset-0 dark:hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-300/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-300/40 rounded-full blur-[120px]"></div>
      </div>
      
      {/* Efectos de blur - Modo oscuro */}
      <div className="fixed inset-0 hidden dark:block">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px]"></div>
      </div>
      
      <div className="relative z-10">
      {/* Header */}
      <header className="bg-white/70 dark:bg-gray-800/80 backdrop-blur-lg border-b border-teal-200/60 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver al Dashboard
          </button>

          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {solicitud?.especialidad}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {solicitud?.centro_formador?.nombre}
                </p>
              </div>

              <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                solicitud?.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800' :
                solicitud?.estado === 'aprobada' ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' :
                'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
              }`}>
                {solicitud?.estado?.toUpperCase()}
              </span>
            </div>

            {/* Botones de acción en el header */}
            {esPendiente && (
              <div className="flex flex-wrap gap-3 pt-4 border-t border-teal-200 dark:border-gray-700">
                {!mostrarRechazo ? (
                  <>
                    <button
                      onClick={confirmarAprobar}
                      disabled={procesando || estudiantes.length === 0}
                      className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      {procesando ? 'Procesando...' : `Aprobar (${estudiantes.length} estudiantes)`}
                    </button>

                    <button
                      onClick={() => setMostrarRechazo(true)}
                      disabled={procesando}
                      className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <XCircleIcon className="w-5 h-5" />
                      Rechazar Solicitud
                    </button>
                  </>
                ) : (
                  <div className="w-full space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Motivo del Rechazo
                      </label>
                      <textarea
                        value={motivoRechazo}
                        onChange={(e) => setMotivoRechazo(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent resize-none"
                        placeholder="Explica el motivo del rechazo..."
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleRechazar}
                        disabled={procesando || !motivoRechazo.trim()}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                      >
                        {procesando ? 'Procesando...' : 'Confirmar Rechazo'}
                      </button>

                      <button
                        onClick={() => {
                          setMostrarRechazo(false)
                          setMotivoRechazo('')
                        }}
                        disabled={procesando}
                        className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors shadow-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información de la solicitud */}
        <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border border-teal-200 dark:border-gray-700/50 mb-6 shadow-md">
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
                {formatearFecha(solicitud?.fecha_inicio)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-500">Fecha de Término</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatearFecha(solicitud?.fecha_termino)}
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
                  className="flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  Descargar Excel Original
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lista de estudiantes */}
        <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border border-teal-200 dark:border-gray-700/50 mb-6 shadow-md">
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
                            className="p-1 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmarEliminarEstudiante(estudiante.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
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


      </main>
      </div>
    </div>

    {/* Modal de confirmación para aprobar */}
    {mostrarConfirmacionAprobar && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                ¿Aprobar esta solicitud?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Se crearán {estudiantes.length} estudiantes en el sistema y se aprobarán sus rotaciones.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setMostrarConfirmacionAprobar(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAprobar}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Sí, Aprobar
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de confirmación para eliminar estudiante */}
    {estudianteAEliminar && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                ¿Eliminar estudiante?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Esta acción no se puede deshacer. El estudiante será eliminado de la solicitud.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setEstudianteAEliminar(null)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleEliminarEstudiante}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sí, Eliminar
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default SolicitudDetalle
