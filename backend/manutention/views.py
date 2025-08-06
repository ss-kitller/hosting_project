from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db import connection
from datetime import datetime
import os
import threading
import time
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
import json
import requests
from bs4 import BeautifulSoup
import csv
from io import StringIO

from .models import (
    Conducteur, Affectation, Absences, Shifts, ChefEscale, AbsenceNonDeclaree,
    Engins, Affectations, EnginsAffectees, QualificationsConducteurs, CumulHeures,
    Equipe, InfoEquipe, Conducteurs, Dockers, AbsencesNonDeclarees, Maintenance,
    Incidents, Utilisateurs, Superviseurs, HistoriqueAffectations, Notifications,
    Rapports, Parametres, Logs, NavirePrevisionnel
)

from .serializers import (
    ConducteurSerializer, AffectationSerializer, AbsencesSerializer, ShiftsSerializer,
    AbsenceNonDeclareeSerializer, ChefEscaleSerializer, EnginsSerializer,
    AffectationsSerializer, EnginsAffecteesSerializer, QualificationsConducteursSerializer,
    CumulHeuresSerializer, EquipeSerializer, InfoEquipeSerializer, ConducteursSerializer,
    DockersSerializer, AbsencesNonDeclareesSerializer, MaintenanceSerializer,
    IncidentsSerializer, UtilisateursSerializer, SuperviseursSerializer,
    HistoriqueAffectationsSerializer, NotificationsSerializer, RapportsSerializer,
    ParametresSerializer, LogsSerializer, NavirePrevisionnelSerializer
)

# Create your views here.

class ConducteurViewSet(viewsets.ModelViewSet):
    queryset = Conducteur.objects.all()
    serializer_class = ConducteurSerializer
    permission_classes = [AllowAny]

class AffectationViewSet(viewsets.ModelViewSet):
    queryset = Affectation.objects.all()
    serializer_class = AffectationSerializer
    permission_classes = [AllowAny]

class AbsenceViewSet(viewsets.ModelViewSet):
    queryset = Absences.objects.all()
    serializer_class = AbsencesSerializer
    permission_classes = [AllowAny]

    def partial_update(self, request, *args, **kwargs):
        try:
            print(f"PATCH data: {request.data}")
            print(f"PATCH kwargs: {kwargs}")
            result = super().partial_update(request, *args, **kwargs)
            print(f"PATCH success: {result}")
            return result
        except Exception as e:
            print(f"PATCH error: {e}")
            import traceback
            traceback.print_exc()
            raise

class ShiftsViewSet(viewsets.ModelViewSet):
    queryset = Shifts.objects.all()
    serializer_class = ShiftsSerializer
    permission_classes = [AllowAny]

class AbsenceNonDeclareeViewSet(viewsets.ModelViewSet):
    queryset = AbsenceNonDeclaree.objects.all()
    serializer_class = AbsenceNonDeclareeSerializer
    permission_classes = [AllowAny]

@api_view(['GET'])
@permission_classes([AllowAny])
def absences_non_declarees_completes(request):
    """Récupère les absences non déclarées avec les informations complètes des employés"""
    try:
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT 
                    and.id,
                    and.matricule,
                    and.id_shift,
                    and.date_debut_abs,
                    and.date_fin_abs,
                    ie.nom,
                    ie.prenom,
                    ie.fonction
                FROM absences_non_déclarées and
                LEFT JOIN info_equipe ie ON and.matricule = ie.matricule
                ORDER BY and.date_debut_abs DESC
            ''')
            rows = cursor.fetchall()
        data = [
            {
                "id": row[0],
                "matricule": row[1],
                "id_shift": row[2],
                "date_debut_abs": row[3].isoformat() if row[3] else None,
                "date_fin_abs": row[4].isoformat() if row[4] else None,
                "nom": row[5] or "Non renseigné",
                "prenom": row[6] or "Non renseigné",
                "fonction": row[7] or "Non renseigné"
            } for row in rows
        ]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def matricules_list(request):
    with connection.cursor() as cursor:
        cursor.execute('SELECT DISTINCT matricule FROM "absences"')
        rows = cursor.fetchall()
    data = [
        {"matricule": row[0]} for row in rows if row[0]
    ]
    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def equipe_list(request):
    with connection.cursor() as cursor:
        cursor.execute('SELECT DISTINCT id_equipe FROM equipe')
        rows = cursor.fetchall()
    data = [
        {"id_equipe": row[0]} for row in rows
    ]
    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def equipe_membres(request, id_equipe):
    with connection.cursor() as cursor:
        cursor.execute('SELECT matricule, fonction, nom, prenom FROM equipe WHERE id_equipe = %s', [id_equipe])
        rows = cursor.fetchall()
    data = [
        {
            "matricule": row[0],
            "fonction": row[1],
            "nom": row[2],
            "prenom": row[3],
        }
        for row in rows
    ]
    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def cumul_conducteurs(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT id_cumul_heures, matricule, code_engin, heure_par_jour, date
                FROM cumul_heures
                WHERE code_engin IS NOT NULL
            ''')
            rows = cursor.fetchall()
        data = [
            {
                "id_cumul_heures": row[0],
                "matricule": row[1],
                "code_engin": row[2],
                "heure_par_jour": row[3],
                "date": row[4].isoformat() if row[4] else None
            } for row in rows
        ]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def cumul_dockers(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT id_cumul_heures, matricule, code_engin, heure_par_jour, date
                FROM cumul_heures
                WHERE code_engin IS NULL
            ''')
            rows = cursor.fetchall()
        data = [
            {
                "id_cumul_heures": row[0],
                "matricule": row[1],
                "code_engin": row[2],
                "heure_par_jour": row[3],
                "date": row[4].isoformat() if row[4] else None
            } for row in rows
        ]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def cumul_heures_dump(request):
    """Récupère tous les cumuls d'heures avec les informations de la table INFO_EQUIPE"""
    try:
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT 
                    ch.id_cumul_heures,
                    ch.matricule,
                    ch.code_engin,
                    ch.heure_par_jour,
                    ch.date,
                    ie.nom,
                    ie.prenom,
                    ie.fonction,
                    ie.email,
                    ie.phone_number,
                    ie.date_embauche,
                    ie.disponibilité
                FROM cumul_heures ch
                LEFT JOIN info_equipe ie ON ch.matricule = ie.matricule
                ORDER BY ch.matricule ASC, ch.date DESC
            ''')
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
        data = [
            {col: (val.isoformat() if hasattr(val, 'isoformat') else val) for col, val in zip(columns, row)}
            for row in rows
        ]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def ajouter_conducteur_cumul(request):
    try:
        data = request.data
        matricule = data.get('matricule')
        nom = data.get('nom')
        prenom = data.get('prenom')
        email = data.get('email', '')
        phone_number = data.get('phone_number', '')
        date_embauche = data.get('date_embauche')
        id_equipe = data.get('id_equipe', None)  # Peut être NULL
        fonction = data.get('fonction', 'conducteur')  # Valeur par défaut
        disponibilite = data.get('disponibilite', 'disponible')  # Valeur par défaut
        
        if not matricule or not nom or not prenom:
            return Response({
                'error': 'Matricule, nom et prénom sont requis'
            }, status=400)
        
        with connection.cursor() as cursor:
            # Vérifier si le matricule existe déjà
            cursor.execute('SELECT COUNT(*) FROM info_equipe WHERE matricule = %s', [matricule])
            count = cursor.fetchone()[0]
            
            if count > 0:
                return Response({
                    'error': f'Un employé avec le matricule {matricule} existe déjà'
                }, status=400)
            
            # Vérifier si l'id_equipe existe dans la table equipe (si fourni)
            if id_equipe:
                cursor.execute('SELECT COUNT(*) FROM equipe WHERE id_equipe = %s', [id_equipe])
                equipe_count = cursor.fetchone()[0]
                if equipe_count == 0:
                    # Si l'équipe n'existe pas, on met id_equipe à NULL
                    id_equipe = None
            
            # Insérer dans info_equipe
            cursor.execute('''
                INSERT INTO info_equipe (id_equipe, matricule, fonction, nom, prenom, email, phone_number, date_embauche, disponibilité)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', [id_equipe, matricule, fonction, nom, prenom, email, phone_number, date_embauche, disponibilite])
            
            id_info_equipe = cursor.fetchone()[0]
            
        return Response({
            'success': True,
            'message': 'Conducteur ajouté avec succès',
            'id_info_equipe': id_info_equipe
        }, status=201)
        
    except Exception as e:
        return Response({
            'error': f'Erreur lors de l\'ajout: {str(e)}'
        }, status=500)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def supprimer_conducteur_cumul(request, matricule):
    try:
        with connection.cursor() as cursor:
            # Vérifier si le conducteur existe
            cursor.execute('''
                SELECT COUNT(*) FROM info_equipe 
                WHERE matricule = %s AND fonction = 'conducteur'
            ''', [matricule])
            
            count = cursor.fetchone()[0]
            
            if count == 0:
                return Response({
                    'error': f'Aucun conducteur trouvé avec le matricule {matricule}'
                }, status=404)
            
            # Supprimer d'abord les absences liées à ce matricule
            cursor.execute('''
                DELETE FROM absences 
                WHERE matricule = %s
            ''', [matricule])
            
            # Supprimer les absences non déclarées liées à ce matricule
            cursor.execute('''
                DELETE FROM absences_non_déclarées 
                WHERE matricule = %s
            ''', [matricule])
            
            # Supprimer les qualifications liées à ce matricule
            cursor.execute('''
                DELETE FROM qualifications_conducteurs 
                WHERE matricule = %s
            ''', [matricule])
            
            # Maintenant supprimer le conducteur
            cursor.execute('''
                DELETE FROM info_equipe 
                WHERE matricule = %s AND fonction = 'conducteur'
            ''', [matricule])
            
        return Response({
            'success': True,
            'message': f'Conducteur {matricule} et toutes ses données associées supprimés avec succès'
        }, status=200)
        
    except Exception as e:
        return Response({
            'error': f'Erreur lors de la suppression: {str(e)}'
        }, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def conducteurs_info_equipe(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT id, id_equipe, matricule, fonction, nom, prenom, email, phone_number, date_embauche, disponibilité
                FROM info_equipe
                WHERE fonction = 'conducteur'
                ORDER BY nom, prenom
            ''')
            rows = cursor.fetchall()
        data = [
            {
                "id": row[0],
                "id_equipe": row[1],
                "matricule": row[2],
                "fonction": row[3],
                "nom": row[4],
                "prenom": row[5],
                "email": row[6],
                "phone_number": row[7],
                "date_embauche": row[8].isoformat() if row[8] else None,
                "disponibilite": row[9]
            } for row in rows
        ]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def conducteurs_liste(request):
    """Récupère la liste des conducteurs depuis la table INFO_EQUIPE"""
    try:
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT 
                    matricule,
                    nom,
                    prenom,
                    fonction,
                    email,
                    phone_number,
                    date_embauche,
                    disponibilité
                FROM info_equipe 
                WHERE fonction = 'conducteur'
                ORDER BY matricule ASC
            ''')
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
        data = [
            {col: (val.isoformat() if hasattr(val, 'isoformat') else val) for col, val in zip(columns, row)}
            for row in rows
        ]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def dockers_liste(request):
    """Récupère la liste des dockers depuis la table INFO_EQUIPE"""
    try:
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT 
                    matricule,
                    nom,
                    prenom,
                    fonction,
                    email,
                    phone_number,
                    date_embauche,
                    disponibilité
                FROM info_equipe 
                WHERE fonction = 'docker'
                ORDER BY matricule ASC
            ''')
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
        data = [
            {col: (val.isoformat() if hasattr(val, 'isoformat') else val) for col, val in zip(columns, row)}
            for row in rows
        ]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def ajouter_docker(request):
    """API pour ajouter un nouveau docker dans INFO_EQUIPE"""
    try:
        data = request.data
        print(f"Données reçues: {data}")
        
        # Validation des champs requis
        required_fields = ['matricule', 'nom', 'prenom', 'date_embauche']
        for field in required_fields:
            value = data.get(field)
            if not value or (isinstance(value, str) and value.strip() == ''):
                print(f"Champ manquant ou vide: {field} = '{value}'")
                return Response({
                    'error': f'Le champ {field} est requis et ne peut pas être vide'
                }, status=400)
            
            # Validation spécifique pour la date d'embauche
            if field == 'date_embauche':
                try:
                    from datetime import datetime
                    datetime.strptime(value, '%Y-%m-%d')
                except ValueError:
                    print(f"Format de date invalide: {value}")
                    return Response({
                        'error': f'Le format de date doit être YYYY-MM-DD'
                    }, status=400)
        
        # Validation de la disponibilité
        disponibilite = data.get('disponibilite', 'disponible')
        valeurs_autorisees = ['en service', 'en repos', 'disponible', 'non disponible']
        if disponibilite not in valeurs_autorisees:
            print(f"Valeur de disponibilité invalide: {disponibilite}")
            return Response({
                'error': f'La valeur de disponibilité doit être une des suivantes: {", ".join(valeurs_autorisees)}'
            }, status=400)
        
        with connection.cursor() as cursor:
            # Vérifier si le matricule existe déjà
            cursor.execute('''
                SELECT COUNT(*) FROM info_equipe 
                WHERE matricule = %s
            ''', [data['matricule']])
            
            if cursor.fetchone()[0] > 0:
                return Response({
                    'error': f'Un docker avec le matricule {data["matricule"]} existe déjà'
                }, status=400)
            
            # Insérer le nouveau docker
            cursor.execute('''
                INSERT INTO info_equipe (id_equipe, matricule, fonction, nom, prenom, email, phone_number, date_embauche, disponibilité)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''', [
                data.get('id_equipe', 'EQUIPE001'),
                data['matricule'],
                'docker',  # Fonction préremplie
                data['nom'],
                data['prenom'],
                data.get('email', ''),
                data.get('phone_number', ''),
                data['date_embauche'],
                data.get('disponibilite', 'disponible')  # Valeurs autorisées: 'en service', 'en repos', 'disponible', 'non disponible'
            ])
            
        return Response({
            'success': True,
            'message': f'Docker {data["matricule"]} ajouté avec succès'
        }, status=201)
        
    except Exception as e:
        return Response({
            'error': f'Erreur lors de l\'ajout: {str(e)}'
        }, status=500)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def supprimer_docker(request, matricule):
    """API pour supprimer un docker depuis INFO_EQUIPE"""
    try:
        with connection.cursor() as cursor:
            # Vérifier si le docker existe
            cursor.execute('''
                SELECT COUNT(*) FROM info_equipe 
                WHERE matricule = %s AND fonction = 'docker'
            ''', [matricule])
            
            count = cursor.fetchone()[0]
            
            if count == 0:
                return Response({
                    'error': f'Aucun docker trouvé avec le matricule {matricule}'
                }, status=404)
            
            # Supprimer d'abord les absences liées à ce matricule
            cursor.execute('''
                DELETE FROM absences 
                WHERE matricule = %s
            ''', [matricule])
            
            # Supprimer les absences non déclarées liées à ce matricule
            cursor.execute('''
                DELETE FROM absences_non_déclarées 
                WHERE matricule = %s
            ''', [matricule])
            
            # Maintenant supprimer le docker
            cursor.execute('''
                DELETE FROM info_equipe 
                WHERE matricule = %s AND fonction = 'docker'
            ''', [matricule])
            
        return Response({
            'success': True,
            'message': f'Docker {matricule} et toutes ses données associées supprimés avec succès'
        }, status=200)
        
    except Exception as e:
        return Response({
            'error': f'Erreur lors de la suppression: {str(e)}'
        }, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def stats_conducteurs_presence(request):
    """Récupère les statistiques de présence/absence des conducteurs pour aujourd'hui"""
    try:
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT 
                    ie.matricule,
                    ie.nom,
                    ie.prenom,
                    ie.fonction,
                    CASE 
                        WHEN a.date_debut_abs IS NOT NULL AND CURRENT_DATE BETWEEN DATE(a.date_debut_abs) AND DATE(a.date_fin_abs) THEN 'absent'
                        ELSE 'present'
                    END as statut
                FROM info_equipe ie
                LEFT JOIN absences a ON ie.matricule = a.matricule AND CURRENT_DATE BETWEEN DATE(a.date_debut_abs) AND DATE(a.date_fin_abs)
                WHERE ie.fonction = 'conducteur'
                ORDER BY ie.matricule ASC
            ''')
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
        data = [
            {col: (val.isoformat() if hasattr(val, 'isoformat') else val) for col, val in zip(columns, row)}
            for row in rows
        ]
        
        # Compter les présents et absents
        presents = len([row for row in data if row['statut'] == 'present'])
        absents = len([row for row in data if row['statut'] == 'absent'])
        
        return Response({
            'presents': presents,
            'absents': absents,
            'total': len(data),
            'details': data
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def stats_dockers_presence(request):
    """Récupère les statistiques de présence/absence des dockers pour aujourd'hui"""
    try:
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT 
                    ie.matricule,
                    ie.nom,
                    ie.prenom,
                    ie.fonction,
                    CASE 
                        WHEN a.date_debut_abs IS NOT NULL AND CURRENT_DATE BETWEEN DATE(a.date_debut_abs) AND DATE(a.date_fin_abs) THEN 'absent'
                        ELSE 'present'
                    END as statut
                FROM info_equipe ie
                LEFT JOIN absences a ON ie.matricule = a.matricule AND CURRENT_DATE BETWEEN DATE(a.date_debut_abs) AND DATE(a.date_fin_abs)
                WHERE ie.fonction = 'docker'
                ORDER BY ie.matricule ASC
            ''')
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
        data = [
            {col: (val.isoformat() if hasattr(val, 'isoformat') else val) for col, val in zip(columns, row)}
            for row in rows
        ]
        
        # Compter les présents et absents
        presents = len([row for row in data if row['statut'] == 'present'])
        absents = len([row for row in data if row['statut'] == 'absent'])
        
        return Response({
            'presents': presents,
            'absents': absents,
            'total': len(data),
            'details': data
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def alertes_conducteurs(request):
    """Récupère les alertes pour les conducteurs (heures > 8 ou < 2)"""
    try:
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT 
                    ch.matricule,
                    ch.heure_par_jour,
                    ch.date,
                    ie.nom,
                    ie.prenom,
                    ie.fonction,
                    CASE 
                        WHEN ch.heure_par_jour > 8 THEN 'excess'
                        WHEN ch.heure_par_jour < 2 THEN 'lack'
                        ELSE NULL
                    END as type_alerte
                FROM cumul_heures ch
                LEFT JOIN info_equipe ie ON ch.matricule = ie.matricule
                WHERE ie.fonction = 'conducteur'
                AND (ch.heure_par_jour > 8 OR ch.heure_par_jour < 2)
                AND ch.date = CURRENT_DATE
                ORDER BY ch.matricule ASC
            ''')
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
        data = [
            {col: (val.isoformat() if hasattr(val, 'isoformat') else val) for col, val in zip(columns, row)}
            for row in rows
        ]
        
        # Formater les données pour le frontend
        alertes = []
        for row in data:
            if row['type_alerte']:
                message = f"Surcharge: {row['heure_par_jour']}h/jour" if row['type_alerte'] == 'excess' else f"Sous-charge: {row['heure_par_jour']}h/jour"
                alertes.append({
                    'matricule': row['matricule'],
                    'nom': row['nom'],
                    'prenom': row['prenom'],
                    'heure_par_jour': row['heure_par_jour'],
                    'type_alerte': row['type_alerte'],
                    'message': message
                })
        
        return Response({'alertes': alertes})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def alertes_dockers(request):
    """Récupère les alertes pour les dockers (heures > 8 ou < 2)"""
    try:
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT 
                    ch.matricule,
                    ch.heure_par_jour,
                    ch.date,
                    ie.nom,
                    ie.prenom,
                    ie.fonction,
                    CASE 
                        WHEN ch.heure_par_jour > 8 THEN 'excess'
                        WHEN ch.heure_par_jour < 2 THEN 'lack'
                        ELSE NULL
                    END as type_alerte
                FROM cumul_heures ch
                LEFT JOIN info_equipe ie ON ch.matricule = ie.matricule
                WHERE ie.fonction = 'docker'
                AND (ch.heure_par_jour > 8 OR ch.heure_par_jour < 2)
                AND ch.date = CURRENT_DATE
                ORDER BY ch.matricule ASC
            ''')
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
        data = [
            {col: (val.isoformat() if hasattr(val, 'isoformat') else val) for col, val in zip(columns, row)}
            for row in rows
        ]
        
        # Formater les données pour le frontend
        alertes = []
        for row in data:
            if row['type_alerte']:
                message = f"Surcharge: {row['heure_par_jour']}h/jour" if row['type_alerte'] == 'excess' else f"Sous-charge: {row['heure_par_jour']}h/jour"
                alertes.append({
                    'matricule': row['matricule'],
                    'nom': row['nom'],
                    'prenom': row['prenom'],
                    'heure_par_jour': row['heure_par_jour'],
                    'type_alerte': row['type_alerte'],
                    'message': message
                })
        
        return Response({'alertes': alertes})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def cumul_dockers_dump(request):
    """Récupère les cumuls d'heures des dockers avec les informations de la table INFO_EQUIPE"""
    try:
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT 
                    ch.id_cumul_heures,
                    ch.matricule,
                    ch.code_engin,
                    ch.heure_par_jour,
                    ch.date,
                    ie.nom,
                    ie.prenom,
                    ie.fonction,
                    ie.email,
                    ie.phone_number,
                    ie.date_embauche,
                    ie.disponibilité
                FROM cumul_heures ch
                LEFT JOIN info_equipe ie ON ch.matricule = ie.matricule
                WHERE ie.fonction = 'docker'
                ORDER BY ch.matricule ASC, ch.date DESC
            ''')
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
        data = [
            {col: (val.isoformat() if hasattr(val, 'isoformat') else val) for col, val in zip(columns, row)}
            for row in rows
        ]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def cumul_conducteurs_dump(request):
    """Récupère les cumuls d'heures des conducteurs avec les informations de la table INFO_EQUIPE"""
    try:
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT 
                    ch.id_cumul_heures,
                    ch.matricule,
                    ch.code_engin,
                    ch.heure_par_jour,
                    ch.date,
                    ie.nom,
                    ie.prenom,
                    ie.fonction,
                    ie.email,
                    ie.phone_number,
                    ie.date_embauche,
                    ie.disponibilité
                FROM cumul_heures ch
                LEFT JOIN info_equipe ie ON ch.matricule = ie.matricule
                WHERE ie.fonction = 'conducteur'
                ORDER BY ch.matricule ASC, ch.date DESC
            ''')
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
        data = [
            {col: (val.isoformat() if hasattr(val, 'isoformat') else val) for col, val in zip(columns, row)}
            for row in rows
        ]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def qualifications_conducteurs(request):
    """Récupère les qualifications des conducteurs depuis la table qualifications_conducteurs"""
    try:
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT 
                    qc.*,
                    ie.nom,
                    ie.prenom,
                    ie.fonction
                FROM qualifications_conducteurs qc
                LEFT JOIN info_equipe ie ON qc.matricule = ie.matricule
                ORDER BY qc.matricule ASC, qc.date_obtention DESC
            ''')
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
        data = [
            {col: (val.isoformat() if hasattr(val, 'isoformat') else val) for col, val in zip(columns, row)}
            for row in rows
        ]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)



@api_view(['PUT'])
@permission_classes([AllowAny])
def modifier_qualification_conducteur(request, id_qualification):
    """Modifie une qualification de conducteur"""
    try:
        data = request.data
        with connection.cursor() as cursor:
            cursor.execute('''
                UPDATE qualifications_conducteurs 
                SET matricule = %s, code_engin = %s, niveau_expertise = %s, date_obtention = %s
                WHERE id_qualification = %s
            ''', [
                data.get('matricule'),
                data.get('code_engin'),
                data.get('niveau_expertise'),
                data.get('date_obtention'),
                id_qualification
            ])
            
            if cursor.rowcount == 0:
                return Response({'error': 'Qualification non trouvée'}, status=404)
                
        return Response({'message': 'Qualification mise à jour avec succès'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def limites_alertes(request):
    """Récupère les limites d'alertes depuis la base de données"""
    try:
        with connection.cursor() as cursor:
            # Vérifier si une table de configuration existe, sinon utiliser des valeurs par défaut
            cursor.execute('''
                SELECT 
                    COALESCE(
                        (SELECT valeur FROM configuration WHERE cle = 'limite_min_heures'), 
                        2
                    ) as limite_min,
                    COALESCE(
                        (SELECT valeur FROM configuration WHERE cle = 'limite_max_heures'), 
                        8
                    ) as limite_max
            ''')
            
            result = cursor.fetchone()
            limite_min = int(result[0]) if result[0] else 2
            limite_max = int(result[1]) if result[1] else 8
            
        return Response({
            'limite_min': limite_min,
            'limite_max': limite_max
        })
    except Exception as e:
        # En cas d'erreur, retourner les valeurs par défaut
        return Response({
            'limite_min': 2,
            'limite_max': 8
        })

# ===== NOUVELLES VUES POUR LES CHEFS D'ESCALE =====

@api_view(['GET'])
@permission_classes([AllowAny])
def chef_escale_liste(request):
    """Récupère la liste complète des chefs d'escale"""
    try:
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT 
                    ce.id_chef_escale,
                    ce.nbr_aff_manuelle,
                    ce.id_shift,
                    ce.nom,
                    ce.prenom,
                    ce.telephone,
                    ce.email,
                    s.date_debut_shift,
                    s.date_fin_shift
                FROM CHEF_ESCALE ce
                LEFT JOIN SHIFTS s ON ce.id_shift = s.id_shift
                ORDER BY ce.nom ASC, ce.prenom ASC
            ''')
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
        data = [
            {col: (val.isoformat() if hasattr(val, 'isoformat') else val) for col, val in zip(columns, row)}
            for row in rows
        ]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def chef_escale_ajouter(request):
    """Ajoute un nouveau chef d'escale"""
    try:
        data = request.data
        
        # Validation des données
        required_fields = ['id_chef_escale', 'nom', 'prenom']
        for field in required_fields:
            if not data.get(field):
                return Response({'error': f'Le champ {field} est requis'}, status=400)
        
        # Validation du nombre d'affectations manuelles
        nbr_aff_manuelle = data.get('nbr_aff_manuelle', 4)
        if nbr_aff_manuelle > 4:
            return Response({'error': 'Le nombre d\'affectations manuelles ne peut pas dépasser 4'}, status=400)
        
        with connection.cursor() as cursor:
            cursor.execute('''
                INSERT INTO CHEF_ESCALE 
                (id_chef_escale, nbr_aff_manuelle, id_shift, nom, prenom, telephone, email)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''', [
                data.get('id_chef_escale'),
                nbr_aff_manuelle,
                data.get('id_shift'),
                data.get('nom'),
                data.get('prenom'),
                data.get('telephone'),
                data.get('email')
            ])
            
        return Response({'message': 'Chef d\'escale ajouté avec succès'}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['PATCH'])
@permission_classes([AllowAny])
def chef_escale_modifier(request, id_chef_escale):
    """Modifie les informations d'un chef d'escale"""
    try:
        data = request.data
        
        # Validation du nombre d'affectations manuelles
        if 'nbr_aff_manuelle' in data and data['nbr_aff_manuelle'] > 4:
            return Response({'error': 'Le nombre d\'affectations manuelles ne peut pas dépasser 4'}, status=400)
        
        # Construire la requête SQL dynamiquement
        update_fields = []
        update_values = []
        
        for field, value in data.items():
            if field in ['nbr_aff_manuelle', 'id_shift', 'nom', 'prenom', 'telephone', 'email']:
                update_fields.append(f"{field} = %s")
                update_values.append(value)
        
        if not update_fields:
            return Response({'error': 'Aucun champ valide à modifier'}, status=400)
        
        update_values.append(id_chef_escale)
        
        with connection.cursor() as cursor:
            cursor.execute(f'''
                UPDATE CHEF_ESCALE 
                SET {', '.join(update_fields)}
                WHERE id_chef_escale = %s
            ''', update_values)
            
            if cursor.rowcount == 0:
                return Response({'error': 'Chef d\'escale non trouvé'}, status=404)
                
        return Response({'message': 'Chef d\'escale modifié avec succès'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def chef_escale_stats(request):
    """Récupère les statistiques des chefs d'escale"""
    try:
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT 
                    COUNT(*) as total_chefs,
                    COUNT(CASE WHEN nbr_aff_manuelle = 0 THEN 1 END) as chefs_limite_atteinte,
                    COUNT(CASE WHEN id_shift IS NOT NULL THEN 1 END) as chefs_avec_shift
                FROM CHEF_ESCALE
            ''')
            
            result = cursor.fetchone()
            stats = {
                'total_chefs': result[0],
                'chefs_limite_atteinte': result[1],
                'chefs_avec_shift': result[2]
            }
            
        return Response(stats)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

def rename_justification_file(justification_file, matricule, date_debut_abs):
    """
    Renomme le fichier de justification selon le format demandé
    Format: matricule_yyyy_mm_dd.pdf
    """
    from datetime import datetime
    import os
    from django.core.files.base import ContentFile
    from django.core.files.storage import default_storage
    
    try:
        # Vérifier que le fichier est un PDF
        if not justification_file.name.lower().endswith('.pdf'):
            raise ValueError("Le fichier doit être au format PDF")
        
        # Extraire la date au format yyyy_mm_dd
        if isinstance(date_debut_abs, str):
            # Si c'est une chaîne ISO format (2025-08-08T23:30:00.000Z)
            try:
                # Supprimer le 'Z' et parser
                date_str_clean = date_debut_abs.replace('Z', '').split('.')[0]
                date_obj = datetime.fromisoformat(date_str_clean.replace('T', ' '))
                date_str = date_obj.strftime('%Y_%m_%d')
            except Exception as e:
                print(f"Erreur parsing date '{date_debut_abs}': {e}")
                date_str = datetime.now().strftime('%Y_%m_%d')
        else:
            # Si c'est un objet datetime
            date_str = date_debut_abs.strftime('%Y_%m_%d')
        
        # Construire le nouveau nom de fichier
        new_filename = f"{matricule}_{date_str}.pdf"
        new_path = os.path.join('justifications', new_filename)
        
        # Lire le contenu du fichier une seule fois
        file_content = justification_file.read()
        
        # Sauvegarder le fichier avec le nouveau nom
        path = default_storage.save(new_path, ContentFile(file_content))
        
        print(f"Fichier sauvegardé: {path}")
        return path
    except Exception as e:
        print(f"Erreur lors du renommage du fichier: {str(e)}")
        # Fallback: sauvegarder avec le nom original
        try:
            justification_file.seek(0)  # Remettre le curseur au début
            path = default_storage.save(f'justifications/{justification_file.name}', ContentFile(justification_file.read()))
            print(f"Fichier sauvegardé (fallback): {path}")
            return path
        except Exception as e2:
            print(f"Erreur fallback: {str(e2)}")
            raise e

# ViewSets complets
class EnginsViewSet(viewsets.ModelViewSet):
    queryset = Engins.objects.all()
    serializer_class = EnginsSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EnginsSerializer
        return EnginsSerializer

    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        total_engins = Engins.objects.count()
        en_maintenance = Engins.objects.filter(etat_engin='en maintenance').count()
        
        # Calculer la moyenne des heures cumulées
        cumuls = CumulHeures.objects.all()
        moyenne_heures = sum(c.heure_par_engin or 0 for c in cumuls) / len(cumuls) if cumuls else 0
        
        # Calculer le taux de disponibilité
        disponibles = Engins.objects.filter(etat_engin='disponible').count()
        taux_disponibilite = (disponibles / total_engins * 100) if total_engins > 0 else 0
        
        return Response({
            'total_engins': total_engins,
            'en_maintenance': en_maintenance,
            'moyenne_heures': round(moyenne_heures, 2),
            'taux_disponibilite': round(taux_disponibilite, 2)
        })

    @action(detail=True, methods=['patch'])
    def update_etat(self, request, pk=None):
        engin = self.get_object()
        etat_engin = request.data.get('etat_engin')
        
        if etat_engin:
            engin.etat_engin = etat_engin
            engin.save()
            
            # Enregistrer dans l'historique si un commentaire est fourni
            commentaire = request.data.get('commentaire')
            if commentaire:
                HistoriqueAffectations.objects.create(
                    id_affectation=None,  # Pas d'affectation spécifique
                    ancien_etat=engin.etat_engin,
                    nouvel_etat=etat_engin,
                    commentaire=commentaire
                )
            
            return Response({'message': 'État mis à jour avec succès'})
        return Response({'error': 'État requis'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def filtres(self, request):
        familles = Engins.objects.values_list('famille_engin', flat=True).distinct()
        etats = Engins.objects.values_list('etat_engin', flat=True).distinct()
        
        return Response({
            'familles': list(familles),
            'etats': list(etats)
        })

    @action(detail=False, methods=['get'])
    def familles(self, request):
        """Récupérer uniquement les familles d'engins distinctes"""
        familles = Engins.objects.values_list('famille_engin', flat=True).distinct().filter(famille_engin__isnull=False).exclude(famille_engin='')
        return Response({
            'familles': list(familles)
        })

class AffectationsViewSet(viewsets.ModelViewSet):
    queryset = Affectations.objects.all()
    serializer_class = AffectationsSerializer
    permission_classes = [AllowAny]

class EnginsAffecteesViewSet(viewsets.ModelViewSet):
    queryset = EnginsAffectees.objects.all()
    serializer_class = EnginsAffecteesSerializer
    permission_classes = [AllowAny]

class QualificationsConducteursViewSet(viewsets.ModelViewSet):
    queryset = QualificationsConducteurs.objects.all()
    serializer_class = QualificationsConducteursSerializer
    permission_classes = [AllowAny]

class CumulHeuresViewSet(viewsets.ModelViewSet):
    queryset = CumulHeures.objects.all()
    serializer_class = CumulHeuresSerializer
    permission_classes = [AllowAny]

class ShiftsViewSet(viewsets.ModelViewSet):
    queryset = Shifts.objects.all()
    serializer_class = ShiftsSerializer
    permission_classes = [AllowAny]

class EquipeViewSet(viewsets.ModelViewSet):
    queryset = Equipe.objects.all()
    serializer_class = EquipeSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        total_equipes = Equipe.objects.count()
        total_conducteurs = Conducteurs.objects.count()
        total_dockers = Dockers.objects.count()
        
        return Response({
            'total_equipes': total_equipes,
            'total_conducteurs': total_conducteurs,
            'total_dockers': total_dockers,
            'total_membres': total_conducteurs + total_dockers
        })

class InfoEquipeViewSet(viewsets.ModelViewSet):
    queryset = InfoEquipe.objects.all()
    serializer_class = InfoEquipeSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        id_equipe = self.request.query_params.get('id_equipe')
        if id_equipe:
            return InfoEquipe.objects.filter(id_equipe=id_equipe)
        return InfoEquipe.objects.all()

class ConducteursViewSet(viewsets.ModelViewSet):
    queryset = Conducteurs.objects.all()
    serializer_class = ConducteursSerializer
    permission_classes = [AllowAny]

class DockersViewSet(viewsets.ModelViewSet):
    queryset = Dockers.objects.all()
    serializer_class = DockersSerializer
    permission_classes = [AllowAny]

class AbsencesViewSet(viewsets.ModelViewSet):
    queryset = Absences.objects.all()
    serializer_class = AbsencesSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        print('POST /api/absences/ - Données reçues:', request.data)
        print('POST /api/absences/ - Fichiers reçus:', request.FILES)
        print('POST /api/absences/ - Content-Type:', request.content_type)
        
        # Fusionner les données et fichiers pour le serializer
        data = request.data.copy()
        if request.FILES:
            for key, file in request.FILES.items():
                data[key] = file
        
        print('POST /api/absences/ - Données fusionnées:', data)
        
        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            print('Erreurs de validation:', serializer.errors)
            return Response(serializer.errors, status=400)
        
        try:
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            print('Absence créée avec succès:', serializer.data)
            return Response(serializer.data, status=201, headers=headers)
        except Exception as e:
            print('Erreur lors de la création:', str(e))
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)

    def update(self, request, *args, **kwargs):
        try:
            # Gérer l'upload de fichier pour les mises à jour avec renommage automatique
            justification_file = request.FILES.get('justification')
            if justification_file:
                # Récupérer le matricule et la date de début
                matricule = request.data.get('matricule')
                date_debut_abs = request.data.get('date_debut_abs')
                
                if matricule and date_debut_abs:
                    # Renommer et sauvegarder le fichier
                    path = rename_justification_file(justification_file, matricule, date_debut_abs)
                    request.data['justification'] = path
                else:
                    # Fallback si les données ne sont pas disponibles
                    path = default_storage.save(f'justifications/{justification_file.name}', ContentFile(justification_file.read()))
                    request.data['justification'] = path

            # Récupérer l'instance existante
            instance = self.get_object()
            
            # Utiliser le serializer pour la validation et la mise à jour
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def absences_non_declarees(self, request):
        """Endpoint pour récupérer les absences non déclarées"""
        try:
            # Pour l'instant, retourner une liste vide car la logique métier
            # pour détecter les absences non déclarées n'est pas encore implémentée
            # Cette logique pourrait comparer les présences planifiées vs les absences déclarées
            absences_non_declarees = []
            return Response(absences_non_declarees)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AbsencesNonDeclareesViewSet(viewsets.ModelViewSet):
    queryset = AbsencesNonDeclarees.objects.all().order_by('-date_debut_abs')
    serializer_class = AbsencesNonDeclareesSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['patch'])
    def justifier(self, request, pk=None):
        """Justifier une absence non déclarée"""
        try:
            absence = self.get_object()
            
            # Gérer l'upload de fichier avec renommage automatique
            justification_file = request.FILES.get('justification')
            if justification_file:
                # Renommer et sauvegarder le fichier
                path = rename_justification_file(justification_file, absence.matricule, absence.date_debut_abs)
                absence.justification = path
            else:
                # Si pas de fichier, utiliser le texte de justification
                justification_text = request.data.get('justification', '')
                absence.justification = justification_text
            
            absence.est_justifie = True
            absence.save()
            
            return Response({
                'message': 'Absence justifiée avec succès',
                'absence': {
                    'id': absence.id,
                    'matricule': absence.matricule,
                    'est_justifie': absence.est_justifie,
                    'justification': str(absence.justification) if absence.justification else None
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Erreur lors de la justification: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def annuler_justification(self, request, pk=None):
        """Annuler la justification d'une absence non déclarée"""
        try:
            absence = self.get_object()
            
            absence.est_justifie = False
            absence.justification = None
            absence.save()
            
            return Response({
                'message': 'Justification annulée avec succès',
                'absence': {
                    'id': absence.id,
                    'matricule': absence.matricule,
                    'est_justifie': absence.est_justifie,
                    'justification': absence.justification
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Erreur lors de l\'annulation de la justification: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response({'message': 'Absence non déclarée supprimée avec succès'}, status=status.HTTP_204_NO_CONTENT)
        except AbsencesNonDeclarees.DoesNotExist:
            return Response({'error': 'Absence non déclarée non trouvée'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MaintenanceViewSet(viewsets.ModelViewSet):
    queryset = Maintenance.objects.all()
    serializer_class = MaintenanceSerializer
    permission_classes = [AllowAny]

class IncidentsViewSet(viewsets.ModelViewSet):
    queryset = Incidents.objects.all()
    serializer_class = IncidentsSerializer
    permission_classes = [AllowAny]

class UtilisateursViewSet(viewsets.ModelViewSet):
    queryset = Utilisateurs.objects.all()
    serializer_class = UtilisateursSerializer
    permission_classes = [AllowAny]

class ChefEscaleViewSet(viewsets.ModelViewSet):
    queryset = ChefEscale.objects.all()
    serializer_class = ChefEscaleSerializer
    permission_classes = [AllowAny]

class SuperviseursViewSet(viewsets.ModelViewSet):
    queryset = Superviseurs.objects.all()
    serializer_class = SuperviseursSerializer
    permission_classes = [AllowAny]

class HistoriqueAffectationsViewSet(viewsets.ModelViewSet):
    queryset = HistoriqueAffectations.objects.all()
    serializer_class = HistoriqueAffectationsSerializer
    permission_classes = [AllowAny]

class NotificationsViewSet(viewsets.ModelViewSet):
    queryset = Notifications.objects.all()
    serializer_class = NotificationsSerializer
    permission_classes = [AllowAny]

class RapportsViewSet(viewsets.ModelViewSet):
    queryset = Rapports.objects.all()
    serializer_class = RapportsSerializer
    permission_classes = [AllowAny]

class ParametresViewSet(viewsets.ModelViewSet):
    queryset = Parametres.objects.all()
    serializer_class = ParametresSerializer
    permission_classes = [AllowAny]

class LogsViewSet(viewsets.ModelViewSet):
    queryset = Logs.objects.all()
    serializer_class = LogsSerializer
    permission_classes = [AllowAny]

class NavirePrevisionnelViewSet(viewsets.ModelViewSet):
    queryset = NavirePrevisionnel.objects.all().order_by('date_arrivee', 'heure_arrivee')
    serializer_class = NavirePrevisionnelSerializer
    permission_classes = [AllowAny]
    pagination_class = None  # Désactiver la pagination

    def list(self, request, *args, **kwargs):
        """Liste des navires prévisionnels"""
        try:
            # Compter le nombre total de navires
            total_count = NavirePrevisionnel.objects.count()
            print(f"📊 Nombre total de navires dans la DB: {total_count}")
            
            # Récupérer tous les navires
            navires = NavirePrevisionnel.objects.all().order_by('date_arrivee', 'heure_arrivee')
            serializer = self.get_serializer(navires, many=True)
            
            print(f"✅ Navires récupérés: {len(serializer.data)}")
            print(f"📋 Premiers navires: {serializer.data[:3] if serializer.data else 'Aucun'}")
            
            return Response(serializer.data)
        except Exception as e:
            print(f"❌ Erreur lors de la récupération des navires: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def update_navires(self, request):
        """Mettre à jour les navires prévisionnels via scraping"""
        try:
            # Lancer le scraping dans un thread séparé pour éviter le blocage
            def run_scraping():
                try:
                    print("🚀 Début du scraping des navires...")
                    
                    # Importer et exécuter le script de scraping
                    from .navire_scraper import scrape_navires_anp
                    
                    # Changer le répertoire de travail pour que le CSV soit créé au bon endroit
                    import os
                    current_dir = os.getcwd()
                    script_dir = os.path.dirname(os.path.abspath(__file__))
                    os.chdir(script_dir)
                    
                    try:
                        result = scrape_navires_anp()
                        print(f"✅ Scraping terminé: {result}")
                    finally:
                        # Restaurer le répertoire de travail
                        os.chdir(current_dir)
                        
                except Exception as e:
                    print(f"❌ Erreur lors du scraping: {str(e)}")
                    import traceback
                    traceback.print_exc()
            
            # Démarrer le scraping en arrière-plan
            scraping_thread = threading.Thread(target=run_scraping)
            scraping_thread.daemon = True
            scraping_thread.start()
            
            return Response({
                'success': True,
                'message': 'Scraping des navires lancé en arrière-plan. Vérifiez les logs pour le suivi.'
            }, status=status.HTTP_202_ACCEPTED)
            
        except Exception as e:
            print(f"Erreur lors du lancement du scraping: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': f'Erreur lors du lancement du scraping: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def clear_navires(self, request):
        """Endpoint pour vider toutes les données des navires"""
        try:
            count = NavirePrevisionnel.objects.count()
            NavirePrevisionnel.objects.all().delete()
            
            return Response({
                'message': f'{count} navires supprimés de la base de données.',
                'count': 0
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Erreur lors de la suppression: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def csv_data(self, request):
        """Endpoint pour récupérer les données du fichier CSV"""
        print("🚀 Endpoint csv_data appelé!")
        try:
            csv_filename = "navires_agadir.csv"
            # Chemin direct vers le fichier dans le dossier manutention
            csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), csv_filename)
            
            print(f"🔍 Recherche du fichier CSV: {csv_path}")
            print(f"📁 Le fichier existe: {os.path.exists(csv_path)}")
            
            if not os.path.exists(csv_path):
                return Response({
                    'error': f'Fichier CSV non trouvé à l\'emplacement: {csv_path}'
                }, status=status.HTTP_404_NOT_FOUND)
            
            navires_data = []
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.reader(f)
                next(reader)  # Skip header
                for row in reader:
                    if len(row) >= 8:
                        navires_data.append({
                            'nom': row[0],
                            'type': row[1],
                            'statut': row[2],
                            'date': row[3],
                            'heure': row[4],
                            'port': row[5],
                            'consignataire': row[6],
                            'operateur': row[7]
                        })
            
            return Response({
                'success': True,
                'data': navires_data,
                'count': len(navires_data),
                'csv_file': csv_filename
            })
            
        except Exception as e:
            return Response({
                'error': f'Erreur lors de la lecture du CSV: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
