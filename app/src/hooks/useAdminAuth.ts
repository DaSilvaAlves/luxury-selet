import { useState, useEffect, useCallback } from 'react';

interface AdminUser {
  id: string;
  username: string;
  name: string;
}

const ADMIN_TOKEN_KEY = 'oboticario-admin-token';
const ADMIN_USER_KEY = 'oboticario-admin-user';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const storedUser = localStorage.getItem(ADMIN_USER_KEY);
    
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
        
        localStorage.setItem(ADMIN_TOKEN_KEY, mockToken);
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(mockUser));
        
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
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
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
