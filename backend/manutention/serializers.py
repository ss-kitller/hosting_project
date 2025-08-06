from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import connection
from django.conf import settings
from .models import (
    Conducteur, Affectation, Absences, Shifts, AbsenceNonDeclaree, ChefEscale,
    Engins, Affectations, EnginsAffectees, QualificationsConducteurs,
    CumulHeures, Equipe, Conducteurs, Dockers, AbsencesNonDeclarees,
    Maintenance, Incidents, Utilisateurs, Superviseurs,
    HistoriqueAffectations, Notifications, Rapports, Parametres, Logs,
    InfoEquipe, NavirePrevisionnel
)
import os

class ConducteurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conducteur
        fields = '__all__'

class AffectationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Affectation
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class EnginsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Engins
        fields = '__all__'

class EnginDetailSerializer(serializers.ModelSerializer):
    heures_cumulees = serializers.SerializerMethodField()
    nombre_affectations = serializers.SerializerMethodField()
    dernier_shift = serializers.SerializerMethodField()
    equipe_affectee = serializers.SerializerMethodField()
    conducteurs_qualifies = serializers.SerializerMethodField()

    class Meta:
        model = Engins
        fields = '__all__'

    def get_heures_cumulees(self, obj):
        cumul = CumulHeures.objects.filter(code_engin=obj.code_engin).first()
        return cumul.heure_par_engin if cumul else 0

    def get_nombre_affectations(self, obj):
        return Affectations.objects.filter(code_engin=obj.code_engin).count()

    def get_dernier_shift(self, obj):
        affectation = Affectations.objects.filter(code_engin=obj.code_engin).order_by('-date_affectation').first()
        if affectation and affectation.id_shift:
            return f"Shift {affectation.id_shift.id_shift}"
        return None

    def get_equipe_affectee(self, obj):
        affectation = Affectations.objects.filter(code_engin=obj.code_engin).order_by('-date_affectation').first()
        if affectation and affectation.id_equipe:
            return f"Équipe {affectation.id_equipe.id_equipe}"
        return None

    def get_conducteurs_qualifies(self, obj):
        qualifications = QualificationsConducteurs.objects.filter(code_engin=obj.code_engin)
        return [
            {
                'matricule': q.matricule,
                'niveau': q.niveau,
                'date_obtention': q.date_obtention
            }
            for q in qualifications
        ]

class EnginUpdateEtatSerializer(serializers.ModelSerializer):
    commentaire = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Engins
        fields = ['etat_engin', 'commentaire']

class AffectationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Affectations
        fields = '__all__'

class EnginsAffecteesSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnginsAffectees
        fields = '__all__'

class QualificationsConducteursSerializer(serializers.ModelSerializer):
    class Meta:
        model = QualificationsConducteurs
        fields = '__all__'

class CumulHeuresSerializer(serializers.ModelSerializer):
    class Meta:
        model = CumulHeures
        fields = '__all__'

class ShiftsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shifts
        fields = '__all__'

class EquipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipe
        fields = ['id_equipe', 'id_chef_escale']

class ConducteursSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conducteurs
        fields = '__all__'

class DockersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dockers
        fields = '__all__'

class AbsencesSerializer(serializers.ModelSerializer):
    justification_file = serializers.FileField(write_only=True, required=False)
    justification = serializers.CharField(required=False, allow_blank=True)
    date_debut_formatted = serializers.SerializerMethodField()
    date_fin_formatted = serializers.SerializerMethodField()
    uploaded_at_formatted = serializers.SerializerMethodField()
    matricule_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Absences
        fields = '__all__'
    
    def get_date_debut_formatted(self, obj):
        if obj.date_debut_abs:
            return obj.date_debut_abs.strftime('%d/%m/%Y %H:%M')
        return None

    def get_date_fin_formatted(self, obj):
        if obj.date_fin_abs:
            return obj.date_fin_abs.strftime('%d/%m/%Y %H:%M')
        return None

    def get_uploaded_at_formatted(self, obj):
        if obj.uploaded_at:
            return obj.uploaded_at.strftime('%d/%m/%Y %H:%M')
        return None

    def get_matricule_info(self, obj):
        try:
            with connection.cursor() as cursor:
                cursor.execute('''
                    SELECT matricule, nom, prenom, fonction 
                    FROM info_equipe 
                    WHERE matricule = %s
                ''', [obj.matricule.matricule if hasattr(obj.matricule, 'matricule') else obj.matricule])
                row = cursor.fetchone()
                if row:
                    return {
                        'matricule': row[0],
                        'nom': row[1] or 'Non renseigné',
                        'prenom': row[2] or 'Non renseigné',
                        'fonction': row[3] or 'Non renseigné'
                    }
        except Exception:
            pass
        return None
    
    def validate_matricule(self, value):
        """Valider que le matricule existe dans info_equipe"""
        from .models import InfoEquipe
        try:
            # Vérifier si le matricule existe dans InfoEquipe
            if not InfoEquipe.objects.filter(matricule=value).exists():
                print(f"Matricule '{value}' non trouvé dans InfoEquipe")
                # Pour l'instant, on accepte le matricule même s'il n'existe pas
                # TODO: Implémenter une validation plus stricte si nécessaire
                return value
            return value
        except Exception as e:
            print(f"Erreur de validation du matricule '{value}': {str(e)}")
            # En cas d'erreur, on accepte quand même le matricule
            return value
    
    def create(self, validated_data):
        """Créer une absence avec gestion des fichiers"""
        justification_file = validated_data.pop('justification_file', None)
        
        # Si un fichier est fourni, utiliser la logique de renommage
        if justification_file:
            # Importer la fonction de renommage depuis les vues
            from .views import rename_justification_file
            
            matricule = validated_data.get('matricule')
            date_debut_abs = validated_data.get('date_debut_abs')
            
            if matricule and date_debut_abs:
                # Renommer et sauvegarder le fichier
                path = rename_justification_file(justification_file, matricule, date_debut_abs)
                validated_data['justification'] = path
            else:
                # Fallback si les données ne sont pas disponibles
                import os
                from django.utils import timezone
                filename = f"justifications/{timezone.now().strftime('%Y%m%d_%H%M%S')}_{justification_file.name}"
                validated_data['justification'] = filename
        
        # Définir uploaded_at si pas déjà défini
        if 'uploaded_at' not in validated_data:
            from django.utils import timezone
            validated_data['uploaded_at'] = timezone.now()
        
        return super().create(validated_data)
    
    def to_representation(self, instance):
        """Personnaliser la représentation des données"""
        data = super().to_representation(instance)
        
        # Ajouter l'URL complète du fichier de justification
        if instance.justification:
            try:
                # Pour un FileField, utiliser .url pour obtenir l'URL
                data['justification_url'] = instance.justification.url
            except:
                # Fallback si .url n'est pas disponible
                from django.conf import settings
                data['justification_url'] = f"{settings.MEDIA_URL}{instance.justification}"
        
        return data

class AbsenceNonDeclareeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AbsenceNonDeclaree
        fields = '__all__'

class AbsencesNonDeclareesSerializer(serializers.ModelSerializer):
    justification_file = serializers.FileField(write_only=True, required=False)
    
    class Meta:
        model = AbsencesNonDeclarees
        fields = '__all__'
    
    def create(self, validated_data):
        """Créer une absence non déclarée avec gestion des fichiers"""
        justification_file = validated_data.pop('justification_file', None)
        
        # Si un fichier est fourni, utiliser la logique de renommage
        if justification_file:
            # Importer la fonction de renommage depuis les vues
            from .views import rename_justification_file
            
            matricule = validated_data.get('matricule')
            date_debut_abs = validated_data.get('date_debut_abs')
            
            if matricule and date_debut_abs:
                # Renommer et sauvegarder le fichier
                path = rename_justification_file(justification_file, matricule, date_debut_abs)
                validated_data['justification'] = path
            else:
                # Fallback si les données ne sont pas disponibles
                import os
                from django.utils import timezone
                filename = f"justifications/{timezone.now().strftime('%Y%m%d_%H%M%S')}_{justification_file.name}"
                validated_data['justification'] = filename
        
        return super().create(validated_data)
    
    def to_representation(self, instance):
        """Personnaliser la représentation des données"""
        data = super().to_representation(instance)
        
        # Ajouter l'URL complète du fichier de justification
        if instance.justification:
            try:
                # Pour un FileField, utiliser .url pour obtenir l'URL
                data['justification_url'] = instance.justification.url
            except:
                # Fallback si .url n'est pas disponible
                from django.conf import settings
                data['justification_url'] = f"{settings.MEDIA_URL}{instance.justification}"
        
        return data

class MaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maintenance
        fields = '__all__'

class IncidentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incidents
        fields = '__all__'

class UtilisateursSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateurs
        fields = '__all__'

class ChefEscaleSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ChefEscale
        fields = '__all__'

class SuperviseursSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Superviseurs
        fields = '__all__'

class HistoriqueAffectationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriqueAffectations
        fields = '__all__'

class NotificationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notifications
        fields = '__all__'

class RapportsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rapports
        fields = '__all__'

class ParametresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parametres
        fields = '__all__'

class LogsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Logs
        fields = '__all__'

# Serializer pour les informations d'équipe combinées
class InfoEquipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = InfoEquipe
        fields = '__all__'

# Serializer pour les équipes avec plus de détails
class EquipeDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipe
        fields = ['id_equipe', 'id_chef_escale'] 

class NavirePrevisionnelSerializer(serializers.ModelSerializer):
    class Meta:
        model = NavirePrevisionnel
        fields = '__all__' 