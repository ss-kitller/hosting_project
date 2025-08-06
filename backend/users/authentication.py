from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import AnonymousUser
from .models import Utilisateur
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.settings import api_settings

class UtilisateurBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        id_utilisateur = kwargs.get('id_utilisateur', username)
        try:
            utilisateur = Utilisateur.objects.get(id_utilisateur=id_utilisateur)
            if check_password(password, utilisateur.mot_de_passe_hash):
                # Créer un objet utilisateur compatible avec Django
                return UtilisateurUser(utilisateur)
        except Utilisateur.DoesNotExist:
            return None
    
    def get_user(self, user_id):
        try:
            utilisateur = Utilisateur.objects.get(id_utilisateur=user_id)
            return UtilisateurUser(utilisateur)
        except Utilisateur.DoesNotExist:
            return None

class UtilisateurUser:
    def __init__(self, utilisateur):
        self.utilisateur = utilisateur
        self.id = utilisateur.id_utilisateur
        self.is_authenticated = True
        self.is_anonymous = False
    
    def __getattr__(self, name):
        return getattr(self.utilisateur, name)
    
    def has_perm(self, perm, obj=None):
        return True  # Simplifié pour l'exemple
    
    def has_module_perms(self, app_label):
        return True  # Simplifié pour l'exemple

class UtilisateurJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        """
        Returns a user that is active and verified by the given token.
        """
        user_id = validated_token[api_settings.USER_ID_CLAIM]
        
        try:
            utilisateur = Utilisateur.objects.get(id_utilisateur=user_id)
            return UtilisateurUser(utilisateur)
        except Utilisateur.DoesNotExist:
            return None 