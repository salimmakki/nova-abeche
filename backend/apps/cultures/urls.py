from django.urls import path
from . import views

urlpatterns = [
    path('recommander/', views.recommander_cultures),
    path('liste/',       views.liste_cultures),
]
