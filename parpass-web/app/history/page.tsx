'use client';

import { useState, useEffect } from 'react';
import { getMemberHistory, Round } from '@/lib/api';
import { loadMemberFromStorage, AuthState } from '@/lib/auth';
import Link from 'next/link';

export default function HistoryPage() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthState>({ member: null, usage: null });

  useEffect(() => {
    async function loadData() {
      const authState = await loadMemberFromStorage();
      setAuth(authState);

      if (authState.member) {
        const history = await getMemberHistory(authState.member.id);
        setRounds(history);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Group rounds by month
  const groupedRounds = rounds.reduce((groups, round) => {
    const date = new Date(round.checked_in_at);
    const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(round);
    return groups;
  }, {} as Record<string, Round[]>);

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
            <h1 className="text-xl font-semibold tracking-tight">History</h1>
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
            <p className="text-gray-500 mb-6">Please sign in to view your history</p>
            <Link
              href="/"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800"
            >
              Sign In
            </Link>
          </div>
        ) : rounds.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏌️</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No rounds yet</h2>
            <p className="text-gray-500 mb-6">Your golf rounds will appear here</p>
            <Link
              href="/courses"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800"
            >
              Find a Course
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Total Rounds</p>
                  <p className="text-3xl font-bold text-gray-900">{rounds.length}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Courses Played</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {new Set(rounds.map(r => r.course_name)).size}
                  </p>
                </div>
              </div>
            </div>

            {/* Grouped Rounds */}
            {Object.entries(groupedRounds).map(([month, monthRounds]) => (
              <div key={month} className="mb-6">
                <h2 className="text-sm font-medium text-gray-500 mb-3">{month}</h2>
                <div className="space-y-3">
                  {monthRounds.map((round) => (
                    <div
                      key={round.id}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex flex-col items-center justify-center">
                            <span className="text-xs font-medium text-emerald-600">
                              {formatDate(round.checked_in_at).split(' ')[0]}
                            </span>
                            <span className="text-lg font-bold text-emerald-700">
                              {formatDate(round.checked_in_at).split(' ')[1]}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{round.course_name}</h3>
                            <p className="text-gray-500 text-sm">{round.city}, {round.state}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          round.tier_required === 'premium'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {round.holes_played}h
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
