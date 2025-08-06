from django.contrib import admin
from django.contrib.auth.models import User
from .models import (
    Engins, Affectations, EnginsAffectees, QualificationsConducteurs,
    CumulHeures, Shifts, Equipe, Conducteurs, Dockers, Absences,
    Maintenance, Incidents, Utilisateurs, ChefEscale, Superviseurs,
    HistoriqueAffectations, Notifications, Rapports, Parametres, Logs
)

@admin.register(Engins)
class EnginsAdmin(admin.ModelAdmin):
    list_display = ['code_engin', 'famille_engin', 'capacite_max', 'etat_engin']
    search_fields = ['code_engin', 'famille_engin']
    list_filter = ['etat_engin', 'famille_engin']

@admin.register(Affectations)
class AffectationsAdmin(admin.ModelAdmin):
    list_display = ['id_affectation', 'date_affectation', 'id_equipe', 'id_shift', 'code_engin']
    list_filter = ['date_affectation', 'id_shift']
    search_fields = ['code_engin__code_engin']

@admin.register(EnginsAffectees)
class EnginsAffecteesAdmin(admin.ModelAdmin):
    list_display = ['id_engin_affectee', 'code_engin', 'id_affectation']
    search_fields = ['code_engin__code_engin']

@admin.register(QualificationsConducteurs)
class QualificationsConducteursAdmin(admin.ModelAdmin):
    list_display = ['id_qualification', 'matricule', 'code_engin', 'niveau', 'date_obtention']
    list_filter = ['niveau', 'date_obtention']
    search_fields = ['matricule', 'code_engin__code_engin']

@admin.register(CumulHeures)
class CumulHeuresAdmin(admin.ModelAdmin):
    list_display = ['id_cumul', 'code_engin', 'heure_par_engin', 'date_cumul']
    list_filter = ['date_cumul']
    search_fields = ['code_engin__code_engin']

@admin.register(Shifts)
class ShiftsAdmin(admin.ModelAdmin):
    list_display = ['id_shift', 'date_debut_shift', 'date_fin_shift']
    list_filter = ['date_debut_shift', 'date_fin_shift']

@admin.register(Equipe)
class EquipeAdmin(admin.ModelAdmin):
    list_display = ['id_equipe', 'id_chef_escale']

@admin.register(Conducteurs)
class ConducteursAdmin(admin.ModelAdmin):
    list_display = ['matricule', 'nom', 'prenom', 'date_embauche', 'id_equipe']
    list_filter = ['date_embauche', 'id_equipe']
    search_fields = ['matricule', 'nom', 'prenom']

@admin.register(Dockers)
class DockersAdmin(admin.ModelAdmin):
    list_display = ['matricule', 'nom', 'prenom', 'date_embauche', 'id_equipe']
    list_filter = ['date_embauche', 'id_equipe']
    search_fields = ['matricule', 'nom', 'prenom']

@admin.register(Absences)
class AbsencesAdmin(admin.ModelAdmin):
    list_display = ['id_absence', 'matricule', 'date_debut_abs', 'date_fin_abs', 'justification', 'uploaded_at']
    list_filter = ['date_debut_abs', 'date_fin_abs']
    search_fields = ['matricule']

@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = ['id_maintenance', 'code_engin', 'date_debut', 'date_fin', 'type_maintenance']
    list_filter = ['date_debut', 'date_fin', 'type_maintenance']
    search_fields = ['code_engin__code_engin', 'type_maintenance']

@admin.register(Incidents)
class IncidentsAdmin(admin.ModelAdmin):
    list_display = ['id_incident', 'code_engin', 'date_incident', 'gravite', 'matricule_conducteur']
    list_filter = ['date_incident', 'gravite']
    search_fields = ['code_engin__code_engin', 'matricule_conducteur']

@admin.register(Utilisateurs)
class UtilisateursAdmin(admin.ModelAdmin):
    list_display = ['id_utilisateur', 'nom_utilisateur', 'role']
    list_filter = ['role']
    search_fields = ['id_utilisateur', 'nom_utilisateur']

@admin.register(ChefEscale)
class ChefEscaleAdmin(admin.ModelAdmin):
    list_display = ['id_chef_escale', 'nom', 'prenom', 'email', 'telephone']
    search_fields = ['nom', 'prenom', 'email']

@admin.register(Superviseurs)
class SuperviseursAdmin(admin.ModelAdmin):
    list_display = ['id_superviseur', 'nom', 'prenom', 'email', 'telephone', 'date_embauche']
    list_filter = ['date_embauche']
    search_fields = ['nom', 'prenom', 'email']

@admin.register(HistoriqueAffectations)
class HistoriqueAffectationsAdmin(admin.ModelAdmin):
    list_display = ['id_historique', 'id_affectation', 'date_modification', 'ancien_etat', 'nouvel_etat']
    list_filter = ['date_modification', 'ancien_etat', 'nouvel_etat']
    search_fields = ['id_affectation__id_affectation']

@admin.register(Notifications)
class NotificationsAdmin(admin.ModelAdmin):
    list_display = ['id_notification', 'destinataire', 'sujet', 'date_envoi', 'lu']
    list_filter = ['date_envoi', 'lu']
    search_fields = ['destinataire', 'sujet']

@admin.register(Rapports)
class RapportsAdmin(admin.ModelAdmin):
    list_display = ['id_rapport', 'titre', 'auteur', 'date_creation', 'type_rapport']
    list_filter = ['date_creation', 'type_rapport']
    search_fields = ['titre', 'auteur']

@admin.register(Parametres)
class ParametresAdmin(admin.ModelAdmin):
    list_display = ['id_parametre', 'nom_parametre', 'date_modification']
    list_filter = ['date_modification']
    search_fields = ['nom_parametre']

@admin.register(Logs)
class LogsAdmin(admin.ModelAdmin):
    list_display = ['id_log', 'utilisateur', 'action', 'date_action', 'ip_adresse']
    list_filter = ['date_action', 'action']
    search_fields = ['utilisateur', 'action']
