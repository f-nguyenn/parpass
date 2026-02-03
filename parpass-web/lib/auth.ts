import { Member, Usage, getMemberByCode, getMemberUsage } from './api';

export interface AuthState {
  member: Member | null;
  usage: Usage | null;
}

export function getStoredCode(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('parpass_code');
}

export function setStoredCode(code: string): void {
  localStorage.setItem('parpass_code', code.toUpperCase());
}

export function clearStoredCode(): void {
  localStorage.removeItem('parpass_code');
}

export async function loadMemberFromStorage(): Promise<AuthState> {
  const code = getStoredCode();
  if (!code) return { member: null, usage: null };
  
  try {
    const member = await getMemberByCode(code);
    const usage = await getMemberUsage(member.id);
    return { member, usage };
  } catch {
    clearStoredCode();
    return { member: null, usage: null };
  }
}
