from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Utilisateur
import re

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    id_utilisateur = request.data.get('id_utilisateur')
    mot_de_passe = request.data.get('mot_de_passe')
    
    try:
        utilisateur = Utilisateur.objects.get(id_utilisateur=id_utilisateur)
        if check_password(mot_de_passe, utilisateur.mot_de_passe_hash):
            # Générer les tokens JWT
            refresh = RefreshToken()
            # Utiliser un ID numérique pour la compatibilité
            refresh['user_id'] = 1  # ID numérique pour l'admin
            refresh['role'] = utilisateur.role
            
            return Response({
                'message': 'Connexion réussie',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'role': utilisateur.role,
                'id_utilisateur': utilisateur.id_utilisateur
            })
        else:
            return Response({
                'error': 'Identifiants incorrects'
            }, status=status.HTTP_401_UNAUTHORIZED)
    except Utilisateur.DoesNotExist:
        return Response({
            'error': 'Utilisateur non trouvé'
        }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    """
    Vue pour l'inscription d'un nouvel utilisateur
    """
    id_utilisateur = request.data.get('id_utilisateur')
    nom_utilisateur = request.data.get('nom_utilisateur')
    mot_de_passe = request.data.get('mot_de_passe')
    email = request.data.get('email')
    role = request.data.get('role', 'utilisateur')  # Rôle par défaut
    
    # Validation des données
    if not all([id_utilisateur, nom_utilisateur, mot_de_passe]):
        return Response({
            'error': 'Tous les champs obligatoires doivent être remplis'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validation de l'ID utilisateur (alphanumérique, 3-30 caractères)
    if not re.match(r'^[a-zA-Z0-9_]{3,30}$', id_utilisateur):
        return Response({
            'error': 'L\'identifiant doit contenir entre 3 et 30 caractères alphanumériques'
        }, status=status.HTTP_400_BAD_REQUEST)
    

    
    # Validation de l'email si fourni
    if email and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        return Response({
            'error': 'Format d\'email invalide'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Mapping des rôles pour correspondre aux contraintes de la base
    role_mapping = {
        'utilisateur': 'DT',  # Mapper vers DT (Dev Tech)
        'chef_escale': 'CE',  # Mapper vers CE
        'rh': 'RH',           # Mapper vers RH
        'admin': 'admin',      # Garder admin
        'superviseur': 'DT'    # Mapper vers DT
    }
    
    # Convertir le rôle
    mapped_role = role_mapping.get(role, 'DT')  # Par défaut DT
    
    # Vérifier si l'utilisateur existe déjà
    try:
        Utilisateur.objects.get(id_utilisateur=id_utilisateur)
        return Response({
            'error': 'Cet identifiant est déjà utilisé'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Utilisateur.DoesNotExist:
        pass
    
    try:
        # Créer le nouvel utilisateur
        utilisateur = Utilisateur.objects.create(
            id_utilisateur=id_utilisateur,
            nom_utilisateur=nom_utilisateur,
            mot_de_passe_hash=make_password(mot_de_passe),  # Hash du mot de passe
            role=mapped_role
        )
        
        return Response({
            'message': 'Inscription réussie ! Vous pouvez maintenant vous connecter.',
            'id_utilisateur': utilisateur.id_utilisateur,
            'nom_utilisateur': utilisateur.nom_utilisateur,
            'role': utilisateur.role
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Erreur lors de l\'inscription: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
import logging
from manutention.models import Utilisateurs
from django.contrib.auth.hashers import check_password

logger = logging.getLogger(__name__)

# Create your views here.

class TestView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({'message': 'Test view works!'})

class SimpleLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        print("=== VUE SIMPLE LOGIN APPELÉE ===")
        return Response({'message': 'Simple login view called!'})

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        id_utilisateur = request.data.get('id_utilisateur')
        mot_de_passe = request.data.get('mot_de_passe')
        try:
            user = Utilisateurs.objects.filter(id_utilisateur=id_utilisateur).first()
            if user and check_password(mot_de_passe, user.mot_de_passe_hash):
                return Response({
                    "id_utilisateur": user.id_utilisateur,
                    "nom_utilisateur": user.nom_utilisateur,
                    "role": user.role,
                })
            else:
                return Response({'error': 'Identifiants invalides'}, status=401)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
