import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      authApi.verifyToken(storedToken).then((data) => {
        if (data.user) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('auth_token');
        }
        setIsLoading(false);
      }).catch(() => {
        localStorage.removeItem('auth_token');
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    const data = await authApi.login(email, password);
    
    if (data.error) {
      setError(data.error);
      setIsLoading(false);
      throw new Error(data.error);
    }
    
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('auth_token', data.token);
    setIsLoading(false);
  };

  const register = async (email: string, name: string, password: string) => {
    setError(null);
    setIsLoading(true);
    const data = await authApi.register(email, name, password);
    
    if (data.error) {
      setError(data.error);
      setIsLoading(false);
      throw new Error(data.error);
    }
    
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('auth_token', data.token);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, error }}>
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
