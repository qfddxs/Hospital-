# 📋 Integración: Documentos de Estudiantes en Gestión Documental

## 🎯 Objetivo
Agregar una pestaña "Documentos de Estudiantes" en la página de Gestión Documental para centralizar todo en un solo lugar.

## 🎨 Diseño de Pestañas

```
┌─────────────────────────────────────────────────────────┐
│ 📚 Gestión Documental                                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [Institucionales] [Documentos de Estudiantes]           │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Contenido según pestaña seleccionada               │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 📝 Cambios Necesarios

### 1. Agregar estado de pestaña
```javascript
const [pestañaActiva, setPestañaActiva] = useState('institucionales'); // 'institucionales' o 'estudiantes'
```

### 2. Modificar fetchDocumentos para filtrar por pestaña
```javascript
const fetchDocumentos = async () => {
  let query = supabase.from('documentos').select('*');
  
  if (pestañaActiva === 'institucionales') {
    // Documentos sin alumno_id (institucionales)
    query = query.is('alumno_id', null);
  } else {
    // Documentos con alumno_id (de estudiantes)
    query = query
      .not('alumno_id', 'is', null)
      .select(`
        *,
        alumno:alumnos(nombre, primer_apellido, rut),
        centro_formador:centros_formadores(nombre)
      `);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  setDocumentos(data || []);
};
```

### 3. Agregar UI de pestañas
```javascript
<div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
  <button
    onClick={() => setPestañaActiva('institucionales')}
    className={`px-4 py-2 font-medium transition-colors ${
      pestañaActiva === 'institucionales'
        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
    }`}
  >
    📄 Documentos Institucionales
  </button>
  <button
    onClick={() => setPestañaActiva('estudiantes')}
    className={`px-4 py-2 font-medium transition-colors ${
      pestañaActiva === 'estudiantes'
        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
    }`}
  >
    👥 Documentos de Estudiantes
    {documentosPendientes > 0 && (
      <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
        {documentosPendientes}
      </span>
    )}
  </button>
</div>
```

### 4. Agregar columnas específicas para documentos de estudiantes
```javascript
const columnasEstudiantes = [
  {
    header: 'Estudiante',
    render: (row) => (
      <div>
        <p className="font-medium">{row.alumno?.nombre} {row.alumno?.primer_apellido}</p>
        <p className="text-xs text-gray-500">{row.alumno?.rut}</p>
      </div>
    )
  },
  {
    header: 'Centro Formador',
    render: (row) => row.centro_formador?.nombre || '-'
  },
  {
    header: 'Documento',
    render: (row) => row.titulo
  },
  {
    header: 'Estado Aprobación',
    render: (row) => {
      if (row.aprobado === null) {
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Pendiente</span>;
      } else if (row.aprobado === true) {
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Aprobado</span>;
      } else {
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Rechazado</span>;
      }
    }
  },
  {
    header: 'Acciones',
    render: (row) => (
      <div className="flex gap-2">
        {row.archivo_url && (
          <button onClick={() => window.open(row.archivo_url, '_blank')} className="...">
            Ver
          </button>
        )}
        {row.aprobado === null && (
          <>
            <button onClick={() => handleAprobar(row)} className="...">Aprobar</button>
            <button onClick={() => handleRechazar(row)} className="...">Rechazar</button>
          </>
        )}
      </div>
    )
  }
];
```

### 5. Funciones de aprobación/rechazo
```javascript
const handleAprobar = async (doc) => {
  const comentarios = prompt('Comentarios (opcional):');
  
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase
    .from('documentos')
    .update({
      aprobado: true,
      aprobado_por: user?.id,
      fecha_aprobacion: new Date().toISOString(),
      comentarios_aprobacion: comentarios
    })
    .eq('id', doc.id);
  
  await supabase
    .from('documentos_historial')
    .insert([{
      documento_id: doc.id,
      accion: 'aprobado',
      detalles: comentarios || 'Documento aprobado',
      usuario_email: user?.email
    }]);
  
  fetchDocumentos();
};

const handleRechazar = async (doc) => {
  const motivo = prompt('Motivo del rechazo (obligatorio):');
  if (!motivo) return;
  
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase
    .from('documentos')
    .update({
      aprobado: false,
      aprobado_por: user?.id,
      fecha_aprobacion: new Date().toISOString(),
      comentarios_aprobacion: motivo
    })
    .eq('id', doc.id);
  
  await supabase
    .from('documentos_historial')
    .insert([{
      documento_id: doc.id,
      accion: 'rechazado',
      detalles: motivo,
      usuario_email: user?.email
    }]);
  
  fetchDocumentos();
};
```

## ✅ Ventajas de esta Solución

1. **Todo centralizado** en una sola página
2. **Navegación simple** con pestañas
3. **Contador de pendientes** visible
4. **Reutiliza código** existente
5. **Mantiene funcionalidad** actual

## 🎯 Resultado Final

```
Gestión Documental
├── Pestaña "Institucionales"
│   ├── Normativas
│   ├── Protocolos
│   └── Convenios
│
└── Pestaña "Documentos de Estudiantes"
    ├── Pendientes de aprobación (8)
    ├── Aprobados
    └── Rechazados
```

## 📝 Próximos Pasos

1. Implementar pestañas en GestionDocumental.jsx
2. Agregar columnas específicas para estudiantes
3. Implementar funciones de aprobación/rechazo
4. Eliminar página DocumentosPendientes.jsx
5. Eliminar ruta de documentos-pendientes
6. Probar funcionalidad completa

---

**Estado**: Diseño completo - Listo para implementar
**Fecha**: 16 de noviembre de 2025
