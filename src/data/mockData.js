// Datos mock para el Sistema de Gestión de Campos Clínicos

export const estadisticasGenerales = {
  cuposTotales: { valor: 1247, cambio: 12 },
  estudiantesActivos: { valor: 892, cambio: 5 },
  rotacionesEnCurso: { valor: 156, cambio: 8 },
  solicitudesPendientes: { valor: 23, cambio: -15 }
};

export const alertas = [
  {
    id: 1,
    tipo: 'warning',
    mensaje: 'Rotación de Medicina Interna próxima a vencer (3 días)',
    fecha: '2025-10-14'
  },
  {
    id: 2,
    tipo: 'error',
    mensaje: '5 estudiantes con asistencia inferior al 80%',
    fecha: '2025-10-14'
  },
  {
    id: 3,
    tipo: 'info',
    mensaje: 'Nueva solicitud de cupos pendiente de aprobación',
    fecha: '2025-10-14'
  }
];

export const actividadReciente = [
  {
    id: 1,
    titulo: 'Nueva solicitud de cupos',
    descripcion: 'Centro Formador A • 2 horas ago',
    tipo: 'solicitud',
    tiempo: '2 horas ago'
  },
  {
    id: 2,
    titulo: 'Asistencia registrada',
    descripcion: 'Dr. Pérez • 4 horas ago',
    tipo: 'asistencia',
    tiempo: '4 horas ago'
  },
  {
    id: 3,
    titulo: 'Documento actualizado',
    descripcion: 'Admin Sistema • 1 día ago',
    tipo: 'documento',
    tiempo: '1 día ago'
  }
];

export const proximasFechas = [
  {
    id: 1,
    titulo: 'Finalización rotación Pediatría',
    fecha: '15 Mar 2024',
    tipo: 'rotacion'
  },
  {
    id: 2,
    titulo: 'Inicio nuevo período académico',
    fecha: '20 Mar 2024',
    tipo: 'academico'
  },
  {
    id: 3,
    titulo: 'Evaluación de tutores',
    fecha: '25 Mar 2024',
    tipo: 'evaluacion'
  }
];

export const centrosFormadores = [
  {
    id: 1,
    nombre: 'Centro Formador A',
    especialidades: ['Medicina Interna', 'Pediatría', 'Cirugía'],
    capacidadTotal: 45,
    capacidadDisponible: 12,
    estado: 'activo',
    ubicacion: 'Ciudad Principal'
  },
  {
    id: 2,
    nombre: 'Centro Formador B',
    especialidades: ['Ginecología', 'Medicina Familiar'],
    capacidadTotal: 30,
    capacidadDisponible: 8,
    estado: 'activo',
    ubicacion: 'Ciudad Secundaria'
  },
  {
    id: 3,
    nombre: 'Centro Formador C',
    especialidades: ['Urgencias', 'Traumatología'],
    capacidadTotal: 25,
    capacidadDisponible: 0,
    estado: 'completo',
    ubicacion: 'Ciudad Principal'
  },
  {
    id: 4,
    nombre: 'Centro Formador D',
    especialidades: ['Psiquiatría', 'Neurología'],
    capacidadTotal: 20,
    capacidadDisponible: 5,
    estado: 'activo',
    ubicacion: 'Ciudad Terciaria'
  }
];

export const estudiantes = [
  {
    id: 1,
    nombre: 'Ana Martínez López',
    programa: 'Medicina General',
    rotacionActual: 'Medicina Interna',
    centroFormador: 'Centro Formador A',
    asistencia: 92,
    estado: 'activo',
    fechaInicio: '01/03/2024',
    email: 'ana.martinez@ejemplo.com'
  },
  {
    id: 2,
    nombre: 'Carlos Rodríguez Pérez',
    programa: 'Medicina General',
    rotacionActual: 'Pediatría',
    centroFormador: 'Centro Formador A',
    asistencia: 88,
    estado: 'activo',
    fechaInicio: '01/03/2024',
    email: 'carlos.rodriguez@ejemplo.com'
  },
  {
    id: 3,
    nombre: 'María González Silva',
    programa: 'Medicina Familiar',
    rotacionActual: 'Medicina Familiar',
    centroFormador: 'Centro Formador B',
    asistencia: 95,
    estado: 'activo',
    fechaInicio: '15/02/2024',
    email: 'maria.gonzalez@ejemplo.com'
  },
  {
    id: 4,
    nombre: 'Juan Torres Ramírez',
    programa: 'Medicina General',
    rotacionActual: 'Cirugía',
    centroFormador: 'Centro Formador A',
    asistencia: 75,
    estado: 'alerta',
    fechaInicio: '01/03/2024',
    email: 'juan.torres@ejemplo.com'
  },
  {
    id: 5,
    nombre: 'Laura Fernández Castro',
    programa: 'Especialidad Pediatría',
    rotacionActual: 'Pediatría',
    centroFormador: 'Centro Formador A',
    asistencia: 98,
    estado: 'activo',
    fechaInicio: '01/01/2024',
    email: 'laura.fernandez@ejemplo.com'
  }
];

export const solicitudesCupos = [
  {
    id: 1,
    centroFormador: 'Centro Formador A',
    especialidad: 'Medicina Interna',
    numeroCupos: 5,
    fechaSolicitud: '10/10/2024',
    estado: 'pendiente',
    solicitante: 'Dr. Franco Ravera Zunino',
    comentarios: 'Solicitud para el próximo período académico'
  },
  {
    id: 2,
    centroFormador: 'Centro Formador B',
    especialidad: 'Ginecología',
    numeroCupos: 3,
    fechaSolicitud: '08/10/2024',
    estado: 'aprobada',
    solicitante: 'Dra. María González',
    comentarios: 'Aprobado para marzo 2024'
  },
  {
    id: 3,
    centroFormador: 'Centro Formador D',
    especialidad: 'Psiquiatría',
    numeroCupos: 4,
    fechaSolicitud: '05/10/2024',
    estado: 'rechazada',
    solicitante: 'Dr. Carlos Pérez',
    comentarios: 'Capacidad insuficiente actualmente'
  }
];

export const registrosAsistencia = [
  {
    id: 1,
    estudianteId: 1,
    fecha: '14/10/2024',
    presente: true,
    observaciones: ''
  },
  {
    id: 2,
    estudianteId: 2,
    fecha: '14/10/2024',
    presente: true,
    observaciones: ''
  },
  {
    id: 3,
    estudianteId: 3,
    fecha: '14/10/2024',
    presente: true,
    observaciones: ''
  },
  {
    id: 4,
    estudianteId: 4,
    fecha: '14/10/2024',
    presente: false,
    observaciones: 'Falta justificada'
  }
];

export const retribuciones = [
  {
    id: 1,
    centroFormador: 'Centro Formador A',
    periodo: 'Marzo 2024',
    monto: 45000,
    estado: 'pagado',
    fechaPago: '05/04/2024',
    numeroEstudiantes: 15
  },
  {
    id: 2,
    centroFormador: 'Centro Formador B',
    periodo: 'Marzo 2024',
    monto: 30000,
    estado: 'pagado',
    fechaPago: '05/04/2024',
    numeroEstudiantes: 10
  },
  {
    id: 3,
    centroFormador: 'Centro Formador C',
    periodo: 'Abril 2024',
    monto: 25000,
    estado: 'pendiente',
    fechaPago: null,
    numeroEstudiantes: 8
  }
];

export const documentos = [
  {
    id: 1,
    nombre: 'Convenio Centro Formador A.pdf',
    tipo: 'convenio',
    fechaSubida: '15/01/2024',
    tamaño: '2.5 MB',
    categoria: 'Convenios'
  },
  {
    id: 2,
    nombre: 'Reglamento Rotaciones 2024.pdf',
    tipo: 'reglamento',
    fechaSubida: '10/02/2024',
    tamaño: '1.8 MB',
    categoria: 'Normativa'
  },
  {
    id: 3,
    nombre: 'Evaluación Estudiantes Q1.xlsx',
    tipo: 'evaluacion',
    fechaSubida: '05/04/2024',
    tamaño: '850 KB',
    categoria: 'Evaluaciones'
  },
  {
    id: 4,
    nombre: 'Lista Asistencia Marzo.xlsx',
    tipo: 'asistencia',
    fechaSubida: '01/04/2024',
    tamaño: '320 KB',
    categoria: 'Asistencia'
  }
];

