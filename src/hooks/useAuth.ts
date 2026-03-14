// src/hooks/useAuth.ts

import { useState, useCallback, useEffect } from 'react';
import { db } from '../db/db';
import type { User } from '../types';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AUTH_STORAGE_KEY = 'kitesurf_auth_userId';

function getStoredUserId(): number | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  const parsed = Number(stored);
  return Number.isNaN(parsed) ? null : parsed;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadUser() {
      const userId = getStoredUserId();
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const foundUser = await db.users.get(userId);
        if (foundUser && foundUser.isActive === 1) {
          setUser(foundUser);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load user'));
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const foundUser = await db.users
        .where('email')
        .equals(email)
        .first();

      if (!foundUser) {
        throw new Error('Email ou mot de passe incorrect');
      }

      if (foundUser.password !== password) {
        throw new Error('Email ou mot de passe incorrect');
      }

      if (foundUser.isActive !== 1) {
        throw new Error('Compte désactivé');
      }

      setUser(foundUser);
      localStorage.setItem(AUTH_STORAGE_KEY, String(foundUser.id));
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Login failed');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const isAuthenticated = user !== null;

  return { user, isLoading, error, login, logout, isAuthenticated };
}
