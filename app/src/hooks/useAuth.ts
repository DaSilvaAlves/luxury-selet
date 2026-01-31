import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'luxury-selet-admin-credentials';

interface Credentials {
  username: string;
  password: string;
}

const DEFAULT_CREDENTIALS: Credentials = {
  username: 'admin',
  password: 'admin123',
};

export function useAuth() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const getCredentials = useCallback((): Credentials => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
    return DEFAULT_CREDENTIALS;
  }, []);

  const validateLogin = useCallback((username: string, password: string): boolean => {
    const credentials = getCredentials();
    return username === credentials.username && password === credentials.password;
  }, [getCredentials]);

  const updateCredentials = useCallback((newUsername: string, newPassword: string): { success: boolean; message: string } => {
    if (!newUsername || newUsername.length < 3) {
      return { success: false, message: 'O utilizador deve ter pelo menos 3 caracteres.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'A senha deve ter pelo menos 6 caracteres.' };
    }

    try {
      const newCredentials: Credentials = {
        username: newUsername,
        password: newPassword,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCredentials));
      return { success: true, message: 'Credenciais atualizadas com sucesso!' };
    } catch (error) {
      return { success: false, message: 'Erro ao guardar as credenciais.' };
    }
  }, []);

  const isUsingDefaultCredentials = useCallback((): boolean => {
    const credentials = getCredentials();
    return credentials.username === DEFAULT_CREDENTIALS.username &&
           credentials.password === DEFAULT_CREDENTIALS.password;
  }, [getCredentials]);

  const getCurrentUsername = useCallback((): string => {
    return getCredentials().username;
  }, [getCredentials]);

  return {
    isLoaded,
    validateLogin,
    updateCredentials,
    isUsingDefaultCredentials,
    getCurrentUsername,
  };
}
