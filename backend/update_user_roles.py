#!/usr/bin/env python
"""
Script pour mettre à jour les rôles des utilisateurs dans la base de données
et créer de nouveaux utilisateurs de test avec les rôles corrects.
"""

import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from users.models import Utilisateur
from django.contrib.auth.hashers import make_password

def update_user_roles():
    print("🔄 Mise à jour des rôles des utilisateurs...")
    role_mapping = {
        'CE': 'CE',
        'DT': 'DT',
        'RH': 'RH',
        'admin': 'admin'
    }
    for utilisateur in Utilisateur.objects.all():
        ancien_role = utilisateur.role
        nouveau_role = role_mapping.get(ancien_role, ancien_role)
        if ancien_role != nouveau_role:
            utilisateur.role = nouveau_role
            utilisateur.save()
            print(f"✅ {utilisateur.id_utilisateur}: {ancien_role} → {nouveau_role}")
        else:
            print(f"⏭️  {utilisateur.id_utilisateur}: {ancien_role} (déjà correct)")

def create_new_test_users():
    print("\n🔄 Création de nouveaux utilisateurs de test...")
    new_users = [
        {'id_utilisateur': 'ce01', 'nom_utilisateur': 'Chef Escale Test 1', 'mot_de_passe': 'password123', 'role': 'CE'},
        {'id_utilisateur': 'ce02', 'nom_utilisateur': 'Chef Escale Test 2', 'mot_de_passe': 'password123', 'role': 'CE'},
        {'id_utilisateur': 'dt01', 'nom_utilisateur': 'Division Technique Test 1', 'mot_de_passe': 'password123', 'role': 'DT'},
        {'id_utilisateur': 'dt02', 'nom_utilisateur': 'Division Technique Test 2', 'mot_de_passe': 'password123', 'role': 'DT'},
        {'id_utilisateur': 'rh01', 'nom_utilisateur': 'RH Test 1', 'mot_de_passe': 'password123', 'role': 'RH'},
        {'id_utilisateur': 'rh02', 'nom_utilisateur': 'RH Test 2', 'mot_de_passe': 'password123', 'role': 'RH'},
        {'id_utilisateur': 'admin', 'nom_utilisateur': 'Administrateur', 'mot_de_passe': 'admin123', 'role': 'admin'}
    ]
    for user_data in new_users:
        id_utilisateur = user_data['id_utilisateur']
        if not Utilisateur.objects.filter(id_utilisateur=id_utilisateur).exists():
            utilisateur = Utilisateur.objects.create(
                id_utilisateur=id_utilisateur,
                nom_utilisateur=user_data['nom_utilisateur'],
                mot_de_passe_hash=make_password(user_data['mot_de_passe']),
                role=user_data['role']
            )
            print(f"✅ Nouvel utilisateur créé: {utilisateur.id_utilisateur} ({utilisateur.role})")
        else:
            print(f"⏭️  Utilisateur {id_utilisateur} existe déjà")

def main():
    print("🚀 Début de la mise à jour des rôles utilisateurs...")
    
    try:
        update_user_roles()
        create_new_test_users()
        print("\n✅ Mise à jour terminée avec succès!")
        print("\n📋 Utilisateurs de test disponibles:")
        print("| Utilisateur | Mot de passe | Rôle |")
        print("|-------------|--------------|------|")
        print("| admin       | admin123     | admin|")
        print("| ce01        | password123  | CE   |")
        print("| ce02        | password123  | CE   |")
        print("| dt01        | password123  | DT   |")
        print("| dt02        | password123  | DT   |")
        print("| rh01        | password123  | RH   |")
        print("| rh02        | password123  | RH   |")
        
    except Exception as e:
        print(f"❌ Erreur lors de la mise à jour: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main() 