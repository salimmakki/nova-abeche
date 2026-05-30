from django.db import models
from django.contrib.auth.models import User

class Analyse(models.Model):
    TYPES = [('culture','Recommandation culture'),('image','Analyse image')]
    user         = models.ForeignKey(User, on_delete=models.CASCADE)
    type_analyse = models.CharField(max_length=20, choices=TYPES)
    parametres   = models.JSONField(default=dict)
    resultat     = models.TextField()
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
