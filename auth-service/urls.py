from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from authentication.template_views import login_view, signup_view, logout_view

schema_view = get_schema_view(
    openapi.Info(
        title="Healthcare Auth Service API",
        default_version='v1',
        description="Authentication and Authorization Service for Healthcare System",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@healthcare.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    # Removed Django admin to avoid conflicts with admin-service
    path('api/auth/', include('authentication.urls')),
    path('health/', include('authentication.health_urls')),
    
    # Template views
    path('login/', login_view, name='login'),
    path('signup/', signup_view, name='signup'),
    path('logout/', logout_view, name='logout'),
    
    # Swagger documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Serve static files from STATICFILES_DIRS in development
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns
    urlpatterns += staticfiles_urlpatterns()