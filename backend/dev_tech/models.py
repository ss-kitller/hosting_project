from django.db import models

# Create your models here.

class Engin(models.Model):
    code_engin = models.CharField(max_length=50, primary_key=True)
    famille_engin = models.CharField(max_length=100)
    capacite_max = models.FloatField()
    ETAT_CHOICES = [
        ('disponible', 'Disponible'),
        ('en maintenance', 'En maintenance'),
        ('affecté', 'Affecté'),
    ]
    etat_engin = models.CharField(max_length=20, choices=ETAT_CHOICES)

    class Meta:
        db_table = "engins"

    def __str__(self):
        return f"{self.code_engin} - {self.famille_engin}"
