'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket, safeStorage } from '@/services/api/api-client';

type User = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  avatar: string;
  modulosAccesibles?: string[];
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize theme safely
    const savedTheme = safeStorage.getItem('app_theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark-mode');
    }

    // Check safeStorage on load
    const storedToken = safeStorage.getItem('auth_token');
    const storedUser = safeStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
        socket.auth = { token: storedToken };
        socket.connect();
      } catch (e) {
        safeStorage.removeItem('auth_token');
        safeStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    safeStorage.setItem('auth_token', newToken);
    safeStorage.setItem('auth_user', JSON.stringify(newUser));
    socket.auth = { token: newToken };
    socket.connect();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    safeStorage.removeItem('auth_token');
    safeStorage.removeItem('auth_user');
    socket.disconnect();
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
