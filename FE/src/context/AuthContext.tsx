import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User, remember?: boolean) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredAuth(): { token: string | null; user: User | null } {
  try {
    const sessionToken = sessionStorage.getItem('token');
    const sessionUser = sessionStorage.getItem('user');
    if (sessionToken && sessionUser) {
      return { token: sessionToken, user: JSON.parse(sessionUser) };
    }

    const localToken = localStorage.getItem('token');
    const localUser = localStorage.getItem('user');
    if (localToken && localUser) {
      return { token: localToken, user: JSON.parse(localUser) };
    }
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = readStoredAuth();
  const [user, setUser] = useState<User | null>(stored.user);
  const [token, setToken] = useState<string | null>(stored.token);
  const [isLoading] = useState(false);

  const clearAuthStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  const login = (newToken: string, newUser: User, remember = true) => {
    setToken(newToken);
    setUser(newUser);
    clearAuthStorage();

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('token', newToken);
    storage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearAuthStorage();
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    const serialized = JSON.stringify(updatedUser);
    if (localStorage.getItem('token')) {
      localStorage.setItem('user', serialized);
    }
    if (sessionStorage.getItem('token')) {
      sessionStorage.setItem('user', serialized);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
