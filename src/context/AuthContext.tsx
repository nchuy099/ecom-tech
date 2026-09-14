import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, TokenPairResponse, UserProfile } from '../types';
import { api } from '../services/api';

export const DEMO_PROFILES: Record<Role, UserProfile> = {
  CUSTOMER: {
    id: 'c1010101-0000-0000-0000-000000000001',
    email: 'customer@ecomlab.com',
    displayName: 'Nguyễn Văn An (Khách Hàng)',
    role: 'CUSTOMER',
  },
  ADMIN: {
    id: 'a2020202-0000-0000-0000-000000000002',
    email: 'admin@ecomlab.com',
    displayName: 'Lê Hoàng Admin (Quản Trị Viên)',
    role: 'ADMIN',
  },
  SHIPPER: {
    id: 's3030303-0000-0000-0000-000000000003',
    email: 'shipper@ecomlab.com',
    displayName: 'Trần Văn Tốc Độ (Shipper)',
    role: 'SHIPPER',
  },
  WAREHOUSE_STAFF: {
    id: 'w4040404-0000-0000-0000-000000000004',
    email: 'warehouse@ecomlab.com',
    displayName: 'Phạm Minh Kho (Thủ Kho)',
    role: 'WAREHOUSE_STAFF',
  },
};

interface AuthContextType {
  user: UserProfile | null;
  role: Role | 'GUEST';
  token: string | null;
  switchRole: (role: Role | 'GUEST') => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role | 'GUEST'>(() => {
    const accessToken = localStorage.getItem('ecom_access_token');
    if (!accessToken) return 'GUEST';

    const saved = localStorage.getItem('ecom_user_role') as (Role | 'GUEST');
    return saved || 'GUEST';
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const accessToken = localStorage.getItem('ecom_access_token');
    if (!accessToken) return null;
    if (role === 'GUEST') return null;
    return DEMO_PROFILES[role as Role] || DEMO_PROFILES.CUSTOMER;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('ecom_access_token');
  });

  useEffect(() => {
    const accessToken = localStorage.getItem('ecom_access_token');
    if (!accessToken) return;

    api
      .get<UserProfile>('/users/me')
      .then(profile => {
        setUser(profile);
        setRole(profile.role);
      })
      .catch(() => {
        localStorage.removeItem('ecom_access_token');
        localStorage.removeItem('ecom_refresh_token');
        setUser(null);
        setRole('GUEST');
        setToken(null);
      });
  }, []);

  const applySession = async (tokens: TokenPairResponse) => {
    localStorage.setItem('ecom_access_token', tokens.accessToken);
    localStorage.setItem('ecom_refresh_token', tokens.refreshToken);
    setToken(tokens.accessToken);

    const profile = await api.get<UserProfile>('/users/me');
    setUser(profile);
    setRole(profile.role);
    localStorage.setItem('ecom_user_role', profile.role);
  };

  const switchRole = async (newRole: Role | 'GUEST') => {
    setRole(newRole);
    localStorage.setItem('ecom_user_role', newRole);
    if (newRole === 'GUEST') {
      setUser(null);
      setToken(null);
      localStorage.removeItem('ecom_access_token');
      localStorage.removeItem('ecom_refresh_token');
      return;
    }

    const demoUser = DEMO_PROFILES[newRole];
    const tokens = await api.post<TokenPairResponse>('/auth/login', {
      email: demoUser.email,
      password: 'Demo@123456',
      deviceName: 'vite-dev-role-switcher',
    });
    await applySession(tokens);
  };

  const login = async (email: string, password: string) => {
    const tokens = await api.post<TokenPairResponse>('/auth/login', {
      email,
      password,
      deviceName: 'vite-web',
    });
    await applySession(tokens);
  };

  const register = async (displayName: string, email: string, password: string) => {
    const tokens = await api.post<TokenPairResponse>('/auth/register', {
      displayName,
      email,
      password,
      deviceName: 'vite-web',
    });
    await applySession(tokens);
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('ecom_refresh_token');
    if (refreshToken) {
      api.post<void>('/auth/logout', { refreshToken }).catch(() => undefined);
    }
    void switchRole('GUEST');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        switchRole,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
