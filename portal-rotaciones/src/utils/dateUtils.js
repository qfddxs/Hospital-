/**
 * Utilidades para manejo de fechas
 * Soluciona problemas de zona horaria al formatear fechas
 */

/**
 * Formatea una fecha para mostrarla correctamente en la zona horaria local
 * @param {string|Date} fecha - Fecha a formatear
 * @param {object} opciones - Opciones de formato (opcional)
 * @returns {string} Fecha formateada
 */
export const formatearFecha = (fecha, opciones = {}) => {
  if (!fecha) return '-'
  
  // Si la fecha no tiene hora, agregar T00:00:00 para forzar interpretación local
  const fechaLocal = typeof fecha === 'string' && !fecha.includes('T') 
    ? new Date(fecha + 'T00:00:00') 
    : new Date(fecha)
  
  const opcionesDefault = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    ...opciones
  }
  
  return fechaLocal.toLocaleDateString('es-CL', opcionesDefault)
}

/**
 * Formatea una fecha con formato largo (ej: "15 de noviembre de 2025")
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatearFechaLarga = (fecha) => {
  return formatearFecha(fecha, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Formatea una fecha con formato corto (ej: "15/11/2025")
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatearFechaCorta = (fecha) => {
  return formatearFecha(fecha, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Obtiene la fecha actual en formato ISO (YYYY-MM-DD)
 * @returns {string} Fecha actual
 */
export const obtenerFechaHoy = () => {
  return new Date().toISOString().split('T')[0]
}

/**
 * Compara dos fechas
 * @param {string|Date} fecha1 - Primera fecha
 * @param {string|Date} fecha2 - Segunda fecha
 * @returns {number} -1 si fecha1 < fecha2, 0 si son iguales, 1 si fecha1 > fecha2
 */
export const compararFechas = (fecha1, fecha2) => {
  const f1 = new Date(fecha1)
  const f2 = new Date(fecha2)
  
  if (f1 < f2) return -1
  if (f1 > f2) return 1
  return 0
}
