# Système d'Authentification par Rôles (RBAC)

Ce document décrit l'implémentation du système d'authentification par rôles (RBAC) dans l'application Next.js.

## Architecture

### 1. Middleware Next.js (`src/middleware.ts`)
- **Fonction** : Protection côté serveur des routes
- **Stockage** : Token JWT dans les cookies sécurisés
- **Permissions** : Vérification des rôles avant accès aux pages

### 2. Service d'Authentification (`src/services/auth.ts`)
- **Fonction** : Gestion centralisée de l'authentification
- **Méthodes** :
  - `setToken()` : Stockage du token
  - `getToken()` : Récupération du token
  - `isAuthenticated()` : Vérification de l'authentification
  - `getUserRole()` : Récupération du rôle utilisateur
  - `hasRole()` : Vérification d'un rôle spécifique
  - `canAccessRoute()` : Vérification d'accès à une route
  - `logout()` : Déconnexion
  - `redirectByRole()` : Redirection selon le rôle

### 3. Composant ProtectedRoute (`src/components/ProtectedRoute.tsx`)
- **Fonction** : Protection côté client des composants
- **Props** :
  - `allowedRoles` : Tableau des rôles autorisés
  - `children` : Contenu à protéger
  - `fallback` : Composant de chargement (optionnel)

### 4. Hook useAuth (`src/hooks/useAuth.ts`)
- **Fonction** : Hook React pour l'état d'authentification
- **Retourne** :
  - `user` : Informations utilisateur
  - `loading` : État de chargement
  - `isAuthenticated` : État d'authentification
  - `login/logout` : Fonctions d'authentification
  - `hasRole/canAccessRoute` : Fonctions de vérification

## Rôles et Permissions

### Rôles Disponibles
- **admin** : Accès complet à toutes les interfaces
- **CE** (Chef d'escale) : Accès à `/chef_escale/*`
- **RH** (Ressources Humaines) : Accès à `/RH/*`
- **DT** (Dev Tech) : Accès à `/dev_tech/*`

### Routes Protégées
```typescript
const protectedRoutes = {
  '/RH': ['admin', 'RH'],
  '/chef_escale': ['admin', 'CE'],
  '/dev_tech': ['admin', 'DT']
};
```

### Redirection Post-Login
- **admin** → `/RH/` (interface par défaut)
- **CE** → `/chef_escale/`
- **RH** → `/RH/`
- **DT** → `/dev_tech/`

## Utilisation

### 1. Protection d'une Page
```tsx
import ProtectedRoute from '../components/ProtectedRoute';

export default function MaPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'RH']}>
      <div>Contenu protégé</div>
    </ProtectedRoute>
  );
}
```

### 2. Utilisation du Hook
```tsx
import { useAuth } from '../hooks/useAuth';

export default function MonComposant() {
  const { user, isAuthenticated, hasRole, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Veuillez vous connecter</div>;
  }

  return (
    <div>
      <p>Bienvenue {user?.role}</p>
      {hasRole('admin') && <button>Action Admin</button>}
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
```

### 3. Service d'Authentification
```tsx
import { AuthService } from '../services/auth';

// Vérifier l'authentification
if (AuthService.isAuthenticated()) {
  const role = AuthService.getUserRole();
  console.log('Rôle utilisateur:', role);
}

// Vérifier les permissions
if (AuthService.canAccessRoute('/RH')) {
  console.log('Accès autorisé à RH');
}
```

## Sécurité

### Stockage des Tokens
- **Méthode** : Cookies sécurisés
- **Configuration** :
  - `secure: true` : HTTPS uniquement
  - `samesite: strict` : Protection CSRF
  - `max-age: 3600` : Expiration 1 heure

### Validation
- **Middleware** : Vérification côté serveur
- **Composants** : Vérification côté client
- **Expiration** : Vérification automatique de l'expiration JWT

## Gestion des Erreurs

### Page Unauthorized (`/unauthorized`)
- **URL** : `/app/unauthorized/page.tsx`
- **Fonction** : Affichage d'erreur d'accès
- **Actions** : Boutons "Retour" et "Accueil"

### Redirections
- **Token manquant** → `/login`
- **Token expiré** → `/login`
- **Accès interdit** → `/unauthorized`
- **Rôle invalide** → `/unauthorized`

## Configuration Backend

### Structure JWT Attendue
```json
{
  "user_id": 123,
  "role": "CE",
  "exp": 1640995200,
  "iat": 1640991600
}
```

### Endpoint de Login
- **URL** : `POST /api/login/`
- **Réponse** : `{ "access": "jwt_token_here" }`

## Dépendances

### Installation
```bash
npm install jwt-decode
```

### Imports Requis
```typescript
import { jwtDecode } from 'jwt-decode';
import { NextRequest, NextResponse } from 'next/server';
```

## Tests

### Scénarios de Test
1. **Login avec rôle CE** → Redirection vers `/chef_escale/`
2. **Accès RH avec rôle DT** → Redirection vers `/unauthorized`
3. **Token expiré** → Redirection vers `/login`
4. **Admin accès toutes interfaces** → Accès autorisé partout

### Vérification
- Tester chaque rôle avec les interfaces correspondantes
- Vérifier les redirections post-login
- Tester l'expiration des tokens
- Vérifier la protection des routes sensibles 