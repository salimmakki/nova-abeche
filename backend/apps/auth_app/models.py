from django.db import models
from django.contrib.auth.models import User

class Profil(models.Model):
    user       = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profil')
    telephone  = models.CharField(max_length=20, blank=True)
    region     = models.CharField(max_length=100, default='Abéché')
    langue     = models.CharField(max_length=10, choices=[('fr','Français'),('ar','Arabe')], default='fr')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profil de {self.user.username}"
