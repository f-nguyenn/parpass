'use client';

import { useState } from 'react';
import { getMemberByCode, getMemberUsage, getRecommendations, Member, Usage, RecommendedCourse } from '@/lib/api';
import Link from 'next/link';

export default function Home() {
  const [code, setCode] = useState('');
  const [member, setMember] = useState<Member | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedCourse[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const memberData = await getMemberByCode(code.toUpperCase());
      const usageData = await getMemberUsage(memberData.id);
      setMember(memberData);
      setUsage(usageData);
      localStorage.setItem('parpass_code', code.toUpperCase());
      
      // Load recommendations
      const recs = await getRecommendations(memberData.id);
      setRecommendations(recs);
    } catch (err) {
      setError('Invalid ParPass code. Try PP100001');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setMember(null);
    setUsage(null);
    setRecommendations([]);
    setCode('');
    localStorage.removeItem('parpass_code');
  };

  // Logged in view
  if (member && usage) {
    const roundsRemaining = member.monthly_rounds - usage.rounds_used;
    const progressPercent = (usage.rounds_used / member.monthly_rounds) * 100;

    return (
      <div className="min-h-screen bg-[#fafafa]">
        {/* Header */}
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold tracking-tight">ParPass</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <p className="text-gray-500 text-sm">Welcome back</p>
            <h2 className="text-3xl font-bold tracking-tight mt-1">
              {member.first_name}
            </h2>
          </div>

          {/* Membership Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/20 mb-6">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-emerald-100 text-sm font-medium">
                  {member.tier.toUpperCase()} MEMBER
                </p>
                <p className="text-white/80 text-sm mt-1">
                  {member.health_plan_name}
                </p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">⛳</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-5xl font-bold">{roundsRemaining}</span>
                <span className="text-emerald-100 text-sm mb-2">of {member.monthly_rounds} rounds left</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${100 - progressPercent}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/20">
              <p className="text-emerald-100 text-xs mb-1">Member ID</p>
              <p className="font-mono text-lg tracking-widest">{member.parpass_code}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-3">
            <Link
              href="/courses"
              className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🏌️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Find Courses</h3>
                  <p className="text-gray-500 text-sm">Browse nearby courses</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/favorites"
              className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">❤️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Favorites</h3>
                  <p className="text-gray-500 text-sm">Your saved courses</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/history"
              className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">History</h3>
                  <p className="text-gray-500 text-sm">Your recent rounds</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/dashboard"
              className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Dashboard</h3>
                  <p className="text-gray-500 text-sm">View analytics</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended for You</h3>
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-100 transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{course.name}</h4>
                        <p className="text-gray-500 text-sm">{course.city}, {course.state}</p>
                        <p className="text-emerald-600 text-sm mt-2">{course.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          course.tier_required === 'premium'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {course.tier_required}
                        </span>
                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Login view
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero section */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="max-w-sm mx-auto w-full">
          {/* Logo */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-6 shadow-lg shadow-emerald-500/30">
              <span className="text-3xl">⛳</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">ParPass</h1>
            <p className="text-gray-500 mt-2">Your golf network membership</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="PP100001"
                className="w-full px-4 py-4 bg-gray-50 border-0 rounded-xl text-center text-xl tracking-widest uppercase font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                maxLength={8}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 rounded-xl">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Continue'
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-8">
            Demo: PP100001 – PP100010
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 text-center">
        <p className="text-gray-400 text-xs">
          Golf network access through your health plan
        </p>
      </div>
    </div>
  );
}
