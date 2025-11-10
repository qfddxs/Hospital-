from django.db import models

class CentroFormador(models.Model):
    """
    Representa un centro formador con su capacidad y especialidades.
    """
    nombre = models.CharField(max_length=255, unique=True, help_text="Nombre del centro formador")
    ubicacion = models.CharField(max_length=255, blank=True, help_text="Dirección o ciudad del centro")
    
    # JSONField es ideal para almacenar una lista de strings como las especialidades.
    especialidades = models.JSONField(default=list, help_text="Lista de especialidades que ofrece el centro")
    
    capacidadTotal = models.PositiveIntegerField(default=0, verbose_name="Capacidad Total")
    
    # Este campo se actualizará automáticamente cuando se asignen o liberen cupos.
    capacidadDisponible = models.PositiveIntegerField(default=0, verbose_name="Capacidad Disponible")
    
    # El estado se calcula dinámicamente, no se guarda en la base de datos.
    # Esto asegura que siempre esté actualizado.
    @property
    def estado(self):
        if self.capacidadTotal == 0:
            return 'completo' # O 'inactivo' si prefieres
        return 'activo' if self.capacidadDisponible > 0 else 'completo'

    def __str__(self):
        return self.nombre

class Estudiante(models.Model):
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('alerta', 'Alerta'),
        ('inactivo', 'Inactivo'),
    ]
    nombre = models.CharField(max_length=255)
    rut = models.CharField(max_length=12, unique=True, null=True, blank=True) # Añadido para el login y la gestión
    programa = models.CharField(max_length=100)
    rotacion_actual = models.CharField(max_length=100, blank=True, null=True)
    # Aquí creamos la relación con el CentroFormador
    centro_formador = models.ForeignKey(CentroFormador, on_delete=models.SET_NULL, null=True, blank=True, related_name='estudiantes')
    asistencia = models.FloatField(default=100.0)
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='activo')
    fecha_inicio = models.DateField(null=True, blank=True) # Hecho opcional
    email = models.EmailField(unique=True, null=True, blank=True)

    def __str__(self):
        return self.nombre

class SolicitudCupo(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('aprobada', 'Aprobada'),
        ('rechazada', 'Rechazada'),
    ]
    centro_formador = models.ForeignKey(CentroFormador, on_delete=models.CASCADE)
    especialidad = models.CharField(max_length=100)
    numero_cupos = models.PositiveIntegerField()
    fecha_solicitud = models.DateField(auto_now_add=True)
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='pendiente')
    solicitante = models.CharField(max_length=200)
    comentarios = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Solicitud de {self.centro_formador.nombre} para {self.especialidad}"

class BloqueHorario(models.Model):
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name='horarios')
    centro_formador = models.ForeignKey(CentroFormador, on_delete=models.CASCADE, related_name='horarios')
    dia_semana = models.CharField(max_length=10) # E.g., 'Lunes', 'Martes'
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    actividad = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.estudiante.nombre} - {self.dia_semana} ({self.hora_inicio}-{self.hora_fin})"
