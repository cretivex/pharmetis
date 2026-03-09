import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

/**
 * Hook for auth state. Re-renders on login/logout (listens to storage/loginStateChange).
 */
export function useAuth() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  useEffect(() => {
    const update = () => {
      setUser(authService.getCurrentUser());
      setIsAuthenticated(authService.isAuthenticated());
    };
    window.addEventListener('storage', update);
    window.addEventListener('loginStateChange', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('loginStateChange', update);
    };
  }, []);

  return {
    user,
    isAuthenticated,
    isBuyer: user?.role === 'BUYER',
    logout: () => authService.logout(),
  };
}

export default useAuth;
