from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EstudianteViewSet, CentroFormadorViewSet, SolicitudCupoViewSet

router = DefaultRouter()
router.register(r'estudiantes', EstudianteViewSet, basename='estudiante')
router.register(r'centros-formadores', CentroFormadorViewSet, basename='centroformador')
router.register(r'solicitudes-cupos', SolicitudCupoViewSet, basename='solicitudcupo')

urlpatterns = [
    path('', include(router.urls)),
]