import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Store, Subscription } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  store: Store | null;
  subscription: Subscription | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string, role?: 'customer' | 'seller') => Promise<boolean>;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
  updateStore: (updatedStore: Store) => void;
  updateSubscription: (updatedSub: Subscription) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const reloadUser = async () => {
    try {
      const data = await api.auth.getMe();
      if (data.success && data.user) {
        setUser(data.user);
        setStore(data.store || null);
        setSubscription(data.subscription || null);
      } else {
        setUser(null);
        setStore(null);
        setSubscription(null);
      }
    } catch {
      setUser(null);
      setStore(null);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadUser();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.auth.login({ email, password: pass });
      if (res.success) {
        if (res.token) {
          localStorage.setItem('vyapora_token', res.token);
          localStorage.setItem('ejan_token', res.token);
          localStorage.setItem('nexora_token', res.token);
        }
        setUser(res.user);
        setStore(res.store || null);
        setSubscription(res.subscription || null);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
      return false;
    }
  };

  const register = async (name: string, email: string, pass: string, role: 'customer' | 'seller' = 'customer'): Promise<boolean> => {
    try {
      const res = await api.auth.register({ name, email, password: pass, role });
      if (res.success) {
        if (res.token) {
          localStorage.setItem('vyapora_token', res.token);
          localStorage.setItem('ejan_token', res.token);
          localStorage.setItem('nexora_token', res.token);
        }
        await reloadUser();
        showToast('Account registered successfully!', 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Registration failed.', 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('vyapora_token');
      localStorage.removeItem('ejan_token');
      localStorage.removeItem('nexora_token');
      setUser(null);
      setStore(null);
      setSubscription(null);
      showToast('Logged out securely.', 'info');
    }
  };

  const updateUser = (u: User) => setUser(u);
  const updateStore = (s: Store) => setStore(s);
  const updateSubscription = (sub: Subscription) => setSubscription(sub);

  return (
    <AuthContext.Provider
      value={{
        user,
        store,
        subscription,
        loading,
        login,
        register,
        logout,
        reloadUser,
        updateUser,
        updateStore,
        updateSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
