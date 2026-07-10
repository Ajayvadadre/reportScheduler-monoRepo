import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

interface UserProfile {
  email: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginUser: (userProfile: UserProfile, rememberMe: boolean) => void;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_USER_KEY = 'authUser';
const REMEMBERED_EMAIL_KEY = 'rememberedEmail';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  const loginUser = (userProfile: UserProfile, rememberMe: boolean) => {
    setUser(userProfile);

    sessionStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_USER_KEY);

    if (rememberMe) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userProfile));
      localStorage.setItem(REMEMBERED_EMAIL_KEY, userProfile.email);
    } else {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(userProfile));
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
  };

  const logoutUser = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.log("Logout endpoint not available or failed", error);
    } finally {
      setUser(null);
      localStorage.removeItem(AUTH_USER_KEY);
      sessionStorage.removeItem(AUTH_USER_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
