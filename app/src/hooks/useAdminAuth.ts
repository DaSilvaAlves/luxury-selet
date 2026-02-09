/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { AUTH_STORAGE_KEYS } from '@/lib/auth-constants';

interface AdminUser {
  id: string;
  username: string;
  name: string;
  auth_id?: string;
  user_id?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
        const unifiedUser: AdminUser = {
          id: parsedUser.id,
          username: parsedUser.username,
          name: parsedUser.name,
          auth_id: parsedUser.auth_id,
          user_id: parsedUser.user_id,
        };
        setUser(unifiedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing admin user:', error);
        localStorage.removeItem(AUTH_STORAGE_KEYS.ADMIN_TOKEN);
        localStorage.removeItem(AUTH_STORAGE_KEYS.ADMIN_USER);
      }
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      // FIXED: Call real API endpoint instead of mock
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        console.error('Login failed:', response.statusText);
        return false;
      }

      const data = await response.json();
      const { token, user: apiUser } = data;

      if (!token || !apiUser) {
        console.error('Invalid login response:', data);
        return false;
      }

      // FIXED: Store unified token context with both auth_id and user_id
      const unifiedUser: AdminUser = {
        id: apiUser.id,
        username: apiUser.username,
        name: apiUser.name,
        auth_id: apiUser.auth_id || apiUser.id,
        user_id: apiUser.user_id || apiUser.id,
      };

      localStorage.setItem(AUTH_STORAGE_KEYS.ADMIN_TOKEN, token);
      localStorage.setItem(AUTH_STORAGE_KEYS.ADMIN_USER, JSON.stringify(unifiedUser));

      setUser(unifiedUser);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    // FIXED: Clear localStorage on logout to prevent stale token issues
    localStorage.removeItem(AUTH_STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.ADMIN_USER);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.ADMIN_TOKEN);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // FIXED: Add method to get unified user context for API requests
  const getUnifiedUserContext = useCallback(() => {
    return {
      user_id: user?.user_id || user?.id,
      auth_id: user?.auth_id || user?.id,
    };
  }, [user]);

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    getAuthHeaders,
    getUnifiedUserContext,
  };
}
