"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '../services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles, 
  fallback 
}: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      // Vérifier si l'utilisateur est connecté
      if (!AuthService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      // Si des rôles spécifiques sont requis, vérifier les permissions
      if (allowedRoles && allowedRoles.length > 0) {
        const userRole = AuthService.getUserRole();
        const hasPermission = allowedRoles.includes(userRole!) || userRole === 'admin';
        
        if (!hasPermission) {
          router.push('/unauthorized');
          return;
        }
      }

      setIsAuthorized(true);
    };

    checkAuth();
  }, [allowedRoles, router]);

  // Afficher un loader pendant la vérification
  if (isAuthorized === null) {
    return fallback || (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f9f9f9'
      }}>
        <div style={{
          padding: '2rem',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          Vérification des permissions...
        </div>
      </div>
    );
  }

  // Si autorisé, afficher le contenu
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Si non autorisé, ne rien afficher (la redirection est en cours)
  return null;
} 