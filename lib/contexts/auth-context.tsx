'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Role } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  // Check if user is logged in from localStorage
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    setUser(JSON.parse(savedUser));
  } else {
    // Auto-login for development - create a mock user
    const mockUser: User = {
      id: '1',
      email: 'admin@church.com',
      name: 'Admin User',
      role: {
        name: 'SuperAdmin',
        permissions: [
          'canViewMembers',
          'canEditMembers',
          'canDeleteMembers',
          'canManageGiving',
          'canSendSMS',
          'canUploadSermons',
          'canManageBudgets',
          'canViewFinance',
          'canManageEvents',
          'canViewReports',
          'canManageRoles',
          'canManageUsers',
          'canViewAuditLogs',
          'canExportData'
        ]
      },
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  }
  setLoading(false);
}, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data with role and permissions
      const mockUser: User = {
        id: '1',
        email,
        name: 'Admin User',
        role: {
          name: 'SuperAdmin',
          permissions: [
            'canViewMembers',
            'canEditMembers',
            'canDeleteMembers',
            'canManageGiving',
            'canSendSMS',
            'canUploadSermons',
            'canManageBudgets',
            'canViewFinance',
            'canManageEvents',
            'canViewReports',
            'canManageRoles',
            'canManageUsers',
            'canViewAuditLogs',
            'canExportData'
          ]
        },
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasPermission = (permission: string): boolean => {
    return user?.role?.permissions?.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    return user?.role?.name === role;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      hasPermission, 
      hasRole 
    }}>
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