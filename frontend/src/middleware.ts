import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  user_id: number;
  role: string;
  exp: number;
  iat: number;
}

// Définition des routes protégées par rôle
const protectedRoutes = {
  '/RH': ['admin', 'RH'],
  '/chef_escale': ['admin', 'CE'],
  '/dev_tech': ['admin', 'DT']
};

// Routes qui ne nécessitent pas d'authentification
const publicRoutes = ['/login', '/unauthorized'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si c'est une route publique
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Récupérer le token depuis les cookies
  const token = request.cookies.get('access')?.value;
  
  // Si pas de token, rediriger vers login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Décoder le token JWT
    const decoded = jwtDecode<JWTPayload>(token);
    
    // Vérifier si le token n'est pas expiré
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      // Token expiré, supprimer le cookie et rediriger
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('access');
      return response;
    }

    const userRole = decoded.role;
    
    // Vérifier les permissions pour les routes protégées
    for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route)) {
        // Si l'utilisateur n'a pas le rôle requis
        if (!allowedRoles.includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        break;
      }
    }

    // Si l'utilisateur est connecté et essaie d'accéder à la page d'accueil
    if (pathname === '/') {
      // Rediriger selon le rôle
      switch (userRole) {
        case 'admin':
          // Admin peut accéder à tout, rediriger vers RH par défaut
          return NextResponse.redirect(new URL('/RH', request.url));
        case 'CE':
          return NextResponse.redirect(new URL('/chef_escale', request.url));
        case 'RH':
          return NextResponse.redirect(new URL('/RH', request.url));
        case 'DT':
          return NextResponse.redirect(new URL('/dev_tech', request.url));
        default:
          return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Erreur de décodage du token, rediriger vers login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('access');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 