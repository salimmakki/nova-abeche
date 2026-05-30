from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/',     include('apps.auth_app.urls')),
    path('api/chatbot/',  include('apps.chatbot.urls')),
    path('api/cultures/', include('apps.cultures.urls')),
    path('api/analyses/', include('apps.analyses.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
