import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, UserProfile } from '../types';

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
  mockMode: boolean;
  setMockMode: (val: boolean) => void;
  switchRole: (role: Role | 'GUEST') => void;
  login: (email: string, role?: Role) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mockMode, setMockModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('ecom_mock_mode');
    return saved !== null ? saved === 'true' : true; // Default to true for UI-first testing
  });

  const [role, setRole] = useState<Role | 'GUEST'>(() => {
    const saved = localStorage.getItem('ecom_user_role') as (Role | 'GUEST');
    return saved || 'CUSTOMER';
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    if (role === 'GUEST') return null;
    return DEMO_PROFILES[role as Role] || DEMO_PROFILES.CUSTOMER;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('ecom_access_token') || 'demo-jwt-token-customer';
  });

  const setMockMode = (val: boolean) => {
    setMockModeState(val);
    localStorage.setItem('ecom_mock_mode', String(val));
  };

  const switchRole = (newRole: Role | 'GUEST') => {
    setRole(newRole);
    localStorage.setItem('ecom_user_role', newRole);
    if (newRole === 'GUEST') {
      setUser(null);
      setToken(null);
      localStorage.removeItem('ecom_access_token');
    } else {
      const demoUser = DEMO_PROFILES[newRole];
      setUser(demoUser);
      const demoToken = `demo-jwt-token-${newRole.toLowerCase()}`;
      setToken(demoToken);
      localStorage.setItem('ecom_access_token', demoToken);
    }
  };

  const login = async (email: string, targetRole: Role = 'CUSTOMER') => {
    // In mock mode or quick login:
    const profile = DEMO_PROFILES[targetRole];
    setUser({ ...profile, email });
    setRole(targetRole);
    const demoToken = `demo-jwt-token-${targetRole.toLowerCase()}`;
    setToken(demoToken);
    localStorage.setItem('ecom_access_token', demoToken);
    localStorage.setItem('ecom_user_role', targetRole);
  };

  const logout = () => {
    switchRole('GUEST');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        mockMode,
        setMockMode,
        switchRole,
        login,
        logout,
        isAuthenticated: !!user,
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
