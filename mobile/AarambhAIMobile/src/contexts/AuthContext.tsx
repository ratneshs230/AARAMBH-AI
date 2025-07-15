import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';
import { STORAGE_KEYS } from '../constants';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  role?: 'student' | 'teacher' | 'parent';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Validate token with backend
        try {
          const response = await apiService.get('/auth/verify');
          if (response.success) {
            // Token is valid, update user data if provided
            if (response.data?.user) {
              setUser(response.data.user);
              await AsyncStorage.setItem(
                STORAGE_KEYS.USER_DATA, 
                JSON.stringify(response.data.user)
              );
            }
          } else {
            // Token is invalid, clear auth data
            await clearAuthData();
          }
        } catch (error) {
          console.warn('Token validation failed:', error);
          await clearAuthData();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      setUser(null);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiService.post('/auth/login', {
        email,
        password,
      });

      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        
        // Store auth data
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        
        setUser(userData);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      const response = await apiService.post('/auth/register', {
        ...userData,
        role: userData.role || 'student',
      });

      if (response.success && response.data) {
        const { token, user: newUser } = response.data;
        
        // Store auth data
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUser));
        
        setUser(newUser);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Notify backend about logout
      try {
        await apiService.post('/auth/logout');
      } catch (error) {
        console.warn('Backend logout failed:', error);
      }
      
      // Clear local auth data
      await clearAuthData();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local data
      await clearAuthData();
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      const response = await apiService.put('/users/profile', userData);

      if (response.success && response.data) {
        const updatedUser = { ...user, ...response.data };
        
        // Update stored user data
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Update user error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const response = await apiService.post('/auth/refresh');

      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        
        // Update stored auth data
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        if (userData) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
          setUser(userData);
        }
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error: any) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      await logout();
      throw new Error(error.message || 'Token refresh failed');
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};