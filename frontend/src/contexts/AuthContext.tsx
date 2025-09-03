"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService, User } from '@/services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: 'admin' | 'editor' | 'viewer') => Promise<void>;
  logout: () => void;
  resetPassword: (password: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = apiService.isAuthenticated() && user !== null;

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (apiService.isAuthenticated()) {
        const currentUser = await apiService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      apiService.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await apiService.login({ username: email, password });
      const currentUser = await apiService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, role: 'admin' | 'editor' | 'viewer' = 'viewer') => {
    try {
      const newUser = await apiService.register({ email, password, role });
      // After registration, log in the user
      await login(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    apiService.logout();
  };

  const resetPassword = async (password: string) => {
    try {
      await apiService.resetPassword(password);
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        resetPassword,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}