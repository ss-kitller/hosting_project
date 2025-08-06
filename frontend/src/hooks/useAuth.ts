import { useState, useEffect } from 'react';
import { AuthService } from '../services/auth';

interface User {
  id: number;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (AuthService.isAuthenticated()) {
        const userId = AuthService.getUserId();
        const userRole = AuthService.getUserRole();
        
        if (userId && userRole) {
          setUser({
            id: userId,
            role: userRole
          });
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (token: string) => {
    AuthService.setToken(token);
    const userId = AuthService.getUserId();
    const userRole = AuthService.getUserRole();
    
    if (userId && userRole) {
      setUser({
        id: userId,
        role: userRole
      });
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const hasRole = (role: string) => {
    return AuthService.hasRole(role);
  };

  const canAccessRoute = (route: string) => {
    return AuthService.canAccessRoute(route);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
    canAccessRoute
  };
} 