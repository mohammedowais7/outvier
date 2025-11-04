import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { showMessage } from 'react-native-flash-message';

import { apiService } from '../services/api';
import { User, LoginCredentials, RegisterData } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      
      // Check if user data exists in AsyncStorage
      const userData = await AsyncStorage.getItem('user');
      const sessionId = await AsyncStorage.getItem('sessionId');
      
      if (userData && sessionId) {
        const parsedUser = JSON.parse(userData);
        
        // Verify session with backend
        try {
          const response = await apiService.get('/auth/me/');
          if (response.data) {
            setUser(response.data);
            await AsyncStorage.setItem('user', JSON.stringify(response.data));
          } else {
            // Session invalid, clear stored data
            await clearAuthData();
          }
        } catch (error) {
          // Session invalid, clear stored data
          await clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth state check failed:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'sessionId']);
      await SecureStore.deleteItemAsync('outvier_session');
      setUser(null);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await apiService.post('/auth/login/', credentials);
      
      if (response.data && response.data.user) {
        const { user: userData, sessionid } = response.data;
        
        // Store user data and session
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('sessionId', sessionid);
        
        // Store session in secure store for additional security
        await SecureStore.setItemAsync('outvier_session', sessionid);
        
        setUser(userData);
        
        showMessage({
          message: 'Welcome back!',
          type: 'success',
          duration: 3000,
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Login failed:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.non_field_errors?.[0] ||
                          'Login failed. Please try again.';
      
      showMessage({
        message: errorMessage,
        type: 'danger',
        duration: 4000,
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await apiService.post('/auth/register/', data);
      
      if (response.data && response.data.user) {
        const { user: userData, sessionid } = response.data;
        
        // Store user data and session
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('sessionId', sessionid);
        
        // Store session in secure store
        await SecureStore.setItemAsync('outvier_session', sessionid);
        
        setUser(userData);
        
        showMessage({
          message: 'Account created successfully!',
          type: 'success',
          duration: 3000,
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Handle validation errors from Django
      if (error.response?.data && typeof error.response.data === 'object') {
        const errors = error.response.data;
        
        // Extract field-specific errors
        const fieldErrors = Object.entries(errors).map(([field, messages]: [string, any]) => {
          if (Array.isArray(messages)) {
            return `${field}: ${messages.join(', ')}`;
          }
          return `${field}: ${messages}`;
        }).join('\n');
        
        if (fieldErrors) {
          showMessage({
            message: `Validation errors:\n${fieldErrors}`,
            type: 'danger',
            duration: 6000,
          });
        } else {
          showMessage({
            message: 'Registration failed. Please check your input and try again.',
            type: 'danger',
            duration: 4000,
          });
        }
      } else {
        const errorMessage = error.response?.data?.detail || 
                            error.response?.data?.message ||
                            'Registration failed. Please try again.';
        
        showMessage({
          message: errorMessage,
          type: 'danger',
          duration: 4000,
        });
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call logout endpoint
      try {
        await apiService.post('/auth/logout/');
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }
      
      // Clear local data
      await clearAuthData();
      
      showMessage({
        message: 'Logged out successfully',
        type: 'info',
        duration: 2000,
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      const response = await apiService.patch('/auth/profile/', data);
      
      if (response.data) {
        const updatedUser = { ...user, ...response.data };
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        showMessage({
          message: 'Profile updated successfully',
          type: 'success',
          duration: 3000,
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Profile update failed:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to update profile. Please try again.';
      
      showMessage({
        message: errorMessage,
        type: 'danger',
        duration: 4000,
      });
      
      return false;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await apiService.get('/auth/me/');
      if (response.data) {
        setUser(response.data);
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
