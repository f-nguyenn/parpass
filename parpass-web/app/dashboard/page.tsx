'use client';

import { useState, useEffect } from 'react';
import { 
  getOverviewStats, 
  getPopularCourses, 
  getRoundsByMonth,
  getTierBreakdown,
  getTopMembers,
  OverviewStats, 
  PopularCourse,
  MonthlyRounds,
  TierBreakdown,
  TopMember
} from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [popularCourses, setPopularCourses] = useState<PopularCourse[]>([]);
  const [monthlyRounds, setMonthlyRounds] = useState<MonthlyRounds[]>([]);
  const [tierBreakdown, setTierBreakdown] = useState<TierBreakdown[]>([]);
  const [topMembers, setTopMembers] = useState<TopMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [overviewData, coursesData, monthlyData, tierData, membersData] = await Promise.all([
        getOverviewStats(),
        getPopularCourses(),
        getRoundsByMonth(),
        getTierBreakdown(),
        getTopMembers()
      ]);
      
      setOverview(overviewData);
      setPopularCourses(coursesData);
      setMonthlyRounds(monthlyData);
      setTierBreakdown(tierData);
      setTopMembers(membersData);
      setLoading(false);
    }
    loadData();
  }, []);

  const maxRounds = Math.max(...popularCourses.map(c => parseInt(c.total_rounds) || 0), 1);
  const totalTierRounds = tierBreakdown.reduce((sum, t) => sum + parseInt(t.rounds), 0) || 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-gray-400" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-400 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
            </div>
            <span className="text-sm text-gray-500">ParPass Analytics</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <span className="text-lg">👥</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{overview?.active_members}</p>
            <p className="text-gray-500 text-sm mt-1">Active Members</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <span className="text-lg">⛳</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{overview?.total_courses}</p>
            <p className="text-gray-500 text-sm mt-1">Courses</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <span className="text-lg">🏌️</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{overview?.total_rounds}</p>
            <p className="text-gray-500 text-sm mt-1">Total Rounds</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <span className="text-lg">📈</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{overview?.rounds_this_month}</p>
            <p className="text-gray-500 text-sm mt-1">This Month</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Popular Courses */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Courses</h2>
            <div className="space-y-4">
              {popularCourses.slice(0, 5).map((course, index) => (
                <div key={course.id} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-400 w-4">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{course.name}</p>
                    <p className="text-sm text-gray-500">{course.city}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(parseInt(course.total_rounds) / maxRounds) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {course.total_rounds}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tier Breakdown */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage by Tier</h2>
            <div className="flex items-center justify-center py-8">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {tierBreakdown.map((tier, index) => {
                    const prevPercent = tierBreakdown
                      .slice(0, index)
                      .reduce((sum, t) => sum + (parseInt(t.rounds) / totalTierRounds) * 100, 0);
                    const percent = (parseInt(tier.rounds) / totalTierRounds) * 100;
                    const circumference = 2 * Math.PI * 40;
                    
                    return (
                      <circle
                        key={tier.tier}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={tier.tier === 'premium' ? '#8b5cf6' : '#10b981'}
                        strokeWidth="20"
                        strokeDasharray={`${(percent / 100) * circumference} ${circumference}`}
                        strokeDashoffset={`${-(prevPercent / 100) * circumference}`}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{totalTierRounds}</p>
                    <p className="text-sm text-gray-500">rounds</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6">
              {tierBreakdown.map((tier) => (
                <div key={tier.tier} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${tier.tier === 'premium' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                  <span className="text-sm text-gray-600 capitalize">{tier.tier}</span>
                  <span className="text-sm font-medium text-gray-900">{tier.rounds}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Members */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Members</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Member</th>
                  <th className="pb-3 font-medium">Health Plan</th>
                  <th className="pb-3 font-medium">Tier</th>
                  <th className="pb-3 font-medium text-right">Rounds</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="py-3">
                      <p className="font-medium text-gray-900">{member.first_name} {member.last_name}</p>
                    </td>
                    <td className="py-3">
                      <p className="text-gray-600 text-sm">{member.health_plan}</p>
                    </td>
                    <td className="py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${
                        member.tier === 'premium' 
                          ? 'bg-purple-50 text-purple-700' 
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {member.tier}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-semibold text-gray-900">{member.total_rounds}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
