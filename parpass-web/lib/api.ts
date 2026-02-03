const API_URL = 'http://localhost:3001/api';

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

export interface Review {
  id: string;
  member_first_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface CourseRating {
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

export async function getCourses(tier?: string): Promise<Course[]> {
  const url = tier ? `${API_URL}/courses?tier=${tier}` : `${API_URL}/courses`;
  const res = await fetch(url, { cache: 'no-store' });
  return res.json();
}

export async function getCourse(id: string): Promise<Course> {
  const res = await fetch(`${API_URL}/courses/${id}`, { cache: 'no-store' });
  return res.json();
}

export async function getMemberByCode(code: string): Promise<Member> {
  const res = await fetch(`${API_URL}/members/code/${code}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Member not found');
  return res.json();
}

export async function getMemberUsage(memberId: string): Promise<Usage> {
  const res = await fetch(`${API_URL}/members/${memberId}/usage`, { cache: 'no-store' });
  return res.json();
}

export async function getMemberFavorites(memberId: string): Promise<Course[]> {
  const res = await fetch(`${API_URL}/members/${memberId}/favorites`, { cache: 'no-store' });
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
    throw new Error(error.error);
  }
  return res.json();
}

export async function addFavorite(memberId: string, courseId: string) {
  const res = await fetch(`${API_URL}/members/${memberId}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ course_id: courseId }),
  });
  return res.json();
}

export async function removeFavorite(memberId: string, courseId: string) {
  const res = await fetch(`${API_URL}/members/${memberId}/favorites/${courseId}`, {
    method: 'DELETE',
  });
  return res.json();
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
  
  export async function getMemberHistory(memberId: string): Promise<Round[]> {
    const res = await fetch(`${API_URL}/members/${memberId}/history`, { cache: 'no-store' });
    return res.json();
  }
  
  export interface OverviewStats {
    active_members: string;
    total_courses: string;
    total_rounds: string;
    rounds_this_month: string;
  }
  
  export interface PopularCourse {
    id: string;
    name: string;
    city: string;
    tier_required: string;
    total_rounds: string;
    unique_members: string;
  }
  
  export interface MonthlyRounds {
    month: string;
    month_date: string;
    rounds: string;
  }
  
  export interface TierBreakdown {
    tier: string;
    rounds: string;
  }
  
  export interface TopMember {
    id: string;
    first_name: string;
    last_name: string;
    health_plan: string;
    tier: string;
    total_rounds: string;
  }
  
  export async function getOverviewStats(): Promise<OverviewStats> {
    const res = await fetch(`${API_URL}/stats/overview`, { cache: 'no-store' });
    return res.json();
  }
  
  export async function getPopularCourses(): Promise<PopularCourse[]> {
    const res = await fetch(`${API_URL}/stats/popular-courses`, { cache: 'no-store' });
    return res.json();
  }
  
  export async function getRoundsByMonth(): Promise<MonthlyRounds[]> {
    const res = await fetch(`${API_URL}/stats/rounds-by-month`, { cache: 'no-store' });
    return res.json();
  }
  
  export async function getTierBreakdown(): Promise<TierBreakdown[]> {
    const res = await fetch(`${API_URL}/stats/tier-breakdown`, { cache: 'no-store' });
    return res.json();
  }
  
  export async function getTopMembers(): Promise<TopMember[]> {
    const res = await fetch(`${API_URL}/stats/top-members`, { cache: 'no-store' });
    return res.json();
  }
  export interface RecommendedCourse extends Course {
    total_plays: string;
    unique_players: string;
    score: string;
    reason: string;
  }
  
  const ML_API_URL = 'http://localhost:3002';

  export async function getRecommendations(memberId: string): Promise<RecommendedCourse[]> {
    try {
      const res = await fetch(`${ML_API_URL}/recommendations/${memberId}`, { cache: 'no-store' });
      const data = await res.json();
      return data.recommendations;
    } catch (err) {
      // Fallback to Node API if ML API is down
      const res = await fetch(`${API_URL}/members/${memberId}/recommendations`, { cache: 'no-store' });
      return res.json();
    }
  }

  export async function getCourseReviews(courseId: string): Promise<Review[]> {
    const res = await fetch(`${API_URL}/courses/${courseId}/reviews`, { cache: 'no-store' });
    return res.json();
  }

  export async function getCourseRating(courseId: string): Promise<CourseRating> {
    const res = await fetch(`${API_URL}/courses/${courseId}/rating`, { cache: 'no-store' });
    return res.json();
  }

  export async function submitReview(
    courseId: string,
    memberId: string,
    rating: number,
    comment?: string
  ): Promise<Review> {
    const res = await fetch(`${API_URL}/courses/${courseId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id: memberId, rating, comment }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error);
    }
    return res.json();
  }
