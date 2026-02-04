// Change this to your computer's local IP when testing on a physical device
// Use 'localhost' for iOS simulator, '10.0.2.2' for Android emulator
const API_URL = 'http://192.168.0.16:3001/api';

export interface Course {
  id: string;
  name: string;
  city: string;
  state: string;
  zip: string;
  holes: number;
  tier_required: 'core' | 'premium';
  phone: string;
  latitude: string;
  longitude: string;
  average_rating: number | null;
  review_count: number;
}

export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  parpass_code: string;
  status: string;
  health_plan_name: string;
  tier: 'core' | 'premium';
  monthly_rounds: number;
}

export interface Usage {
  rounds_used: number;
}

export interface Round {
  id: string;
  checked_in_at: string;
  holes_played: number;
  course_name: string;
  city: string;
  state: string;
  tier_required: 'core' | 'premium';
}

export async function getCourses(tier?: string): Promise<Course[]> {
  const url = tier ? `${API_URL}/courses?tier=${tier}` : `${API_URL}/courses`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch courses');
  return res.json();
}

export async function getCourse(id: string): Promise<Course> {
  const res = await fetch(`${API_URL}/courses/${id}`);
  if (!res.ok) throw new Error('Failed to fetch course');
  return res.json();
}

export async function getMemberByCode(code: string): Promise<Member> {
  const res = await fetch(`${API_URL}/members/code/${code}`);
  if (!res.ok) throw new Error('Member not found');
  return res.json();
}

export async function getMemberUsage(memberId: string): Promise<Usage> {
  const res = await fetch(`${API_URL}/members/${memberId}/usage`);
  if (!res.ok) throw new Error('Failed to fetch usage');
  return res.json();
}

export async function getMemberHistory(memberId: string): Promise<Round[]> {
  const res = await fetch(`${API_URL}/members/${memberId}/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function checkIn(memberId: string, courseId: string, holesPlayed: number = 18) {
  const res = await fetch(`${API_URL}/check-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_id: memberId, course_id: courseId, holes_played: holesPlayed }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Check-in failed');
  }
  return res.json();
}

// Member Preferences / Survey API

export interface MemberPreferences {
  id: string;
  member_id: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | null;
  goals: string[];
  play_frequency: 'weekly' | 'biweekly' | 'monthly' | 'occasionally' | null;
  preferred_time: 'morning' | 'afternoon' | 'evening' | 'flexible' | null;
  interests: string[];
  notifications_enabled: boolean;
  push_token: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreferencesInput {
  skill_level?: string | null;
  goals?: string[];
  play_frequency?: string | null;
  preferred_time?: string | null;
  interests?: string[];
  notifications_enabled?: boolean;
  push_token?: string | null;
}

export async function getMemberPreferences(memberId: string): Promise<MemberPreferences | null> {
  const res = await fetch(`${API_URL}/members/${memberId}/preferences`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch preferences');
  return res.json();
}

export async function saveMemberPreferences(memberId: string, preferences: PreferencesInput): Promise<MemberPreferences> {
  const res = await fetch(`${API_URL}/members/${memberId}/preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
  if (!res.ok) throw new Error('Failed to save preferences');
  return res.json();
}

export async function getOnboardingStatus(memberId: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/members/${memberId}/preferences/onboarding-status`);
  if (!res.ok) return false;
  const data = await res.json();
  return data.completed;
}

// Clustering & Recommendations API

export interface ClusterInfo {
  clusterId: number;
  clusterName: string;
  description: string;
  updatedAt: string | null;
  profile: {
    skillLevel: string | null;
    handicap: string | null;
    budgetPreference: string | null;
    goals: string[] | null;
  };
}

export interface RecommendedCourse {
  id: string;
  name: string;
  city: string;
  state: string;
  difficulty: string;
  course_type: string;
  price_range: string;
  tier_required: string;
  course_rating: string;
  slope_rating: number;
  has_driving_range: boolean;
  has_restaurant: boolean;
  walking_friendly: boolean;
  avg_rating: string;
  review_count: string;
  reason: string;
}

export interface ClusterRecommendations {
  memberId: string;
  cluster: {
    id: number;
    name: string;
  };
  recommendations: RecommendedCourse[];
}

export interface SimilarMember {
  id: string;
  first_name: string;
  skill_level: string;
  handicap: string;
  total_rounds: string;
}

export interface SimilarMembersResponse {
  clusterId: number;
  clusterName: string;
  similarMembers: SimilarMember[];
}

export async function getMemberCluster(memberId: string): Promise<ClusterInfo | null> {
  const res = await fetch(`${API_URL}/members/${memberId}/cluster`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch cluster info');
  return res.json();
}

export async function getClusterRecommendations(memberId: string, limit: number = 5): Promise<ClusterRecommendations> {
  const res = await fetch(`${API_URL}/members/${memberId}/recommendations/cluster?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function getSimilarMembers(memberId: string, limit: number = 5): Promise<SimilarMembersResponse> {
  const res = await fetch(`${API_URL}/members/${memberId}/similar?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch similar members');
  return res.json();
}
