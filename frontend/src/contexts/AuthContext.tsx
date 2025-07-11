import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  bio?: string;
  storeName?: string;
  avatar?: string;
  joinedDate?: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  refreshUser: () => void;
  clearError: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  storeName?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing auth token on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Checking authentication...');
      const token = localStorage.getItem('authToken');
      console.log('Token exists:', !!token);
      
      if (token) {
        try {
          console.log('🔄 Fetching current user...');
          const response = await authAPI.getCurrentUser();
          const userData = response.data.user;
          console.log('✅ User data received:', userData);
          
          // Convert backend snake_case to frontend camelCase
          const convertedUser = {
            ...userData,
            storeName: userData.store_name,
            id: userData.id.toString()
          };
          console.log('✅ Setting user:', convertedUser);
          setUser(convertedUser);
        } catch (err) {
          console.error('❌ Failed to get current user:', err);
          localStorage.removeItem('authToken');
          setUser(null);
        }
      } else {
        console.log('❌ No token found, user not authenticated');
        setUser(null);
      }
      
      // Add a small delay to prevent rapid re-renders
      setTimeout(() => {
        console.log('🏁 Setting loading to false');
        setLoading(false);
      }, 100);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.signIn({ email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('authToken', token);
      // Convert backend snake_case to frontend camelCase
      setUser({
        ...userData,
        storeName: userData.store_name,
        id: userData.id.toString()
      });
      return true;
    } catch (err: any) {
      console.error('Login failed:', err);
      const errorMessage = err.response?.data?.error || 
                          (err.response?.data?.errors && err.response.data.errors.join(', ')) ||
                          'Login failed. Please check your credentials.';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.signUp(userData);
      const { token, user: newUser } = response.data;
      
      localStorage.setItem('authToken', token);
      // Convert backend snake_case to frontend camelCase
      setUser({
        ...newUser,
        storeName: newUser.store_name,
        id: newUser.id.toString()
      });
      return true;
    } catch (err: any) {
      console.error('Registration failed:', err);
      const errorMessage = err.response?.data?.error || 
                          (err.response?.data?.errors && err.response.data.errors.join(', ')) ||
                          'Registration failed. Please try again.';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
      setError(null);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare data for API (convert camelCase to snake_case)
      const apiData = {
        name: userData.name,
        email: userData.email,
        storeName: userData.storeName
      };
      
      const response = await authAPI.updateProfile(apiData);
      const updatedUser = response.data.user;
      
      // Convert backend snake_case to frontend camelCase
      setUser({
        ...updatedUser,
        storeName: updatedUser.store_name,
        id: updatedUser.id.toString()
      });
      
      return true;
    } catch (err: any) {
      console.error('Profile update failed:', err);
      const errorMessage = err.response?.data?.error || 
                          (err.response?.data?.errors && err.response.data.errors.join(', ')) ||
                          'Failed to update profile. Please try again.';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
    } catch (err) {
      console.error('Failed to refresh user:', err);
      // If refresh fails, user might be logged out
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Compute isAuthenticated based on both user and token
  const isAuthenticated = !!user && !!localStorage.getItem('authToken');

  console.log('🔐 AuthContext state:', { 
    user: !!user, 
    token: !!localStorage.getItem('authToken'), 
    isAuthenticated, 
    loading 
  });

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      error,
      login,
      register,
      logout,
      updateProfile,
      refreshUser,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};