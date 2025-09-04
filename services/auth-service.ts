import apiClient from './api-client';
import { User, LoginCredentials, RegisterData } from '@/lib/types';

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginResponse {
  success: boolean;
  data: AuthResponse;
  message?: string;
}

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { user, token } = response.data;
      
      // Store tokens and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as AuthResponse,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  }

  // Register new user
  async register(userData: RegisterData): Promise<LoginResponse> {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const { user, token } = response.data;
      
      // Store tokens and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as AuthResponse,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedCurrency');
    }
  }

  // Refresh token
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await apiClient.post('/auth/refresh', {
        refreshToken,
      });
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user failed:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User | null> {
    try {
      const response = await apiClient.put('/auth/profile', userData);
      const updatedUser = response.data;
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  }

  // Change password
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<boolean> {
    try {
      await apiClient.put('/auth/change-password', passwordData);
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<boolean> {
    try {
      await apiClient.post('/auth/forgot-password', { email });
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
      });
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Get stored user data
  getStoredUser(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
}

export default new AuthService(); 