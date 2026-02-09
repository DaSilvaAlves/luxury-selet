import { useState, useEffect, useCallback } from 'react';
import { AUTH_STORAGE_KEYS } from '@/lib/auth-constants';

interface AdminUser {
  id: string;
  username: string;
  name: string;
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.ADMIN_TOKEN);
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.ADMIN_USER);
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing admin user:', error);
        logout();
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      // Em produção, fazer chamada à API
      // const response = await fetch('/api/admin/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, password }),
      // });
      
      // Mock login for demonstration
      if (username === 'admin' && password === 'admin123') {
        const mockUser: AdminUser = {
          id: 'admin-1',
          username: 'admin',
          name: 'Administrador',
        };
        const mockToken = 'mock-jwt-token';
        
        localStorage.setItem(AUTH_STORAGE_KEYS.ADMIN_TOKEN, mockToken);
        localStorage.setItem(AUTH_STORAGE_KEYS.ADMIN_USER, JSON.stringify(mockUser));
        
        setUser(mockUser);
        setIsAuthenticated(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.ADMIN_USER);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.ADMIN_TOKEN);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    getAuthHeaders,
  };
}
