import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Button from '../components/UI/Button';
import HeaderCentroFormador from '../components/UI/HeaderCentroFormador';
import {
  BuildingOffice2Icon,
  ArrowLeftIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'; // No se usa en este componente
import { motion, useInView, animate, AnimatePresence } from 'framer-motion';
import { useNivelFormacion } from '../context/NivelFormacionContext';

// Componente para animar números
function Counter({ from = 0, to }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      animate(from, to, {
        duration: 1.5,
        onUpdate(value) {
          if (ref.current) {
            ref.current.textContent = Math.round(value).toLocaleString('es-CL');
          }
        },
      });
    }
  }, [from, to, isInView]);

  return <span ref={ref}>{from}</span>;
}

const PortalSolicitar = () => {
  const navigate = useNavigate();
  const { nivelFormacion } = useNivelFormacion();
  const [centroInfo, setCentroInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cuposDisponibles, setCuposDisponibles] = useState(0);
  const [cuposTotales, setCuposTotales] = useState(0);
  
  const [formData, setFormData] = useState({
    especialidad: '',
    numero_cupos: 1,
    fecha_inicio: '',
    fecha_termino: '',
    comentarios: '',
    solicitante: ''
  });

  // Especialidades según nivel de formación
  const especialidadesPregrado = [
    'Enfermería',
    'Técnico de Nivel Superior en Enfermería',
    'Medicina',
    'Kinesiología',
    'Nutrición',
    'Obstetricia',
    'Odontología',
    'Tecnología Médica',
    'Técnico en Laboratorio Clínico',
    'Técnico en Radiología',
    'Terapia Ocupacional',
    'Fonoaudiología',
    'Química y Farmacia',
    'Podología',
    'Técnico en Enfermería',
    'Técnico Paramédico'
  ];

  const especialidadesPostgrado = [
    'Medicina - Especialización',
    'Odontología - Especialización',
    'Enfermería en Cuidados Críticos',
    'Medicina Familiar',
    'Pediatría',
    'Cirugía',
    'Medicina Interna',
    'Ginecología y Obstetricia'
  ];

  const especialidadesDisponibles = nivelFormacion === 'pregrado' 
    ? especialidadesPregrado 
    : especialidadesPostgrado;

  useEffect(() => {
    fetchCentroInfo();

    // Suscribirse a cambios en tiempo real (solo cuando hay cambios en la BD)
    const channel = supabase
      .channel('centros_formadores_cupos_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'centros_formadores'
        },
        (payload) => {
          fetchCentroInfoSilent();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCentroInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: centroData } = await supabase
        .from('usuarios_centros')
        .select('*, centro_formador:centros_formadores(*)')
        .eq('user_id', user.id)
        .single();

      setCentroInfo(centroData);
      
      // Obtener cupos disponibles
      if (centroData?.centro_formador) {
        setCuposDisponibles(centroData.centro_formador.capacidad_disponible || 0);
        setCuposTotales(centroData.centro_formador.capacidad_total || 0);
      }
      
      // Usar contacto_nombre del centro formador como solicitante
      setFormData(prev => ({
        ...prev,
        solicitante: centroData?.centro_formador?.contacto_nombre || user.user_metadata?.nombre_completo || user.email || ''
      }));
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar información del centro');
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar cupos sin mostrar loading
  const fetchCentroInfoSilent = async () => {
    try {
      if (!centroInfo?.centro_formador_id) return;

      const { data: centroData } = await supabase
        .from('centros_formadores')
        .select('capacidad_disponible, capacidad_total')
        .eq('id', centroInfo.centro_formador_id)
        .single();

      if (centroData) {
        setCuposDisponibles(centroData.capacidad_disponible || 0);
        setCuposTotales(centroData.capacidad_total || 0);
      }
    } catch (err) {
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numero_cupos' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Validaciones
      if (!formData.especialidad) {
        throw new Error('Debes seleccionar una especialidad');
      }

      if (!formData.fecha_inicio || !formData.fecha_termino) {
        throw new Error('Debes especificar las fechas de inicio y término');
      }

      if (new Date(formData.fecha_termino) <= new Date(formData.fecha_inicio)) {
        throw new Error('La fecha de término debe ser posterior a la fecha de inicio');
      }

      // Validar cupos disponibles
      if (formData.numero_cupos > cuposDisponibles) {
        throw new Error(`No puedes solicitar más cupos de los disponibles. Tienes ${cuposDisponibles} cupos disponibles.`);
      }

      if (formData.numero_cupos <= 0) {
        throw new Error('Debes solicitar al menos 1 cupo');
      }

      // Crear solicitud
      const { data, error } = await supabase
        .from('solicitudes_cupos')
        .insert([{
          centro_formador_id: centroInfo.centro_formador_id,
          especialidad: formData.especialidad,
          numero_cupos: formData.numero_cupos,
          fecha_inicio: formData.fecha_inicio,
          fecha_termino: formData.fecha_termino,
          solicitante: formData.solicitante,
          comentarios: formData.comentarios,
          estado: 'pendiente',
          fecha_solicitud: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();

      if (error) throw error;

      setSuccess(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/solicitudes');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return ( // Pantalla de éxito animada
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Solicitud Enviada!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tu solicitud ha sido enviada exitosamente. El hospital la revisará y te notificará el resultado.
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-4 overflow-hidden">
              <motion.div className="bg-green-500 h-1" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2, ease: 'linear' }} />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <HeaderCentroFormador
        titulo="Solicitar Cupos Clínicos"
        subtitulo={
          <span>
            {centroInfo?.centro_formador?.nombre} - {nivelFormacion === 'pregrado' ? 'Pregrado' : 'Postgrado'}
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <span className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></span>
              Actualización en tiempo real
            </span>
          </span>
        }
        icono={DocumentTextIcon}
        codigoCentro={centroInfo?.centro_formador?.codigo}
      />

      {/* Contenido */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        {/* Indicador de Cupos Disponibles */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-teal-100 mb-1">Cupos Disponibles</p>
                <p className="text-4xl font-bold text-white"><Counter to={cuposDisponibles} /></p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg"><UserGroupIcon className="w-6 h-6 text-white" /></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-100 mb-1">Cupos Totales Asignados</p>
                <p className="text-4xl font-bold text-white"><Counter to={cuposTotales} /></p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg"><BuildingOffice2Icon className="w-6 h-6 text-white" /></div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-4">
            <h2 className="text-xl font-semibold text-white">Formulario de Solicitud</h2>
          </div>
          
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información de la Solicitud */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-teal-200 dark:border-teal-700 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-300 mb-4 flex items-center gap-2 transition-colors">
                <div className="p-2 bg-teal-500 rounded-lg">
                  <AcademicCapIcon className="w-5 h-5 text-white" />
                </div>
                Información de la Solicitud
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="especialidad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Especialidad/Carrera *
                  </label>
                  <select
                    name="especialidad"
                    id="especialidad"
                    required
                    value={formData.especialidad}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent"
                  >
                    <option value="">Selecciona una especialidad</option>
                    {especialidadesDisponibles.map(esp => (
                      <option key={esp} value={esp}>{esp}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="numero_cupos" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Número de Cupos * 
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      (Máximo: {cuposDisponibles})
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserGroupIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="numero_cupos"
                      id="numero_cupos"
                      min="1"
                      max={cuposDisponibles}
                      required
                      value={formData.numero_cupos}
                      onChange={handleChange}
                      disabled={cuposDisponibles === 0}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        formData.numero_cupos > cuposDisponibles 
                          ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-300 dark:border-gray-600'
                      } ${cuposDisponibles === 0 ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  {formData.numero_cupos > cuposDisponibles && (
                    <p className="mt-2 text-sm text-red-600">
                      ⚠️ Excede los cupos disponibles ({cuposDisponibles})
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Fechas */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-cyan-200 dark:border-cyan-700 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-cyan-900 dark:text-cyan-300 mb-4 flex items-center gap-2 transition-colors">
                <div className="p-2 bg-cyan-500 rounded-lg">
                  <CalendarDaysIcon className="w-5 h-5 text-white" />
                </div>
                Duración de Práctica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    id="fecha_inicio"
                    required
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="fecha_termino" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Término *
                  </label>
                  <input
                    type="date"
                    name="fecha_termino"
                    id="fecha_termino"
                    required
                    value={formData.fecha_termino}
                    onChange={handleChange}
                    min={formData.fecha_inicio || new Date().toISOString().split('T')[0]}
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>

            {/* Información Adicional */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300 mb-4 flex items-center gap-2 transition-colors">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <BuildingOffice2Icon className="w-5 h-5 text-white" />
                </div>
                Información Adicional
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="solicitante" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Solicitante
                  </label>
                  <input
                    type="text"
                    name="solicitante"
                    id="solicitante"
                    value={formData.solicitante}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent"
                    placeholder="Nombre del responsable de la solicitud"
                  />
                </div>

                <div>
                  <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comentarios Adicionales
                  </label>
                  <textarea
                    name="comentarios"
                    id="comentarios"
                    rows={4}
                    value={formData.comentarios}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent resize-none"
                    placeholder="Información adicional sobre la solicitud, requisitos especiales, etc."
                  />
                </div>
              </div>
            </motion.div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting || cuposDisponibles === 0 || formData.numero_cupos > cuposDisponibles}
                className="min-w-[140px]"
              >
                {submitting ? 'Enviando...' : cuposDisponibles === 0 ? 'Sin Cupos Disponibles' : 'Enviar Solicitud'}
              </Button>
            </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PortalSolicitar;
