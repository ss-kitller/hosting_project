from django.db import models

# Create your models here.

class Utilisateur(models.Model):
    id_utilisateur = models.CharField(max_length=30, primary_key=True)
    nom_utilisateur = models.CharField(max_length=50)
    mot_de_passe_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=50)

    class Meta:
        db_table = 'utilisateurs'
