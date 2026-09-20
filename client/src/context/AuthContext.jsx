import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('invoiceflow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('invoiceflow_token') || null);
  const [loading, setLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('invoiceflow_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success) {
            setUser(res.data);
            localStorage.setItem('invoiceflow_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('[Auth Error] Invalid or expired token session');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginUser = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('invoiceflow_token', res.data.token);
      localStorage.setItem('invoiceflow_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const registerUser = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('invoiceflow_token', res.data.token);
      localStorage.setItem('invoiceflow_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('invoiceflow_token');
    localStorage.removeItem('invoiceflow_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login: loginUser,
        register: registerUser,
        logout
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
