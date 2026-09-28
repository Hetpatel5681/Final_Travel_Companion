import { createContext, useState, useEffect, ReactNode } from 'react';
import { getProfile } from '@/features/profile/api/profile.api';

export interface User {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to decode token and check expiration
const isTokenValid = (token: string): boolean => {
  if (!token) return false;
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return false;
    let validBase64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    while (validBase64.length % 4) {
       validBase64 += '=';
    }
    const decodedJson = atob(validBase64);
    const payload = JSON.parse(decodedJson);
    const exp = payload.exp;
    if (!exp) return true; // If no exp in token, assume valid
    return exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    
    // On load, validate JWT presence and expiration
    if (storedToken && isTokenValid(storedToken)) {
      setToken(storedToken);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse stored user", e);
        }
      }
      
      // Hydrate actual profile from backend if valid to bypass outdated local storage data
      getProfile().then((userData) => {
         setUser(userData);
         localStorage.setItem('user', JSON.stringify(userData));
      }).catch((e) => {
         console.error("Failed to fetch fresh user profile", e);
      });
      
    } else {
      // If token is missing or invalid, clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setIsInitializing(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };
  
  const updateUser = (updatedFields: Partial<User>) => {
    if (!user) return;
    const nextUser = { ...user, ...updatedFields };
    setUser(nextUser);
    localStorage.setItem('user', JSON.stringify(nextUser));
  };

  if (isInitializing) {
    return null;
  }

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
