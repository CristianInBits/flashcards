import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { authService } from '@/services/authService';
import type { AuthContextType, UserResponse, LoginRequest, RegisterRequest } from '@/types/auth.types';
import { AxiosError } from 'axios';

// ==========================================
// HELPER FUNCION PURA (Fuera del componente)
// ==========================================
const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as { message?: string; error?: string | Record<string, string> };
    
    if (data.message) return data.message;
    
    if (typeof data.error === 'string') return data.error;
    
    if (typeof data.error === 'object') {
        return Object.values(data.error).join(', ');
    }
  }
  return 'Ha ocurrido un error inesperado';
};

// ==========================================
// CONTEXT & PROVIDER
// ==========================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);

          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
          } catch (error) {
            console.error('Sesión inválida:', error);
            logout();
          }
        } catch (error) {
          console.error('Storage corrupto:', error);
          logout();
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, [logout]);

  const login = useCallback(async (data: LoginRequest) => {
    try {
      const response = await authService.login(data);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    isLoading,
  }), [user, token, login, register, logout, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};