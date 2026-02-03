import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'parpass_onboarding';
const SURVEY_KEY = 'parpass_survey';

export interface SurveyData {
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | null;
  goals: string[];
  playFrequency: 'weekly' | 'biweekly' | 'monthly' | 'occasionally' | null;
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'flexible' | null;
  interests: string[];
  notificationsEnabled: boolean;
}

export const defaultSurveyData: SurveyData = {
  skillLevel: null,
  goals: [],
  playFrequency: null,
  preferredTime: null,
  interests: [],
  notificationsEnabled: false,
};

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}

export async function getSurveyData(): Promise<SurveyData | null> {
  try {
    const value = await AsyncStorage.getItem(SURVEY_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export async function saveSurveyData(data: SurveyData): Promise<void> {
  await AsyncStorage.setItem(SURVEY_KEY, JSON.stringify(data));
}

export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.multiRemove([ONBOARDING_KEY, SURVEY_KEY]);
}

export const SKILL_LEVELS = [
  { id: 'beginner', label: 'Beginner', description: 'Just getting started', icon: '🌱' },
  { id: 'intermediate', label: 'Intermediate', description: 'Know the basics', icon: '⭐' },
  { id: 'advanced', label: 'Advanced', description: 'Experienced player', icon: '🏆' },
] as const;

export const GOALS = [
  { id: 'improve', label: 'Improve my game', icon: '📈' },
  { id: 'exercise', label: 'Stay active & healthy', icon: '💪' },
  { id: 'social', label: 'Meet other golfers', icon: '👥' },
  { id: 'relax', label: 'Relax & unwind', icon: '🧘' },
  { id: 'compete', label: 'Compete & win', icon: '🥇' },
  { id: 'explore', label: 'Try new courses', icon: '🗺️' },
] as const;

export const PLAY_FREQUENCIES = [
  { id: 'weekly', label: 'Weekly', description: 'Once a week or more' },
  { id: 'biweekly', label: 'Bi-weekly', description: 'Every two weeks' },
  { id: 'monthly', label: 'Monthly', description: 'A few times a month' },
  { id: 'occasionally', label: 'Occasionally', description: 'When I find time' },
] as const;

export const PREFERRED_TIMES = [
  { id: 'morning', label: 'Morning', description: 'Early bird tee times', icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon', description: 'Midday rounds', icon: '☀️' },
  { id: 'evening', label: 'Evening', description: 'Twilight golf', icon: '🌆' },
  { id: 'flexible', label: 'Flexible', description: 'Any time works', icon: '🕐' },
] as const;

export const INTERESTS = [
  { id: 'tournaments', label: 'Tournaments', icon: '🏆' },
  { id: 'lessons', label: 'Lessons & tips', icon: '📚' },
  { id: 'deals', label: 'Deals & discounts', icon: '💰' },
  { id: 'events', label: 'Social events', icon: '🎉' },
  { id: 'gear', label: 'Equipment & gear', icon: '🏌️' },
  { id: 'news', label: 'Golf news', icon: '📰' },
] as const;
