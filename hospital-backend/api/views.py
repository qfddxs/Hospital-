from rest_framework import viewsets
from .models import Estudiante, CentroFormador, SolicitudCupo, BloqueHorario
from rest_framework.permissions import IsAuthenticated
from .serializers import EstudianteSerializer, CentroFormadorSerializer, SolicitudCupoSerializer, BloqueHorarioSerializer

class EstudianteViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite ver o editar estudiantes.
    """
    # Usamos select_related para optimizar la consulta a la base de datos,
    # obteniendo los datos del centro formador en la misma query.
    queryset = Estudiante.objects.select_related('centro_formador').all().order_by('nombre')
    serializer_class = EstudianteSerializer
    # Añade esta línea para proteger el endpoint
    permission_classes = [IsAuthenticated]

class CentroFormadorViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite ver o editar centros formadores.
    """
    queryset = CentroFormador.objects.all().order_by('nombre')
    serializer_class = CentroFormadorSerializer
    # Añade esta línea para proteger el endpoint
    permission_classes = [IsAuthenticated]

class SolicitudCupoViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite ver o editar solicitudes de cupo.
    """
    queryset = SolicitudCupo.objects.all().order_by('-fecha_solicitud')
    serializer_class = SolicitudCupoSerializer
    # Añade esta línea para proteger el endpoint
    permission_classes = [IsAuthenticated]

class BloqueHorarioViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite ver o editar bloques de horario.
    """
    queryset = BloqueHorario.objects.all()
    serializer_class = BloqueHorarioSerializer
    # Protegemos también este endpoint
    permission_classes = [IsAuthenticated]
