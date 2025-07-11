from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'patients', views.PatientViewSet)
router.register(r'clinicians', views.ClinicianViewSet)
router.register(r'appointments', views.AppointmentViewSet)
router.register(r'medical-records', views.MedicalRecordViewSet)
router.register(r'prescriptions', views.PrescriptionViewSet)
router.register(r'cancer-types', views.CancerTypeViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('events/', views.log_event, name='log_event'),
    path('statistics/', views.statistics, name='statistics'),
]