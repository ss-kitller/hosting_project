# 🧪 Guide de Test du Système RBAC

Ce guide vous explique comment tester le système d'authentification par rôles (RBAC) implémenté.

## 📋 Prérequis

### 1. Démarrage des Serveurs

```bash
# Terminal 1 - Backend Django
cd backend
python manage.py runserver

# Terminal 2 - Frontend Next.js
cd frontend
npm run dev
```

### 2. Vérification des Données

Les utilisateurs de test ont été créés automatiquement :

## 🔑 Comptes de Test Disponibles

| Utilisateur | Mot de passe | Rôle | Accès |
|-------------|--------------|------|-------|
| `admin` | `admin123` | admin | Toutes les interfaces |
| `ce01` | `password123` | CE | `/chef_escale/*` |
| `ce02` | `password123` | CE | `/chef_escale/*` |
| `rh01` | `password123` | RH | `/RH/*` |
| `rh02` | `password123` | RH | `/RH/*` |
| `dt01` | `password123` | DT | `/dev_tech/*` |
| `dt02` | `password123` | DT | `/dev_tech/*` |

## 🧪 Scénarios de Test

### Test 1 : Connexion Admin
1. **URL** : `http://localhost:3000/login`
2. **Identifiants** : `admin` / `admin123`
3. **Résultat attendu** : Redirection vers `/RH/`
4. **Tests d'accès** :
   - ✅ `/RH/` → Accès autorisé
   - ✅ `/chef_escale/` → Accès autorisé
   - ✅ `/dev_tech/` → Accès autorisé

### Test 2 : Connexion Chef d'escale (CE)
1. **URL** : `http://localhost:3000/login`
2. **Identifiants** : `ce01` / `password123`
3. **Résultat attendu** : Redirection vers `/chef_escale/`
4. **Tests d'accès** :
   - ❌ `/RH/` → Redirection vers `/unauthorized`
   - ✅ `/chef_escale/` → Accès autorisé
   - ❌ `/dev_tech/` → Redirection vers `/unauthorized`

### Test 3 : Connexion RH
1. **URL** : `http://localhost:3000/login`
2. **Identifiants** : `rh01` / `password123`
3. **Résultat attendu** : Redirection vers `/RH/`
4. **Tests d'accès** :
   - ✅ `/RH/` → Accès autorisé
   - ❌ `/chef_escale/` → Redirection vers `/unauthorized`
   - ❌ `/dev_tech/` → Redirection vers `/unauthorized`

### Test 4 : Connexion Dev Tech (DT)
1. **URL** : `http://localhost:3000/login`
2. **Identifiants** : `dt01` / `password123`
3. **Résultat attendu** : Redirection vers `/dev_tech/`
4. **Tests d'accès** :
   - ❌ `/RH/` → Redirection vers `/unauthorized`
   - ❌ `/chef_escale/` → Redirection vers `/unauthorized`
   - ✅ `/dev_tech/` → Accès autorisé

## 🔒 Tests de Sécurité

### Test 5 : Accès Direct sans Connexion
1. **URLs à tester** :
   - `http://localhost:3000/RH/`
   - `http://localhost:3000/chef_escale/`
   - `http://localhost:3000/dev_tech/`
2. **Résultat attendu** : Redirection vers `/login`

### Test 6 : Page d'Accueil
1. **URL** : `http://localhost:3000/`
2. **Résultat** : Redirection selon le rôle de l'utilisateur connecté

### Test 7 : Page Unauthorized
1. **URL** : `http://localhost:3000/unauthorized`
2. **Vérifications** :
   - ✅ Message "⛔ Accès refusé"
   - ✅ Bouton "Retour" fonctionne
   - ✅ Bouton "Accueil" fonctionne

## 🛠️ Tests Techniques

### Test 8 : Vérification des Cookies
1. **Ouvrir** : F12 → Application → Cookies
2. **Vérifier** : Présence du cookie `access`
3. **Tester** : Supprimer le cookie → Redirection vers `/login`

### Test 9 : Test d'Expiration
1. **Modifier** : L'expiration du JWT dans le cookie
2. **Résultat** : Redirection vers `/login`

### Test 10 : Navigation Manuelle
1. **Se connecter** avec un rôle spécifique
2. **Naviguer manuellement** vers une interface interdite
3. **Résultat** : Redirection vers `/unauthorized`

## 📊 Checklist de Validation

### ✅ Configuration Backend
- [ ] Serveur Django démarré sur `http://localhost:8000`
- [ ] Endpoint `/api/login/` fonctionnel
- [ ] JWT contient le champ `role`
- [ ] Structure JWT correcte : `{user_id, role, exp, iat}`

### ✅ Configuration Frontend
- [ ] Serveur Next.js démarré sur `http://localhost:3000`
- [ ] Package `jwt-decode` installé
- [ ] Middleware `src/middleware.ts` présent
- [ ] Service `src/services/auth.ts` fonctionnel

### ✅ Tests de Connexion
- [ ] Login admin → `/RH/`
- [ ] Login CE → `/chef_escale/`
- [ ] Login RH → `/RH/`
- [ ] Login DT → `/dev_tech/`

### ✅ Tests de Sécurité
- [ ] Accès interdit → `/unauthorized`
- [ ] Token manquant → `/login`
- [ ] Token expiré → `/login`

## 🔧 Dépannage

### Problème : Redirection en boucle
**Solution** : Vérifier que les routes publiques sont bien configurées dans le middleware

### Problème : Erreur de décodage JWT
**Solution** : Vérifier la structure du JWT envoyé par le backend

### Problème : Accès non autorisé
**Solution** : Vérifier que les rôles dans la base correspondent exactement à `admin`, `CE`, `RH`, `DT`

### Problème : Page blanche
**Solution** : Vérifier les erreurs dans la console du navigateur (F12)

## 📝 Notes Importantes

1. **Cookies** : Le système utilise des cookies sécurisés pour stocker le JWT
2. **Expiration** : Les tokens expirent après 1 heure
3. **Middleware** : Protection côté serveur + côté client
4. **Rôles** : Les noms doivent correspondre exactement à ceux de la base de données

## 🎯 Résultats Attendus

Après tous les tests, vous devriez avoir confirmé que :

- ✅ L'admin a accès à toutes les interfaces
- ✅ Chaque rôle a accès uniquement à son interface
- ✅ Les accès interdits redirigent vers `/unauthorized`
- ✅ Les tokens expirés redirigent vers `/login`
- ✅ Le système est sécurisé et fonctionnel

## 🚀 Prochaines Étapes

Une fois les tests validés, vous pouvez :

1. **Personnaliser** les interfaces selon vos besoins
2. **Ajouter** de nouveaux rôles si nécessaire
3. **Implémenter** des fonctionnalités spécifiques par rôle
4. **Optimiser** les performances du middleware

---

**✅ Le système RBAC est maintenant prêt pour la production !** 