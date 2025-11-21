'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FloatPurchaseModal from '@/components/agents/FloatPurchaseModal';

interface AgentData {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  locationCity: string;
}

interface FloatData {
  currentBalance: number;
  dailyQuotaRemaining: number;
  dailyQuotaLimit: number;
}

interface ReferralData {
  referralCode: string;
  referralsMade: number;
  bonusEarned: number;
}

interface PerformanceData {
  currentTier: string;
  tierLabel: string;
  totalRequestsCompleted: number;
}

interface EarningsData {
  completedTickets: number;
  totalEarnings: number;
  totalSpent: number;
  netEarnings: number;
  thisMonthEarnings: number;
  averagePerTicket: number;
}

interface ActivityItem {
  id: string;
  type: 'transaction' | 'ticket';
  title: string;
  description: string;
  amount?: string | number;
  date?: Date;
  icon: string;
}

export default function AgentDashboard() {
  const router = useRouter();
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [floatData, setFloatData] = useState<FloatData | null>(null);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFloatModal, setShowFloatModal] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('agentToken');
    const agentId = localStorage.getItem('agentId');
    const agentName = localStorage.getItem('agentName');

    if (!token || !agentId) {
      router.push('/agent');
      return;
    }

    // Fetch dashboard data
    const fetchData = async () => {
      try {
        const [floatRes, referralRes, perfRes, earningsRes, activityRes] = await Promise.all([
          fetch(`/api/agent/float/balance?agentId=${agentId}`),
          fetch(`/api/agent/referrals?agentId=${agentId}`),
          fetch(`/api/agent/performance?agentId=${agentId}`),
          fetch(`/api/agent/earnings?agentId=${agentId}`),
          fetch(`/api/agent/activity?agentId=${agentId}&limit=5`),
        ]);

        if (floatRes.ok) setFloatData(await floatRes.json());
        if (referralRes.ok) setReferralData(await referralRes.json());
        if (perfRes.ok) setPerformanceData(await perfRes.json());
        if (earningsRes.ok) setEarningsData(await earningsRes.json());
        if (activityRes.ok) {
          const data = await activityRes.json();
          setActivities(data.activities || []);
        }

        // Set agent data from localStorage
        if (agentName) {
          const [firstName, ...lastNameParts] = agentName.split(' ');
          setAgentData({
            id: parseInt(agentId),
            firstName,
            lastName: lastNameParts.join(' '),
            phoneNumber: localStorage.getItem('agentPhone') || '',
            locationCity: '',
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('agentToken');
    localStorage.removeItem('agentId');
    localStorage.removeItem('agentName');
    localStorage.removeItem('agentPhone');
    router.push('/agent');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!agentData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Unable to load dashboard</p>
          <button
            onClick={handleLogout}
            className="text-blue-600 hover:underline font-medium"
          >
            Go back to login
          </button>
        </div>
      </div>
    );
  }

  const handleFloatPurchaseSuccess = () => {
    // Refresh dashboard data
    const agentId = localStorage.getItem('agentId');
    if (agentId) {
      fetch(`/api/agent/float/balance?agentId=${agentId}`)
        .then(res => res.json())
        .then(data => setFloatData(data))
        .catch(err => console.error('Error refreshing float data:', err));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {showFloatModal && (
        <FloatPurchaseModal
          onClose={() => setShowFloatModal(false)}
          agentId={localStorage.getItem('agentId') || ''}
          currentBalance={floatData?.currentBalance || 0}
          onPurchaseSuccess={handleFloatPurchaseSuccess}
        />
      )}

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">InterCity Agent Portal</div>
          <div className="flex items-center gap-4">
            <span className="text-slate-600 text-sm">
              Welcome, <span className="font-semibold">{agentData.firstName}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Dashboard
            </h1>
            <p className="text-slate-600">
              Manage your agent profile, earnings, and requests
            </p>
          </div>
          <button
            onClick={() => setShowFloatModal(true)}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Buy Float
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Balance Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-slate-900">
                  {floatData?.currentBalance || 0} ZMW
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Daily Quota Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Daily Quota</p>
                <p className="text-3xl font-bold text-slate-900">
                  {floatData?.dailyQuotaRemaining || 0}/{floatData?.dailyQuotaLimit || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tier Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Current Tier</p>
                <p className="text-3xl font-bold text-slate-900 capitalize">
                  {performanceData?.tierLabel || 'Bronze'}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Referral Bonus Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Referral Bonus</p>
                <p className="text-3xl font-bold text-slate-900">
                  {referralData?.bonusEarned || 0} ZMW
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button className="bg-white rounded-lg border border-slate-200 p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">View Requests</h3>
            <p className="text-sm text-slate-600">See available booking requests</p>
          </button>

          <button className="bg-white rounded-lg border border-slate-200 p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Buy Float</h3>
            <p className="text-sm text-slate-600">Purchase more request credits</p>
          </button>

          <button className="bg-white rounded-lg border border-slate-200 p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Referrals</h3>
            <p className="text-sm text-slate-600">Share code: <span className="font-mono font-semibold text-blue-600">{referralData?.referralCode}</span></p>
          </button>
        </div>

        {/* Earnings Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-slate-900">
                  {earningsData?.totalEarnings || 0} ZMW
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  From {earningsData?.completedTickets || 0} completed tickets
                </p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-slate-900">
                  {earningsData?.thisMonthEarnings || 0} ZMW
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {new Date().toLocaleString('default', { month: 'long' })} earnings
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Average Per Ticket */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Average Per Ticket</p>
                <p className="text-3xl font-bold text-slate-900">
                  {earningsData?.averagePerTicket || 0} ZMW
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Per completed request
                </p>
              </div>
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="text-xl">{activity.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">{activity.title}</p>
                      <p className="text-sm text-slate-600 truncate">{activity.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {activity.date ? new Date(activity.date).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                    {activity.amount && (
                      <div className="text-right">
                        <p className={`font-semibold ${activity.type === 'transaction' && typeof activity.amount === 'string' ? parseFloat(activity.amount as string) > 0 ? 'text-green-600' : 'text-slate-600' : 'text-slate-600'}`}>
                          {activity.type === 'transaction' && typeof activity.amount === 'string' ? parseFloat(activity.amount as string) > 0 ? '+' : '' : ''}{activity.amount}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-center py-8">No recent activity</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-600 mb-2">Completion Rate</p>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: earningsData?.completedTickets ? Math.min((earningsData.completedTickets / 20) * 100, 100) : 0 + '%' }}
                  ></div>
                </div>
                <p className="text-sm text-slate-600 mt-1">{earningsData?.completedTickets || 0} / 20 target</p>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm font-medium text-slate-900 mb-2">Balance Health</p>
                <div className={`p-3 rounded-lg ${floatData && floatData.currentBalance > 200 ? 'bg-green-50' : floatData && floatData.currentBalance > 100 ? 'bg-yellow-50' : 'bg-orange-50'}`}>
                  <p className={`text-sm font-medium ${floatData && floatData.currentBalance > 200 ? 'text-green-700' : floatData && floatData.currentBalance > 100 ? 'text-yellow-700' : 'text-orange-700'}`}>
                    {floatData && floatData.currentBalance > 200 ? '✓ Healthy' : floatData && floatData.currentBalance > 100 ? '⚠ Good' : '⚠ Low Balance'}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm font-medium text-slate-900 mb-2">Performance Tier</p>
                <p className="text-2xl font-bold text-slate-900 capitalize">
                  {performanceData?.tierLabel || 'Bronze'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Level {performanceData?.currentTier || 'I'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
