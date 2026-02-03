'use client';

import { useState, useEffect } from 'react';
import { getCourses, getMemberFavorites, addFavorite, removeFavorite, Course } from '@/lib/api';
import { loadMemberFromStorage, AuthState } from '@/lib/auth';
import Link from 'next/link';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthState>({ member: null, usage: null });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      const authState = await loadMemberFromStorage();
      setAuth(authState);
      
      const tier = filter === 'all' ? undefined : filter;
      const coursesData = await getCourses(tier);
      setCourses(coursesData);
      
      if (authState.member) {
        const favs = await getMemberFavorites(authState.member.id);
        setFavorites(new Set(favs.map(f => f.id)));
      }
      
      setLoading(false);
    }
    loadData();
  }, [filter]);

  const toggleFavorite = async (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!auth.member) return;
    
    const isFav = favorites.has(courseId);
    
    setFavorites(prev => {
      const next = new Set(prev);
      if (isFav) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
    
    try {
      if (isFav) {
        await removeFavorite(auth.member.id, courseId);
      } else {
        await addFavorite(auth.member.id, courseId);
      }
    } catch (err) {
      setFavorites(prev => {
        const next = new Set(prev);
        if (isFav) {
          next.add(courseId);
        } else {
          next.delete(courseId);
        }
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold tracking-tight">Courses</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6">
        {/* Filter Pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'core', 'premium'].map((tier) => (
            <button
              key={tier}
              onClick={() => setFilter(tier)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === tier
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tier === 'all' ? 'All Courses' : tier.charAt(0).toUpperCase() + tier.slice(1)}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-gray-500 text-sm mb-4">{courses.length} courses available</p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-gray-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-100 transition-all"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{course.name}</h3>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {course.city}, {course.state}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      {course.average_rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm font-medium text-gray-700">{course.average_rating}</span>
                          <span className="text-gray-400 text-sm">({course.review_count})</span>
                        </div>
                      )}
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        course.tier_required === 'premium'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {course.tier_required}
                      </span>
                      <span className="text-gray-400 text-sm">{course.holes} holes</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {auth.member && (
                      <button
                        onClick={(e) => toggleFavorite(e, course.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                      >
                        {favorites.has(course.id) ? (
                          <span className="text-xl">❤️</span>
                        ) : (
                          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        )}
                      </button>
                    )}
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
