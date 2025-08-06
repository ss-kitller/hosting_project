import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  user_id: number;
  role: string;
  exp: number;
  iat: number;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'access';
  private static readonly TOKEN_EXPIRY = 3600; // 1 heure

  // Stocker le token dans un cookie sécurisé
  static setToken(token: string): void {
    // En développement local, on n'utilise pas secure
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const secureFlag = isLocalhost ? '' : '; secure';
    const cookieValue = `${this.TOKEN_KEY}=${token}; path=/; max-age=${this.TOKEN_EXPIRY}; samesite=strict${secureFlag}`;
    document.cookie = cookieValue;
    console.log("🍪 Cookie défini:", cookieValue);
  }

  // Récupérer le token depuis les cookies
  static getToken(): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === this.TOKEN_KEY) {
        console.log("🔍 Token trouvé dans les cookies:", value ? "présent" : "absent");
        return value;
      }
    }
    console.log("🔍 Aucun token trouvé dans les cookies");
    return null;
  }

  // Supprimer le token
  static removeToken(): void {
    document.cookie = `${this.TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  // Vérifier si l'utilisateur est connecté
  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  // Récupérer le rôle de l'utilisateur
  static getUserRole(): string | null {
    const token = this.getToken();
    if (!token) {
      console.log("❌ Pas de token pour récupérer le rôle");
      return null;
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      console.log("🔓 Token décodé:", decoded);
      return decoded.role;
    } catch (error) {
      console.error("❌ Erreur lors du décodage du token:", error);
      return null;
    }
  }

  // Récupérer l'ID de l'utilisateur
  static getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      return decoded.user_id;
    } catch {
      return null;
    }
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  static hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role || userRole === 'admin';
  }

  // Vérifier si l'utilisateur a accès à une route
  static canAccessRoute(route: string): boolean {
    const userRole = this.getUserRole();
    if (!userRole) return false;

    const routePermissions = {
      '/RH': ['admin', 'RH'],
      '/chef_escale': ['admin', 'CE'],
      '/dev_tech': ['admin', 'DT']
    };

    for (const [protectedRoute, allowedRoles] of Object.entries(routePermissions)) {
      if (route.startsWith(protectedRoute)) {
        return allowedRoles.includes(userRole);
      }
    }

    return true; // Routes non protégées
  }

  // Déconnexion
  static logout(): void {
    this.removeToken();
    window.location.href = '/login';
  }

  // Rediriger selon le rôle
  static redirectByRole(): void {
    const role = this.getUserRole();
    console.log("🎯 Redirection pour le rôle:", role);
    
    if (!role) {
      console.log("❌ Pas de rôle, redirection vers login");
      window.location.href = '/login';
      return;
    }

    let redirectUrl = '/';
    switch (role) {
      case 'admin':
        redirectUrl = '/RH/';
        break;
      case 'CE':
        redirectUrl = '/chef_escale/';
        break;
      case 'RH':
        redirectUrl = '/RH/';
        break;
      case 'DT':
        redirectUrl = '/dev_tech/';
        break;
      default:
        redirectUrl = '/unauthorized/';
        break;
    }

    console.log("🚀 Redirection vers:", redirectUrl);
    window.location.href = redirectUrl;
  }
} 