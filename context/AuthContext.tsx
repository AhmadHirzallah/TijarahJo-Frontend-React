
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, RoleID } from '../types/api';
import { authService } from '../services/authService';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  profileImage: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (payload: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshProfileImage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfileImage = useCallback(async () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      try {
        const res = await api.get(`/users/${currentUser.userID}/images`);
        setProfileImage(res.data.primaryImageUrl || null);
      } catch (err) {
        console.error("Failed to fetch profile image", err);
        setProfileImage(null);
      }
    } else {
      setProfileImage(null);
    }
  }, []);

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      refreshProfileImage();
    }
    setLoading(false);
  }, [refreshProfileImage]);

  const login = async (payload: any) => {
    const res = await authService.login(payload);
    setUser(res.user);
    await refreshProfileImage();
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setProfileImage(null);
  };

  const isAdmin = user?.roleID === RoleID.Admin;

  return (
    <AuthContext.Provider value={{ 
      user, 
      profileImage,
      isAuthenticated: !!user, 
      isAdmin, 
      login, 
      logout, 
      loading,
      refreshProfileImage
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
