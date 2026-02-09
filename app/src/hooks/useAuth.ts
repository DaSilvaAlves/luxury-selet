import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

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
  const [credentials, setCredentials] = useState<Credentials>(DEFAULT_CREDENTIALS);

  // Load credentials from Supabase
  const loadCredentials = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error loading credentials:', error);
        // If table doesn't exist or no data, seed default credentials
        if (error.code === 'PGRST116') {
          await seedDefaultCredentials();
        }
        setIsLoaded(true);
        return;
      }

      if (data) {
        setCredentials({
          username: data.username,
          password: data.password,
        });
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Seed default credentials if none exist
  const seedDefaultCredentials = async () => {
    const { error } = await supabase
      .from('credentials')
      .insert([DEFAULT_CREDENTIALS]);

    if (error && error.code !== '23505') { // Ignore unique constraint violation
      console.error('Error seeding credentials:', error);
    }
  };

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  const validateLogin = useCallback((username: string, password: string): boolean => {
    return username === credentials.username && password === credentials.password;
  }, [credentials]);

  const updateCredentials = useCallback(async (newUsername: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!newUsername || newUsername.length < 3) {
      return { success: false, message: 'O utilizador deve ter pelo menos 3 caracteres.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'A senha deve ter pelo menos 6 caracteres.' };
    }

    try {
      // Update or insert credentials (upsert)
      const { error } = await supabase
        .from('credentials')
        .update({ username: newUsername, password: newPassword })
        .eq('username', credentials.username);

      if (error) {
        console.error('Error updating credentials:', error);
        return { success: false, message: 'Erro ao guardar as credenciais.' };
      }

      setCredentials({
        username: newUsername,
        password: newPassword,
      });

      return { success: true, message: 'Credenciais atualizadas com sucesso!' };
    } catch {
      return { success: false, message: 'Erro ao guardar as credenciais.' };
    }
  }, [credentials.username]);

  const isUsingDefaultCredentials = useCallback((): boolean => {
    return credentials.username === DEFAULT_CREDENTIALS.username &&
           credentials.password === DEFAULT_CREDENTIALS.password;
  }, [credentials]);

  const getCurrentUsername = useCallback((): string => {
    return credentials.username;
  }, [credentials]);

  return {
    isLoaded,
    validateLogin,
    updateCredentials,
    isUsingDefaultCredentials,
    getCurrentUsername,
  };
}
