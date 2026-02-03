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
