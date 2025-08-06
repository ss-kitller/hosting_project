#!/usr/bin/env python
import os
import django

# Configuration Django
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'manutention.settings')
django.setup()

from manutention.models import InfoEquipe

# Vérifier si le matricule mat003 existe
matricule = "mat003"
exists = InfoEquipe.objects.filter(matricule=matricule).exists()
print(f"Le matricule '{matricule}' existe: {exists}")

if exists:
    info = InfoEquipe.objects.get(matricule=matricule)
    print(f"Informations: {info.nom} {info.prenom}, fonction: {info.fonction}")
else:
    print("Matricule non trouvé")
    # Lister tous les matricules disponibles
    all_matricules = InfoEquipe.objects.values_list('matricule', flat=True)
    print(f"Matricules disponibles: {list(all_matricules)}") 