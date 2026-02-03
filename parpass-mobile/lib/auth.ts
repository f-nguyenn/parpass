import AsyncStorage from '@react-native-async-storage/async-storage';
import { Member, Usage, getMemberByCode, getMemberUsage } from './api';

const STORAGE_KEY = 'parpass_code';

export interface AuthState {
  member: Member | null;
  usage: Usage | null;
}

export async function getStoredCode(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export async function setStoredCode(code: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, code.toUpperCase());
}

export async function clearStoredCode(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function loadMemberFromStorage(): Promise<AuthState> {
  const code = await getStoredCode();
  if (!code) return { member: null, usage: null };

  try {
    const member = await getMemberByCode(code);
    const usage = await getMemberUsage(member.id);
    return { member, usage };
  } catch {
    await clearStoredCode();
    return { member: null, usage: null };
  }
}
