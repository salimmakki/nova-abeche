from django.db import models

class Culture(models.Model):
    nom         = models.CharField(max_length=100)
    nom_arabe   = models.CharField(max_length=100, blank=True)
    saison      = models.CharField(max_length=50)
    mois_debut  = models.IntegerField()
    mois_fin    = models.IntegerField()
    temp_min    = models.FloatField()
    temp_max    = models.FloatField()
    pluie_min   = models.FloatField()
    pluie_max   = models.FloatField()
    type_sol    = models.CharField(max_length=100)
    ph_min      = models.FloatField()
    ph_max      = models.FloatField()
    description = models.TextField(blank=True)

    def __str__(self):
        return self.nom
