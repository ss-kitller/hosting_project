from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # ViewSets principaux
    ConducteurViewSet, AffectationViewSet, AbsenceViewSet, ShiftsViewSet, 
    AbsenceNonDeclareeViewSet, 
    # ViewSets supplémentaires
    EnginsViewSet, AffectationsViewSet, EnginsAffecteesViewSet, QualificationsConducteursViewSet,
    CumulHeuresViewSet, EquipeViewSet, InfoEquipeViewSet, ConducteursViewSet, DockersViewSet,
    AbsencesViewSet, AbsencesNonDeclareesViewSet, MaintenanceViewSet, IncidentsViewSet,
    UtilisateursViewSet, ChefEscaleViewSet, SuperviseursViewSet, HistoriqueAffectationsViewSet,
    NotificationsViewSet, RapportsViewSet, ParametresViewSet, LogsViewSet, NavirePrevisionnelViewSet,
    # Fonctions API
    matricules_list, equipe_list, equipe_membres, cumul_conducteurs, cumul_dockers, 
    cumul_heures_dump, ajouter_conducteur_cumul, supprimer_conducteur_cumul, 
    conducteurs_info_equipe, conducteurs_liste, dockers_liste, ajouter_docker, 
    supprimer_docker, stats_conducteurs_presence, stats_dockers_presence, 
    alertes_conducteurs, alertes_dockers, cumul_dockers_dump, cumul_conducteurs_dump,
    qualifications_conducteurs, modifier_qualification_conducteur, limites_alertes,
    chef_escale_liste, chef_escale_ajouter, chef_escale_modifier, chef_escale_stats,
    absences_non_declarees_completes
)
from . import auth_views

# Router principal
router = DefaultRouter()

# ViewSets principaux (utilisés dans les routes)
router.register(r'conducteurs', ConducteurViewSet)
router.register(r'affectations', AffectationViewSet)
router.register(r'absences', AbsenceViewSet, basename='absence')
router.register(r'absences-non-declarees', AbsenceNonDeclareeViewSet, basename='absences-non-declarees')
router.register(r'shifts', ShiftsViewSet)

# ViewSets supplémentaires (pour compatibilité)
router.register(r'engins', EnginsViewSet)
router.register(r'affectations-avancees', AffectationsViewSet)
router.register(r'engins-affectees', EnginsAffecteesViewSet)
router.register(r'qualifications-conducteurs', QualificationsConducteursViewSet)
router.register(r'cumul-heures', CumulHeuresViewSet)
router.register(r'equipe', EquipeViewSet, basename='equipe')
router.register(r'equipes', EquipeViewSet, basename='equipes')
router.register(r'info-equipe', InfoEquipeViewSet, basename='info-equipe')
router.register(r'info_equipe', InfoEquipeViewSet, basename='info_equipe')
router.register(r'conducteurs-avances', ConducteursViewSet)
router.register(r'dockers-avances', DockersViewSet)
router.register(r'absences-avancees', AbsencesViewSet)
router.register(r'absences-non-declarees-avancees', AbsencesNonDeclareesViewSet)
router.register(r'maintenance', MaintenanceViewSet)
router.register(r'incidents', IncidentsViewSet)
router.register(r'utilisateurs', UtilisateursViewSet)
router.register(r'chef-escale-avances', ChefEscaleViewSet)
router.register(r'superviseurs', SuperviseursViewSet)
router.register(r'historique-affectations', HistoriqueAffectationsViewSet)
router.register(r'notifications', NotificationsViewSet)
router.register(r'rapports', RapportsViewSet)
router.register(r'parametres', ParametresViewSet)
router.register(r'logs', LogsViewSet)
router.register(r'navires-previsionnels', NavirePrevisionnelViewSet)

# URLs d'authentification
auth_urlpatterns = [
    path('auth/login/', auth_views.login_view, name='login'),
    path('auth/logout/', auth_views.logout_view, name='logout'),
]

# URLs fonctionnelles
urlpatterns = [
    # Gestion des équipes et membres
    path('matricules/', matricules_list, name='matricules-list'),
    path('equipe-list/', equipe_list, name='equipe-list'),
    path('equipe-membres/<str:id_equipe>/', equipe_membres, name='equipe-membres'),
    
    # Gestion des cumuls d'heures
    path('cumul/conducteurs/', cumul_conducteurs, name='cumul-conducteurs'),
    path('cumul/dockers/', cumul_dockers, name='cumul-dockers'),
    path('cumul/dump/', cumul_heures_dump, name='cumul-heures-dump'),
    path('cumul/conducteurs/dump/', cumul_conducteurs_dump, name='cumul-conducteurs-dump'),
    path('cumul/dockers/dump/', cumul_dockers_dump, name='cumul-dockers-dump'),
    path('cumul/conducteurs/ajouter/', ajouter_conducteur_cumul, name='ajouter-conducteur-cumul'),
    path('cumul/conducteurs/supprimer/<str:matricule>/', supprimer_conducteur_cumul, name='supprimer-conducteur-cumul'),
    
    # Gestion des conducteurs
    path('conducteurs/info-equipe/', conducteurs_info_equipe, name='conducteurs-info-equipe'),
    path('conducteurs/liste/', conducteurs_liste, name='conducteurs-liste'),
    path('qualifications/conducteurs/', qualifications_conducteurs, name='qualifications-conducteurs'),
    path('qualifications/conducteurs/modifier/<int:id_qualification>/', modifier_qualification_conducteur, name='modifier_qualification_conducteur'),
    
    # Gestion des dockers
    path('dockers/liste/', dockers_liste, name='dockers-liste'),
    path('dockers/ajouter/', ajouter_docker, name='ajouter-docker'),
    path('dockers/supprimer/<str:matricule>/', supprimer_docker, name='supprimer-docker'),
    
    # Statistiques et alertes
    path('stats/conducteurs/presence/', stats_conducteurs_presence, name='stats-conducteurs-presence'),
    path('stats/dockers/presence/', stats_dockers_presence, name='stats-dockers-presence'),
    path('alertes/conducteurs/', alertes_conducteurs, name='alertes-conducteurs'),
    path('alertes/dockers/', alertes_dockers, name='alertes-dockers'),
    path('limites/alertes/', limites_alertes, name='limites-alertes'),
    
    # Gestion des chefs d'escale
    path('chef-escale/liste/', chef_escale_liste, name='chef-escale-liste'),
    path('chef-escale/ajouter/', chef_escale_ajouter, name='chef-escale-ajouter'),
    path('chef-escale/modifier/<str:id_chef_escale>/', chef_escale_modifier, name='chef-escale-modifier'),
    path('chef-escale/stats/', chef_escale_stats, name='chef-escale-stats'),
    
    # Absences non déclarées
    path('absences-non-declarees-completes/', absences_non_declarees_completes, name='absences-non-declarees-completes'),
    
    # Navires prévisionnels - endpoint CSV manuel
    path('navires-previsionnels/csv_data/', NavirePrevisionnelViewSet.as_view({'get': 'csv_data'}), name='navires-csv-data'),
] + router.urls + auth_urlpatterns 