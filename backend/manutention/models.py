from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
import os

# Create your models here.

class Conducteur(models.Model):
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    matricule = models.CharField(max_length=50, unique=True)
    engin_assigne = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.nom} {self.prenom} ({self.matricule})"

class Affectation(models.Model):
    conducteur = models.ForeignKey(Conducteur, on_delete=models.CASCADE)
    engin = models.CharField(max_length=100)
    date = models.DateField()
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()

    def __str__(self):
        return f"{self.conducteur} - {self.engin} ({self.date})"

class Shifts(models.Model):
    id_shift = models.AutoField(primary_key=True)
    date_debut_shift = models.DateTimeField()
    date_fin_shift = models.DateTimeField()

    class Meta:
        db_table = 'SHIFTS'

    def __str__(self):
        return f"Shift {self.id_shift}: {self.date_debut_shift} - {self.date_fin_shift}"

class Equipe(models.Model):
    id_equipe = models.CharField(primary_key=True, max_length=30)
    id_chef_escale = models.CharField(max_length=30, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'equipe'

    def __str__(self):
        return f"Équipe {self.id_equipe}"

class InfoEquipe(models.Model):
    id_equipe = models.ForeignKey(Equipe, models.DO_NOTHING, db_column='id_equipe', blank=True, null=True)
    matricule = models.CharField(unique=True, max_length=30, blank=True, null=True)
    fonction = models.CharField(max_length=30, blank=True, null=True)
    nom = models.CharField(max_length=50, blank=True, null=True)
    prenom = models.CharField(max_length=50, blank=True, null=True)
    email = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=14, blank=True, null=True)
    date_embauche = models.DateField(blank=True, null=True)
    disponibilité = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'info_equipe'

    def __str__(self):
        return f"{self.nom} {self.prenom} ({self.matricule})"

def justification_upload_path(instance, filename):
    """Génère le chemin de sauvegarde pour les fichiers de justification"""
    if instance.date_debut_abs:
        date_str = instance.date_debut_abs.strftime('%Y_%m_%d')
        matricule = str(instance.matricule).lower()
        return f'justifications/{matricule}_{date_str}.PDF'
    return f'justifications/{filename}'

class Absences(models.Model):
    ETAT_CHOICES = [
        ('en attente', 'En attente'),
        ('validée', 'Validée'),
        ('refusée', 'Refusée'),
    ]
    
    id_absence = models.AutoField(primary_key=True)
    matricule = models.CharField(max_length=30)  # Changé pour correspondre à votre table
    date_debut_abs = models.DateTimeField(blank=True, null=True)
    date_fin_abs = models.DateTimeField(blank=True, null=True)
    justification = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(blank=True, null=True)
    etat = models.CharField(max_length=50, choices=ETAT_CHOICES, default='en attente')

    class Meta:
        managed = False
        db_table = 'absences'  # Changé pour correspondre à votre table
    
    def save(self, *args, **kwargs):
        # Set uploaded_at to current timezone-aware datetime if not set
        if not self.uploaded_at:
            self.uploaded_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Absence {self.id_absence} - {self.matricule}"

class AbsenceNonDeclaree(models.Model):
    id = models.AutoField(primary_key=True)
    matricule = models.CharField(max_length=30)
    id_shift = models.IntegerField()
    date_debut_abs = models.DateTimeField()
    date_fin_abs = models.DateTimeField()

    class Meta:
        db_table = 'absences_non_déclarées'

    def __str__(self):
        return f"Absence non déclarée {self.id} - {self.matricule}"

class ChefEscale(models.Model):
    id_chef_escale = models.CharField(max_length=30, primary_key=True)
    nbr_aff_manuelle = models.IntegerField(default=4)
    id_shift = models.ForeignKey(Shifts, on_delete=models.CASCADE, null=True, blank=True)
    nom = models.CharField(max_length=50, null=True, blank=True)
    prenom = models.CharField(max_length=50, null=True, blank=True)
    telephone = models.IntegerField(null=True, blank=True)
    email = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'CHEF_ESCALE'

    def __str__(self):
        return f"{self.nom} {self.prenom} ({self.id_chef_escale})"

class Engins(models.Model):
    code_engin = models.CharField(primary_key=True, max_length=30)
    famille_engin = models.CharField(max_length=30)
    capacite_max = models.FloatField(blank=True, null=True)
    etat_engin = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'engins'

    def __str__(self):
        return f"{self.code_engin} ({self.famille_engin})"

class Affectations(models.Model):
    id_affectation = models.AutoField(primary_key=True)
    date_affectation = models.DateField(blank=True, null=True)
    id_equipe = models.ForeignKey(Equipe, models.DO_NOTHING, db_column='id_equipe', blank=True, null=True)
    id_shift = models.ForeignKey(Shifts, models.DO_NOTHING, db_column='id_shift', blank=True, null=True)
    code_engin = models.ForeignKey(Engins, models.DO_NOTHING, db_column='code_engin', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'affectations'

    def __str__(self):
        return f"Affectation {self.id_affectation}"

class EnginsAffectees(models.Model):
    id_engin_affectee = models.AutoField(primary_key=True)
    code_engin = models.ForeignKey(Engins, models.DO_NOTHING, db_column='code_engin', blank=True, null=True)
    id_affectation = models.ForeignKey(Affectations, models.DO_NOTHING, db_column='id_affectation', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'engins_affectees'

    def __str__(self):
        return f"Engin affecté {self.id_engin_affectee}"

class QualificationsConducteurs(models.Model):
    id_qualification = models.AutoField(primary_key=True)
    matricule = models.CharField(max_length=20, blank=True, null=True)
    code_engin = models.ForeignKey(Engins, models.DO_NOTHING, db_column='code_engin', blank=True, null=True)
    niveau = models.CharField(max_length=20, blank=True, null=True)
    date_obtention = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'qualifications_conducteurs'

    def __str__(self):
        return f"Qualification {self.id_qualification}"

class CumulHeures(models.Model):
    id_cumul = models.AutoField(primary_key=True)
    code_engin = models.ForeignKey(Engins, models.DO_NOTHING, db_column='code_engin', blank=True, null=True)
    heure_par_engin = models.FloatField(blank=True, null=True)
    date_cumul = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'cumul_heures'

    def __str__(self):
        return f"Cumul {self.id_cumul}"

class Conducteurs(models.Model):
    matricule = models.CharField(primary_key=True, max_length=20)
    nom = models.CharField(max_length=50, blank=True, null=True)
    prenom = models.CharField(max_length=50, blank=True, null=True)
    date_naissance = models.DateField(blank=True, null=True)
    date_embauche = models.DateField(blank=True, null=True)
    id_equipe = models.ForeignKey(Equipe, models.DO_NOTHING, db_column='id_equipe', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'conducteurs'

    def __str__(self):
        return f"{self.nom} {self.prenom} ({self.matricule})"

class Dockers(models.Model):
    matricule = models.CharField(primary_key=True, max_length=20)
    nom = models.CharField(max_length=50, blank=True, null=True)
    prenom = models.CharField(max_length=50, blank=True, null=True)
    date_naissance = models.DateField(blank=True, null=True)
    date_embauche = models.DateField(blank=True, null=True)
    id_equipe = models.ForeignKey(Equipe, models.DO_NOTHING, db_column='id_equipe', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dockers'

    def __str__(self):
        return f"{self.nom} {self.prenom} ({self.matricule})"

class AbsencesNonDeclarees(models.Model):
    id = models.AutoField(primary_key=True)
    matricule = models.CharField(max_length=30)
    id_shift = models.IntegerField()
    date_debut_abs = models.DateTimeField(blank=True, null=True)
    date_fin_abs = models.DateTimeField(blank=True, null=True)
    est_justifie = models.BooleanField(default=False)
    justification = models.FileField(
        upload_to=justification_upload_path,
        blank=True, 
        null=True,
        verbose_name="Fichier de justification"
    )

    class Meta:
        managed = False
        db_table = 'absences_non_déclarées'

    def __str__(self):
        return f"Absence non déclarée {self.id} - {self.matricule}"

class Maintenance(models.Model):
    id_maintenance = models.AutoField(primary_key=True)
    code_engin = models.ForeignKey(Engins, models.DO_NOTHING, db_column='code_engin', blank=True, null=True)
    date_debut = models.DateField(blank=True, null=True)
    date_fin = models.DateField(blank=True, null=True)
    type_maintenance = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'maintenance'

    def __str__(self):
        return f"Maintenance {self.id_maintenance}"

class Incidents(models.Model):
    id_incident = models.AutoField(primary_key=True)
    code_engin = models.ForeignKey(Engins, models.DO_NOTHING, db_column='code_engin', blank=True, null=True)
    date_incident = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    gravite = models.CharField(max_length=20, blank=True, null=True)
    matricule_conducteur = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'incidents'

    def __str__(self):
        return f"Incident {self.id_incident}"

class Utilisateurs(models.Model):
    id_utilisateur = models.CharField(primary_key=True, max_length=30)
    nom_utilisateur = models.CharField(max_length=50)
    mot_de_passe_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'utilisateurs'

    def __str__(self):
        return f"{self.nom_utilisateur} ({self.role})"

class ChefEscaleAvance(models.Model):
    id_chef_escale = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=50, blank=True, null=True)
    prenom = models.CharField(max_length=50, blank=True, null=True)
    email = models.CharField(max_length=100, blank=True, null=True)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    date_embauche = models.DateField(blank=True, null=True)
    user = models.ForeignKey(User, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'chef_escale'

    def __str__(self):
        return f"{self.nom} {self.prenom}"

class Superviseurs(models.Model):
    id_superviseur = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=50, blank=True, null=True)
    prenom = models.CharField(max_length=50, blank=True, null=True)
    email = models.CharField(max_length=100, blank=True, null=True)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    date_embauche = models.DateField(blank=True, null=True)
    user = models.ForeignKey(User, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'superviseurs'

    def __str__(self):
        return f"{self.nom} {self.prenom}"

class HistoriqueAffectations(models.Model):
    id_historique = models.AutoField(primary_key=True)
    id_affectation = models.ForeignKey(Affectations, models.DO_NOTHING, db_column='id_affectation', blank=True, null=True)
    date_modification = models.DateTimeField(blank=True, null=True)
    ancien_etat = models.CharField(max_length=20, blank=True, null=True)
    nouvel_etat = models.CharField(max_length=20, blank=True, null=True)
    commentaire = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'historique_affectations'

    def __str__(self):
        return f"Historique {self.id_historique}"

class Notifications(models.Model):
    id_notification = models.AutoField(primary_key=True)
    destinataire = models.CharField(max_length=100, blank=True, null=True)
    sujet = models.CharField(max_length=200, blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    date_envoi = models.DateTimeField(blank=True, null=True)
    lu = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'notifications'

    def __str__(self):
        return f"Notification {self.id_notification}"

class Rapports(models.Model):
    id_rapport = models.AutoField(primary_key=True)
    titre = models.CharField(max_length=200, blank=True, null=True)
    contenu = models.TextField(blank=True, null=True)
    date_creation = models.DateTimeField(blank=True, null=True)
    auteur = models.CharField(max_length=100, blank=True, null=True)
    type_rapport = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'rapports'

    def __str__(self):
        return f"Rapport {self.id_rapport}"

class Parametres(models.Model):
    id_parametre = models.AutoField(primary_key=True)
    nom_parametre = models.CharField(max_length=100, blank=True, null=True)
    valeur = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    date_modification = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'parametres'

    def __str__(self):
        return f"Paramètre {self.id_parametre}"

class Logs(models.Model):
    id_log = models.AutoField(primary_key=True)
    utilisateur = models.CharField(max_length=100, blank=True, null=True)
    action = models.CharField(max_length=200, blank=True, null=True)
    date_action = models.DateTimeField(blank=True, null=True)
    details = models.TextField(blank=True, null=True)
    ip_adresse = models.CharField(max_length=45, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'logs'

    def __str__(self):
        return f"Log {self.id_log}"

class NavirePrevisionnel(models.Model):
    id = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=255)
    type = models.CharField(max_length=100)
    statut = models.CharField(max_length=50)
    date_arrivee = models.DateField()
    heure_arrivee = models.TimeField()
    port = models.CharField(max_length=100)
    consignataire = models.CharField(max_length=255)
    operateur = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'navires_previsionnels'
        ordering = ['date_arrivee', 'heure_arrivee']

    def __str__(self):
        return f"{self.nom} ({self.type})"
