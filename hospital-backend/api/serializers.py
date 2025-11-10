from rest_framework import serializers
from .models import Estudiante, CentroFormador, SolicitudCupo, BloqueHorario

class EstudianteSerializer(serializers.ModelSerializer):
    # Para mostrar el nombre del centro en lugar de solo su ID en la respuesta JSON
    centro_formador_nombre = serializers.CharField(source='centro_formador.nombre', read_only=True)

    class Meta:
        model = Estudiante
        # '__all__' incluye todos los campos del modelo en la API
        # Es mejor práctica listar los campos explícitamente.
        fields = [
            'id',
            'nombre',
            'rut',
            'email',
            'programa',
            'rotacion_actual',
            'centro_formador', # Enviamos el ID del centro para las relaciones
            'centro_formador_nombre', # Y el nombre para mostrarlo fácilmente en el frontend
            'asistencia',
            'estado',
            'fecha_inicio'
        ]
        extra_kwargs = {
            'centro_formador': {'required': False, 'allow_null': True}
        }

class CentroFormadorSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo CentroFormador.
    """
    class Meta:
        model = CentroFormador
        fields = [
            'id', 
            'nombre', 
            'ubicacion', 
            'especialidades', 
            'capacidadTotal', 
            'capacidadDisponible', 
            'estado'  # Incluimos la propiedad 'estado'
        ]
        # Estos campos no deben ser editables directamente por el usuario a través de la API.
        read_only_fields = ['capacidadDisponible', 'estado']

    def create(self, validated_data):
        """
        Al crear un nuevo centro, la capacidad disponible inicial
        es igual a la capacidad total.
        """
        capacidad_total = validated_data.get('capacidadTotal', 0)
        validated_data['capacidadDisponible'] = capacidad_total
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Al actualizar, ajusta la capacidad disponible si la capacidad total cambia.
        """
        if 'capacidadTotal' in validated_data:
            cupos_ocupados = instance.capacidadTotal - instance.capacidadDisponible
            nueva_capacidad_total = validated_data['capacidadTotal']
            instance.capacidadDisponible = max(0, nueva_capacidad_total - cupos_ocupados)

        return super().update(instance, validated_data)

class SolicitudCupoSerializer(serializers.ModelSerializer):
    # También mostramos el nombre del centro para que sea más legible
    centro_formador_nombre = serializers.CharField(source='centro_formador.nombre', read_only=True)

    class Meta:
        model = SolicitudCupo
        fields = '__all__'


class BloqueHorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloqueHorario
        fields = '__all__'