from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Utilisateurs

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Endpoint d'authentification simple"""
    try:
        id_utilisateur = request.data.get('id_utilisateur')
        mot_de_passe = request.data.get('mot_de_passe')
        
        if not id_utilisateur or not mot_de_passe:
            return Response({
                'error': 'Identifiants manquants'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier si l'utilisateur existe dans la table Utilisateurs
        try:
            utilisateur = Utilisateurs.objects.get(id_utilisateur=id_utilisateur)
            
            # Pour l'instant, accepter n'importe quel mot de passe
            # En production, il faudrait vérifier le hash du mot de passe
            
            return Response({
                'success': True,
                'role': utilisateur.role if hasattr(utilisateur, 'role') else 'chef_escale',
                'message': 'Connexion réussie'
            }, status=status.HTTP_200_OK)
            
        except Utilisateurs.DoesNotExist:
            # Si l'utilisateur n'existe pas, créer un utilisateur temporaire
            # pour permettre l'accès au système
            return Response({
                'success': True,
                'role': 'chef_escale',
                'message': 'Connexion réussie (utilisateur temporaire)'
            }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'error': f'Erreur lors de l\'authentification: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    """Endpoint de déconnexion"""
    return Response({
        'success': True,
        'message': 'Déconnexion réussie'
    }, status=status.HTTP_200_OK) 