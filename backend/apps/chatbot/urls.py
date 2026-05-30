from django.urls import path
from . import views

urlpatterns = [
    path('conversations/',               views.conversations),
    path('conversations/<int:conv_id>/', views.conversation_detail),
    path('envoyer/',                     views.envoyer),
]
