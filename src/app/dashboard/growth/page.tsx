'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Agent {
  id: number;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: Date;
}

interface GrowthMetric {
  totalAgents: number;
  approvedAgents: number;
  totalRequestsProcessed: number;
  totalRevenueGenerated: number;
  averageEarningsPerAgent: number;
  agentChurn: number;
}

export default function GrowthPage() {
  const [metrics, setMetrics] = useState<GrowthMetric>({
    totalAgents: 0,
    approvedAgents: 0,
    totalRequestsProcessed: 0,
    totalRevenueGenerated: 0,
    averageEarningsPerAgent: 0,
    agentChurn: 0,
  });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrowthData();
  }, []);

  const fetchGrowthData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      setAgents(data);

      // Calculate metrics
      const approved = data.filter((a: Agent) => a.status === 'approved').length;
      setMetrics({
        totalAgents: data.length,
        approvedAgents: approved,
        totalRequestsProcessed: Math.floor(Math.random() * 1000), // Mock data
        totalRevenueGenerated: Math.floor(Math.random() * 50000),
        averageEarningsPerAgent: Math.floor(Math.random() * 5000),
        agentChurn: Math.floor(Math.random() * 5),
      });
    } catch (error) {
      console.error('Error fetching growth data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Growth & Analytics</h1>
        <p className="text-slate-600 mt-1">Monitor agent growth, referrals, and performance incentives</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <label className="text-xs font-medium text-slate-500 uppercase">Total Agents</label>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.totalAgents}</p>
          <p className="text-xs text-slate-600 mt-1">Active & pending</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <label className="text-xs font-medium text-slate-500 uppercase">Approved</label>
          <p className="text-2xl font-bold text-green-600 mt-2">{metrics.approvedAgents}</p>
          <p className="text-xs text-slate-600 mt-1">Earning agents</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <label className="text-xs font-medium text-slate-500 uppercase">Requests</label>
          <p className="text-2xl font-bold text-blue-600 mt-2">{metrics.totalRequestsProcessed}</p>
          <p className="text-xs text-slate-600 mt-1">This month</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <label className="text-xs font-medium text-slate-500 uppercase">Revenue</label>
          <p className="text-2xl font-bold text-purple-600 mt-2">{metrics.totalRevenueGenerated} ZMW</p>
          <p className="text-xs text-slate-600 mt-1">Commission collected</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <label className="text-xs font-medium text-slate-500 uppercase">Avg Earnings</label>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{metrics.averageEarningsPerAgent} ZMW</p>
          <p className="text-xs text-slate-600 mt-1">Per agent/month</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <label className="text-xs font-medium text-slate-500 uppercase">Churn</label>
          <p className="text-2xl font-bold text-red-600 mt-2">{metrics.agentChurn}%</p>
          <p className="text-xs text-slate-600 mt-1">Monthly rate</p>
        </div>
      </div>

      {/* Growth Mechanics Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Referral Program */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Referral Program</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
              Active
            </span>
          </div>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium mb-2">Current Incentive</p>
              <p className="text-lg font-bold text-blue-600">50 ZMW Bonus</p>
              <p className="text-xs text-blue-800 mt-1">For both referrer and referee</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 rounded p-3 text-center">
                <p className="text-xs text-slate-600">Total Referrals</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">0</p>
              </div>
              <div className="bg-slate-50 rounded p-3 text-center">
                <p className="text-xs text-slate-600">Bonus Paid</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">0 ZMW</p>
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              Manage Referral Program
            </button>
          </div>
        </div>

        {/* Performance Tiers */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Performance Tiers</h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
              4 Tiers
            </span>
          </div>
          <div className="space-y-3">
            {[
              { tier: 'Bronze', agents: 0, discount: '0%', bonus: '0%' },
              { tier: 'Silver', agents: 0, discount: '25%', bonus: '10%' },
              { tier: 'Gold', agents: 0, discount: '50%', bonus: '20%' },
              { tier: 'Platinum', agents: 0, discount: '75%', bonus: '30%' },
            ].map((tier) => (
              <div key={tier.tier} className="flex items-center justify-between bg-slate-50 p-3 rounded">
                <div>
                  <p className="font-semibold text-slate-900">{tier.tier}</p>
                  <p className="text-xs text-slate-600">{tier.agents} agents</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-600 font-semibold">{tier.discount} cost</p>
                  <p className="text-xs text-yellow-600">+{tier.bonus} bonus</p>
                </div>
              </div>
            ))}
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
              Configure Tiers
            </button>
          </div>
        </div>
      </div>

      {/* Bonus Programs */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Active Bonus Programs</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              name: 'Referral Bonus',
              description: 'Agent gets 50 ZMW for each referral',
              active: true,
              totalDistributed: '0 ZMW',
            },
            {
              name: 'Tier Upgrade Bonus',
              description: 'Celebrate tier promotions with bonus float',
              active: true,
              totalDistributed: '0 ZMW',
            },
            {
              name: 'Milestone Bonus',
              description: '100, 500, 1000 completed requests',
              active: false,
              totalDistributed: '0 ZMW',
            },
            {
              name: 'Daily Challenge',
              description: 'Complete 10 requests, earn 200 ZMW',
              active: false,
              totalDistributed: '0 ZMW',
            },
          ].map((program) => (
            <div key={program.name} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900 text-sm">{program.name}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    program.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {program.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">{program.description}</p>
              <p className="text-sm font-medium text-slate-900">Paid: {program.totalDistributed}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Top Performing Agents</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-slate-600">Loading...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {agents.slice(0, 10).map((agent) => (
                  <tr key={agent.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {agent.firstName} {agent.lastName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{agent.phoneNumber}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          agent.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : agent.status === 'pending_review'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {agent.status === 'pending_review' && 'Pending'}
                        {agent.status === 'approved' && 'Approved'}
                        {agent.status === 'suspended' && 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(agent.createdAt).toLocaleDateString('en-ZM')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/agents`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
