'use client';

import { useState, useEffect } from 'react';
import { getMemberFavorites, removeFavorite, Course } from '@/lib/api';
import { loadMemberFromStorage, AuthState } from '@/lib/auth';
import Link from 'next/link';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthState>({ member: null, usage: null });

  useEffect(() => {
    async function loadData() {
      const authState = await loadMemberFromStorage();
      setAuth(authState);

      if (authState.member) {
        const favs = await getMemberFavorites(authState.member.id);
        setFavorites(favs);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleRemove = async (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!auth.member) return;

    setFavorites(prev => prev.filter(c => c.id !== courseId));
    
    try {
      await removeFavorite(auth.member.id, courseId);
    } catch {
      // Reload on error
      const favs = await getMemberFavorites(auth.member.id);
      setFavorites(favs);
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
            <h1 className="text-xl font-semibold tracking-tight">Favorites</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-gray-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : !auth.member ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Sign in required</h2>
            <p className="text-gray-500 mb-6">Please sign in to view your favorites</p>
            <Link
              href="/"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800"
            >
              Sign In
            </Link>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❤️</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h2>
            <p className="text-gray-500 mb-6">Save courses you love for quick access</p>
            <Link
              href="/courses"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-4">{favorites.length} saved courses</p>
            <div className="space-y-3">
              {favorites.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-100 transition-all"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{course.name}</h3>
                      <p className="text-gray-500 text-sm">
                        {course.city}, {course.state}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
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
                      <button
                        onClick={(e) => handleRemove(e, course.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors group"
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform">❤️</span>
                      </button>
                      <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
