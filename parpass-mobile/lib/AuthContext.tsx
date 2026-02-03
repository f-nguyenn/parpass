import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, loadMemberFromStorage, setStoredCode, clearStoredCode } from './auth';
import { getMemberByCode, getMemberUsage, Member } from './api';

interface AuthContextType extends AuthState {
  loading: boolean;
  login: (code: string) => Promise<Member>;
  logout: () => Promise<void>;
  refreshUsage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<AuthState['member']>(null);
  const [usage, setUsage] = useState<AuthState['usage']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemberFromStorage().then((auth) => {
      setMember(auth.member);
      setUsage(auth.usage);
      setLoading(false);
    });
  }, []);

  const login = async (code: string): Promise<Member> => {
    const memberData = await getMemberByCode(code);
    const usageData = await getMemberUsage(memberData.id);
    await setStoredCode(code);
    setMember(memberData);
    setUsage(usageData);
    return memberData;
  };

  const logout = async () => {
    await clearStoredCode();
    setMember(null);
    setUsage(null);
  };

  const refreshUsage = async () => {
    if (member) {
      const usageData = await getMemberUsage(member.id);
      setUsage(usageData);
    }
  };

  return (
    <AuthContext.Provider value={{ member, usage, loading, login, logout, refreshUsage }}>
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
